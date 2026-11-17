/**
 * MECHPLANT — THREE.GLTFLoader (Parser glTF 2.0 / .glb Binario Nativo)
 * Ruta: assets/js/vendor/three/GLTFLoader.js
 * Compatible con Three.js r128 y el motor local offline de MECHPLANT.
 */
(function (global) {
  "use strict";

  const THREE = global.THREE;
  if (!THREE) {
    console.error("[GLTFLoader] window.THREE debe cargarse antes que GLTFLoader.js");
    return;
  }

  const GLB_MAGIC = 0x46546c67; // "glTF"
  const CHUNK_TYPE_JSON = 0x4e4f534a; // "JSON"
  const CHUNK_TYPE_BIN = 0x004e4942; // "BIN\0"

  const COMPONENT_TYPES = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
  };

  const TYPE_SIZES = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };

  class GLTFLoader {
    constructor(manager) {
      this.manager = manager || null;
      this.resourcePath = "";
    }

    setPath(path) {
      this.resourcePath = path || "";
      return this;
    }

    load(url, onLoad, onProgress, onError) {
      const fullUrl = this.resourcePath + url;

      fetch(fullUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} al cargar ${fullUrl}`);
          }
          return response.arrayBuffer();
        })
        .then((buffer) => {
          this.parse(buffer, this.resourcePath, onLoad, onError);
        })
        .catch((err) => {
          if (typeof onError === "function") {
            onError(err);
          } else {
            console.error("[GLTFLoader] Error cargando modelo:", err);
          }
        });
    }

    parse(data, _path, onLoad, onError) {
      try {
        let json = null;
        let binaryChunk = null;

        if (data instanceof ArrayBuffer) {
          const view = new DataView(data);
          const magic = view.getUint32(0, true);

          if (magic === GLB_MAGIC) {
            const version = view.getUint32(4, true);
            if (version !== 2) {
              throw new Error(`Versión glTF no soportada: ${version}`);
            }

            const totalLength = view.getUint32(8, true);
            let offset = 12;

            while (offset < totalLength) {
              const chunkLength = view.getUint32(offset, true);
              const chunkType = view.getUint32(offset + 4, true);
              const chunkStart = offset + 8;

              if (chunkType === CHUNK_TYPE_JSON) {
                const jsonBytes = new Uint8Array(data, chunkStart, chunkLength);
                const jsonText = new TextDecoder("utf-8").decode(jsonBytes);
                json = JSON.parse(jsonText);
              } else if (chunkType === CHUNK_TYPE_BIN) {
                binaryChunk = data.slice(chunkStart, chunkStart + chunkLength);
              }

              offset += 8 + chunkLength;
            }
          } else {
            const text = new TextDecoder("utf-8").decode(new Uint8Array(data));
            json = JSON.parse(text);
          }
        } else if (typeof data === "string") {
          json = JSON.parse(data);
        } else {
          json = data;
        }

        if (!json) {
          throw new Error("El archivo glTF/GLB no contiene estructura JSON válida.");
        }

        const result = this._buildSceneGraph(json, binaryChunk);
        if (typeof onLoad === "function") {
          onLoad(result);
        }
      } catch (err) {
        if (typeof onError === "function") {
          onError(err);
        } else {
          console.error("[GLTFLoader] Error al parsear GLB:", err);
        }
      }
    }

    _getAccessorData(json, binaryChunk, accessorIndex) {
      const accessor = json.accessors[accessorIndex];
      const bufferView = json.bufferViews[accessor.bufferView];
      const TypedArrayCtor = COMPONENT_TYPES[accessor.componentType];
      const numComponents = TYPE_SIZES[accessor.type];

      if (!TypedArrayCtor || !numComponents || !binaryChunk) {
        return null;
      }

      const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
      const count = accessor.count * numComponents;
      return new TypedArrayCtor(binaryChunk, byteOffset, count);
    }

    _buildMaterial(json, materialIndex) {
      if (materialIndex === undefined || !json.materials || !json.materials[materialIndex]) {
        return new THREE.MeshStandardMaterial({
          color: 0x0095d9,
          metalness: 0.7,
          roughness: 0.3
        });
      }

      const matDef = json.materials[materialIndex];
      const pbr = matDef.pbrMetallicRoughness || {};
      const factor = pbr.baseColorFactor || [0.75, 0.8, 0.85, 1.0];

      const r = Math.round(Math.min(1, factor[0]) * 255);
      const g = Math.round(Math.min(1, factor[1]) * 255);
      const b = Math.round(Math.min(1, factor[2]) * 255);
      const hexColor = (r << 16) | (g << 8) | b;
      const alpha = factor[3] !== undefined ? factor[3] : 1.0;

      const mat = new THREE.MeshStandardMaterial({
        color: hexColor,
        metalness: pbr.metallicFactor !== undefined ? pbr.metallicFactor : 0.65,
        roughness: pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 0.35,
        transparent: matDef.alphaMode === "BLEND" || alpha < 0.99,
        opacity: alpha
      });
      mat.name = matDef.name || `Material_${materialIndex}`;
      return mat;
    }

    _buildGeometry(json, binaryChunk, primitive) {
      const posData =
        primitive.attributes && primitive.attributes.POSITION !== undefined
          ? this._getAccessorData(json, binaryChunk, primitive.attributes.POSITION)
          : null;

      // Si existe BufferGeometry oficial de Three.js, construye la malla exacta
      if (typeof THREE.BufferGeometry === "function" && typeof THREE.BufferAttribute === "function" && posData) {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(posData, 3));

        if (primitive.attributes.NORMAL !== undefined) {
          const normData = this._getAccessorData(json, binaryChunk, primitive.attributes.NORMAL);
          if (normData) geom.setAttribute("normal", new THREE.BufferAttribute(normData, 3));
        }

        if (primitive.attributes.TEXCOORD_0 !== undefined) {
          const uvData = this._getAccessorData(json, binaryChunk, primitive.attributes.TEXCOORD_0);
          if (uvData) geom.setAttribute("uv", new THREE.BufferAttribute(uvData, 2));
        }

        if (primitive.indices !== undefined) {
          const idxData = this._getAccessorData(json, binaryChunk, primitive.indices);
          if (idxData) geom.setIndex(new THREE.BufferAttribute(idxData, 1));
        }

        if (!geom.attributes.normal && typeof geom.computeVertexNormals === "function") {
          geom.computeVertexNormals();
        }
        return geom;
      }

      // Fallback para shim ligero: calcula bounding box a partir de POSITION
      if (posData && posData.length >= 3) {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let i = 0; i < posData.length; i += 3) {
          minX = Math.min(minX, posData[i]);
          maxX = Math.max(maxX, posData[i]);
          minY = Math.min(minY, posData[i + 1]);
          maxY = Math.max(maxY, posData[i + 1]);
          minZ = Math.min(minZ, posData[i + 2]);
          maxZ = Math.max(maxZ, posData[i + 2]);
        }
        return new THREE.BoxGeometry(
          Math.max(0.05, maxX - minX),
          Math.max(0.05, maxY - minY),
          Math.max(0.05, maxZ - minZ)
        );
      }

      return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }

    _buildNode(json, binaryChunk, nodeIndex) {
      const nodeDef = json.nodes[nodeIndex];
      let obj;

      if (nodeDef.mesh !== undefined && json.meshes && json.meshes[nodeDef.mesh]) {
        const meshDef = json.meshes[nodeDef.mesh];
        const primitives = meshDef.primitives || [];

        if (primitives.length === 1) {
          const geom = this._buildGeometry(json, binaryChunk, primitives[0]);
          const mat = this._buildMaterial(json, primitives[0].material);
          obj = new THREE.Mesh(geom, mat);
        } else {
          obj = new THREE.Group();
          primitives.forEach((prim, pIdx) => {
            const geom = this._buildGeometry(json, binaryChunk, prim);
            const mat = this._buildMaterial(json, prim.material);
            const subMesh = new THREE.Mesh(geom, mat);
            subMesh.name = `${nodeDef.name || meshDef.name || "Part"}_${pIdx}`;
            obj.add(subMesh);
          });
        }
      } else {
        obj = new THREE.Group();
      }

      obj.name = nodeDef.name || `Node_${nodeIndex}`;

      if (Array.isArray(nodeDef.translation)) {
        obj.position.set(nodeDef.translation[0], nodeDef.translation[1], nodeDef.translation[2]);
      }
      if (Array.isArray(nodeDef.scale)) {
        obj.scale.set(nodeDef.scale[0], nodeDef.scale[1], nodeDef.scale[2]);
      }
      if (Array.isArray(nodeDef.rotation) && typeof THREE.Quaternion === "function" && obj.quaternion) {
        obj.quaternion.set(nodeDef.rotation[0], nodeDef.rotation[1], nodeDef.rotation[2], nodeDef.rotation[3]);
      }

      if (Array.isArray(nodeDef.children)) {
        nodeDef.children.forEach((childIndex) => {
          obj.add(this._buildNode(json, binaryChunk, childIndex));
        });
      }

      return obj;
    }

    _buildSceneGraph(json, binaryChunk) {
      const rootGroup = new THREE.Group();
      rootGroup.name = "GLTF_Root_Scene";

      const sceneIndex = json.scene !== undefined ? json.scene : 0;
      const sceneDef = (json.scenes && json.scenes[sceneIndex]) || { nodes: [] };

      (sceneDef.nodes || []).forEach((nodeIdx) => {
        rootGroup.add(this._buildNode(json, binaryChunk, nodeIdx));
      });

      return {
        scene: rootGroup,
        scenes: [rootGroup],
        asset: json.asset || { version: "2.0" }
      };
    }
  }

  THREE.GLTFLoader = GLTFLoader;
})(typeof window !== "undefined" ? window : this);
