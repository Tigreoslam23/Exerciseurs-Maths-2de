/* Diaporama de classe : toutes les questions, puis tous les corrigés. */
let slideSeries = [];
let slideIndex = 0;

function beginSlides(chosen, total) {
  const order = shuffle(chosen), selected = [];
  // Ces deux générateurs nécessitent les propositions du QCM.
  const excluded = new Set(['C1-03', 'C2-02']);
  for (let i = 0; i < total; i++) {
    const chapter = order[i % order.length];
    let available = families.filter(f =>
      f.c === chapter && !excluded.has(f.id) && !selected.some(s => s.id === f.id));
    if (!available.length) available = families.filter(f => f.c === chapter && !excluded.has(f.id));
    selected.push(pick(available));
  }
  slideSeries = selected.map(generate);
  slideIndex = 0;
  showOnly('slides');
  renderSlide();
}

function slideQuestionText(q) {
  if (q.id === 'C6-04') return q.q.replace('Quel point appartient à la courbe de ', 'Donner les coordonnées d’un point de la courbe de ').replace(' ? Les réponses donnent ses coordonnées.', '.');
  return q.q;
}

async function renderSlide() {
  if (!slideSeries.length) return;
  const count = slideSeries.length, solution = slideIndex >= count;
  const number = slideIndex % count, q = slideSeries[number];
  const phase = el('slidePhase'), content = el('slideContent');
  phase.textContent = solution ? 'Corrigés' : 'Questions';
  phase.classList.toggle('solution', solution);
  el('slideCount').textContent = (solution ? 'Corrigé ' : 'Question ') + (number + 1) + ' / ' + count;
  const prompt = '<h2 class="slide-prompt">' + escapeHtml(slideQuestionText(q)) + '</h2>';
  const questionFigure = q.figure ? '<div class="slide-figure">' + q.figure + '</div>' : '';
  const correctionFigure = q.diagram ? '<div class="slide-figure">' + q.diagram + '</div>' : '';
  const answer = q.choiceFigures?.[q.correct] || sheetMath(q.correct);
  content.innerHTML = solution
    ? prompt + '<div class="slide-answer">Réponse : ' + answer + '</div><div class="slide-explanation">' + sheetMath(q.explanation) + '</div>' + (correctionFigure || questionFigure)
    : prompt + questionFigure;
  el('slidePrev').disabled = slideIndex === 0;
  el('slideNext').textContent = slideIndex === count - 1 ? 'Voir les corrigés →'
    : slideIndex === 2 * count - 1 ? 'Terminer' : 'Suivant →';
  el('slides').setAttribute('aria-label', (solution ? 'Corrigé ' : 'Question ') + (number + 1) + ' sur ' + count);
  content.scrollTop = 0;
  await typeset(content);
  if (!document.fullscreenElement) el('slides').scrollIntoView({block:'start'});
}

function moveSlide(direction) {
  if (!slideSeries.length || el('slides').classList.contains('hidden')) return;
  if (direction > 0 && slideIndex === slideSeries.length * 2 - 1) {
    leaveSlides();
    return;
  }
  slideIndex = Math.max(0, Math.min(slideSeries.length * 2 - 1, slideIndex + direction));
  renderSlide();
}

function leaveSlides() {
  if (document.fullscreenElement === el('slides')) document.exitFullscreen?.().catch(() => {});
  returnToMenu();
}

el('slidePrev').onclick = () => moveSlide(-1);
el('slideNext').onclick = () => moveSlide(1);
el('slideHome').onclick = leaveSlides;
el('slideFullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement === el('slides')) await document.exitFullscreen();
    else await el('slides').requestFullscreen();
  } catch (error) {
    el('slideFullscreen').title = 'Le plein écran est indisponible dans ce navigateur.';
  }
};
document.addEventListener('fullscreenchange', () => {
  el('slideFullscreen').textContent = document.fullscreenElement === el('slides') ? 'Quitter le plein écran' : 'Plein écran';
});
document.addEventListener('keydown', event => {
  if (el('slides').classList.contains('hidden') || event.altKey || event.ctrlKey || event.metaKey) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault(); moveSlide(1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault(); moveSlide(-1);
  }
});
