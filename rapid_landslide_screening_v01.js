//VERSION=3

/*
===============================================================
 RAPID LANDSLIDE SCREENING v0.1
 Sentinel-2 L2A
 Copernicus Browser / Sentinel Hub
===============================================================

 OBJETIVO
 --------------------------------------------------------------
 Identificación preliminar de superficies cuya respuesta
 espectral es compatible con:

   - suelo expuesto
   - pérdida o baja presencia de vegetación
   - alteración de la superficie

 Este producto está diseñado para:

        DETECTAR
           ↓
        PRIORIZAR
           ↓
        VERIFICAR

 NO es un mapa de deslizamientos confirmados.


---------------------------------------------------------------
 INTERPRETACIÓN DE COLORES
---------------------------------------------------------------

 NEGRO
 Baja evidencia según los criterios utilizados.

 VERDE
 Señal baja/moderada asociada principalmente con vegetación
 reducida o superficies parcialmente expuestas.

 AMARILLO
 Mayor presencia de suelo expuesto y/o menor vegetación.
 Requiere revisión contextual.

 ROJO
 Alta coincidencia con las condiciones espectrales buscadas.
 Debe considerarse una zona PRIORITARIA PARA VERIFICACIÓN.

 IMPORTANTE:
 ROJO NO SIGNIFICA "DESLIZAMIENTO CONFIRMADO".


---------------------------------------------------------------
 POSIBLES FALSOS POSITIVOS
---------------------------------------------------------------

 El algoritmo utiliza información espectral de Sentinel-2.
 Por ello puede señalar superficies que NO corresponden
 a deslizamientos, por ejemplo:

   - carreteras y caminos
   - canteras y minas
   - terrenos agrícolas
   - áreas de construcción
   - superficies erosionadas
   - zonas rocosas
   - áreas quemadas
   - claros forestales
   - superficies permanentemente desnudas

 También pueden influir:

   - nubes y sombras
   - condiciones atmosféricas
   - iluminación
   - humedad del suelo
   - diferencias entre fechas


---------------------------------------------------------------
 USO OPERACIONAL
---------------------------------------------------------------

 Se recomienda prestar especial atención a las zonas
 señaladas cuando coincidan con:

   - carreteras
   - puentes
   - vías férreas
   - infraestructura crítica
   - reportes de daños
   - bloqueos
   - zonas montañosas o de ladera

 El objetivo es ayudar a responder:

   "¿Dónde debemos verificar primero?"


---------------------------------------------------------------
 LIMITACIONES
---------------------------------------------------------------

 Sentinel-2 permite trabajar aproximadamente a 10 m en las
 bandas principales utilizadas.

 B11 y B12 tienen resolución nativa de 20 m.

 Por tanto, daños pequeños o elementos puntuales pueden no
 ser detectados.

 Esta versión utiliza una sola observación espectral y no
 determina por sí sola cuándo ocurrió una alteración.

 Para confirmar una posible afectación se recomienda combinar
 este resultado con:

   - imágenes antes/después
   - imágenes de mayor resolución
   - DEM y pendiente
   - Sentinel-1
   - UAV
   - información de campo
   - reportes de daños


---------------------------------------------------------------
 ÍNDICES UTILIZADOS
---------------------------------------------------------------

 BSI
 Bare Soil Index
 Señal asociada con superficies de suelo desnudo.

 NDVI
 Normalized Difference Vegetation Index
 Señal relacionada con presencia de vegetación.

 NDWI
 Normalized Difference Water Index
 Ayuda a identificar superficies relacionadas con agua.

 NBR
 Normalized Burn Ratio
 Aporta información complementaria sobre vegetación y
 alteración de la superficie.


===============================================================
*/


// =============================================================
// PARÁMETROS
// =============================================================

// BSI mínimo a partir del cual comienza a aumentar la señal
// de suelo expuesto.

var BSI_MIN = 0.05;


// NDVI por debajo de este valor representa una señal
// relativamente baja de vegetación.

var NDVI_MAX = 0.35;


// Por encima de este valor se considera posible presencia
// de agua y se reduce la puntuación.

var NDWI_WATER = 0.30;


// Umbral utilizado para la señal complementaria del NBR.

var NBR_MAX = 0.30;


// =============================================================
// CONFIGURACIÓN
// =============================================================

function setup() {

    return {

        input: [{
            bands: [
                "B02",
                "B03",
                "B04",
                "B08",
                "B11",
                "B12",
                "SCL",
                "dataMask"
            ]
        }],

        output: {
            bands: 4,
            sampleType: "AUTO"
        }
    };
}


// =============================================================
// CONTROL DE CALIDAD
// =============================================================

function validPixel(s) {

    // El píxel debe disponer de datos válidos.

    if (s.dataMask !== 1) {
        return false;
    }


    /*
    SCL - Scene Classification Layer

    0  No data
    1  Saturated / defective
    2  Dark features / shadows
    3  Cloud shadow
    4  Vegetation
    5  Bare soil
    6  Water
    7  Unclassified
    8  Cloud medium probability
    9  Cloud high probability
    10 Cirrus
    11 Snow / ice

    Se eliminan las clases que pueden producir señales
    espectrales poco fiables para este análisis.
    */

    if (
        s.SCL === 0 ||
        s.SCL === 1 ||
        s.SCL === 2 ||
        s.SCL === 3 ||
        s.SCL === 7 ||
        s.SCL === 8 ||
        s.SCL === 9 ||
        s.SCL === 10 ||
        s.SCL === 11
    ) {
        return false;
    }

    return true;
}


// =============================================================
// BSI - BARE SOIL INDEX
// =============================================================

function calculateBSI(s) {

    /*
    BSI aumenta generalmente cuando existe mayor presencia
    relativa de suelo desnudo.

    Fórmula:

    BSI =
    [(SWIR + RED) - (NIR + BLUE)]
    --------------------------------
    [(SWIR + RED) + (NIR + BLUE)]
    */

    var numerator =
        (s.B11 + s.B04) -
        (s.B08 + s.B02);

    var denominator =
        (s.B11 + s.B04) +
        (s.B08 + s.B02);


    if (Math.abs(denominator) < 0.000001) {
        return null;
    }


    return numerator / denominator;
}


// =============================================================
// NDVI - VEGETACIÓN
// =============================================================

function calculateNDVI(s) {

    /*
    NDVI permite estimar la presencia relativa de vegetación.

    Valores altos:
        mayor señal de vegetación.

    Valores bajos:
        vegetación escasa o superficie no vegetal.
    */

    var denominator =
        s.B08 + s.B04;


    if (Math.abs(denominator) < 0.000001) {
        return null;
    }


    return (
        (s.B08 - s.B04) /
        denominator
    );
}


// =============================================================
// NDWI - AGUA
// =============================================================

function calculateNDWI(s) {

    /*
    NDWI ayuda a identificar superficies relacionadas
    con agua.

    Se utiliza principalmente para reducir falsos positivos
    en ríos, lagos, embalses y zonas inundadas.
    */

    var denominator =
        s.B03 + s.B08;


    if (Math.abs(denominator) < 0.000001) {
        return null;
    }


    return (
        (s.B03 - s.B08) /
        denominator
    );
}


// =============================================================
// NBR - ALTERACIÓN DE VEGETACIÓN / SUPERFICIE
// =============================================================

function calculateNBR(s) {

    /*
    NBR utiliza NIR y SWIR2.

    Aporta una señal complementaria sobre el estado de la
    vegetación y de la superficie.

    NO identifica por sí solo un deslizamiento.
    */

    var denominator =
        s.B08 + s.B12;


    if (Math.abs(denominator) < 0.000001) {
        return null;
    }


    return (
        (s.B08 - s.B12) /
        denominator
    );
}


// =============================================================
// LIMITAR VALORES ENTRE 0 Y 1
// =============================================================

function clamp(value) {

    if (value < 0) {
        return 0;
    }

    if (value > 1) {
        return 1;
    }

    return value;
}


// =============================================================
// EVALUACIÓN DEL PÍXEL
// =============================================================

function evaluatePixel(s) {


    // ---------------------------------------------------------
    // 1. CONTROL DE CALIDAD
    // ---------------------------------------------------------

    if (!validPixel(s)) {

        return [
            0,
            0,
            0,
            0
        ];
    }


    // ---------------------------------------------------------
    // 2. CALCULAR ÍNDICES
    // ---------------------------------------------------------

    var bsi =
        calculateBSI(s);

    var ndvi =
        calculateNDVI(s);

    var ndwi =
        calculateNDWI(s);

    var nbr =
        calculateNBR(s);


    // Si algún índice no puede calcularse,
    // el píxel no se utiliza.

    if (
        bsi === null ||
        ndvi === null ||
        ndwi === null ||
        nbr === null
    ) {

        return [
            0,
            0,
            0,
            0
        ];
    }


    // ---------------------------------------------------------
    // 3. SEÑAL DE SUELO EXPUESTO
    // ---------------------------------------------------------

    /*
    Una señal BSI elevada puede indicar mayor presencia
    de suelo desnudo.

    Puede aparecer después de un deslizamiento, pero también
    en carreteras, cultivos, canteras, construcciones, etc.
    */

    var bareSoil =
        clamp(
            (bsi - BSI_MIN) / 0.20
        );


    // ---------------------------------------------------------
    // 4. SEÑAL DE VEGETACIÓN ESCASA
    // ---------------------------------------------------------

    /*
    Una señal NDVI baja puede indicar pérdida o ausencia
    de vegetación.

    También puede ser completamente normal en superficies
    agrícolas, urbanas o naturalmente desnudas.
    */

    var lowVegetation =
        clamp(
            (NDVI_MAX - ndvi) / 0.40
        );


    // ---------------------------------------------------------
    // 5. SEÑAL COMPLEMENTARIA NBR
    // ---------------------------------------------------------

    /*
    NBR aporta una segunda señal relacionada con el estado
    de la cobertura vegetal y la superficie.

    Se utiliza como indicador complementario.
    */

    var lowNBR =
        clamp(
            (NBR_MAX - nbr) / 0.50
        );


    // ---------------------------------------------------------
    // 6. PENALIZACIÓN DE AGUA
    // ---------------------------------------------------------

    /*
    Si NDWI indica una posible superficie de agua,
    se reduce la puntuación.

    Esto ayuda a disminuir falsos positivos sobre:

        - ríos
        - lagos
        - embalses
        - zonas inundadas
    */

    var waterPenalty = 0;


    if (ndwi > NDWI_WATER) {

        waterPenalty =
            clamp(
                (ndwi - NDWI_WATER) / 0.30
            );
    }


    // ---------------------------------------------------------
    // 7. PUNTUACIÓN ESPECTRAL
    // ---------------------------------------------------------

    /*
    La puntuación combina:

        BSI  = 45 %
        NDVI = 30 %
        NBR  = 25 %

    La puntuación NO representa una probabilidad estadística
    de deslizamiento.

    Es una medida relativa de coincidencia con las condiciones
    espectrales buscadas.
    */

    var score =

        bareSoil * 0.45 +

        lowVegetation * 0.30 +

        lowNBR * 0.25;


    // Reducir la puntuación cuando existe señal de agua.

    score =
        score *
        (1 - waterPenalty);


    score =
        clamp(score);


    // =========================================================
    // 8. CLASIFICACIÓN
    // =========================================================

    /*
    NEGRO
    ---------------------------------------------------------
    Baja evidencia espectral.


    VERDE
    ---------------------------------------------------------
    Señal baja/moderada.

    Puede corresponder a superficies normalmente desnudas.


    AMARILLO
    ---------------------------------------------------------
    Mayor coincidencia con las condiciones buscadas.

    Requiere revisión contextual.


    ROJO
    ---------------------------------------------------------
    Alta coincidencia con las condiciones buscadas.

    Prioridad de verificación.


    IMPORTANTE:
    ROJO NO SIGNIFICA DESLIZAMIENTO CONFIRMADO.
    */


    // ---------------------------------------------------------
    // NEGRO
    // ---------------------------------------------------------

    if (score < 0.25) {

        return [
            0,
            0,
            0,
            1
        ];
    }


    // ---------------------------------------------------------
    // VERDE
    // ---------------------------------------------------------

    if (score < 0.50) {

        return [
            0,
            1,
            0,
            1
        ];
    }


    // ---------------------------------------------------------
    // AMARILLO
    // ---------------------------------------------------------

    if (score < 0.75) {

        return [
            1,
            1,
            0,
            1
        ];
    }


    // ---------------------------------------------------------
    // ROJO
    // ---------------------------------------------------------

    return [
        1,
        0,
        0,
        1
    ];
}