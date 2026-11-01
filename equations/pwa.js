/* Installation et mode hors ligne propres à Équations. */
(() => {
  'use strict';
  const button = document.getElementById('eqInstallButton');
  const status = document.getElementById('eqOfflineStatus');
  const dialog = document.getElementById('eqInstallDialog');
  const instructions = document.getElementById('eqInstallInstructions');
  const nativeButton = document.getElementById('eqNativeInstall');
  const copyButton = document.getElementById('eqCopyLink');
  const copyStatus = document.getElementById('eqCopyStatus');
  const link = document.getElementById('eqInstallLink');
  if (!button || !dialog) return;
  const appURL = new URL('./', document.currentScript.src);
  const standalone = window.matchMedia('(display-mode: standalone)');
  let promptEvent = null, installed = Boolean(navigator.standalone || standalone.matches);
  let offlineReady = false, offlineFailed = false, requested = false, registration = null;
  link.value = appURL.href;

  function render() {
    button.hidden = false;
    button.disabled = installed || requested;
    button.querySelector('span').textContent = installed ? 'Application installée' : requested ? 'Installation en cours…' : 'Installer l’application';
    nativeButton.hidden = !promptEvent || installed;
    nativeButton.disabled = requested;
    status.hidden = false;
    status.textContent = offlineReady ? (navigator.onLine ? 'Prête hors ligne' : 'Mode hors ligne') : offlineFailed ? 'Mode hors ligne indisponible' : navigator.onLine ? 'Préparation hors ligne…' : 'Connexion nécessaire';
    status.dataset.ready = String(offlineReady);
    document.getElementById('eqOfflineDetail').textContent = offlineReady ? 'Les entraînements sont prêts à être utilisés sans connexion sur cet appareil.' : 'Ouvre une première fois l’application en ligne pour préparer les entraînements hors ligne.';
  }

  function manualInstructions() {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const macSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua) && !ios;
    const embedded = /\bwv\b|FBAN|FBAV|Instagram/.test(ua);
    if (ios) return '<p>Sur iPhone ou iPad :</p><ol><li>Ouvre le menu <strong>Partager</strong> du navigateur.</li><li>Choisis <strong>Sur l’écran d’accueil</strong>.</li><li>Active <strong>Ouvrir comme app web</strong> si cette option apparaît, puis touche <strong>Ajouter</strong>.</li></ol><p>Si cette option manque, ouvre ce lien dans <strong>Safari</strong>.</p>';
    if (macSafari) return '<p>Dans Safari sur Mac, à partir de macOS Sonoma 14 :</p><ol><li>Ouvre le menu <strong>Fichier</strong> ou le bouton <strong>Partager</strong>.</li><li>Choisis <strong>Ajouter au Dock</strong>.</li><li>Confirme avec <strong>Ajouter</strong>.</li></ol><p>Tu peux aussi installer l’application avec Chrome ou Edge.</p>';
    if (embedded) return '<p>Ouvre ce lien dans <strong>Chrome</strong> sur Android ou dans <strong>Safari</strong> sur iPhone et iPad, puis utilise le bouton Installer ou le menu du navigateur.</p>';
    if (/Android/.test(ua)) return '<p>Dans le menu <strong>⋮</strong> du navigateur, choisis <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>, puis confirme.</p><p>Si l’option manque, ouvre ce lien dans Chrome. Le bouton d’installation peut devenir disponible après la première ouverture.</p>';
    return '<p>Sur ordinateur, utilise l’icône d’installation dans la barre d’adresse ou l’option <strong>Installer</strong> dans le menu du navigateur.</p><p>Si ton navigateur ne propose pas l’installation, ouvre ce lien dans <strong>Chrome</strong> ou <strong>Edge</strong>. Sur Mac, Safari propose aussi <strong>Ajouter au Dock</strong>.</p>';
  }

  function showHelp() {
    instructions.innerHTML = manualInstructions();
    copyStatus.textContent = '';
    render();
    if (!dialog.open) dialog.showModal();
  }

  async function install() {
    if (installed || requested) return;
    if (!promptEvent) { showHelp(); return; }
    const event = promptEvent;
    promptEvent = null;
    requested = true;
    if (dialog.open) dialog.close();
    render();
    try {
      // Appel immédiat pendant le geste de l’utilisateur.
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome !== 'accepted') requested = false;
      else setTimeout(() => { if (!installed) { requested = false; render(); } }, 15000);
    } catch (_) {
      requested = false;
      showHelp();
    }
    render();
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
    requested = false;
    render();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    requested = false;
    promptEvent = null;
    if (dialog.open) dialog.close();
    render();
  });
  const displayChanged = () => { installed = Boolean(navigator.standalone || standalone.matches); render(); };
  if (standalone.addEventListener) standalone.addEventListener('change', displayChanged);
  else if (standalone.addListener) standalone.addListener(displayChanged);
  button.addEventListener('click', install);
  nativeButton.addEventListener('click', install);
  document.getElementById('eqCloseInstall').addEventListener('click', () => dialog.close());
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(appURL.href);
      copyStatus.textContent = 'Lien copié.';
    } catch (_) {
      link.focus();
      link.select();
      link.setSelectionRange(0, link.value.length);
      copyStatus.textContent = 'Le lien est sélectionné. Utilise Copier sur ton appareil.';
    }
  });

  async function refreshOfflineStatus() {
    if (!registration?.active) return;
    try {
      offlineReady = await new Promise(resolve => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => { channel.port1.close(); resolve(false); }, 2500);
        channel.port1.onmessage = ({data}) => {
          clearTimeout(timeout);
          channel.port1.close();
          resolve(data?.application === 'equations' && data.ready === true);
        };
        registration.active.postMessage({type:'EQ_OFFLINE_STATUS'}, [channel.port2]);
      });
      offlineFailed = !offlineReady;
    } catch (_) { offlineFailed = true; }
    render();
  }

  function watchWorker(worker) {
    if (!worker) return;
    if (worker.state === 'activated') refreshOfflineStatus();
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') refreshOfflineStatus();
      if (worker.state === 'redundant' && !registration?.active) { offlineFailed = true; render(); }
    });
  }

  window.addEventListener('online', () => { render(); refreshOfflineStatus(); });
  window.addEventListener('offline', render);
  window.addEventListener('pageshow', refreshOfflineStatus);
  render();
  if (!('serviceWorker' in navigator) || !window.isSecureContext || location.protocol === 'file:') {
    offlineFailed = true;
    render();
    return;
  }
  navigator.serviceWorker.register(new URL('sw.js', appURL), {scope:appURL.href, updateViaCache:'none'})
    .then(reg => {
      registration = reg;
      reg.addEventListener('updatefound', () => watchWorker(reg.installing));
      watchWorker(reg.installing || reg.waiting || reg.active);
      navigator.serviceWorker.addEventListener('controllerchange', refreshOfflineStatus);
      refreshOfflineStatus();
      setTimeout(() => { if (!offlineReady) { offlineFailed = true; render(); } }, 20000);
    })
    .catch(() => { offlineFailed = true; render(); });
})();
