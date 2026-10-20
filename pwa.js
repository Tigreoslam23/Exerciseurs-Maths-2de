(()=>{
 const install=document.getElementById('installApp'),status=document.getElementById('offlineStatus'),help=document.getElementById('installHelp'),retry=document.getElementById('retryOffline');
 let deferredPrompt=null,registration=null,offlineReady=false,initializing=false;
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const supported=window.isSecureContext&&'serviceWorker' in navigator;
 function update(){
  install.textContent=standalone()?'Application installée':'Installer AutoMaths';install.disabled=standalone();
  if(offlineReady)status.textContent=navigator.onLine?'Prêt hors connexion · QCM, corrigés et fiches disponibles.':'Mode hors connexion · ta progression reste enregistrée sur cet appareil.';
 }
 function instructions(){
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  help.textContent=ios?'Sur iPhone ou iPad : ouvre AutoMaths dans Safari, touche Partager, puis « Sur l’écran d’accueil ».':'Dans le menu de ton navigateur, choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ». Sur ordinateur, cherche aussi l’icône d’installation dans la barre d’adresse.';
  help.hidden=false;
 }
 function query(worker){return new Promise((resolve,reject)=>{
  const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('Vérification interrompue')),8000);
  channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data.ready===true)};
  worker.postMessage({type:'OFFLINE_STATUS'},[channel.port2]);
 })}
 async function readyWorker(reg){
  if(reg.active)return reg.active;
  const worker=reg.installing||reg.waiting;
  if(!worker)throw Error('Installation indisponible');
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Téléchargement trop long')),90000);
   function check(){if(worker.state==='activated'){clearTimeout(timer);resolve(worker)}else if(worker.state==='redundant'){clearTimeout(timer);reject(Error('Téléchargement incomplet'))}}
   worker.addEventListener('statechange',check);check();
  });
 }
 async function prepare(){
  if(initializing)return;initializing=true;retry.hidden=true;
  if(!supported){status.textContent='Pour installer AutoMaths et préparer le mode hors connexion, ouvre sa version en ligne dans un navigateur compatible.';initializing=false;return}
  status.textContent='Préparation du mode hors connexion… Garde cette page ouverte pendant le téléchargement.';
  try{
   registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
   const worker=await readyWorker(registration);
   offlineReady=await query(worker);
   if(!offlineReady)throw Error('Cache incomplet');
   update();
   // Une nouvelle version se prépare sans recharger ni interrompre un QCM en cours.
   registration.addEventListener('updatefound',()=>{
    const next=registration.installing;
    next?.addEventListener('statechange',async()=>{if(next.state==='activated'){try{offlineReady=await query(next);update()}catch(error){}}});
   });
  }catch(error){status.textContent='Mode hors connexion non prêt. Vérifie ta connexion puis réessaie.';retry.hidden=false}
  finally{initializing=false}
 }
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;update()});
 window.addEventListener('appinstalled',()=>{deferredPrompt=null;install.textContent='Application installée';install.disabled=true;help.hidden=true});
 install.addEventListener('click',async()=>{
  if(deferredPrompt){const prompt=deferredPrompt;deferredPrompt=null;await prompt.prompt();await prompt.userChoice}
  else instructions();
 });
 retry.addEventListener('click',prepare);
 window.addEventListener('online',()=>{if(!offlineReady)prepare();else update()});
 window.addEventListener('offline',update);
 update();prepare();
})();
