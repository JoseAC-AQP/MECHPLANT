/* ==========================================================================
   MECHPLANT - BASE DE DATOS DE COMPONENTES Y MATERIALES (db-componentes.js)
   Propiedades mecánicas referenciales (Shigley 11ª Ed. / Norton 6ª Ed. / SAE)
   NOTA: Valores típicos para cálculo académico; verificar certificados de colada.
   ========================================================================== */

window.MECHPLANT_COMPONENTES = {
  materiales: [
    {
      id: "sae-1020-hr",
      designacion: "SAE/AISI 1020 (Laminado en caliente)",
      norma: "SAE J403 / ASTM A36 equivalente",
      tipo: "Acero al carbono estructural",
      Sy_MPa: 210,
      Sut_MPa: 380,
      E_GPa: 207,
      dureza_HB: 111,
      aplicacionTipica: "Bases estructurales, guardas, soportes soldados, placas base."
    },
    {
      id: "sae-1045-cd",
      designacion: "SAE/AISI 1045 (Estirado en frío)",
      norma: "SAE J403 / ASTM A108",
      tipo: "Acero al carbono medio",
      Sy_MPa: 530,
      Sut_MPa: 625,
      E_GPa: 207,
      dureza_HB: 179,
      aplicacionTipica: "Ejes de transmisión moderada, chavetas paralelas, pasadores, piñones."
    },
    {
      id: "sae-4140-qt",
      designacion: "SAE/AISI 4140 (Templado y revenido a 540 °C)",
      norma: "SAE J404 / ASTM A434",
      tipo: "Acero aleado Cr-Mo",
      Sy_MPa: 900,
      Sut_MPa: 1020,
      E_GPa: 207,
      dureza_HB: 302,
      aplicacionTipica: "Ejes de poleas motrices, ejes de bombas, espárragos de alta resistencia."
    },
    {
      id: "sae-4340-qt",
      designacion: "SAE/AISI 4340 (Templado y revenido a 540 °C)",
      norma: "SAE J404 / ASTM A434",
      tipo: "Acero aleado Ni-Cr-Mo",
      Sy_MPa: 1100,
      Sut_MPa: 1200,
      E_GPa: 207,
      dureza_HB: 350,
      aplicacionTipica: "Ejes principales de chancadoras, ejes de molinos, cigüeñales de prensas."
    },
    {
      id: "sae-8620-cem",
      designacion: "SAE/AISI 8620 (Cementado y templado)",
      norma: "SAE J404",
      tipo: "Acero aleado de cementación",
      Sy_MPa: 580,
      Sut_MPa: 850,
      E_GPa: 207,
      dureza_HB: 600,
      aplicacionTipica: "Engranajes rectos, helicoidales y cónicos de reductores industriales (núcleo tenaz, superficie 60 HRC)."
    },
    {
      id: "astm-a48-cl30",
      designacion: "Hierro Fundido Gris ASTM A48 Clase 30",
      norma: "ASTM A48",
      tipo: "Fundición gris (material frágil)",
      Sy_MPa: 0,
      Sut_MPa: 214,
      Suc_MPa: 752,
      E_GPa: 101,
      dureza_HB: 180,
      aplicacionTipica: "Carcasas de reductores, chumaceras bipartidas, poleas y volantes de inercia (alta amortiguación)."
    }
  ],

  gradosPernosSAE: [
    {
      grado: "SAE Grado 2",
      norma: "SAE J429",
      rangoDiametro: "1/4 a 3/4 pulg",
      Sp_MPa: 380,
      Sy_MPa: 393,
      Sut_MPa: 510,
      uso: "Fijación general no crítica, guardas, tapas de inspección."
    },
    {
      grado: "SAE Grado 5",
      norma: "SAE J429",
      rangoDiametro: "1/4 a 1 pulg",
      Sp_MPa: 586,
      Sy_MPa: 634,
      Sut_MPa: 827,
      uso: "Soportes de motores eléctricos, bridas estándar, bastidores auxiliares."
    },
    {
      grado: "SAE Grado 8",
      norma: "SAE J429",
      rangoDiametro: "1/4 a 1-1/2 pulg",
      Sp_MPa: 827,
      Sy_MPa: 896,
      Sut_MPa: 1034,
      uso: "Chancadoras, zarandas vibratorias, acoplamientos rígidos, cargas dinámicas severas."
    },
    {
      grado: "ISO Clase 8.8",
      norma: "ISO 898-1",
      rangoDiametro: "M6 a M36",
      Sp_MPa: 580,
      Sy_MPa: 640,
      Sut_MPa: 800,
      uso: "Equivalente métrico industrial a SAE Grado 5."
    },
    {
      grado: "ISO Clase 10.9",
      norma: "ISO 898-1",
      rangoDiametro: "M6 a M36",
      Sp_MPa: 830,
      Sy_MPa: 940,
      Sut_MPa: 1040,
      uso: "Equivalente métrico industrial a SAE Grado 8."
    }
  ]
};
