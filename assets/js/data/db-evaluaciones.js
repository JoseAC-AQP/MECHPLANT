/* ==========================================================================
   MECHPLANT - BANCO DE EVALUACIONES Y DIAGNÓSTICO (db-evaluaciones.js)
   Incluye preguntas conceptuales, problemas de cálculo y diagnóstico de fallas
   ========================================================================== */

window.MECHPLANT_EVALUACIONES = {
  m1: {
    moduleId: "m1",
    titulo: "Evaluación Módulo 1: Fundamentos de Diseño, Materiales y Tolerancias",
    preguntas: [
      {
        id: "m1-q1",
        tipo: "Conceptual",
        enunciado: "En un plano mecánico bajo norma ISO 286, un ajuste especificado como 50 H7/p6 entre un rodamiento o cubo y su eje indica:",
        opciones: [
          "Un ajuste con juego amplio para deslizamiento libre.",
          "Un ajuste con interferencia (apriete) donde el diámetro del eje es mayor que el del agujero.",
          "Una tolerancia geométrica de cilindricidad de 0.05 mm.",
          "Un acabado superficial rectificado Ra 0.8."
        ],
        respuestaCorrecta: 1,
        explicacion: "En el sistema de agujero base (H7), la letra 'p' (en minúscula para ejes) se ubica por encima de la línea cero, garantizando interferencia para transmisión de carga sin desplazamiento."
      },
      {
        id: "m1-q2",
        tipo: "Cálculo",
        enunciado: "Un tirante de acero SAE 1045 estirado en frío (Sy = 530 MPa) de sección circular de 20 mm de diámetro soporta una carga axial estática de tracción de 66 kN. ¿Cuál es su factor de seguridad (n) por fluencia?",
        opciones: [
          "n = 1.65",
          "n = 2.52",
          "n = 3.18",
          "n = 0.95 (Falla por fluencia)"
        ],
        respuestaCorrecta: 1,
        explicacion: "Área A = π*(20^2)/4 = 314.16 mm². Esfuerzo normal σ = 66,000 N / 314.16 mm² = 210.08 MPa. Factor de seguridad n = Sy / σ = 530 / 210.08 = 2.52."
      },
      {
        id: "m1-q3",
        tipo: "Diagnóstico",
        enunciado: "Al inspeccionar la carcasa de hierro fundido gris (ASTM A48 Cl. 30) de un reductor tras un impacto severo, se observa una grieta sin deformación plástica previa. ¿Qué teoría de falla estática explica mejor este comportamiento?",
        opciones: [
          "Teoría de la Energía de Distorsión (Von Mises).",
          "Teoría del Esfuerzo Cortante Máximo (Tresca).",
          "Teoría de Coulomb-Mohr / Esfuerzo Normal Máximo para materiales frágiles.",
          "Pandeo elástico de Euler."
        ],
        respuestaCorrecta: 2,
        explicacion: "El hierro fundido gris es un material frágil cuya resistencia a compresión (~752 MPa) es mucho mayor que su resistencia a tracción (~214 MPa); se modela con Coulomb-Mohr."
      }
    ]
  },

  m2: {
    moduleId: "m2",
    titulo: "Evaluación Módulo 2: Uniones Empernadas, Precarga y Chavetas",
    preguntas: [
      {
        id: "m2-q1",
        tipo: "Conceptual",
        enunciado: "¿Cuál es la función principal de aplicar una precarga inicial (Fi) alta en una unión empernada sometida a cargas dinámicas de separación (como la tapa de una chancadora o carcasa de bomba)?",
        opciones: [
          "Aumentar la dureza superficial del perno.",
          "Reducir la amplitud del esfuerzo alternante que absorbe el perno, transfiriendo la mayor parte de la carga externa a la descarga de los elementos unidos.",
          "Evitar la corrosión galvánica entre tuerca y arandela.",
          "Eliminar la necesidad de usar arandelas endurecidas."
        ],
        respuestaCorrecta: 1,
        explicacion: "Según Shigley (Cap. 8), la fracción de carga externa que toma el perno es C = kb / (kb + km). Como los miembros unidos son mucho más rígidos que el perno (km >> kb), el perno sufre una variación de esfuerzo mínima si se mantiene la precarga."
      },
      {
        id: "m2-q2",
        tipo: "Cálculo",
        enunciado: "Un eje de 50 mm de diámetro transmite un torque de 800 N·m mediante una chaveta paralela de ancho b = 14 mm, altura h = 9 mm y longitud L = 60 mm. ¿Cuál es el esfuerzo cortante promedio en la chaveta?",
        opciones: [
          "τ = 19.0 MPa",
          "τ = 38.1 MPa",
          "τ = 76.2 MPa",
          "τ = 118.5 MPa"
        ],
        respuestaCorrecta: 1,
        explicacion: "Fuerza tangencial F = T / r = 800 N·m / 0.025 m = 32,000 N. Área de corte A_corte = b * L = 14 mm * 60 mm = 840 mm². Esfuerzo cortante τ = 32,000 / 840 = 38.1 MPa."
      },
      {
        id: "m2-q3",
        tipo: "Diagnóstico",
        enunciado: "En los pernos de anclaje de una zaranda vibratoria se detecta aflojamiento recurrente pese a haber aplicado el torque nominal SAE J429 Grado 8. ¿Cuál es la causa raíz más probable y su acción correctiva?",
        opciones: [
          "Exceso de lubricación en la cabeza; cambiar a pernos Grado 2.",
          "Micromovimientos transversales por vibración que vencen la fricción de la rosca; incorporar arandelas de bloqueo por cuña (ej. Nord-Lock) y verificar planitud de apoyo.",
          "Fatiga térmica; soldar la tuerca al espárrago.",
          "Falla por aplastamiento puro; reducir el diámetro del agujero."
        ],
        respuestaCorrecta: 1,
        explicacion: "Las cargas vibratorias transversales provocan deslizamiento relativo en los hilos de rosca (efecto Junker). Las arandelas de bloqueo por cuña mecánica impiden el giro de aflojamiento."
      }
    ]
  },

  m3: {
    moduleId: "m3",
    titulo: "Evaluación Módulo 3: Diseño de Ejes y Fatiga",
    preguntas: [
      {
        id: "m3-q1",
        tipo: "Conceptual",
        enunciado: "En un eje rotativo de velocidad constante sometido a una carga radial estacionaria (ej. eje de polea motriz de un transportador), ¿cómo se comportan los esfuerzos de flexión y torsión en un punto de la superficie?",
        opciones: [
          "Flexión constante (media) y torsión completamente invertida (alternante).",
          "Flexión completamente invertida (alternante) y torsión constante (media).",
          "Ambos esfuerzos son puramente estáticos.",
          "Ambos esfuerzos son completamente invertidos."
        ],
        respuestaCorrecta: 1,
        explicacion: "Al girar el eje 180°, cada fibra superficial pasa de tracción máxima a compresión máxima en cada revolución (flexión alternante), mientras que el par torsor transmitido permanece constante (torsión media)."
      },
      {
        id: "m3-q2",
        tipo: "Cálculo",
        enunciado: "Un eje macizo de 40 mm de diámetro soporta un momento flector alternante Ma = 300 N·m y un torque medio Tm = 400 N·m. Ignorando concentradores de esfuerzo (Kf = Kfs = 1), ¿cuál es el esfuerzo normal alternante de flexión (σa)?",
        opciones: [
          "σa = 23.9 MPa",
          "σa = 47.7 MPa",
          "σa = 95.5 MPa",
          "σa = 143.2 MPa"
        ],
        respuestaCorrecta: 1,
        explicacion: "σa = 32 * Ma / (π * d³) = 32 * (300,000 N·mm) / (π * 40³ mm³) = 9,600,000 / 201,061.9 = 47.75 MPa."
      },
      {
        id: "m3-q3",
        tipo: "Diagnóstico",
        enunciado: "El eje de una bomba centrífuga presenta desgaste acelerado en la empaquetadura y fuga constante de pulpa, aunque el cálculo por resistencia a fatiga arroja un factor de seguridad n = 3.4. ¿Qué criterio de diseño se omitió?",
        opciones: [
          "Verificación de deflexión lateral y pendiente en la zona de sello.",
          "Resistencia al impacto Charpy.",
          "Dureza Brinell del extremo acoplado.",
          "Cálculo de pandeo torsional."
        ],
        respuestaCorrecta: 0,
        explicacion: "Como enfatizan Shigley y Norton, el diseño de ejes está gobernado frecuentemente por rigidez (deflexión y pendiente) más que por resistencia: deflexiones > 0.05 mm en sellos mecánicos o empaquetaduras destruyen el sellado."
      }
    ]
  },

  m4: {
    moduleId: "m4",
    titulo: "Evaluación Módulo 4: Rodamientos y Cojinetes (ISO 281 / ISO 76)",
    preguntas: [
      {
        id: "m4-q1",
        tipo: "Conceptual",
        enunciado: "Según la norma ISO 281, si la carga dinámica equivalente (P) sobre un rodamiento de rodillos (exponente p = 10/3) se reduce a la mitad manteniendo constante la velocidad, ¿qué ocurre con su vida nominal L10?",
        opciones: [
          "Se duplica (2 veces mayor).",
          "Aumenta 8 veces (2³).",
          "Aumenta aproximadamente 10 veces (2^(10/3) = 10.08).",
          "Permanece igual si no cambia la viscosidad del lubricante."
        ],
        respuestaCorrecta: 2,
        explicacion: "La ecuación ISO 281 es L10 = (C/P)^p. Para rodamientos de rodillos p = 10/3 ≈ 3.333. Al dividir P entre 2, L10 aumenta por un factor de 2^(10/3) = 10.08."
      },
      {
        id: "m4-q2",
        tipo: "Cálculo",
        enunciado: "Un rodamiento rígido de bolas (p = 3) tiene una capacidad de carga dinámica C = 35 kN y soporta una carga radial pura P = 7 kN girando a 1000 rpm. ¿Cuál es su vida nominal en horas (L10h)?",
        opciones: [
          "L10h = 2,083 horas",
          "L10h = 8,333 horas",
          "L10h = 12,500 horas",
          "L10h = 25,000 horas"
        ],
        respuestaCorrecta: 0,
        explicacion: "L10 = (35 / 7)³ = 5³ = 125 millones de revoluciones. L10h = (125 * 10^6) / (60 * 1000) = 2,083.3 horas."
      },
      {
        id: "m4-q3",
        tipo: "Diagnóstico",
        enunciado: "Al desmontar un rodamiento de rodillos cilíndricos de un motor eléctrico acoplado a una bomba, se observan marcas acanaladas oscuras (fluting) paralelas al eje en la pista exterior. ¿Cuál es la causa más probable?",
        opciones: [
          "Paso de corriente eléctrica parásita (EDM) desde el variador de frecuencia (VFD) a través del rodamiento.",
          "Exceso de grasa de litio.",
          "Ajuste demasiado holgado en el eje.",
          "Carga axial excesiva."
        ],
        respuestaCorrecta: 0,
        explicacion: "El patrón acanalado (fluting) es característico de erosión eléctrica por corrientes de eje inducidas por VFD; requiere anillos de puesta a tierra de eje o rodamientos aislados."
      }
    ]
  },

  m5: {
    moduleId: "m5",
    titulo: "Evaluación Módulo 5: Transmisiones por Fajas y Poleas",
    preguntas: [
      {
        id: "m5-q1",
        tipo: "Conceptual",
        enunciado: "¿Por qué las fajas trapezoidales (en V) permiten transmitir mayor potencia que una faja plana con la misma tensión inicial?",
        opciones: [
          "Porque tienen mayor longitud total.",
          "Por el efecto cuña en la ranura de la polea, que incrementa la fuerza normal contra las paredes laterales por un factor 1 / sen(β/2).",
          "Porque no sufren fuerza centrífuga a alta velocidad.",
          "Porque trabajan engranadas por dientes."
        ],
        respuestaCorrecta: 1,
        explicacion: "La geometría trapecial encaja en la garganta de la polea (ángulo típico 34°-38°), multiplicando la fuerza normal y la fricción efectiva."
      },
      {
        id: "m5-q2",
        tipo: "Cálculo",
        enunciado: "Un motor eléctrico gira a 1480 rpm con una polea motriz de diámetro primitivo d = 160 mm. Si la polea conducida de un ventilador tiene D = 400 mm, ¿cuál es la velocidad periférica de la faja y la rpm de salida (sin deslizamiento)?",
        opciones: [
          "v = 12.4 m/s y n2 = 592 rpm",
          "v = 24.8 m/s y n2 = 592 rpm",
          "v = 12.4 m/s y n2 = 3700 rpm",
          "v = 6.2 m/s y n2 = 740 rpm"
        ],
        respuestaCorrecta: 0,
        explicacion: "Velocidad periférica v = π * d * n1 / 60,000 = π * 160 * 1480 / 60,000 = 12.40 m/s. Velocidad salida n2 = 1480 * (160 / 400) = 592 rpm."
      },
      {
        id: "m5-q3",
        tipo: "Diagnóstico",
        enunciado: "En una transmisión múltiple de 4 fajas en V de una bomba de pulpa, una de las fajas se rompe por desgaste. ¿Cuál es el procedimiento correcto de mantenimiento?",
        opciones: [
          "Reemplazar únicamente la faja rota por una nueva de la misma sección.",
          "Reemplazar el juego completo de 4 fajas por un set hermanado (matched set) y verificar alineamiento láser de poleas.",
          "Tensar las 3 fajas restantes al máximo para compensar.",
          "Aplicar resina adherente sobre las poleas."
        ],
        respuestaCorrecta: 1,
        explicacion: "Las fajas usadas ya sufrieron elongación permanente; si se instala una faja nueva junto a tres usadas, la nueva asumirá casi toda la carga y fallará prematuramente."
      }
    ]
  },

  m6: {
    moduleId: "m6",
    titulo: "Evaluación Módulo 6: Transmisiones por Cadenas",
    preguntas: [
      {
        id: "m6-q1",
        tipo: "Conceptual",
        enunciado: "¿Qué fenómeno cinemático causa fluctuaciones de velocidad y vibración en transmisiones por cadena cuando el piñón motriz tiene muy pocos dientes (ej. Z1 < 17)?",
        opciones: [
          "Deslizamiento elástico (creep).",
          "Efecto poligonal (acción cordal).",
          "Cavitación del lubricante.",
          "Pandeo lateral de placas."
        ],
        respuestaCorrecta: 1,
        explicacion: "Al engranar los eslabones sobre un polígono de Z lados, el radio efectivo varía entre el radio primitivo y el apotema, generando pulsaciones de velocidad que disminuyen al aumentar Z1."
      },
      {
        id: "m6-q2",
        tipo: "Cálculo",
        enunciado: "Una transmisión por cadena ANSI #80 (paso p = 25.4 mm) tiene un piñón motriz de Z1 = 19 dientes girando a 300 rpm y una rueda conducida de Z2 = 57 dientes. ¿Cuál es la velocidad lineal promedio de la cadena?",
        opciones: [
          "v = 1.21 m/s",
          "v = 2.41 m/s",
          "v = 4.83 m/s",
          "v = 0.80 m/s"
        ],
        respuestaCorrecta: 1,
        explicacion: "v = (Z1 * p * n1) / 60,000 = (19 * 25.4 * 300) / 60,000 = 144,780 / 60,000 = 2.413 m/s."
      },
      {
        id: "m6-q3",
        tipo: "Diagnóstico",
        enunciado: "Durante la inspección de un alimentador accionado por cadena de rodillos, se mide una elongación del 2.4% respecto a su longitud nominal nueva. ¿Qué acción debe tomarse?",
        opciones: [
          "Continuar operando hasta alcanzar el 5% de elongación.",
          "Programar el reemplazo inmediato de la cadena (límite típico 1.5% - 2% en transmisiones) e inspeccionar el perfil de dientes de los piñones.",
          "Quitar dos eslabones y volver a unir.",
          "Cambiar a grasa de alta viscosidad."
        ],
        respuestaCorrecta: 1,
        explicacion: "El desgaste interno entre pasador y buje alarga el paso de la cadena, haciendo que los rodillos trepen hacia la punta de los dientes del piñón y los destruyan."
      }
    ]
  },

  m7: {
    moduleId: "m7",
    titulo: "Evaluación Módulo 7: Diseño de Engranajes y Reductores",
    preguntas: [
      {
        id: "m7-q1",
        tipo: "Conceptual",
        enunciado: "¿Cuál es la principal diferencia de cargas que introducen los engranajes helicoidales en comparación con los engranajes cilíndricos de dientes rectos?",
        opciones: [
          "No generan fuerza radial.",
          "Generan una componente de fuerza axial (empuje Wa = Wt * tan ψ) que debe ser absorbida por los rodamientos.",
          "Tienen menor relación de contacto.",
          "Solo pueden operar a bajas velocidades."
        ],
        respuestaCorrecta: 1,
        explicacion: "La inclinación de los dientes (ángulo de hélice ψ) suaviza el engrane y reduce el ruido, pero descompone la fuerza normal generando empuje axial (Wa)."
      },
      {
        id: "m7-q2",
        tipo: "Cálculo",
        enunciado: "Un piñón recto de módulo m = 4 mm y Z1 = 25 dientes transmite 15 kW a 1432 rpm (ω = 150 rad/s). ¿Cuál es la fuerza tangencial (Wt) en el círculo primitivo?",
        opciones: [
          "Wt = 1,000 N",
          "Wt = 2,000 N",
          "Wt = 4,000 N",
          "Wt = 500 N"
        ],
        respuestaCorrecta: 1,
        explicacion: "Diámetro primitivo d1 = m * Z1 = 4 * 25 = 100 mm (r1 = 0.05 m). Torque T = P / ω = 15,000 W / 150 rad/s = 100 N·m. Fuerza tangencial Wt = T / r1 = 100 / 0.05 = 2,000 N."
      },
      {
        id: "m7-q3",
        tipo: "Diagnóstico",
        enunciado: "En los dientes de un reductor de molienda se observan cráteres pequeños en la línea primitiva (dedendum cercano al pitch line). ¿A qué mecanismo de falla corresponde?",
        opciones: [
          "Fractura por sobrecarga instantánea.",
          "Fatiga superficial por contacto hertziano (Pitting / Picadura).",
          "Gripado adhesivo por falta total de aceite (Scuffing).",
          "Corrosión intergranular."
        ],
        respuestaCorrecta: 1,
        explicacion: "El pitting ocurre por esfuerzos cíclicos de contacto (Hertz) que superan la resistencia superficial del material o por caída de espesor de película lubricante."
      }
    ]
  },

  m8: {
    moduleId: "m8",
    titulo: "Evaluación Módulo 8: Integración, Vibraciones y Confiabilidad",
    preguntas: [
      {
        id: "m8-q1",
        tipo: "Conceptual",
        enunciado: "En un espectro de vibraciones mecánicas (FFT) de un conjunto motor-acoplamiento-bomba que gira a 1800 rpm (30 Hz), un pico dominante en 2X (60 Hz) en dirección axial y radial suele indicar:",
        opciones: [
          "Desbalanceo estático puro del rotor.",
          "Desalineamiento angular o paralelo en el acoplamiento.",
          "Cavitación hidráulica.",
          "Holgura en la cimentación."
        ],
        respuestaCorrecta: 1,
        explicacion: "El desalineamiento de ejes genera fuerzas de reacción dos veces por revolución (2X RPM), frecuentemente acompañado de componente axial elevada."
      },
      {
        id: "m8-q2",
        tipo: "Cálculo",
        enunciado: "Un equipo crítico de planta operó durante 1,440 horas en un periodo de 2 meses y sufrió 3 fallas mecánicas cuyas reparaciones tomaron un total de 24 horas. ¿Cuál es su MTBF (Tiempo Medio Entre Fallas)?",
        opciones: [
          "MTBF = 472 horas",
          "MTBF = 480 horas",
          "MTBF = 8 horas",
          "MTBF = 98.3%"
        ],
        respuestaCorrecta: 0,
        explicacion: "Tiempo operativo neto = 1,440 - 24 = 1,416 horas. MTBF = Tiempo operativo neto / Número de fallas = 1,416 / 3 = 472 horas (MTTR = 24 / 3 = 8 horas)."
      },
      {
        id: "m8-q3",
        tipo: "Diagnóstico",
        enunciado: "Al realizar un alineamiento láser entre un motor de 200 HP y un reductor, las lecturas cambian erráticamente cada vez que se aprietan los pernos de anclaje del motor. ¿Qué condición mecánica debe corregirse antes de alinear?",
        opciones: [
          "Pata coja (Soft Foot) en el bastidor o base del motor.",
          "Desbalanceo dinámico G2.5.",
          "Viscosidad del aceite del reductor.",
          "Contragolpe de engranajes."
        ],
        respuestaCorrecta: 0,
        explicacion: "La 'pata coja' (Soft Foot) ocurre cuando una de las patas del motor no apoya en el mismo plano que las otras tres; al apretar el perno se deforma la carcasa y se desalinea el eje."
      }
    ]
  }
};
