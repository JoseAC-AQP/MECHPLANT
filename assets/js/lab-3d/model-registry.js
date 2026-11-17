/* ==========================================================================
   MECHPLANT - REGISTRO MAESTRO DE MODELOS 3D (model-registry.js)
   Centraliza metadatos, rutas GLB, cámaras óptimas y vínculos curriculares
   ========================================================================== */

window.MECHPLANT_3D_REGISTRY = {
  "chancadora-conica": {
    id: "chancadora-conica",
    code: "MOD-3D-01",
    nombre: "Chancadora Cónica Secundaria",
    categoria: "Procesamiento de Minerales",
    glbFile: "chancadora-conica.glb",
    fichaUrl: "../equipos/procesamiento-minerales/chancadora-conica.html",
    descripcion: "Ensamble de bastidor principal, manto cónico triturador, eje principal en acero SAE 4340 y conjunto de contraeje con piñón cónico.",
    cameraPreset: { pos: [5.2, 3.6, 5.8], target: [0, 1.0, 0] },
    modulos: ["M01", "M02", "M03", "M04", "M07"],
    simuladores: ["sim-04", "sim-06", "sim-07"],
    partesClave: [
      "Bastidor Principal (Mainframe)",
      "Manto Cónico Triturador",
      "Eje Principal (Main Shaft)",
      "Contraeje y Piñón Cónico"
    ]
  },

  "chancadora-quijadas": {
    id: "chancadora-quijadas",
    code: "MOD-3D-02",
    nombre: "Chancadora de Quijadas Primaria",
    categoria: "Procesamiento de Minerales",
    glbFile: "chancadora-quijadas.glb",
    fichaUrl: "../equipos/procesamiento-minerales/chancadora-quijadas.html",
    descripcion: "Trituradora primaria con eje excéntrico de alta inercia, volantes acanalados para fajas en V, placa toggle y rodamientos oscilantes.",
    cameraPreset: { pos: [5.8, 3.4, 5.6], target: [0, 1.0, 0] },
    modulos: ["M02", "M03", "M04", "M05"],
    simuladores: ["sim-04", "sim-07", "sim-08"],
    partesClave: [
      "Eje Excéntrico SAE 4340",
      "Volante Motriz Acanalado",
      "Rodamientos de Rodillos a Rótula",
      "Placa Toggle y Pernos de Tensión"
    ]
  },

  "molino-bolas": {
    id: "molino-bolas",
    code: "MOD-3D-03",
    nombre: "Molino de Bolas de Molienda",
    categoria: "Procesamiento de Minerales",
    glbFile: "molino-bolas.glb",
    fichaUrl: "../equipos/procesamiento-minerales/molino-bolas.html",
    descripcion: "Tambor rotatorio con revestimientos apernados, muñones de apoyo y transmisión perimetral por corona dentada y piñón helicoidal.",
    cameraPreset: { pos: [6.4, 3.8, 6.4], target: [0, 1.1, 0] },
    modulos: ["M02", "M03", "M07", "M08"],
    simuladores: ["sim-06", "sim-10", "sim-11"],
    partesClave: [
      "Corona Dentada Perimetral",
      "Piñón de Accionamiento AGMA",
      "Muñones y Cojinetes Principales",
      "Pernos de Revestimiento (Liners)"
    ]
  },

  "reductor-engranajes": {
    id: "reductor-engranajes",
    code: "MOD-3D-04",
    nombre: "Reductor de Velocidad Helicoidal",
    categoria: "Equipos Auxiliares de Planta",
    glbFile: "reductor-engranajes.glb",
    fichaUrl: "../equipos/auxiliares/reductor-velocidad.html",
    descripcion: "Caja reductora bipartida con eje piñón de alta velocidad, rueda helicoidal cementada, rodamientos cónicos y chavetas DIN 6885.",
    cameraPreset: { pos: [4.8, 3.4, 5.2], target: [0, 1.0, 0] },
    modulos: ["M02", "M03", "M04", "M07", "M08"],
    simuladores: ["sim-05", "sim-10", "sim-12"],
    partesClave: [
      "Carcasa Inferior y Tapa Bipartida",
      "Eje Piñón de Alta Velocidad",
      "Rueda Dentada Helicoidal",
      "Rodamientos de Rodillos Cónicos"
    ]
  },

  "bomba-centrifuga": {
    id: "bomba-centrifuga",
    code: "MOD-3D-05",
    nombre: "Bomba Centrífuga de Pulpa",
    categoria: "Procesamiento de Minerales",
    glbFile: "bomba-centrifuga.glb",
    fichaUrl: "../equipos/procesamiento-minerales/bomba-pulpa.html",
    descripcion: "Bomba horizontal de servicio pesado con eje en voladizo de alta rigidez, cartucho de rodamientos cónicos y polea conducida 5V.",
    cameraPreset: { pos: [5.0, 3.2, 5.4], target: [0, 0.9, 0] },
    modulos: ["M03", "M04", "M05", "M08"],
    simuladores: ["sim-04", "sim-07", "sim-08"],
    partesClave: [
      "Eje en Voladizo SAE 4140",
      "Cartucho de Rodamientos Cónicos",
      "Polea Conducida Perfil 5V",
      "Carcasa Partida y Espárragos B7"
    ]
  },

  "transportador-fajas": {
    id: "transportador-fajas",
    code: "MOD-3D-06",
    nombre: "Tren Motriz de Transportador de Fajas",
    categoria: "Procesamiento de Minerales",
    glbFile: "transportador-fajas.glb",
    fichaUrl: "../equipos/procesamiento-minerales/faja-transportadora.html",
    descripcion: "Estación motriz completa: Motor eléctrico trifásico, acoplamiento flexible con chaveta, chumaceras bipartidas y polea motriz.",
    cameraPreset: { pos: [5.5, 3.5, 5.8], target: [0, 0.9, 0] },
    modulos: ["M02", "M03", "M04", "M05", "M08"],
    simuladores: ["sim-04", "sim-05", "sim-13"],
    partesClave: [
      "Motor Eléctrico Trifásico (150 HP)",
      "Acoplamiento Flexible y Chaveta",
      "Eje de Transmisión Principal",
      "Chumacera Bipartida y Polea Motriz"
    ]
  }
};
