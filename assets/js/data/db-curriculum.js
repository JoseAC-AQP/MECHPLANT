/* ==========================================================================
   MECHPLANT - BASE DE DATOS ACADÉMICA E INDUSTRIAL (db-curriculum.js)
   Fuentes: Shigley (11a Ed.) & Norton (6a Ed.) | Normativa ISO/ASME/SAE/AGMA
   ========================================================================== */

window.MECHPLANT_DB = {
  modules: [
    {
      id: "m1",
      code: "MÓDULO 01",
      title: "Introducción al Diseño Mecánico Industrial",
      folder: "modulos/m1-introduccion-diseno/index.html",
      topics: [
        "Metodología de diseño y necesidades de planta",
        "Materiales SAE/ASTM, esfuerzos y factor de seguridad",
        "Planos mecánicos, ajustes ISO 286 y GD&T ASME Y14.5"
      ],
      equipos: ["Chancadora", "Bomba Centrífuga", "Reductor", "Faja Transportadora"],
      normas: ["ISO 286", "ISO 1101", "ISO 12100", "ASME Y14.5", "SAE J403"]
    },
    {
      id: "m2",
      code: "MÓDULO 02",
      title: "Diseño de Uniones y Elementos de Fijación",
      folder: "modulos/m2-uniones-elementos-fijacion/index.html",
      topics: [
        "Pernos, tuercas, arandelas y cálculo de precarga",
        "Uniones a tracción, corte, aplastamiento y desgarro",
        "Chavetas, pasadores y acoplamientos mecánicos"
      ],
      equipos: ["Chancadora de Quijadas", "Soporte de Motor", "Bridas", "Acoplamientos"],
      normas: ["ASME B1.1", "ASME B18", "SAE J429", "DIN 6885"]
    },
    {
      id: "m3",
      code: "MÓDULO 03",
      title: "Diseño de Ejes y Árboles de Transmisión",
      folder: "modulos/m3-ejes-arboles-transmision/index.html",
      topics: [
        "Cargas combinadas de flexión y torsión",
        "Concentración de esfuerzos y fatiga (Goodman/Soderberg)",
        "Deflexión, pendiente crítica y chaveteros"
      ],
      equipos: ["Molino de Bolas", "Transportador de Fajas", "Chancadora", "Bomba de Pulpa"],
      normas: ["ASME B106.1M", "SAE J404", "ISO 286"]
    },
    {
      id: "m4",
      code: "MÓDULO 04",
      title: "Rodamientos y Cojinetes",
      folder: "modulos/m4-rodamientos-cojinetes/index.html",
      topics: [
        "Tipología: bolas, rodillos cilíndricos, cónicos y oscilantes",
        "Capacidad dinámica/estática y vida nominal L10",
        "Ajustes, lubricación, montaje y análisis de fallas"
      ],
      equipos: ["Zaranda Vibratoria", "Polea Motriz", "Chancadora Cónica", "Motor Eléctrico"],
      normas: ["ISO 281", "ISO 76", "ISO 286", "ABMA"]
    },
    {
      id: "m5",
      code: "MÓDULO 05",
      title: "Transmisiones por Fajas y Poleas",
      folder: "modulos/m5-transmisiones-fajas-poleas/index.html",
      topics: [
        "Fajas planas, trapezoidales (en V) y dentadas",
        "Relación de transmisión, velocidad periférica y tensiones",
        "Alineamiento de poleas, tensado y mantenimiento"
      ],
      equipos: ["Ventilador Industrial", "Compresor", "Zaranda", "Bomba Auxiliar"],
      normas: ["ISO 4184", "ASME/RMA IP-20", "DIN 2215"]
    },
    {
      id: "m6",
      code: "MÓDULO 06",
      title: "Transmisiones por Cadenas",
      folder: "modulos/m6-transmisiones-cadenas/index.html",
      topics: [
        "Cadenas de rodillos y piñones normalizados",
        "Cinemática, efecto poligonal y potencia transmisible",
        "Regímenes de lubricación, elongación por desgaste e inspección"
      ],
      equipos: ["Alimentador de Placas", "Transportador de Cadenas", "Accionamiento Pesado"],
      normas: ["ANSI B29.1", "ISO 606", "DIN 8187"]
    },
    {
      id: "m7",
      code: "MÓDULO 07",
      title: "Diseño de Engranajes y Reductores",
      folder: "modulos/m7-engranajes-reductores/index.html",
      topics: [
        "Engranajes rectos, helicoidales, cónicos y sinfín-corona",
        "Fuerzas tangenciales, radiales y axiales",
        "Resistencia a flexión (Lewis/AGMA) y picadura por contacto"
      ],
      equipos: ["Reductor de Velocidad", "Molino SAG", "Chancadora Giratoria"],
      normas: ["ISO 6336", "ISO 1328", "AGMA 2001-D04", "AGMA 2101"]
    },
    {
      id: "m8",
      code: "MÓDULO 08",
      title: "Integración de Elementos y Confiabilidad",
      folder: "modulos/m8-integracion-confiabilidad/index.html",
      topics: [
        "Integración motor-acoplamiento-reductor-equipo",
        "Alineamiento láser, balanceo de rotores y vibraciones",
        "Mantenimiento predictivo, análisis de fallas y disponibilidad"
      ],
      equipos: ["Tren de Accionamiento Completo", "Chancadora", "Transportador Mineral"],
      normas: ["ISO 20816", "ISO 21940", "ISO 14224", "ISO 55000", "API 686"]
    }
  ],

  equiposPorCategoria: {
    minerales: [
      {
        id: "chancadora-conica",
        code: "EQ-MIN-01",
        name: "Chancadora Cónica",
        proceso: "Chancado Secundario / Terciario",
        descripcion: "Equipo de conminución por compresión entre un manto excéntrico giratorio y un cóncavo fijo.",
        componentes: ["Eje excéntrico de acero aleado", "Rodamientos oscilantes y axiales", "Engranajes cónicos espirales", "Pernos de sujeción de revestimientos"],
        modulosRelacionados: ["M02", "M03", "M04", "M07"],
        urlFicha: "equipos/procesamiento-minerales/chancadora-conica.html",
        url3D: "lab-3d/visor-3d.html?eq=chancadora-conica"
      },
      {
        id: "chancadora-quijadas",
        code: "EQ-MIN-02",
        name: "Chancadora de Quijadas",
        proceso: "Chancado Primario",
        descripcion: "Trituradora de impacto y compresión cíclica accionada por un eje excéntrico con volantes de inercia.",
        componentes: ["Eje excéntrico", "Rodamientos de rodillos a rótula", "Pernos de placa toggle", "Transmisión por fajas en V múltiples"],
        modulosRelacionados: ["M02", "M03", "M04", "M05"],
        urlFicha: "equipos/procesamiento-minerales/chancadora-quijadas.html",
        url3D: "lab-3d/visor-3d.html?eq=chancadora-quijadas"
      },
      {
        id: "molino-bolas",
        code: "EQ-MIN-03",
        name: "Molino de Bolas",
        proceso: "Molienda Húmeda / Seca",
        descripcion: "Cilindro rotatorio cargado con medios de molienda accionado mediante corona dentada y piñón.",
        componentes: ["Corona y piñón de dientes rectos/helicoidales", "Muñones y cojinetes hidrostáticos/rodamientos", "Pernos de forros (liners)", "Acoplamiento de alta torsión"],
        modulosRelacionados: ["M02", "M03", "M07", "M08"],
        urlFicha: "equipos/procesamiento-minerales/molino-bolas.html",
        url3D: "lab-3d/visor-3d.html?eq=molino-bolas"
      },
      {
        id: "faja-transportadora",
        code: "EQ-MIN-04",
        name: "Transportador de Fajas",
        proceso: "Transporte Continuo de Mineral",
        descripcion: "Sistema de transporte masivo impulsado por estación motriz con motor, reductor y polea motriz.",
        componentes: ["Eje de polea motriz", "Rodamientos bipartidos con manguito", "Reductor de ejes paralelos", "Acoplamiento hidráulico/flexible"],
        modulosRelacionados: ["M03", "M04", "M07", "M08"],
        urlFicha: "equipos/procesamiento-minerales/faja-transportadora.html",
        url3D: "lab-3d/visor-3d.html?eq=transportador-fajas"
      },
      {
        id: "zaranda-vibratoria",
        code: "EQ-MIN-05",
        name: "Zaranda Vibratoria",
        proceso: "Clasificación Granulométrica",
        descripcion: "Tamiz industrial sometido a aceleraciones cíclicas de 3g a 5g mediante ejes excitadores desbalanceados.",
        componentes: ["Rodamientos vibratorios de rodillos cilíndricos/rótula", "Ejes excitadores", "Resortes helicoidales de suspensión", "Pernos Huck/alta resistencia"],
        modulosRelacionados: ["M02", "M03", "M04", "M05"],
        urlFicha: "equipos/procesamiento-minerales/zaranda-vibratoria.html",
        url3D: "lab-3d/visor-3d.html?eq=zaranda-vibratoria"
      },
      {
        id: "bomba-pulpa",
        code: "EQ-MIN-06",
        name: "Bomba Centrífuga de Pulpa",
        proceso: "Impulsión de Fluidos Abrasivos",
        descripcion: "Bomba centrífuga de servicio pesado con impulsor revestido y eje en voladizo de alta rigidez.",
        componentes: ["Eje en voladizo (mínima deflexión)", "Rodamientos cónicos espalda con espalda", "Transmisión por fajas y poleas", "Pernos de carcasa partida"],
        modulosRelacionados: ["M03", "M04", "M05", "M08"],
        urlFicha: "equipos/procesamiento-minerales/bomba-pulpa.html",
        url3D: "lab-3d/visor-3d.html?eq=bomba-centrifuga"
      }
    ],
    auxiliares: [
      {
        id: "reductor-velocidad",
        code: "EQ-AUX-01",
        name: "Reductor de Engranajes",
        proceso: "Transmisión de Potencia",
        descripcion: "Caja reductora multietapa que adapta velocidad y multiplica el par torsional.",
        componentes: ["Engranajes helicoidales/cónicos", "Ejes escalonados", "Rodamientos de rodillos cónicos", "Sellos y chavetas paralelas"],
        modulosRelacionados: ["M03", "M04", "M07", "M08"],
        urlFicha: "equipos/auxiliares/reductor-velocidad.html",
        url3D: "lab-3d/visor-3d.html?eq=reductor-engranajes"
      },
      {
        id: "ventilador-industrial",
        code: "EQ-AUX-02",
        name: "Ventilador Centrífugo",
        proceso: "Ventilación y Extracción",
        descripcion: "Equipo rotativo de alta velocidad accionado frecuentemente por fajas trapezoidales.",
        componentes: ["Poleas y fajas en V", "Chumaceras de piso", "Rotor balanceado ISO 21940", "Pernos de anclaje con amortiguadores"],
        modulosRelacionados: ["M04", "M05", "M08"],
        urlFicha: "equipos/auxiliares/ventilador-industrial.html",
        url3D: "lab-3d/visor-3d.html?eq=tren-motor-acoplamiento-eje"
      },
      {
        id: "motor-electrico",
        code: "EQ-AUX-03",
        name: "Motor Eléctrico Trifásico",
        proceso: "Accionamiento Principal",
        descripcion: "Máquina motriz primaria normalizada bajo IEC 60034 / NEMA MG1.",
        componentes: ["Eje rotor con chavetero", "Rodamientos rígidos de bolas (DE/NDE)", "Pernos de fijación en base", "Acoplamiento flexible"],
        modulosRelacionados: ["M02", "M03", "M04", "M08"],
        urlFicha: "equipos/auxiliares/motor-electrico.html",
        url3D: "lab-3d/visor-3d.html?eq=tren-motor-acoplamiento-eje"
      }
    ],
    manufactureros: [
      {
        id: "maquina-cnc",
        code: "EQ-MAN-01",
        name: "Centro de Mecanizado CNC",
        proceso: "Manufactura de Precisión",
        descripcion: "Máquina herramienta de alta precisión con husillos de bolas recirculantes y guías lineales.",
        componentes: ["Tornillos de potencia (husillo de bolas)", "Rodamientos de contacto angular", "Acoplamientos de rigidez torsional", "Chavetas y portaherramientas"],
        modulosRelacionados: ["M01", "M02", "M03", "M04"],
        urlFicha: "equipos/manufactureros/maquina-cnc.html",
        url3D: "lab-3d/visor-3d.html?eq=tren-motor-acoplamiento-eje"
      },
      {
        id: "prensa-industrial",
        code: "EQ-MAN-02",
        name: "Prensa Mecánica Industrial",
        proceso: "Conformado y Estampado",
        descripcion: "Prensa excéntrica de alta carga impulsiva con volante de inercia y embrague-freno.",
        componentes: ["Cigüeñal / eje excéntrico", "Engranajes de alta carga", "Columnas y pernos pre-tensados", "Cojinetes de deslizamiento"],
        modulosRelacionados: ["M02", "M03", "M04", "M07"],
        urlFicha: "equipos/manufactureros/prensa-industrial.html",
        url3D: "lab-3d/visor-3d.html?eq=reductor-engranajes"
      }
    ]
  },

  simuladores: [
    { id: "sim-01", code: "SIM-01", name: "Esfuerzos Básicos (σ, τ)", mod: "M01", url: "simuladores/sim-01-esfuerzos-basicos.html" },
    { id: "sim-02", code: "SIM-02", name: "Factor de Seguridad (Von Mises / Tresca)", mod: "M01", url: "simuladores/sim-02-factor-seguridad.html" },
    { id: "sim-03", code: "SIM-03", name: "Tolerancias y Ajustes ISO 286", mod: "M01", url: "simuladores/sim-03-tolerancias-ajustes-iso.html" },
    { id: "sim-04", code: "SIM-04", name: "Diseño de Ejes por Fatiga", mod: "M03", url: "simuladores/sim-04-diseno-ejes.html" },
    { id: "sim-05", code: "SIM-05", name: "Chavetas y Chaveteros (DIN 6885)", mod: "M02", url: "simuladores/sim-05-chavetas-chaveteros.html" },
    { id: "sim-06", code: "SIM-06", name: "Uniones Empernadas y Precarga", mod: "M02", url: "simuladores/sim-06-uniones-empernadas.html" },
    { id: "sim-07", code: "SIM-07", name: "Vida Nominal de Rodamientos L10 (ISO 281)", mod: "M04", url: "simuladores/sim-07-seleccion-vida-rodamientos.html" },
    { id: "sim-08", code: "SIM-08", name: "Transmisión por Fajas y Poleas", mod: "M05", url: "simuladores/sim-08-transmision-fajas-poleas.html" },
    { id: "sim-09", code: "SIM-09", name: "Transmisión por Cadenas de Rodillos", mod: "M06", url: "simuladores/sim-09-transmision-cadenas.html" },
    { id: "sim-10", code: "SIM-10", name: "Diseño y Fuerzas en Engranajes", mod: "M07", url: "simuladores/sim-10-diseno-engranajes.html" },
    { id: "sim-11", code: "SIM-11", name: "Calculadora de Relación de Transmisión", mod: "M07", url: "simuladores/sim-11-relacion-transmision.html" },
    { id: "sim-12", code: "SIM-12", name: "Selección de Reductores Industriales", mod: "M07", url: "simuladores/sim-12-seleccion-reductores.html" },
    { id: "sim-13", code: "SIM-13", name: "Alineamiento de Ejes (Galgas / Láser)", mod: "M08", url: "simuladores/sim-13-alineamiento-ejes.html" },
    { id: "sim-14", code: "SIM-14", name: "Diagnóstico de Fallas Mecánicas (RCA)", mod: "M08", url: "simuladores/sim-14-analisis-fallas-mecanicas.html" }
  ]
};
