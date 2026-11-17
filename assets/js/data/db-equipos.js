/* ==========================================================================
   MECHPLANT - BASE DE DATOS DE EQUIPOS INDUSTRIALES (db-equipos.js)
   Incluye los 13 bloques técnicos educativos por equipo y enlaces cruzados
   ========================================================================== */

window.MECHPLANT_EQUIPOS = {
  "chancadora-conica": {
    id: "chancadora-conica",
    code: "EQ-MIN-01",
    categoria: "Procesamiento de Minerales",
    nombre: "Chancadora Cónica Secundaria/Terciaria",
    modelo3D: "chancadora-conica.glb",
    funcionamiento: "Reduce el tamaño del mineral mediante compresión interparticular entre un manto cónico móvil (con movimiento giratorio excéntrico) y un revestimiento cóncavo fijo.",
    componentesPrincipales: [
      "Bastidor principal (Mainframe) y taza (Bowl)",
      "Eje principal (Main Shaft) y buje excéntrico",
      "Contraeje (Countershaft) y piñón/corona cónica espiral",
      "Sistema hidro-neumático de alivio (Tramp Release)"
    ],
    despieceMecanico: [
      { item: 1, pieza: "Eje Principal", funcion: "Soportar el cabezal y transmitir cargas de trituración", material: "Acero aleado SAE 4340 templado y revenido" },
      { item: 2, pieza: "Conjunto Piñón-Corona Cónica", funcion: "Transmitir potencia del motor al excéntrico", material: "Acero cementado SAE 8620 / 9310" },
      { item: 3, pieza: "Rodamientos de Contraeje", funcion: "Soportar cargas radiales y axiales del piñón", material: "Acero al cromo AISI 52100" },
      { item: 4, pieza: "Pernos de Anclaje y Bastidor", funcion: "Fijar el conjunto ante impactos cíclicos", material: "Acero grado 8 (SAE J429) / ASTM A193 B7" }
    ],
    elementosPresentes: ["Ejes escalonados", "Engranajes cónicos espirales", "Rodamientos de rodillos cónicos y oscilantes", "Chavetas paralelas", "Uniones empernadas de alta resistencia", "Transmisión por fajas en V"],
    condicionesOperacion: {
      tipoDato: "Referencial industrial (Chancadora secundaria 300 HP / 224 kW)",
      potencia: "224 kW (300 HP)",
      velocidadContraeje: "750 - 900 rpm",
      ambiente: "Polvo abrasivo mineral, vibración severa e impactos intermitentes"
    },
    cargasEsfuerzos: "Cargas radiales de impacto cíclico por trituración, torsión alta en contraeje, esfuerzos de contacto (Hertz) elevados en dientes cónicos y fatiga por flexión rotativa.",
    problemasFrecuentes: [
      "Desgaste acelerado de bujes excéntricos por contaminación de polvo en aceite",
      "Picadura (pitting) y rotura de dientes en corona cónica por desajuste de backlash",
      "Falla prematura de rodamientos de contraeje por desalineamiento de poleas",
      "Aflojamiento de pernos de cimentación por paso de material intriturable (tramp iron)"
    ],
    inspeccion: [
      "Análisis de vibraciones en caja de contraeje (ISO 20816-3)",
      "Termografía infrarroja en rodamientos y línea de retorno de aceite",
      "Conteo de partículas ISO 4406 y análisis espectrométrico de cobre/plomo en lubricante",
      "Medición de contragolpe (backlash) y contacto de dientes con azul de Prusia"
    ],
    mantenimientoPreventivo: [
      "Revisión de presión y temperatura del sistema de lubricación forzada cada turno",
      "Cambio de filtros de aceite y verificación de sellos tipo laberinto/Taconite",
      "Reapriete controlado con torquímetro hidráulico en pernos críticos cada 500 h"
    ],
    actividadCalculo: {
      titulo: "Verificación del Contraeje y Vida de Rodamientos",
      enunciado: "Calcular el diámetro mínimo del contraeje de acero SAE 4140 que transmite 224 kW a 850 rpm bajo carga de choque moderado (Kt=1.5) y estimar la vida nominal L10h.",
      simuladorId: "sim-04"
    },
    modulosVinculados: ["m2", "m3", "m4", "m5", "m7", "m8"]
  },

  "faja-transportadora": {
    id: "faja-transportadora",
    code: "EQ-MIN-04",
    categoria: "Procesamiento de Minerales",
    nombre: "Transportador de Fajas de Alta Capacidad",
    modelo3D: "transportador-fajas.glb",
    funcionamiento: "Transporte continuo de material a granel mediante una banda elastomérica reforzada accionada por fricción sobre una polea motriz.",
    componentesPrincipales: [
      "Estación motriz (Motor eléctrico + Acoplamiento + Reductor + Polea motriz)",
      "Polea de cola, poleas deflectoras y contrapeso tensor (Take-up)",
      "Bastidores (stringers) y estaciones de polines de carga y retorno",
      "Chutes de transferencia y raspadores de limpieza"
    ],
    despieceMecanico: [
      { item: 1, pieza: "Eje de Polea Motriz", funcion: "Soportar tensión de faja (T1 + T2) y transmitir torque", material: "Acero SAE 4140 / 4340 normalizado" },
      { item: 2, pieza: "Rodamientos Oscilantes de Rodillos", funcion: "Absorber deflexión angular del eje bajo carga", material: "AISI 52100 con manguito de fijación cónico" },
      { item: 3, pieza: "Reductor de Ejes Paralelos", funcion: "Reducir de 1780 rpm a ~45 rpm en polea", material: "Engranajes helicoidales cementados" },
      { item: 4, pieza: "Acoplamiento Hidráulico / Elástico", funcion: "Suavizar arranque con faja cargada", material: "Aleación de aluminio / acero fundido" }
    ],
    elementosPresentes: ["Ejes de transmisión sometidos a flexo-torsión", "Rodamientos oscilantes en chumaceras bipartidas", "Engranajes helicoidales", "Acoplamientos", "Elementos de fijación estructural"],
    condicionesOperacion: {
      tipoDato: "Referencial industrial (Transportador Overland / Planta)",
      potencia: "150 kW - 500 kW",
      velocidadBanda: "2.5 - 4.2 m/s",
      ambiente: "Operación continua 24/7, polvo ambiental, humedad y arranques bajo carga"
    },
    cargasEsfuerzos: "Flexión severa en el eje de polea motriz debida a la suma vectorial de tensiones T1 y T2 más peso propio, combinada con torsión constante.",
    problemasFrecuentes: [
      "Fractura por fatiga en el eje de la polea motriz (zona de cubo o cambio de diámetro)",
      "Sobrecalentamiento de chumaceras por exceso de grasa o falla de sellos",
      "Desalineamiento de banda por desgaste irregular de polines o acumulación de material",
      "Desgaste de elastómeros en acoplamientos por desalineación angular/paralela"
    ],
    inspeccion: [
      "Monitoreo de temperatura en chumaceras y carcasa de reductor (termografía)",
      "Inspección acústica/ultrasónica de polines en marcha",
      "Verificación de alineamiento láser motor-reductor (ISO 20816)",
      "Ensayo por ultrasonido (UT) en muñones de eje de polea motriz en paradas mayores"
    ],
    mantenimientoPreventivo: [
      "Lubricación programada de chumaceras según horas de operación y diámetro de rodamiento",
      "Inspección de nivel y estado de aceite sintético ISO VG 320 en reductor",
      "Verificación de carrera del contrapeso tensor y estado de empalmes"
    ],
    actividadCalculo: {
      titulo: "Dimensionamiento del Eje de Polea Motriz",
      enunciado: "Determinar los esfuerzos alternantes y medios en el eje de una polea motriz con T1 = 48 kN y T2 = 16 kN, verificando el factor de seguridad por Goodman modificado.",
      simuladorId: "sim-04"
    },
    modulosVinculados: ["m1", "m3", "m4", "m7", "m8"]
  },

  "bomba-pulpa": {
    id: "bomba-pulpa",
    code: "EQ-MIN-06",
    categoria: "Procesamiento de Minerales",
    nombre: "Bomba Centrífuga Horizontal de Pulpa",
    modelo3D: "bomba-centrifuga.glb",
    funcionamiento: "Impulsa mezclas sólido-líquido altamente abrasivas mediante energía cinética impartida por un impulsor cerrado de álabes gruesos.",
    componentesPrincipales: [
      "Carcasa partida con revestimiento reemplazable (elastómero o alto cromo)",
      "Impulsor centrífugo en voladizo",
      "Conjunto de rodamientos (Bearing Assembly) en cartucho",
      "Sistema de sellado (prensaestopas con agua de sello o sello mecánico)"
    ],
    despieceMecanico: [
      { item: 1, pieza: "Eje en Voladizo", funcion: "Soportar impulsor minimizando deflexión en caja de sello", material: "Acero SAE 4140 de alta rigidez" },
      { item: 2, pieza: "Rodamientos de Rodillos Cónicos", funcion: "Soportar empuje axial hidráulico y carga radial", material: "AISI 52100 montaje espalda-espalda (DB)" },
      { item: 3, pieza: "Transmisión por Fajas en V", funcion: "Permitir ajuste de velocidad según curva del sistema", material: "Poleas de hierro dúctil y fajas estrechas 5V/8V" },
      { item: 4, pieza: "Espárragos de Carcasa", funcion: "Soportar presión interna de descarga", material: "Acero ASTM A193 B7" }
    ],
    elementosPresentes: ["Ejes en voladizo (rigidez crítica)", "Rodamientos cónicos y cilíndricos", "Transmisiones por fajas y poleas", "Pernos y espárragos de brida"],
    condicionesOperacion: {
      tipoDato: "Referencial industrial (Bomba de alimentación a ciclones)",
      potencia: "110 kW (150 HP)",
      velocidadBomba: "680 - 950 rpm",
      ambiente: "Pulpa abrasiva (gravedad específica 1.4 - 1.7), salpicaduras y cavitación potencial"
    },
    cargasEsfuerzos: "Empuje axial hidráulico elevado hacia la succión, carga radial por desbalanceo hidráulico/abrasión del impulsor y tensión radial de fajas.",
    problemasFrecuentes: [
      "Deflexión excesiva del eje que destruye empaquetaduras o sellos mecánicos",
      "Desgaste erosivo asimétrico del impulsor generando desbalanceo dinámico",
      "Patinaje y cristalización de fajas en V por tensado insuficiente",
      "Ingreso de pulpa al alojamiento de rodamientos por falla de sello expulsor/laberinto"
    ],
    inspeccion: [
      "Medición de vibración radial y axial en soportes de rodamientos (ISO 20816-7)",
      "Control de caudal y presión de agua de sello (debe superar presión de descarga)",
      "Inspección de tensión de fajas mediante tensiómetro de deflexión o frecuencia",
      "Verificación de luz axial del impulsor respecto al plato de succión"
    ],
    mantenimientoPreventivo: [
      "Ajuste periódico de luz axial (nose gap) para mantener eficiencia hidráulica",
      "Alineamiento láser de poleas motriz y conducida en cada cambio de fajas",
      "Reemplazo preventivo de camisas de eje (shaft sleeves) en zona de sello"
    ],
    actividadCalculo: {
      titulo: "Selección de Transmisión por Fajas y Vida de Rodamientos",
      enunciado: "Seleccionar el número de fajas perfil 5V para transmitir 110 kW desde un motor de 1480 rpm a una bomba a 820 rpm y verificar la vida L10h del rodamiento lado impulsor.",
      simuladorId: "sim-08"
    },
    modulosVinculados: ["m3", "m4", "m5", "m8"]
  },

  "reductor-velocidad": {
    id: "reductor-velocidad",
    code: "EQ-AUX-01",
    categoria: "Equipos Auxiliares",
    nombre: "Reductor de Velocidad de Engranajes Helicoidales",
    modelo3D: "reductor-engranajes.glb",
    funcionamiento: "Reduce la velocidad angular del motor eléctrico y multiplica proporcionalmente el torque de salida mediante etapas de engranajes cilíndricos helicoidales.",
    componentesPrincipales: [
      "Carcasa bipartida de hierro fundido gris o acero soldado con aletas de disipación",
      "Eje de entrada de alta velocidad (piñón integral)",
      "Ejes intermedios y eje de salida de baja velocidad",
      "Engranajes helicoidales cementados y rectificados",
      "Rodamientos de rodillos cónicos y retenes radiales"
    ],
    despieceMecanico: [
      { item: 1, pieza: "Piñón Helicoidal de Entrada", funcion: "Engranar suavemente a alta velocidad", material: "Acero SAE 8620 / 18CrNiMo7-6 cementado (58-62 HRC)" },
      { item: 2, pieza: "Rueda Helicoidal de Salida", funcion: "Transmitir alto par torsional", material: "Acero aleado templado y revenido / cementado" },
      { item: 3, pieza: "Chaveta Paralela de Salida", funcion: "Transmitir torque al acoplamiento de baja", material: "Acero estirado en frío SAE 1045 (DIN 6885)" },
      { item: 4, pieza: "Rodamientos Cónicos", funcion: "Absorber empuje axial generado por el ángulo de hélice", material: "Acero AISI 52100" }
    ],
    elementosPresentes: ["Engranajes helicoidales", "Ejes escalonados", "Rodamientos de rodillos cónicos", "Chavetas y chaveteros", "Pernos de carcasa"],
    condicionesOperacion: {
      tipoDato: "Referencial industrial (Reductor 2 etapas, relación i = 18:1)",
      potencia: "90 kW",
      velocidadEntrada: "1780 rpm",
      ambiente: "Servicio continuo, requiere verificación de capacidad térmica además de mecánica"
    },
    cargasEsfuerzos: "Fuerzas tridimensionales en dientes helicoidales (tangencial Wt, radial Wr y axial Wa), esfuerzos de contacto hertziano y flexión en raíz del diente.",
    problemasFrecuentes: [
      "Micropitting y macropitting por caída de viscosidad del aceite a alta temperatura",
      "Fuga de lubricante por retenes debido a obstrucción del respiradero (breather)",
      "Desgaste de rodamientos por precarga axial incorrecta al cerrar carcasa",
      "Aplastamiento de chaveta de salida por picos de torque no previstos"
    ],
    inspeccion: [
      "Análisis de aceite (viscosidad a 40°C, índice PQ de desgaste ferroso, agua)",
      "Inspección boroscópica de flancos de dientes a través de tapa de registro",
      "Espectro de vibraciones FFT buscando frecuencias de engrane (GMF) y bandas laterales"
    ],
    mantenimientoPreventivo: [
      "Limpieza o cambio de filtro respiradero desecante",
      "Cambio de aceite sintético PAO o mineral EP según horas y temperatura de cárter",
      "Verificación de apriete de pernos de anclaje y estado de patas (soft foot)"
    ],
    actividadCalculo: {
      titulo: "Cálculo de Fuerzas en Engranajes Helicoidales y Factor de Servicio",
      enunciado: "Calcular Wt, Wr y Wa para un piñón helicoidal (módulo 5 mm, Z1=21, ángulo hélice 15°, ángulo presión normal 20°) que transmite 90 kW a 1780 rpm.",
      simuladorId: "sim-10"
    },
    modulosVinculados: ["m2", "m3", "m4", "m7", "m8"]
  }
};
