/* ==========================================================================
   MECHPLANT - MATRIZ DE RELACIÓN BIDIRECCIONAL (db-relaciones.js)
   Conecta: Elemento de Máquina <-> Módulo <-> Equipos <-> Simulador <-> Caso
   ========================================================================== */

window.MECHPLANT_RELACIONES = [
  {
    elementoId: "uniones-empernadas",
    elemento: "Uniones Empernadas y Precarga",
    moduloId: "m2",
    moduloUrl: "modulos/m2-uniones-elementos-fijacion/t2-1-tornillos-pernos-precarga.html",
    equiposIds: ["chancadora-conica", "chancadora-quijadas", "molino-bolas", "bomba-pulpa"],
    simuladoresIds: ["sim-06"],
    casoUrl: "casos-estudio/caso-05-aflojamiento-uniones-empernadas.html"
  },
  {
    elementoId: "chavetas-acoplamientos",
    elemento: "Chavetas Paralelas y Acoplamientos",
    moduloId: "m2",
    moduloUrl: "modulos/m2-uniones-elementos-fijacion/t2-3-chavetas-pasadores-acoplamientos.html",
    equiposIds: ["reductor-velocidad", "motor-electrico", "faja-transportadora"],
    simuladoresIds: ["sim-05", "sim-13"],
    casoUrl: "casos-estudio/caso-02-rotura-eje-transportador.html"
  },
  {
    elementoId: "ejes-transmision",
    elemento: "Ejes y Árboles de Transmisión",
    moduloId: "m3",
    moduloUrl: "modulos/m3-ejes-arboles-transmision/t3-1-cargas-combinadas-flexion-torsion.html",
    equiposIds: ["faja-transportadora", "chancadora-conica", "bomba-pulpa", "reductor-velocidad"],
    simuladoresIds: ["sim-01", "sim-02", "sim-03", "sim-04"],
    casoUrl: "casos-estudio/caso-02-rotura-eje-transportador.html"
  },
  {
    elementoId: "rodamientos",
    elemento: "Rodamientos y Chumaceras",
    moduloId: "m4",
    moduloUrl: "modulos/m4-rodamientos-cojinetes/t4-2-vida-nominal-l10-cargas-combinadas.html",
    equiposIds: ["chancadora-conica", "zaranda-vibratoria", "faja-transportadora", "bomba-pulpa"],
    simuladoresIds: ["sim-03", "sim-07"],
    casoUrl: "casos-estudio/caso-01-falla-rodamiento-chancadora.html"
  },
  {
    elementoId: "fajas-poleas",
    elemento: "Transmisiones por Fajas y Poleas",
    moduloId: "m5",
    moduloUrl: "modulos/m5-transmisiones-fajas-poleas/t5-2-cinematica-tensiones-potencia.html",
    equiposIds: ["ventilador-industrial", "bomba-pulpa", "chancadora-quijadas", "zaranda-vibratoria"],
    simuladoresIds: ["sim-08", "sim-11"],
    casoUrl: "casos-estudio/caso-03-desgaste-prematuro-fajas.html"
  },
  {
    elementoId: "cadenas-rodillos",
    elemento: "Transmisiones por Cadenas y Piñones",
    moduloId: "m6",
    moduloUrl: "modulos/m6-transmisiones-cadenas/t6-2-seleccion-potencia-lubricacion-desgaste.html",
    equiposIds: ["alimentador-placas", "faja-transportadora"],
    simuladoresIds: ["sim-09", "sim-11"],
    casoUrl: "modulos/m6-transmisiones-cadenas/caso-m6-alimentador-industrial-cadenas.html"
  },
  {
    elementoId: "engranajes-reductores",
    elemento: "Engranajes y Reductores Industriales",
    moduloId: "m7",
    moduloUrl: "modulos/m7-engranajes-reductores/t7-3-resistencia-flexion-contacto-lubricacion.html",
    equiposIds: ["reductor-velocidad", "molino-bolas", "chancadora-conica"],
    simuladoresIds: ["sim-10", "sim-11", "sim-12"],
    casoUrl: "casos-estudio/caso-04-falla-engranajes-reductor.html"
  },
  {
    elementoId: "confiabilidad-vibraciones",
    elemento: "Alineamiento, Vibraciones y Confiabilidad",
    moduloId: "m8",
    moduloUrl: "modulos/m8-integracion-confiabilidad/t8-2-vibraciones-iso20816-lubricacion-predictiva.html",
    equiposIds: ["faja-transportadora", "bomba-pulpa", "ventilador-industrial", "reductor-velocidad"],
    simuladoresIds: ["sim-13", "sim-14"],
    casoUrl: "casos-estudio/caso-01-falla-rodamiento-chancadora.html"
  }
];
