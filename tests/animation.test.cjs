const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../scripts/animation.js'), 'utf8');
function setup({ mobile = false, reduced = false } = {}) {
  function element() {
    const classes = new Set();
    return { style: {}, hidden: true, textContent: '', innerHTML: '', events: {},
      classList: { add: x => classes.add(x), remove: x => classes.delete(x), toggle: (x, v) => v ? classes.add(x) : classes.delete(x), contains: x => classes.has(x) },
      setAttribute() {}, addEventListener(name, fn) { this.events[name] = fn; },
      getBoundingClientRect: () => ({ left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 }),
      getTotalLength: () => 100, getPointAtLength: x => ({ x, y: 0 }) };
  }
  const singles = Object.fromEntries(['.stage-container', '.stage-flow', '.stage-svg-canvas', '.zone-pulse-hub', '.pulse-symbol-stage', '.zone-structured-table', 'stage-control-btn', 'stage-control-text', 'stage-control-icon'].map(k => [k, element()]));
  const lists = Object.fromEntries(Object.entries({ '.flow-path': 8, '.flow-particle': 8, '.stage-phase': 4, '.source-card': 4, '.stage-bar': 7, '.pulse-step-tag': 3, '.table-row': 6, '.output-card': 3 }).map(([k,n]) => [k, Array.from({length:n}, element)]));
  const queries = [{ matches: mobile, addEventListener(n,fn) { this.change = fn; } }, { matches: reduced, addEventListener(n,fn) { this.change = fn; } }];
  let observer, callback, time = 0;
  const doc = { hidden: false, events: {}, querySelector: k => singles[k], querySelectorAll: k => lists[k] || [], getElementById: k => singles[k], addEventListener(n,fn) { this.events[n] = fn; } };
  const win = { matchMedia: q => queries[q.includes('reduced') ? 1 : 0], IntersectionObserver: true, ResizeObserver: true };
  vm.runInNewContext(source, { document: doc, window: win,
    IntersectionObserver: class { constructor(fn) { observer = fn; } observe() {} },
    ResizeObserver: class { observe() {} },
    requestAnimationFrame: fn => { callback = fn; return 1; }, cancelAnimationFrame: () => { callback = null; } });
  return {
    label: () => singles['stage-control-text'].textContent,
    hidden: () => singles['stage-control-btn'].hidden,
    click: () => singles['stage-control-btn'].events.click(),
    see: ratio => observer([{isIntersecting:ratio>0,intersectionRatio:ratio}]),
    tick: ms => { time += ms; const fn = callback; callback = null; if(fn) fn(time); },
    visibility: hidden => { doc.hidden=hidden; doc.events.visibilitychange(); },
    reduce: () => { queries[1].matches=true; queries[1].change(); },
    particle: i => Number(lists['.flow-particle'][i].style.opacity),
    revealed: i => lists['.output-card'][i].classList.contains('is-visible'),
    complete: () => lists['.output-card'].every(e=>e.classList.contains('is-visible')),
    rowBlank: i => lists['.table-row'][i].classList.contains('is-blank'),
    rowFilled: i => lists['.table-row'][i].classList.contains('is-filled'),
    rowVisible: i => lists['.table-row'][i].classList.contains('is-visible'),
  };
}
test('movimento reduzido inicial mantém estado final e esconde controle', () => {
  const app=setup({reduced:true}); assert.equal(app.hidden(),true); assert.equal(app.complete(),true); app.see(1); assert.equal(app.label(),'Ver animação');
});
test('celular só reproduz por solicitação e conclui em seis segundos', () => {
  const app=setup({mobile:true}); app.see(1); assert.equal(app.label(),'Ver animação'); app.click(); app.tick(0); app.tick(5999); assert.equal(app.label(),'Pausar animação'); app.tick(1); assert.equal(app.label(),'Rever animação'); assert.equal(app.complete(),true);
});
test('desktop exige 40%, pausa fora de vista e retoma sem reiniciar', () => {
  const app=setup(); app.see(.2); app.visibility(false); assert.equal(app.label(),'Ver animação'); app.see(.4); app.tick(0); app.tick(4000); app.see(0); assert.equal(app.label(),'Continuar animação'); app.tick(30000); app.see(.2); app.tick(0); app.tick(5000); assert.equal(app.label(),'Rever animação');
});
test('pausa manual não é desfeita por visibilidade e replay reinicia', () => {
  const app=setup(); app.see(1); app.tick(0); app.tick(2000); app.click(); app.see(0); app.see(1); assert.equal(app.label(),'Continuar animação'); app.click(); app.tick(0); app.tick(7000); assert.equal(app.label(),'Rever animação'); app.click(); app.tick(0); app.tick(1000); assert.equal(app.label(),'Pausar animação');
});
test('aba oculta pausa, retorno retoma, preferência alterada encerra', () => {
  const app=setup(); app.see(1); app.visibility(true); assert.equal(app.label(),'Continuar animação'); app.visibility(false); assert.equal(app.label(),'Pausar animação'); app.reduce(); assert.equal(app.hidden(),true); assert.equal(app.complete(),true);
});

test('pulsos percorrem tabela e saídas antes da revelação, pausa conserva posição', () => {
  const app = setup(); app.see(1); app.tick(0); app.tick(4600);
  assert.ok(app.particle(4) > 0); assert.equal(app.revealed(0), false);
  app.click(); const opacity = app.particle(4); app.tick(2000);
  assert.equal(app.particle(4), opacity);
  app.click(); app.tick(0); app.tick(1800);
  assert.ok(app.particle(5) > 0); assert.equal(app.revealed(0), false);
  app.tick(800); assert.equal(app.revealed(0), true); assert.equal(app.revealed(2), false);
  app.tick(1800); assert.equal(app.complete(), true);
  app.click(); assert.equal(app.revealed(0), false); assert.equal(app.particle(5), 0);
});

test('tabela de 6 linhas exibe bloco em branco antes de cada preenchimento sequencial', () => {
  const app = setup();
  app.see(1);
  app.tick(0);
  // Antes da linha do fluxo se conectar à tabela (t = 4600ms < 4650ms): nenhuma linha visível
  app.tick(4600);
  assert.equal(app.rowVisible(0), false);
  assert.equal(app.rowBlank(0), false);
  assert.equal(app.rowFilled(0), false);

  // Logo após a linha se conectar (t = 4700ms > 4650ms): linha 0 está no estado bloco em branco (is-blank=true, is-filled=false)
  app.tick(100); // 4700ms
  assert.equal(app.rowVisible(0), true);
  assert.equal(app.rowBlank(0), true);
  assert.equal(app.rowFilled(0), false);
  assert.equal(app.rowVisible(1), false);

  // Aos 4950ms: linha 0 preenchida (is-filled=true), linha 1 entra em bloco em branco
  app.tick(250); // 4950ms
  assert.equal(app.rowFilled(0), true);
  assert.equal(app.rowBlank(0), false);
  assert.equal(app.rowVisible(1), true);
  assert.equal(app.rowBlank(1), true);
  assert.equal(app.rowFilled(1), false);

  // Avança até 6200ms: todas as 6 linhas preenchidas
  app.tick(1250); // 6200ms
  for (let i = 0; i < 6; i++) {
    assert.equal(app.rowVisible(i), true, `linha ${i} deve estar visível`);
    assert.equal(app.rowFilled(i), true, `linha ${i} deve estar preenchida`);
    assert.equal(app.rowBlank(i), false, `linha ${i} não deve estar em branco`);
  }
});
