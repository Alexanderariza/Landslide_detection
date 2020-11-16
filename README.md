# Landslide detection for rapid Mapping Using Sentinel 2

<a href="#" id='togglescript'>Show</a> script or [download](script_landslides_det.js){:target="_blank"} it.
<div id='script_view' style="display:none">
{% highlight javascript %}
      {% include_relative script.js %}
{% endhighlight %}
</div>

## Description
This repository is a collection of basic scripts - explained in **English and Spanish** - for analysing landslides using space-based data in [**Google Earth Engine (GEE)**](https://earthengine.google.com/), [**Sentinel Playground**](https://www.sentinel-hub.com/explore/sentinelplayground/) or [**EO Browser**](https://www.sentinel-hub.com/explore/eobrowser/). It aims to facilitate working with big data in the cloud as an alternative to using desktop software.

## 1. Evaluation and visualization
* [Sentinel Playground](https://apps.sentinel-hub.com/sentinel-playground/?source=S2&lat=16.444296750697553&lng=-96.42880439758301&zoom=15&preset=CUSTOM&layers=B01,B02,B03&maxcc=39&gain=1.0&gamma=1.0&time=2019-12-01%7C2020-06-27&atmFilter=&showDates=false&evalscript=Ly9JbmRpY2UgdGVtcG9yYWwgZGUgc3VlbG8gZGVzbnVkbywgVmVyLiAxLjAKLy90ZW1wb3JhbCBCYXJyZW4gU29pbCBTY3JpcHQKCmxldCBCU0kgPSAoKEIxMSArIEIwNCktKEIwOCArIEIwMikpLygoQjExICsgQjA0KSsoQjA4ICsgQjAyKSkKIApyZXR1cm4gWyBCMDQsIEIwOCwgQlNJICogNi4yNV07Cg%3D%3D)
* [EO Browser](https://apps.sentinel-hub.com/eo-browser/?zoom=15&lat=16.05614&lng=-96.26152&themeId=DEFAULT-THEME&datasetId=S2L2A&fromTime=2020-04-28T00%3A00%3A00.000Z&toTime=2020-04-28T23%3A59%3A59.999Z&visualizationUrl=https%3A%2F%2Fservices.sentinel-hub.com%2Fogc%2Fwms%2Fbd86bcc0-f318-402b-a145-015f85b9427e&evalscript=Ly9WRVJTSU9OPTEKLy9JbmRpY2UgdGVtcG9yYWwgZGUgc3VlbG8gZGVzbnVkbywgVmVyLiAxLjAKLy90ZW1wb3JhbCBCYXJyZW4gU29pbCBTY3JpcHQKCmxldCBCU0kgPSAyLjUgKiAoKEIxMSArIEIwNCktKEIwOCArIEIwMikpLygoQjExICsgQjA0KSsoQjA4ICsgQjAyKSkKIApyZXR1cm4gWyBCMDQsIEIwOCwgQlNJICogNi4yNV07Cg%3D%3D)

## 2. Definition of landslides
According to the United Nations Office for Disaster Risk Reduction [(UNDRR)](https://www.unisdr.org/files/52828_03landslidehazardandriskassessment.pdf#page=2), landslides are a a "variety of processes that result in the downward and outward movement of slope-forming materials, including rock, soil, artificial fill, or a combination of these. The materials may move by falling, toppling, sliding, spreading, or flowing." 
## 3. General description of the algorithm 
The landslide and mass removal processes that occurred in the southern area of the state of Oaxaca in 2020 were analysed for the area of La Soledad using Sentinel-2 optical imagery, radar image analysis and digital terrain models (DTM). A specific algorithm was developed to establish a model for automatic extraction of the traces of the ground movements by using the Bare Soil Index (BSI) at two different times. This was reduced to a temporal composition (BSI1, NIR, BSI2). The results allow to extract the shapes of the landslides in the terrain and to calculate their direction of movement. It was observed that there is a close relationship between most of the landslide processes on slopes in front of the areas detected by radar. The methodology proposed allows extracting and characterizing mass clearance processes from Sentinel-2 high-resolution satellite images.
## 4. Barren Soil Script
The Bare Soil Index (BSI) is a numerical indicator that combines blue, red, near infrared and short wave infrared spectral bands to capture soil variations. These spectral bands are used in a normalized manner. The short wave infrared and the red spectral bands are used to quantify the soil mineral composition, while the blue and the near infrared spectral bands are used to enhance the presence of vegetation. BSI can be used in numerous remote sensing applications such as soil mapping, crop identification (in combination with NDVI) etc. To calculate the BSI, the following formulas (one for each satellite are used):  
<img src='./IMG/RBd.png' alt='BSI calculation' style="display: block; width: 50%; margin-left: auto; margin-right: auto;"></img>
## 5. Interpretation and description of images
<img src='./IMG/TBSI.JPG' alt='BSI indicator calculations' style="display: block; margin: 5px auto 5px auto; width: 100%;"></img>
The index calculation is applied to the blue and red channels. It shows all vegetation in green and the potential slippery ground in blue. This can be useful for soil mapping as it indicates to the user where to do remote sensing analysis on the bare soil; where crops have been harvested or where they are not growing; and the location of landslides or the extent of erosion in non-vegetated areas. Unfortunately, it also highlights certain buildings, making areas of bare soil difficult to separate from houses. It should be noted that the result depends on the vegetation and agriculture of the season.
<img src='./IMG/BSI.png' alt='Comparison of methodologies' style="display: block; margin: 5px auto 5px auto; width: 100%;"></img>
The different tests carried out showed that the BSI temporal and the B3 band reflectance are sufficient to identify the traces of the mass removal processes. In the case of the index, the BSI alone does not make it possible to characterize the features investigated that do not correspond solely to an absence of active vegetation, especially since the Sentinel-2 image has a cloud cover and a reactivation of the vegetation was observed locally. Therefore, the temporal values of the BSI need to be taken into account.
<img src='./IMG/BSI2.png' alt='Landslide map' style="display: block; margin: 5px auto 5px auto; width: 100%;"></img>

## References
OCHOA-TEJEDA, Verónica  y  PARROT, Jean-François.Extracción automática de trazas de deslizamientos utilizando un modelo digital de terreno e imágenes de satélite de alta resolución IKONOS: Ejemplo en la Sierra Norte de Puebla, México. Rev. mex. cienc. geol [online]. 2007, vol.24, n.3, pp.354-367. ISSN 2007-2902.
## Author of the script
- Norma Davila
- Alexander Ariza
<i><p style="text-align:right;">The compilation has been created to support the [UN-SPIDER Knowledge Portal](http://www.un-spider.org/).
