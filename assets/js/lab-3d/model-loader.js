/* ==========================================================================
   MECHPLANT - CARGADOR DE MODELOS GLB Y ENSAMBLES PARAMÉTRICOS (model-loader.js)
   Incluye fallback procedural 3D con metadatos mecánicos reales por pieza
   ========================================================================== */

window.MECHPLANT_3D_LOADER = (function () {
  let activeAssembly = null;
  let activeParts = [];

  // Materiales metálicos PBR estándar de ingeniería
  function createMaterials() {
    return {
      steelDark: new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.72, roughness: 0.35 }),
      steelBright: new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.85, roughness: 0.22 }),
      cyanHousing: new THREE.MeshStandardMaterial({ color: 0x0F4C81, metalness: 0.55, roughness: 0.4 }),
      bronzeWear: new THREE.MeshStandardMaterial({ color: 0xD97706, metalness: 0.78, roughness: 0.3 }),
      safetyAccent: new THREE.MeshStandardMaterial({ color: 0x0095D9, metalness: 0.4, roughness: 0.35 }),
      rubberBelt: new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.1, roughness: 0.85 })
    };
  }

  // Helper para registrar cada subcomponente con su vector de despiece y ficha técnica
  function registerPart(group, mesh, meta, explodeVec) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.meta = meta;
    mesh.userData.originPos = mesh.position.clone();
    mesh.userData.explodeVector = new THREE.Vector3(...explodeVec);
    mesh.userData.originalMaterial = mesh.material;
    group.add(mesh);
    activeParts.push(mesh);
  }

  // Constructor paramétrico 3D según el equipo seleccionado
  function buildParametricEquipment(eqKey) {
    const mats = createMaterials();
    const group = new THREE.Group();
    activeParts = [];

    if (eqKey === "reductor-engranajes") {
      // 1. Base de carcasa
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.1, 2.0), mats.cyanHousing);
      base.position.set(0, 0.55, 0);
      registerPart(group, base, {
        nombre: "Carcasa Inferior de Reductor",
        elemento: "Bastidor y cárter de aceite",
        material: "Hierro Fundido Gris ASTM A48 Cl. 30",
        norma: "ISO 12100 / API 686",
        modulo: "Módulo 01 y 07",
        simulador: "../simuladores/sim-12-seleccion-reductores.html",
        fallaTipica: "Fuga de lubricante por obstrucción de respiradero o deformación por pata coja."
      }, [0, -0.35, 0]);

      // 2. Tapa superior de carcasa
      const cover = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.9, 1.9), mats.cyanHousing);
      cover.position.set(0, 1.55, 0);
      registerPart(group, cover, {
        nombre: "Tapa Superior Bipartida",
        elemento: "Cubierta de inspección y alojamiento",
        material: "Hierro Fundido Gris ASTM A48",
        norma: "ASME B18.2.1 (Pernos de cierre)",
        modulo: "Módulo 02 y 07",
        simulador: "../simuladores/sim-06-uniones-empernadas.html",
        fallaTipica: "Pérdida de estanqueidad en plano de junta o precarga desigual."
      }, [0, 1.65, 0]);

      // 3. Eje de entrada y piñón helicoidal
      const shaftIn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.8, 24), mats.steelBright);
      shaftIn.rotation.z = Math.PI / 2;
      shaftIn.position.set(-0.9, 1.25, 0.35);
      registerPart(group, shaftIn, {
        nombre: "Eje Piñón de Alta Velocidad (1780 rpm)",
        elemento: "Árbol de entrada escalonado",
        material: "Acero SAE 8620 Cementado (60 HRC)",
        norma: "ASME B106.1M / DIN 6885",
        modulo: "Módulo 03 y 07",
        simulador: "../simuladores/sim-04-diseno-ejes.html",
        fallaTipica: "Fatiga por flexión rotativa en chavetero o desalineamiento de acoplamiento."
      }, [-1.2, 0.8, 0.9]);

      // 4. Engranaje helicoidal conducido
      const gearOut = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.42, 32), mats.steelDark);
      gearOut.rotation.z = Math.PI / 2;
      gearOut.position.set(0.6, 1.05, -0.25);
      registerPart(group, gearOut, {
        nombre: "Rueda Dentada Helicoidal de Salida",
        elemento: "Engranaje cilíndrico helicoidal",
        material: "Acero SAE 4140 / 8620 Rectificado",
        norma: "AGMA 2001-D04 / ISO 6336",
        modulo: "Módulo 07",
        simulador: "../simuladores/sim-10-diseno-engranajes.html",
        fallaTipica: "Picadura (pitting) en flanco de diente por caída de viscosidad ISO VG 320."
      }, [1.1, 0.7, -0.8]);

      // 5. Rodamiento de rodillos cónicos
      const bearing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.09, 16, 32), mats.bronzeWear);
      bearing.rotation.y = Math.PI / 2;
      bearing.position.set(1.45, 1.05, -0.25);
      registerPart(group, bearing, {
        nombre: "Rodamiento de Rodillos Cónicos",
        elemento: "Soporte radial y empuje axial (Wa)",
        material: "Acero al Cromo AISI 52100",
        norma: "ISO 281 / ISO 76 / ISO 286",
        modulo: "Módulo 04",
        simulador: "../simuladores/sim-07-seleccion-vida-rodamientos.html",
        fallaTipica: "Desconchado (spalling) por precarga axial excesiva o contaminación."
      }, [2.1, 0.7, -0.8]);

    } else if (eqKey === "chancadora-conica") {
      // 1. Bastidor principal (Mainframe)
      const frame = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 1.5, 32, 1, true), mats.cyanHousing);
      frame.position.set(0, 0.85, 0);
      registerPart(group, frame, {
        nombre: "Bastidor Principal (Mainframe)",
        elemento: "Estructura soporte de cámara de trituración",
        material: "Acero Fundido ASTM A27 Grado 70-40",
        norma: "ISO 12100 / ASTM A27",
        modulo: "Módulo 01 y 02",
        simulador: "../simuladores/sim-06-uniones-empernadas.html",
        fallaTipica: "Fisuras por impacto de material intriturable (tramp iron)."
      }, [0, -0.2, 0]);

      // 2. Manto cónico móvil
      const mantle = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.45, 32), mats.steelDark);
      mantle.position.set(0, 1.25, 0);
      registerPart(group, mantle, {
        nombre: "Manto Cónico Triturador",
        elemento: "Revestimiento móvil de desgaste",
        material: "Acero Austenítico al Manganeso ASTM A128",
        norma: "ASTM A128",
        modulo: "Módulo 01",
        simulador: "../simuladores/sim-01-esfuerzos-basicos.html",
        fallaTipica: "Desgaste abrasivo irregular por alimentación segregada."
      }, [0, 1.85, 0]);

      // 3. Eje principal vertical
      const mainShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 2.3, 24), mats.steelBright);
      mainShaft.position.set(0, 1.15, 0);
      registerPart(group, mainShaft, {
        nombre: "Eje Principal (Main Shaft)",
        elemento: "Eje soporte de cabezal bajo flexión cíclica",
        material: "Acero Aleado SAE 4340 Templado y Revenido",
        norma: "SAE J404 / ASME B106.1M",
        modulo: "Módulo 03",
        simulador: "../simuladores/sim-04-diseno-ejes.html",
        fallaTipica: "Fatiga por flexión en radio de acuerdo inferior."
      }, [0, 0.9, 0]);

      // 4. Contraeje y polea motriz
      const counterShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 20), mats.steelBright);
      counterShaft.rotation.z = Math.PI / 2;
      counterShaft.position.set(1.85, 0.65, 0);
      registerPart(group, counterShaft, {
        nombre: "Contraeje y Piñón Cónico",
        elemento: "Transmisión de potencia de entrada (850 rpm)",
        material: "Acero SAE 4140 / 8620",
        norma: "AGMA 2001-D04 / ISO 281",
        modulo: "Módulo 03, 04 y 07",
        simulador: "../simuladores/sim-07-seleccion-vida-rodamientos.html",
        fallaTipica: "Sobrecalentamiento de rodamientos por tensión excesiva de fajas."
      }, [1.7, 0, 0]);

    } else {
      // Ensamble estándar: Tren Industrial Motor - Acoplamiento - Chumacera - Polea
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.4, 24), mats.cyanHousing);
      motor.rotation.z = Math.PI / 2;
      motor.position.set(-1.8, 0.85, 0);
      registerPart(group, motor, {
        nombre: "Motor Eléctrico Trifásico (150 HP)",
        elemento: "Máquina motriz primaria (1780 rpm)",
        material: "Carcasa Hierro Fundido / Eje SAE 1045",
        norma: "IEC 60034-1 / NEMA MG1",
        modulo: "Módulo 02 y 08",
        simulador: "../simuladores/sim-13-alineamiento-ejes.html",
        fallaTipica: "Pata coja (soft foot) y corrientes parásitas en rodamientos con VFD."
      }, [-1.2, 0.4, 0]);

      const coupling = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 20), mats.safetyAccent);
      coupling.rotation.z = Math.PI / 2;
      coupling.position.set(-0.75, 0.85, 0);
      registerPart(group, coupling, {
        nombre: "Acoplamiento Flexible y Chaveta DIN 6885",
        elemento: "Transmisión de par y compensación de desalineamiento",
        material: "Cubos Acero SAE 1045 / Elastómero Poliuretano",
        norma: "DIN 6885-1 / ISO 20816",
        modulo: "Módulo 02 y 08",
        simulador: "../simuladores/sim-05-chavetas-chaveteros.html",
        fallaTipica: "Desgaste prematuro de elastómero por desalineamiento angular/paralelo."
      }, [-0.4, 1.2, 0]);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.5, 24), mats.steelBright);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0.65, 0.85, 0);
      registerPart(group, shaft, {
        nombre: "Eje de Transmisión Principal",
        elemento: "Árbol sometido a flexo-torsión combinada",
        material: "Acero Aleado SAE 4140 Templado y Revenido",
        norma: "ASME B106.1M / ISO 286",
        modulo: "Módulo 03",
        simulador: "../simuladores/sim-04-diseno-ejes.html",
        fallaTipica: "Fractura por fatiga en concentrador de esfuerzos (escalón o chavetero)."
      }, [0.3, 0.5, 0]);

      const pillowBlock = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.65), mats.bronzeWear);
      pillowBlock.position.set(0.35, 0.55, 0);
      registerPart(group, pillowBlock, {
        nombre: "Chumacera Bipartida con Rodamiento Oscilante",
        elemento: "Apoyo radial autoalineante",
        material: "Soporte ASTM A48 / Rodamiento AISI 52100",
        norma: "ISO 281 / ISO 286",
        modulo: "Módulo 04",
        simulador: "../simuladores/sim-07-seleccion-vida-rodamientos.html",
        fallaTipica: "Sobrecalentamiento por exceso de grasa o ingreso de polvo abrasivo."
      }, [0.3, -0.35, 0.9]);

      const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.35, 32), mats.steelDark);
      pulley.rotation.z = Math.PI / 2;
      pulley.position.set(1.65, 0.85, 0);
      registerPart(group, pulley, {
        nombre: "Polea Motriz Acanalada (Perfil 5V)",
        elemento: "Transmisión por fajas trapezoidales",
        material: "Hierro Dúctil ASTM A536 Balanceado G6.3",
        norma: "ISO 4184 / ISO 21940-11",
        modulo: "Módulo 05",
        simulador: "../simuladores/sim-08-transmision-fajas-poleas.html",
        fallaTipica: "Desgaste de gargantas por patinaje o desalineamiento láser."
      }, [1.4, 0.4, 0]);
    }

    return group;
  }

  function loadEquipment(eqKey, scene, rootPrefix = "../") {
    if (activeAssembly && scene) {
      scene.remove(activeAssembly);
    }

    const glbPath = `${rootPrefix}assets/models/${eqKey}.glb`;

    // Intentar cargar GLB si existe GLTFLoader; si falla o no hay servidor, usar ensamble CAD paramétrico
    if (typeof THREE.GLTFLoader !== "undefined") {
      const loader = new THREE.GLTFLoader();
      loader.load(
        glbPath,
        (gltf) => {
          activeAssembly = gltf.scene;
          activeParts = [];
          activeAssembly.traverse(child => {
            if (child.isMesh) {
              child.userData.originPos = child.position.clone();
              child.userData.explodeVector = new THREE.Vector3(0, 0.8, 0);
              child.userData.originalMaterial = child.material;
              activeParts.push(child);
            }
          });
          scene.add(activeAssembly);
          window.dispatchEvent(new CustomEvent("mechplant:3dLoaded", { detail: { parts: activeParts, mode: "GLB" } }));
        },
        undefined,
        () => {
          // Fallback automático limpio al ensamble paramétrico 3D
          activeAssembly = buildParametricEquipment(eqKey);
          scene.add(activeAssembly);
          window.dispatchEvent(new CustomEvent("mechplant:3dLoaded", { detail: { parts: activeParts, mode: "ParametricCAD" } }));
        }
      );
    } else {
      activeAssembly = buildParametricEquipment(eqKey);
      scene.add(activeAssembly);
      window.dispatchEvent(new CustomEvent("mechplant:3dLoaded", { detail: { parts: activeParts, mode: "ParametricCAD" } }));
    }
  }

  function getParts() {
    return activeParts;
  }

  return {
    loadEquipment,
    getParts
  };
})();
