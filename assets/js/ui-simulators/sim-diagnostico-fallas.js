/* ==========================================================================
   MECHPLANT - MOTOR DE DIAGNÓSTICO DE FALLAS EN MANTENIMIENTO (sim-diagnostico-fallas.js)
   Cruza: Subsistema -> Síntoma en Planta -> Causa Raíz -> Acción -> Simulador
   ========================================================================== */

window.MECHPLANT_DIAGNOSTICO = (function () {
  const DIAGNOSTIC_DB = {
    rodamientos: {
      nombre: "Rodamientos y Chumaceras (ISO 281 / ISO 15243)",
      sintomas: [
        {
          id: "rod-temp-alta",
          sintoma: "Sobrecalentamiento rápido (> 85 °C) inmediatamente después de lubricar o montar",
          causaRaiz: "Exceso de grasa (batido hidráulico que impide disipación térmica) o precarga axial excesiva / ajuste con interferencia fuera de tolerancia ISO 286.",
          evidenciaVisual: "Grasa carbonizada u oscurecida, decoloración azulada/pajiza en pistas de rodadura.",
          accionCorrectiva: [
            "Purgar exceso de grasa y calcular cantidad exacta según fórmula: G = 0.005 × D × B (gramos).",
            "Verificar tolerancia dimensional del eje y alojamiento (ISO 286) y juego interno radial (C3 en alta temperatura).",
            "Comprobar temperatura estabilizada con termografía infrarroja tras 2 horas de marcha."
          ],
          norma: "ISO 286 / ISO 15243 (Modos de falla en rodamientos)",
          simulador: { code: "SIM-07", nombre: "Vida Nominal de Rodamientos L10", url: "sim-07-seleccion-vida-rodamientos.html" }
        },
        {
          id: "rod-fluting",
          sintoma: "Ruido de alta frecuencia y marcas acanaladas oscuras paralelas al eje (Fluting) en pistas",
          causaRaiz: "Erosión eléctrica (EDM) por paso de corrientes parásitas de eje inducidas por variador de frecuencia (VFD).",
          evidenciaVisual: "Patrón estriado tipo 'tabla de lavar' en pista exterior e interior.",
          accionCorrectiva: [
            "Instalar anillo de puesta a tierra de eje (shaft grounding ring) en el lado libre del motor.",
            "Considerar rodamiento con recubrimiento aislante cerámico en pista exterior (ej. INSOCOAT) en motores > 100 HP con VFD."
          ],
          norma: "IEC 60034-17 / ISO 15243 (Erosión eléctrica)",
          simulador: { code: "SIM-14", nombre: "Severidad Vibratoria ISO 20816", url: "sim-14-vibraciones-confiabilidad.html" }
        },
        {
          id: "rod-spalling",
          sintoma: "Vibración creciente con picos espectrales en BPFO / BPFI y desconchado metálico en aceite",
          causaRaiz: "Fatiga subsuperficial prematura por sobrecarga dinámica (desalineamiento, desbalanceo o tensión excesiva de fajas) o contaminación abrasiva.",
          evidenciaVisual: "Cráteres con bordes escarpados (spalling) en zona de carga de la pista.",
          accionCorrectiva: [
            "Recalcular vida L10h con carga dinámica equivalente real (incluyendo tensión de fajas o empuje axial).",
            "Mejorar sellado (sellos tipo Taconite / laberinto purgado con grasa) en ambientes con polvo mineral."
          ],
          norma: "ISO 281 / ISO 20816-3",
          simulador: { code: "SIM-07", nombre: "Vida Nominal de Rodamientos L10", url: "sim-07-seleccion-vida-rodamientos.html" }
        }
      ]
    },

    ejes: {
      nombre: "Ejes, Árboles y Acoplamientos (Shigley Cap. 7)",
      sintomas: [
        {
          id: "eje-fractura-escalon",
          sintoma: "Fractura transversal limpia con marcas de playa (beach marks) en un cambio de diámetro o chavetero",
          causaRaiz: "Falla por fatiga bajo flexión rotativa agravada por alta concentración de esfuerzos (Kt / Kf) debido a radio de acuerdo (fillet) muy pequeño o entalla por mecanizado.",
          evidenciaVisual: "Dos zonas bien diferenciadas: zona lisa con ondas concéntricas (propagación de grieta) y zona rugosa cristalina pequeña (fractura súbita final).",
          accionCorrectiva: [
            "Aumentar el radio de acuerdo r/d en el hombro del eje para reducir Kf.",
            "Especificar rectificado fino o bruñido en zonas críticas de transición (incrementa factor de superficie ka).",
            "Verificar diámetro mínimo mediante criterio DE-Goodman modificado."
          ],
          norma: "ASME B106.1M / DIN 6885-1",
          simulador: { code: "SIM-04", nombre: "Diseño de Ejes por Fatiga (Goodman)", url: "sim-04-diseno-ejes.html" }
        },
        {
          id: "eje-vibracion-2x",
          sintoma: "Vibración elevada en 2X RPM con componente axial significativa y desgaste rápido del elastómero del acoplamiento",
          causaRaiz: "Desalineamiento angular o paralelo excesivo entre máquina motriz y conducida, o condición de 'Pata Coja' (Soft Foot).",
          evidenciaVisual: "Polvo de caucho/poliuretano bajo el acoplamiento y calentamiento del cubo.",
          accionCorrectiva: [
            "Corregir pata coja (Soft Foot < 0.05 mm) antes de iniciar el alineamiento.",
            "Ejecutar alineamiento láser dentro de tolerancias API 686 según velocidad de giro."
          ],
          norma: "API 686 / ISO 20816-3",
          simulador: { code: "SIM-13", nombre: "Alineamiento de Ejes y Cálculo de Shims", url: "sim-13-alineamiento-ejes.html" }
        }
      ]
    },

    transmisiones: {
      nombre: "Transmisiones por Fajas, Cadenas y Engranajes",
      sintomas: [
        {
          id: "trans-fajas-volteo",
          sintoma: "Volteo de fajas en V dentro de la garganta, chirrido en arranque y desgaste lateral desigual",
          causaRaiz: "Tensión inicial insuficiente, desalineamiento angular/paralelo entre poleas o desgaste de gargantas de polea (hombros cóncavos).",
          evidenciaVisual: "Flancos de faja cristalizados o deshilachados; fondo de garganta brillante (faja tocando fondo).",
          accionCorrectiva: [
            "Verificar perfil de gargantas de polea con galga (si el desgaste > 0.8 mm, reemplazar polea).",
            "Alinear poleas con láser y tensar según deflexión/fuerza calculada.",
            "Reemplazar siempre el juego completo por un set hermanado (matched set)."
          ],
          norma: "ISO 4184 / RMA IP-20",
          simulador: { code: "SIM-08", nombre: "Transmisión por Fajas y Poleas", url: "sim-08-transmision-fajas-poleas.html" }
        },
        {
          id: "trans-cadena-salto",
          sintoma: "Tirones, ruido metálico rítmico y dientes del piñón desgastados en forma de 'gancho' (hooked teeth)",
          causaRaiz: "Elongación de la cadena por desgaste interno pasador-buje superior al 1.5% - 2.0% o lubricación inadecuada para la velocidad lineal.",
          evidenciaVisual: "Rodillos montándose sobre la punta de los dientes del piñón.",
          accionCorrectiva: [
            "Medir elongación en tramo tenso; reemplazar cadena y piñón simultáneamente.",
            "Adecuar sistema de lubricación (goteo, baño de aceite o chorro forzado) según velocidad lineal v (m/s)."
          ],
          norma: "ANSI/ASME B29.1",
          simulador: { code: "SIM-09", nombre: "Transmisión por Cadenas ANSI B29.1", url: "sim-09-transmision-cadenas.html" }
        },
        {
          id: "trans-engranaje-pitting",
          sintoma: "Picadura (cráteres) en la línea primitiva de los dientes del reductor y aumento de hierro en análisis de aceite",
          causaRaiz: "Fatiga superficial por esfuerzo de contacto hertziano excesivo o caída de viscosidad del aceite por operación sobre capacidad térmica.",
          evidenciaVisual: "Cráteres pequeños cerca del círculo de paso (pitch line) en flancos activos.",
          accionCorrectiva: [
            "Verificar viscosidad real del lubricante a temperatura de operación y limpiar filtro respiradero.",
            "Evaluar capacidad térmica del reductor (P_term) y estado de aletas/intercambiador de calor."
          ],
          norma: "AGMA 2001-D04 / ISO 6336 / ISO 10825",
          simulador: { code: "SIM-10", nombre: "Diseño de Engranajes y Fuerzas", url: "sim-10-diseno-engranajes.html" }
        }
      ]
    },

    uniones: {
      nombre: "Uniones Empernadas y Fijación Estructural (SAE J429)",
      sintomas: [
        {
          id: "union-aflojamiento",
          sintoma: "Pérdida recurrente de precarga y aflojamiento de tuercas en equipos vibratorios (zarandas, chancadoras, molinos)",
          causaRaiz: "Deslizamiento transversal en filetes de rosca por vibración (efecto Junker), asentamiento de superficies rugosas o precarga inicial Fi insuficiente.",
          evidenciaVisual: "Marcas de fretting (óxido rojizo/negro) en caras de apoyo de arandela y brida.",
          accionCorrectiva: [
            "Aplicar precarga al 75% de carga de prueba (Fp) con torquímetro calibrado y factor K controlado.",
            "Incorporar arandelas de bloqueo por cuña mecánica (ej. Nord-Lock) y pernos SAE Grado 8 / ISO 10.9."
          ],
          norma: "SAE J429 / ISO 898-1 / VDI 2230",
          simulador: { code: "SIM-06", nombre: "Uniones Empernadas y Precarga", url: "sim-06-uniones-empernadas.html" }
        }
      ]
    }
  };

  function getSubsystems() {
    return Object.keys(DIAGNOSTIC_DB).map(key => ({
      id: key,
      nombre: DIAGNOSTIC_DB[key].nombre,
      sintomas: DIAGNOSTIC_DB[key].sintomas
    }));
  }

  function diagnose(subsystemKey, symptomId) {
    const sub = DIAGNOSTIC_DB[subsystemKey];
    if (!sub) return null;
    return sub.sintomas.find(s => s.id === symptomId) || null;
  }

  return {
    DIAGNOSTIC_DB,
    getSubsystems,
    diagnose
  };
})();
