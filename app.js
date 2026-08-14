const places = [
  {id:'gwanghwamun',name:'Gwanghwamun',korean:'광화문',kind:'Porta principale',lat:37.57590,lng:126.97684,era:'1395 · ricostruita nel 2010',minutes:3,story:'La soglia monumentale del palazzo e il punto in cui la città incontra la corte reale.',detail:'Il nome significa “Porta della trasformazione luminosa”. Era l’ingresso meridionale al palazzo principale dei Joseon. Distrutta e spostata più volte, è tornata sul suo asse storico con la ricostruzione completata nel 2010.'},
  {id:'heungnyemun',name:'Heungnyemun',korean:'흥례문',kind:'Seconda porta',lat:37.57718,lng:126.97691,era:'Area cerimoniale',minutes:2,story:'Qui il percorso rallenta: oltre la porta iniziava il mondo regolato della corte.',detail:'Il cortile fra Gwanghwamun e Heungnyemun fu profondamente alterato nel periodo coloniale. La porta odierna fa parte del lungo progetto di recupero dell’assetto storico del palazzo.'},
  {id:'geunjeongjeon',name:'Geunjeongjeon',korean:'근정전',kind:'Sala del trono',lat:37.57863,lng:126.97688,era:'Tesoro nazionale · 1867',minutes:5,story:'Il cuore politico della dinastia: incoronazioni, udienze e grandi cerimonie di Stato.',detail:'Osserva le pietre di rango nel cortile: indicavano dove dovevano disporsi i funzionari. Il padiglione attuale risale alla grande ricostruzione del 1867 e conserva la solennità dell’architettura reale Joseon.'},
  {id:'sajeongjeon',name:'Sajeongjeon',korean:'사정전',kind:'Ufficio del re',lat:37.57930,lng:126.97690,era:'1395 · ricostruita nel 1867',minutes:4,story:'Non solo cerimonie: qui il sovrano lavorava ogni giorno con i suoi ministri.',detail:'Sajeongjeon significa “Sala del governo ponderato”. Era il principale spazio di lavoro quotidiano del re. Gli edifici laterali avevano il riscaldamento ondol e risultavano più confortevoli in inverno.'},
  {id:'gyeonghoeru',name:'Gyeonghoeru',korean:'경회루',kind:'Padiglione sul lago',lat:37.57970,lng:126.97510,era:'Tesoro nazionale · 1867',minutes:6,story:'Un’isola cerimoniale sull’acqua, costruita per banchetti reali e ospiti diplomatici.',detail:'Il padiglione si alza su 48 colonne di pietra. La superficie riflettente dello stagno e il profilo del monte Bugaksan trasformano il paesaggio in una scenografia del potere reale.'},
  {id:'gangnyeongjeon',name:'Gangnyeongjeon',korean:'강녕전',kind:'Residenza del re',lat:37.58002,lng:126.97692,era:'Quartiere privato',minutes:4,story:'La vita privata del sovrano iniziava qui, dietro le sale ufficiali.',detail:'Era la camera e residenza principale del re. Il tetto è privo della grande trave di colmo decorata: secondo la tradizione, nessun simbolo di drago poteva sovrastare il re, lui stesso associato al drago.'},
  {id:'gyotaejeon',name:'Gyotaejeon',korean:'교태전',kind:'Residenza della regina',lat:37.58054,lng:126.97693,era:'Quartiere privato',minutes:4,story:'La residenza della regina e centro della vita della famiglia reale.',detail:'Dietro la sala si trova Amisan, un giardino a terrazze creato con la terra scavata per lo stagno di Gyeonghoeru. I camini decorati uniscono funzione, simbolismo e paesaggio.'},
  {id:'hyangwonjeong',name:'Hyangwonjeong',korean:'향원정',kind:'Padiglione del loto',lat:37.58255,lng:126.97675,era:'c. 1873',minutes:5,story:'Il volto più intimo del palazzo: un padiglione esagonale sospeso tra acqua e loto.',detail:'Il nome evoca una “fragranza che arriva lontano”. Il ponte Chwihyanggyo conduce all’isola; l’insieme fu creato durante il regno di Gojong come luogo di riposo nel settore settentrionale.'},
  {id:'geoncheonggung',name:'Geoncheonggung',korean:'건청궁',kind:'Residenza reale',lat:37.58310,lng:126.97730,era:'1873 · ricostruita nel 2007',minutes:7,story:'Una residenza quasi domestica, legata agli ultimi anni drammatici della corte.',detail:'Costruita per re Gojong e la regina Myeongseong, adottava lo stile di una casa aristocratica. Nel vicino Gonnyeonghap la regina fu assassinata nel 1895, evento decisivo nella crisi della Corea di fine Ottocento.'},
  {id:'jibokjae',name:'Jibokjae',korean:'집옥재',kind:'Biblioteca reale',lat:37.58215,lng:126.97810,era:'Fine XIX secolo',minutes:4,story:'Una biblioteca reale dall’insolito linguaggio architettonico di influenza cinese.',detail:'Gojong la usò come biblioteca e sala di ricevimento. Le facciate in mattoni e le decorazioni la distinguono nettamente dai padiglioni lignei che scandiscono il resto del palazzo.'}
];

const bounds={north:37.5840,south:37.57535,west:126.97425,east:126.97865};
const palaceBoundary={type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[126.97425,37.57538],[126.97865,37.57538],[126.97865,37.58388],[126.97425,37.58388],[126.97425,37.57538]]]}};
const routeLine={type:'Feature',properties:{},geometry:{type:'LineString',coordinates:places.map(p=>[p.lng,p.lat])}};
const $=id=>document.getElementById(id);
let selected='geunjeongjeon',locationData=null,sheetOpen=true,map=null,mapReady=false,is3D=true,userMarker=null,watchId=null,manualSelection=false;
const mapMarkers=new Map();

function distance(a,b){const r=6371000,p1=a.lat*Math.PI/180,p2=b.lat*Math.PI/180,dp=(b.lat-a.lat)*Math.PI/180,dl=(b.lng-a.lng)*Math.PI/180,h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*r*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}

function choose(id,{focusMap=true,scroll=true,manual=true}={}){
  selected=id;manualSelection=manual;sheetOpen=true;render();
  const place=places.find(p=>p.id===id);
  if(mapReady&&focusMap)map.flyTo({center:[place.lng,place.lat],zoom:18.35,pitch:is3D?58:0,bearing:is3D?-12:0,duration:850,essential:true});
  if(scroll)$('storySheet').scrollIntoView({behavior:'smooth',block:'center'});
}

function render(){
  const p=places.find(x=>x.id===selected),index=places.indexOf(p),d=locationData?Math.round(distance(locationData,p)):null;
  mapMarkers.forEach((element,id)=>element.classList.toggle('selected',id===selected));
  if(mapReady&&map.getLayer('selected-structure'))map.setFilter('selected-structure',['==',['get','stop_id'],selected]);
  $('eyebrow').textContent=d===null?p.kind:`A ${d} m da te`;$('placeName').textContent=p.name;$('placeMeta').textContent=`${p.korean} · ${p.era}`;
  $('stopNumber').innerHTML=`${index+1}<small>/10</small>`;$('placeStory').textContent=p.story;$('placeDetail').textContent=p.detail;$('duration').textContent=`⏱ ${p.minutes} min`;
  $('storySheet').className=`storySheet ${sheetOpen?'open':'closed'}`;$('sheetHandle').setAttribute('aria-label',sheetOpen?'Riduci scheda':'Apri scheda');
  $('routeTitle').textContent=locationData?'Vicino a te':'Percorso consigliato';renderList();
}

function renderList(){
  const ordered=locationData?[...places].sort((a,b)=>distance(locationData,a)-distance(locationData,b)):places;$('placeList').innerHTML='';
  ordered.forEach(p=>{const b=document.createElement('button');b.className=selected===p.id?'active':'';b.innerHTML=`<span class="listNum">${places.indexOf(p)+1}</span><span class="listText"><b>${p.name}</b><small>${p.korean} · ${p.kind}</small></span><span class="distance">${locationData?Math.round(distance(locationData,p))+' m':p.minutes+' min'} ›</span>`;b.onclick=()=>choose(p.id);$('placeList').appendChild(b);});
}

function addMapLayers(){
  const firstLabel=map.getStyle().layers.find(layer=>layer.type==='symbol')?.id;
  map.addSource('palace-boundary',{type:'geojson',data:palaceBoundary});
  map.addLayer({id:'palace-ground',type:'fill',source:'palace-boundary',paint:{'fill-color':'#e8dfcf','fill-opacity':.26}},firstLabel);
  map.addLayer({id:'palace-wall',type:'line',source:'palace-boundary',paint:{'line-color':'#8d3d32','line-width':2,'line-opacity':.58}},firstLabel);
  map.addSource('royal-route',{type:'geojson',data:routeLine});
  map.addLayer({id:'royal-route-line',type:'line',source:'royal-route',paint:{'line-color':'#bd5a45','line-width':2,'line-dasharray':[2,2],'line-opacity':.62}},firstLabel);
  map.addSource('palace-structures',{type:'geojson',data:'palace-buildings.geojson'});
  map.addLayer({id:'context-buildings',type:'fill-extrusion',source:'palace-structures',filter:['!=',['get','historic'],true],minzoom:15,paint:{'fill-extrusion-color':'#91a89d','fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-opacity':.58}},firstLabel);
  map.addLayer({id:'historic-buildings',type:'fill-extrusion',source:'palace-structures',filter:['==',['get','historic'],true],minzoom:15,paint:{'fill-extrusion-color':['case',['!=',['get','stop_id'],null],'#a94638','#315e53'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-opacity':.94}},firstLabel);
  map.addLayer({id:'selected-structure',type:'fill-extrusion',source:'palace-structures',filter:['==',['get','stop_id'],selected],paint:{'fill-extrusion-color':'#d5a75d','fill-extrusion-height':['+',['get','height'],2.2],'fill-extrusion-base':0,'fill-extrusion-opacity':1}},firstLabel);
  if(typeof map.setLight==='function')map.setLight({anchor:'map',color:'#f5d6a5',intensity:.48,position:[1.15,160,45]});
}

function addStopMarkers(){
  places.forEach((p,i)=>{const el=document.createElement('button');el.type='button';el.className='mapStop';el.dataset.id=p.id;el.setAttribute('aria-label',`Apri ${p.name}`);el.innerHTML=`<span>${i+1}</span><em>${p.name}</em>`;el.addEventListener('click',event=>{event.stopPropagation();choose(p.id,{focusMap:true,scroll:true,manual:true});});new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([p.lng,p.lat]).addTo(map);mapMarkers.set(p.id,el);});
}

function showMapError(){
  $('mapLoading').classList.add('hidden');$('mapError').hidden=false;$('viewToggle').disabled=true;$('northButton').disabled=true;
}

function initMap(){
  if(!window.maplibregl||!maplibregl.supported())return showMapError();
  const failTimer=setTimeout(()=>{if(!mapReady)showMapError();},15000);
  try{
    map=new maplibregl.Map({container:'map3d',style:'https://tiles.openfreemap.org/styles/liberty',center:[126.97683,37.57962],zoom:17.25,pitch:58,bearing:-12,minZoom:15,maxZoom:20,maxBounds:[[126.9708,37.5729],[126.9831,37.5863]],canvasContextAttributes:{antialias:true},attributionControl:true});
    map.dragRotate.enable();map.touchZoomRotate.enableRotation();
    map.on('load',()=>{clearTimeout(failTimer);mapReady=true;addMapLayers();addStopMarkers();$('mapLoading').classList.add('hidden');render();if(locationData)drawUser();});
    map.on('click','historic-buildings',event=>{const id=event.features?.[0]?.properties?.stop_id;if(id)choose(id,{focusMap:false,scroll:true,manual:true});});
    map.on('mouseenter','historic-buildings',()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave','historic-buildings',()=>map.getCanvas().style.cursor='');
  }catch(error){clearTimeout(failTimer);showMapError();}
}

function toggleView(){
  if(!mapReady)return;is3D=!is3D;map.easeTo({pitch:is3D?58:0,bearing:is3D?-12:0,duration:800});
  $('viewToggle').classList.toggle('active',!is3D);$('viewToggle').querySelector('b').textContent=is3D?'2D':'3D';$('viewToggle').setAttribute('aria-label',is3D?'Passa alla vista bidimensionale':'Passa alla vista tridimensionale');$('mapModeLabel').textContent=is3D?'VISTA 3D':'VISTA 2D';
}

function resetNorth(){if(mapReady)map.easeTo({bearing:0,pitch:is3D?58:0,duration:650});}

function locate(){
  if(!navigator.geolocation){showError('La geolocalizzazione non è disponibile in questo browser.');return;}
  manualSelection=false;$('gpsButton').className='gpsButton loading';$('gpsLabel').textContent='Cerco…';
  if(watchId!==null){if(locationData&&mapReady)map.flyTo({center:[locationData.lng,locationData.lat],zoom:18.4,pitch:is3D?58:0,duration:700});return;}
  watchId=navigator.geolocation.watchPosition(updateLocation,()=>{watchId=null;showError('Non riesco a leggere il GPS. Puoi esplorare toccando i punti sulla mappa.');},{enableHighAccuracy:true,timeout:15000,maximumAge:4000});
}

function updateLocation(position){
  const firstFix=!locationData;locationData={lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy};$('gpsButton').className='gpsButton active';$('gpsLabel').textContent='Posizione attiva';$('locationPrompt').textContent='Ti mostro il luogo più vicino';
  const closest=places.reduce((a,b)=>distance(locationData,a)<distance(locationData,b)?a:b),meters=Math.round(distance(locationData,closest));
  $('mapStatusText').textContent=`${closest.name} · ${meters} m`;
  if(!manualSelection)selected=closest.id;drawUser();render();
  if(firstFix){$('mapArea').scrollIntoView({behavior:'smooth',block:'center'});if(mapReady)map.flyTo({center:[locationData.lng,locationData.lat],zoom:18.5,pitch:is3D?58:0,duration:900,essential:true});}
}

function drawUser(){
  const inside=locationData&&locationData.lat>=bounds.south&&locationData.lat<=bounds.north&&locationData.lng>=bounds.west&&locationData.lng<=bounds.east;
  if(!inside){showError('Sei fuori dal perimetro del palazzo. La mappa resta esplorabile manualmente.');return;}
  $('notice').hidden=true;if(!mapReady)return;if(userMarker)userMarker.remove();const el=document.createElement('div');el.className='userMapPin';el.setAttribute('aria-label','La tua posizione');userMarker=new maplibregl.Marker({element:el}).setLngLat([locationData.lng,locationData.lat]).addTo(map);
}

function showError(text){$('notice').textContent=text;$('notice').hidden=false;$('gpsButton').className='gpsButton';$('gpsLabel').textContent='Riprova';$('locationPrompt').textContent='Esplora la mappa manualmente';}

$('gpsButton').onclick=locate;$('viewToggle').onclick=toggleView;$('northButton').onclick=resetNorth;$('sheetHandle').onclick=()=>{sheetOpen=!sheetOpen;render();};
$('listenButton').onclick=()=>{if(!('speechSynthesis' in window))return showError('L’audioguida non è disponibile in questo browser.');const p=places.find(x=>x.id===selected),utterance=new SpeechSynthesisUtterance(`${p.name}. ${p.story} ${p.detail}`);utterance.lang='it-IT';speechSynthesis.cancel();$('listenButton').classList.add('speaking');utterance.onend=()=>$('listenButton').classList.remove('speaking');speechSynthesis.speak(utterance);};
window.addEventListener('beforeunload',()=>{if(watchId!==null)navigator.geolocation.clearWatch(watchId);});

render();initMap();
