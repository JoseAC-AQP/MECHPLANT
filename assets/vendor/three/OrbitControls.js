/**
 * MECHPLANT — THREE.OrbitControls (Compatible con Three.js r128 y entorno Offline)
 * Ruta: assets/js/vendor/three/OrbitControls.js
 */
(function (global) {
  "use strict";

  const THREE = global.THREE;
  if (!THREE) {
    console.error("[OrbitControls] window.THREE debe cargarse antes que OrbitControls.js");
    return;
  }

  class OrbitControls {
    constructor(camera, domElement) {
      this.camera = camera;
      this.domElement = domElement || document;

      // Punto focal orbital
      this.target = new THREE.Vector3(0, 0, 0);

      // Configuración de comportamiento y límites
      this.enabled = true;
      this.enableDamping = true;
      this.dampingFactor = 0.08;

      this.enableZoom = true;
      this.zoomSpeed = 1.0;
      this.minDistance = 1.2;
      this.maxDistance = 30.0;

      this.enableRotate = true;
      this.rotateSpeed = 0.85;
      this.minPolarAngle = 0.08;
      this.maxPolarAngle = Math.PI - 0.08;

      this.enablePan = true;
      this.panSpeed = 0.85;

      // Estado esférico interno
      this._spherical = { radius: 6.0, phi: 1.15, theta: 0.65 };
      this._sphericalDelta = { radius: 0, phi: 0, theta: 0 };
      this._panOffset = new THREE.Vector3(0, 0, 0);
      this._scale = 1.0;

      // Estado de punteros
      this._state = "NONE"; // NONE | ROTATE | PAN | DOLLY
      this._pointerStart = { x: 0, y: 0 };
      this._pointerEnd = { x: 0, y: 0 };
      this._touchStartDist = 0;

      this._syncFromCamera();
      this._bindEvents();
      this.update();
    }

    _syncFromCamera() {
      const dx = this.camera.position.x - this.target.x;
      const dy = this.camera.position.y - this.target.y;
      const dz = this.camera.position.z - this.target.z;
      const radius = Math.max(0.001, Math.hypot(dx, dy, dz));

      this._spherical.radius = radius;
      this._spherical.phi = Math.acos(Math.max(-1, Math.min(1, dy / radius)));
      this._spherical.theta = Math.atan2(dx, dz);
    }

    _rotateLeft(angle) {
      this._sphericalDelta.theta -= angle;
    }

    _rotateUp(angle) {
      this._sphericalDelta.phi -= angle;
    }

    _pan(deltaX, deltaY) {
      const element = this.domElement === document ? document.body : this.domElement;
      const clientHeight = element.clientHeight || 600;

      const fovRad = ((this.camera.fov || 45) * Math.PI) / 180;
      const targetDistance = this._spherical.radius * Math.tan(fovRad / 2);

      const moveX = (2 * deltaX * targetDistance) / clientHeight;
      const moveY = (2 * deltaY * targetDistance) / clientHeight;

      const theta = this._spherical.theta;
      // Vector derecha en el plano XZ
      const rightX = Math.cos(theta);
      const rightZ = -Math.sin(theta);

      this._panOffset.x -= rightX * moveX;
      this._panOffset.z -= rightZ * moveX;
      this._panOffset.y += moveY;
    }

    _dollyIn(dollyScale) {
      this._scale /= dollyScale;
    }

    _dollyOut(dollyScale) {
      this._scale *= dollyScale;
    }

    update() {
      const s = this._spherical;
      const d = this._sphericalDelta;

      if (this.enableDamping) {
        s.theta += d.theta * this.dampingFactor;
        s.phi += d.phi * this.dampingFactor;
        this.target.x += this._panOffset.x * this.dampingFactor;
        this.target.y += this._panOffset.y * this.dampingFactor;
        this.target.z += this._panOffset.z * this.dampingFactor;

        d.theta *= 1 - this.dampingFactor;
        d.phi *= 1 - this.dampingFactor;
        this._panOffset.multiplyScalar(1 - this.dampingFactor);
      } else {
        s.theta += d.theta;
        s.phi += d.phi;
        this.target.add(this._panOffset);

        d.theta = 0;
        d.phi = 0;
        this._panOffset.set(0, 0, 0);
      }

      // Restricciones de ángulo polar y distancia
      s.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, s.phi));
      s.radius = Math.max(this.minDistance, Math.min(this.maxDistance, s.radius * this._scale));
      this._scale = 1.0;

      // Conversión de coordenadas esféricas a cartesianas
      const sinPhiRadius = Math.sin(s.phi) * s.radius;
      this.camera.position.x = this.target.x + sinPhiRadius * Math.sin(s.theta);
      this.camera.position.y = this.target.y + Math.cos(s.phi) * s.radius;
      this.camera.position.z = this.target.z + sinPhiRadius * Math.cos(s.theta);

      if (typeof this.camera.lookAt === "function") {
        this.camera.lookAt(this.target);
      }

      return true;
    }

    reset() {
      this.target.set(0, 0, 0);
      this._spherical.radius = 6.0;
      this._spherical.phi = 1.15;
      this._spherical.theta = 0.65;
      this._sphericalDelta = { radius: 0, phi: 0, theta: 0 };
      this._panOffset.set(0, 0, 0);
      this._scale = 1.0;
      this.update();
    }

    _bindEvents() {
      const el = this.domElement;

      this._onContextMenu = (e) => {
        if (this.enabled) e.preventDefault();
      };

      this._onMouseDown = (e) => {
        if (!this.enabled) return;
        e.preventDefault();

        this._pointerStart = { x: e.clientX, y: e.clientY };

        if (e.button === 0 && !e.shiftKey && !e.ctrlKey && this.enableRotate) {
          this._state = "ROTATE";
        } else if ((e.button === 2 || e.button === 1 || e.shiftKey) && this.enablePan) {
          this._state = "PAN";
        }

        window.addEventListener("mousemove", this._onMouseMove);
        window.addEventListener("mouseup", this._onMouseUp);
      };

      this._onMouseMove = (e) => {
        if (!this.enabled || this._state === "NONE") return;

        this._pointerEnd = { x: e.clientX, y: e.clientY };
        const dx = this._pointerEnd.x - this._pointerStart.x;
        const dy = this._pointerEnd.y - this._pointerStart.y;
        const height = el.clientHeight || 600;

        if (this._state === "ROTATE") {
          this._rotateLeft((2 * Math.PI * dx * this.rotateSpeed) / height);
          this._rotateUp((2 * Math.PI * dy * this.rotateSpeed) / height);
        } else if (this._state === "PAN") {
          this._pan(dx * this.panSpeed, dy * this.panSpeed);
        }

        this._pointerStart = { x: e.clientX, y: e.clientY };
        if (!this.enableDamping) this.update();
      };

      this._onMouseUp = () => {
        this._state = "NONE";
        window.removeEventListener("mousemove", this._onMouseMove);
        window.removeEventListener("mouseup", this._onMouseUp);
      };

      this._onWheel = (e) => {
        if (!this.enabled || !this.enableZoom) return;
        e.preventDefault();
        const zoomScale = Math.pow(0.95, this.zoomSpeed);
        if (e.deltaY < 0) {
          this._dollyIn(zoomScale);
        } else if (e.deltaY > 0) {
          this._dollyOut(zoomScale);
        }
        if (!this.enableDamping) this.update();
      };

      this._onTouchStart = (e) => {
        if (!this.enabled) return;
        if (e.touches.length === 1 && this.enableRotate) {
          this._state = "ROTATE";
          this._pointerStart = { x: e.touches[0].pageX, y: e.touches[0].pageY };
        } else if (e.touches.length === 2 && this.enableZoom) {
          this._state = "DOLLY";
          const dx = e.touches[0].pageX - e.touches[1].pageX;
          const dy = e.touches[0].pageY - e.touches[1].pageY;
          this._touchStartDist = Math.hypot(dx, dy);
        }
      };

      this._onTouchMove = (e) => {
        if (!this.enabled) return;
        e.preventDefault();
        if (e.touches.length === 1 && this._state === "ROTATE") {
          const dx = e.touches[0].pageX - this._pointerStart.x;
          const dy = e.touches[0].pageY - this._pointerStart.y;
          const height = el.clientHeight || 600;
          this._rotateLeft((2 * Math.PI * dx * this.rotateSpeed) / height);
          this._rotateUp((2 * Math.PI * dy * this.rotateSpeed) / height);
          this._pointerStart = { x: e.touches[0].pageX, y: e.touches[0].pageY };
        } else if (e.touches.length === 2 && this._state === "DOLLY") {
          const dx = e.touches[0].pageX - e.touches[1].pageX;
          const dy = e.touches[0].pageY - e.touches[1].pageY;
          const dist = Math.hypot(dx, dy);
          if (this._touchStartDist > 0) {
            this._scale *= this._touchStartDist / dist;
          }
          this._touchStartDist = dist;
        }
        if (!this.enableDamping) this.update();
      };

      this._onTouchEnd = () => {
        this._state = "NONE";
      };

      el.addEventListener("contextmenu", this._onContextMenu);
      el.addEventListener("mousedown", this._onMouseDown);
      el.addEventListener("wheel", this._onWheel, { passive: false });
      el.addEventListener("touchstart", this._onTouchStart, { passive: false });
      el.addEventListener("touchmove", this._onTouchMove, { passive: false });
      el.addEventListener("touchend", this._onTouchEnd);
    }

    dispose() {
      const el = this.domElement;
      el.removeEventListener("contextmenu", this._onContextMenu);
      el.removeEventListener("mousedown", this._onMouseDown);
      el.removeEventListener("wheel", this._onWheel);
      el.removeEventListener("touchstart", this._onTouchStart);
      el.removeEventListener("touchmove", this._onTouchMove);
      el.removeEventListener("touchend", this._onTouchEnd);
      window.removeEventListener("mousemove", this._onMouseMove);
      window.removeEventListener("mouseup", this._onMouseUp);
    }
  }

  THREE.OrbitControls = OrbitControls;
})(typeof window !== "undefined" ? window : this);
