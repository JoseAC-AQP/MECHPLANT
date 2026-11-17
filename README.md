# ⚙️ MECHPLANT — Plataforma Interactiva de Diseño de Elementos de Máquinas

> **Ingeniería de Diseño Mecánico aplicada al Mantenimiento Industrial y Confiabilidad de Planta**  
> Basado en los fundamentos de *Shigley's Mechanical Engineering Design* y *Norton's Machine Design*, integrado con normativa internacional (**ISO, AGMA, ASME, DIN, SAE, API, ANSI**).

---

## 📌 Descripción del Proyecto

**MECHPLANT** es una plataforma educativa web modular desarrollada en **HTML5, CSS3 y JavaScript Vanilla** sin dependencias de frameworks pesados. Está diseñada para estudiantes de ingeniería mecánica, técnicos superiores y profesionales de mantenimiento industrial que requieren conectar la **teoría del diseño mecánico** con el **diagnóstico, cálculo y operación de activos críticos de planta**.

### Características Principales
- **8 Módulos Curriculares Estructurados:** Cobertura progresiva desde análisis de esfuerzos y fallas hasta diagnóstico vibratorio y confiabilidad operacional.
- **19 Fichas Técnicas de Equipos Industriales:** Desglose sistemático en 13 bloques educativos por activo (chancadoras, molinos, bombas de pulpa, reductores, fajas transportadoras, compresores, entre otros).
- **14 Simuladores de Cálculo de Ingeniería:** Motores matemáticos puros con memoria de cálculo paso a paso, semáforos de factor de seguridad e impresión directa a PDF.
- **Laboratorio Virtual 3D Interactivo (Three.js):** Exploración orbital, despiece explosivo progresivo (`0% – 100%`), modo Rayos X de carcasas e inspección técnica por pieza con modelos `.glb` y respaldo paramétrico CAD.
- **Motor de Diagnóstico de Fallas en Planta:** Árboles de decisión que vinculan síntomas de campo (vibración FFT, termografía, desgaste) con causas raíz y cálculos de verificación.
- **Herramientas Transversales:** Buscador técnico unificado en tiempo real, conversor de unidades **SI ↔ IPS** y seguimiento persistente de progreso académico en `localStorage`.

---

## 🗂️ Arquitectura del Repositorio

```text
mechplant/
├── index.html                        # Portada principal y acceso rápido a módulos/herramientas
├── README.md                         # Documentación general del proyecto
│
├── assets/
│   ├── css/                          # Sistema de diseño "Industrial Blueprint & Precision"
│   │   ├── tokens.css                # Variables CSS (paleta Navy/Cian, tipografía, espaciados)
│   │   ├── reset.css                 # Normalización y estilos base
│   │   ├── layout.css                # Grillas, contenedores y estructura responsiva
│   │   ├── navbar.css                # Barra de navegación superior y buscador global
│   │   ├── home.css                  # Estilos específicos de la página de inicio
│   │   ├── components.css            # Tarjetas, badges técnicos, callouts, KPIs y botones
│   │   ├── math-diagrams.css         # Fórmulas, memoria de cálculo paso a paso y SVG técnicos
│   │   └── print.css                 # Hoja de estilos optimizada para exportar memorias a PDF
│   │
│   ├── js/
│   │   ├── core/                     # Núcleo funcional transversal
│   │   │   ├── app-init.js           # Inicialización global de componentes y eventos
│   │   │   ├── navbar.js             # Navegación dinámica y estado activo
│   │   │   ├── sidebar.js            # Menú lateral colapsable de módulos y equipos
│   │   │   ├── search-engine.js      # Buscador técnico instantáneo multicategoría
│   │   │   ├── unit-converter.js     # Conversor técnico SI ↔ IPS (esfuerzo, torque, potencia)
│   │   │   └── progress-tracker.js   # Registro de avances, evaluaciones y simulaciones
│   │   │
│   │   ├── data/                     # Base de conocimiento estructurada
│   │   │   ├── db-curriculum.js      # Estructura de los 8 módulos y temas
│   │   │   ├── db-equipos.js         # Catálogo de los 19 equipos industriales
│   │   │   ├── db-componentes.js     # Diccionario de elementos mecánicos
│   │   │   ├── db-normas.js          # Referencias normativas (ISO, AGMA, DIN, SAE, API)
│   │   │   ├── db-relaciones.js      # Matriz de trazabilidad Equipo ↔ Elemento ↔ Simulador
│   │   │   └── db-evaluaciones.js    # Banco de preguntas técnicas y casos ABP
│   │   │
│   │   ├── lab-3d/                   # Motor de visualización 3D (Three.js)
│   │   │   ├── model-registry.js     # Registro maestro de ensambles 3D y cámaras
│   │   │   ├── scene-manager.js      # Escena WebGL, iluminación industrial y OrbitControls
│   │   │   ├── model-loader.js       # Cargador GLTFLoader con fallback CAD paramétrico
│   │   │   ├── exploded-view.js      # Despiece explosivo suave y modo Rayos X
│   │   │   └── hotspot-inspector.js  # Selección por Raycaster y ficha técnica de pieza
│   │   │
│   │   ├── solvers/                  # Motores de cálculo puro independientes del DOM
│   │   │   ├── solver-esfuerzos.js
│   │   │   ├── solver-falla-estatica.js
│   │   │   ├── solver-ejes.js
│   │   │   ├── solver-chavetas.js
│   │   │   ├── solver-uniones.js
│   │   │   ├── solver-rodamientos.js
│   │   │   ├── solver-fajas.js
│   │   │   ├── solver-cadenas.js
│   │   │   ├── solver-engranajes.js
│   │   │   ├── solver-trenes-reductores.js
│   │   │   ├── solver-alineamiento.js
│   │   │   ├── solver-vibraciones.js
│   │   │   ├── solver-tolerancias.js
│   │   │   └── sim-diagnostico-fallas.js
│   │   │
│   │   └── ui-simulator/             # Capa de presentación de simuladores
│   │       └── sim-renderer.js       # Renderizador estándar de KPIs, pasos e impresión
│   │
│   └── models/                       # Archivos 3D en formato .glb (opcionales con fallback CAD)
│
├── modulos/                          # Contenido teórico-práctico (Módulos 01 a 08)
├── equipos/                          # Fichas técnicas de activos industriales
├── simuladores/                      # Interfaces HTML de los 14 simuladores de ingeniería
└── lab-3d/                           # Galería y visor interactivo del Laboratorio 3D
