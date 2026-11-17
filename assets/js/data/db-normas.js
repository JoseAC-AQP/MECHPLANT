/* ==========================================================================
   MECHPLANT - BASE DE DATOS DE NORMATIVA INTERNACIONAL (db-normas.js)
   Cumple Reglas Normativas: organismo, alcance, tipo de norma y estado
   ========================================================================== */

window.MECHPLANT_NORMAS = [
  // --- NORMAS ISO ---
  {
    codigo: "ISO 286-1 / 286-2",
    organismo: "ISO",
    titulo: "Especificación geométrica de productos (GPS) — Sistema de codificación ISO para tolerancias en dimensiones lineales",
    tipo: "Norma Dimensional / Ajustes",
    modulos: ["M01", "M03", "M04"],
    aplicacion: "Selección de ajustes con juego, indeterminados o con interferencia entre ejes, alojamientos, rodamientos y cubos.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 2768-1 / 2768-2",
    organismo: "ISO",
    titulo: "Tolerancias generales para dimensiones lineales, angulares y geométricas sin indicación individual",
    tipo: "Norma Dimensional",
    modulos: ["M01"],
    aplicacion: "Simplificación de planos de fabricación de piezas mecanizadas y estructuras de planta.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 1101",
    organismo: "ISO",
    titulo: "Especificación geométrica de productos (GPS) — Tolerancias geométricas (forma, orientación, localización y cabeceo)",
    tipo: "Norma Dimensional / GD&T",
    modulos: ["M01", "M03"],
    aplicacion: "Control de cilindricidad, coaxialidad y runout en asientos de rodamientos y ejes de alta velocidad.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 12100",
    organismo: "ISO",
    titulo: "Seguridad de las máquinas — Principios generales para el diseño — Evaluación del riesgo y reducción del riesgo",
    tipo: "Norma de Diseño y Seguridad",
    modulos: ["M01", "M02", "M05", "M06"],
    aplicacion: "Diseño de guardas de protección en transmisiones por fajas, cadenas y acoplamientos rotativos.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 281",
    organismo: "ISO",
    titulo: "Rodamientos — Capacidad de carga dinámica y vida nominal (L10 y L10m)",
    tipo: "Norma de Diseño y Cálculo",
    modulos: ["M04"],
    aplicacion: "Cálculo de vida básica por fatiga subsuperficial en rodamientos de bolas y rodillos.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 76",
    organismo: "ISO",
    titulo: "Rodamientos — Capacidad de carga estática (C0)",
    tipo: "Norma de Diseño y Cálculo",
    modulos: ["M04"],
    aplicacion: "Verificación de deformación plástica permanente (brinelling) en rodamientos sometidos a cargas en reposo o choque.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 6336 (Partes 1-6)",
    organismo: "ISO",
    titulo: "Cálculo de la capacidad de carga de engranajes cilíndricos rectos y helicoidales",
    tipo: "Norma de Diseño y Cálculo",
    modulos: ["M07"],
    aplicacion: "Verificación de resistencia a picadura (contacto) y fractura en raíz del diente (flexión).",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 1328-1",
    organismo: "ISO",
    titulo: "Engranajes cilíndricos — Sistema de clasificación de precisión de flancos",
    tipo: "Norma de Fabricación y Calidad",
    modulos: ["M07"],
    aplicacion: "Definición de grados de precisión (ej. Grado 6 a 8) según velocidad periférica del reductor.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 21940-11 (Sustituye a ISO 1940-1)",
    organismo: "ISO",
    titulo: "Vibraciones mecánicas — Equilibrado de rotores — Procedimientos y tolerancias para rotores rígidos",
    tipo: "Norma de Fabricación y Mantenimiento",
    modulos: ["M08"],
    aplicacion: "Definición de grados de calidad de balanceo (ej. G6.3 para impulsores de bombas y ventiladores; G2.5 para motores). Nota: Sustituye a la histórica ISO 1940-1.",
    estado: "Vigente (Sustituye ISO 1940)"
  },
  {
    codigo: "ISO 20816 (Partes 1-9) (Sustituye a ISO 10816)",
    organismo: "ISO",
    titulo: "Vibraciones mecánicas — Medición y evaluación de la vibración de máquinas en partes no rotativas",
    tipo: "Norma de Ensayo y Mantenimiento Predictivo",
    modulos: ["M08"],
    aplicacion: "Criterios de severidad vibratoria (Zonas A, B, C, D) en motores, bombas y reductores. Nota: Sustituye progresivamente las partes de la histórica ISO 10816.",
    estado: "Vigente (Sustituye ISO 10816)"
  },
  {
    codigo: "ISO 14224",
    organismo: "ISO",
    titulo: "Industrias del petróleo, petroquímica y gas natural — Recopilación e intercambio de datos de confiabilidad y mantenimiento de equipos",
    tipo: "Norma de Confiabilidad y Mantenimiento",
    modulos: ["M08"],
    aplicacion: "Taxonomía de equipos, codificación de modos de falla, causas de falla y cálculo de MTBF/disponibilidad.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ISO 55000 / 55001",
    organismo: "ISO",
    titulo: "Gestión de activos — Visión general, principios y terminología / Requisitos",
    tipo: "Norma de Gestión",
    modulos: ["M08"],
    aplicacion: "Alineamiento de las estrategias de mantenimiento y rediseño mecánico con el ciclo de vida del activo.",
    estado: "Vigente (Referencia técnica)"
  },

  // --- NORMAS ASME / ANSI ---
  {
    codigo: "ASME B1.1",
    organismo: "ASME",
    titulo: "Roscas unificadas en pulgadas (UN y UNR)",
    tipo: "Norma Dimensional",
    modulos: ["M02"],
    aplicacion: "Geometría de roscas UNC, UNF y cálculo de áreas de esfuerzo a tracción (At) y corte.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ASME B18.2.1 / B18.2.2",
    organismo: "ASME",
    titulo: "Pernos y tornillos cuadrados y hexagonales / Tuercas (Serie en pulgadas)",
    tipo: "Norma Dimensional",
    modulos: ["M02"],
    aplicacion: "Dimensiones de cabeza, altura de tuerca y selección de llaves/herramientas de torque.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ASME Y14.5",
    organismo: "ASME",
    titulo: "Dimensionamiento y tolerancias geométricas (GD&T)",
    tipo: "Norma de Ingeniería y Planos",
    modulos: ["M01"],
    aplicacion: "Especificación de datums, posición verdadera, perpendicularidad y perfil en planos de fabricación.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ASME B106.1M (Histórica)",
    organismo: "ASME",
    titulo: "Diseño de ejes de transmisión (Design of Transmission Shafting)",
    tipo: "Referencia Histórica de Diseño",
    modulos: ["M03"],
    aplicacion: "Metodología clásica de dimensionamiento de ejes por fatiga bajo flexión y torsión combinadas (referenciada en Shigley).",
    estado: "Retirada por ASME / Referencia académica histórica"
  },
  {
    codigo: "ANSI/ASME B29.1",
    organismo: "ANSI",
    titulo: "Cadenas de rodillos de transmisión de potencia de precisión, accesorios y piñones",
    tipo: "Norma Dimensional y de Diseño",
    modulos: ["M06"],
    aplicacion: "Selección de paso de cadena (#40, #60, #80, #100, etc.), capacidad de potencia y lubricación.",
    estado: "Vigente (Referencia técnica)"
  },

  // --- NORMAS SAE / ASTM / AGMA / DIN / API / IEC ---
  {
    codigo: "SAE J429",
    organismo: "SAE",
    titulo: "Requisitos mecánicos y de materiales para sujetadores roscados externamente",
    tipo: "Norma de Materiales y Propiedades",
    modulos: ["M02"],
    aplicacion: "Especificación de resistencia de prueba (Sp), fluencia (Sy) y última (Sut) para pernos Grados 2, 5 y 8.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "SAE J403 / SAE J404",
    organismo: "SAE",
    titulo: "Composiciones químicas de aceros al carbono (J403) y aceros aleados (J404)",
    tipo: "Norma de Materiales",
    modulos: ["M01", "M03", "M07"],
    aplicacion: "Selección de aceros (1020, 1045, 4140, 4340, 8620) para ejes, chavetas y engranajes.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "ANSI/AGMA 2001-D04 / 2101-D04",
    organismo: "AGMA",
    titulo: "Factores fundamentales de clasificación y métodos de cálculo para dientes de engranajes rectos y helicoidales involutos",
    tipo: "Norma de Diseño y Cálculo",
    modulos: ["M07"],
    aplicacion: "Ecuaciones AGMA de esfuerzo de flexión y resistencia a picadura (base del capítulo de engranajes en Shigley).",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "DIN 6885-1",
    organismo: "DIN",
    titulo: "Chavetas paralelas y chaveteros — Sección transversal y tolerancias",
    tipo: "Norma Dimensional",
    modulos: ["M02", "M03"],
    aplicacion: "Dimensionamiento normalizado (ancho b x alto h) de chavetas según el diámetro del eje.",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "API 686",
    organismo: "API",
    titulo: "Práctica recomendada para el diseño de instalación e ingeniería de maquinaria",
    tipo: "Práctica Recomendada de Montaje",
    modulos: ["M02", "M08"],
    aplicacion: "Criterios de cimentación, grouting, tolerancias de alineamiento de ejes y tuberías sin esfuerzo (pipe strain).",
    estado: "Vigente (Referencia técnica)"
  },
  {
    codigo: "IEC 60034-1 / 60034-14",
    organismo: "IEC",
    titulo: "Máquinas eléctricas rotativas — Características asignadas y vibraciones mecánicas",
    tipo: "Norma Electromecánica",
    modulos: ["M08"],
    aplicacion: "Selección de motores eléctricos industriales, factores de servicio y límites de vibración en fábrica.",
    estado: "Vigente (Referencia técnica)"
  }
];
