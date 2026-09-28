/**
 * ============================================================================
 * PULSO — Motor de Dinâmicas, Motion Design e Interatividade
 * "Dados, território e inovação"
 * 
 * Módulos:
 * 2. Canvas Ambiental do Hero (Curvas de Nível & Meandros do Rio Xingu)
 * 4. Palco do Método com Equalização Harmônica das Barras Pulso
 * ============================================================================
 */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 768px)');

  /* ==========================================================================
     2. CANVAS AMBIENTAL DO HERO: DADOS SENDO ORGANIZADOS E MONTADOS
     ========================================================================== */
  function initHeroDataCanvas() {
    const canvas = document.getElementById('hero-data-canvas');
    const heroSection = document.getElementById('inicio');
    if (!canvas || !heroSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrameId = null;
    let isVisible = false;
    let time = 0;

    // Coordenadas e controle de perturbação pelo cursor
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 240, active: false };

    let nodes = [];
    let pulses = [];
    const cols = mobile.matches ? 7 : 13;
    const rows = mobile.matches ? 5 : 7;

    function createNodes() {
      nodes = [];
      pulses = [];

      const marginX = width * (mobile.matches ? 0.04 : 0.08);
      const marginY = height * (mobile.matches ? 0.08 : 0.12);
      const gridW = width - marginX * 2;
      const gridH = height - marginY * 2;

      const colStep = gridW / Math.max(1, cols - 1);
      const rowStep = gridH / Math.max(1, rows - 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Posição estruturada na grade (organizada)
          const gx = marginX + c * colStep;
          const gy = marginY + r * rowStep;

          // Posição dispersa inicial (espalhada aleatoriamente pelo território do hero)
          const sx = Math.random() * width;
          const sy = Math.random() * height;

          // Parâmetros de flutuação no modo disperso
          const floatAngle = Math.random() * Math.PI * 2;
          const floatSpeed = 0.015 + Math.random() * 0.025;
          const floatRadiusX = 20 + Math.random() * 35;
          const floatRadiusY = 15 + Math.random() * 25;

          // Tipos visuais de dados: 'cross' (+), 'bar' (barra pulso), 'metric' (índice), 'dot' (ponto)
          const rand = Math.random();
          const type = rand > 0.82 ? 'cross' : rand > 0.68 ? 'bar' : rand > 0.52 ? 'metric' : 'dot';
          const metricText = (Math.random() * 80 + 10).toFixed(0);

          nodes.push({
            r, c,
            gx, gy,
            sx, sy,
            x: sx, y: sy,
            floatAngle, floatSpeed, floatRadiusX, floatRadiusY,
            type,
            metricText,
            size: type === 'bar' ? 6 : type === 'cross' ? 4 : 2.5,
            alpha: 0.28 + Math.random() * 0.45,
            organizeProgress: 0, // 0 = disperso, 1 = perfeitamente montado
            targetProgress: 0
          });
        }
      }
    }

    function resize() {
      const rect = heroSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      createNodes();
    }

    // Criar pulsos luminosos de dados trafegando pelas conexões estruturadas
    function maybeSpawnPulse() {
      if (pulses.length > 8 || Math.random() > 0.08) return;
      // Escolher nó aleatório com nível alto de organização
      const organizedNodes = nodes.filter(n => n.organizeProgress > 0.7);
      if (organizedNodes.length === 0) return;
      const startNode = organizedNodes[Math.floor(Math.random() * organizedNodes.length)];
      
      // Encontrar vizinho na grade
      const neighbor = nodes.find(n => 
        n.organizeProgress > 0.6 &&
        ((n.r === startNode.r && Math.abs(n.c - startNode.c) === 1) ||
         (n.c === startNode.c && Math.abs(n.r - startNode.r) === 1))
      );

      if (neighbor) {
        pulses.push({
          x1: startNode.x, y1: startNode.y,
          x2: neighbor.x, y2: neighbor.y,
          progress: 0,
          speed: 0.02 + Math.random() * 0.025
        });
      }
    }

    function draw() {
      if (!isVisible) return;
      time += 1;

      // Interpolação amortecida do cursor
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Onda periódica de organização (ciclo de montagem / estruturação contínua)
      // A onda viaja pela tela, alinhando dados dispersos em blocos organizados
      const waveCycle = 720; // ~12 segundos a 60fps
      const cycleTime = time % waveCycle;
      const waveFront = (cycleTime / (waveCycle * 0.65)) * (width + 400) - 200;

      // 1. Atualizar e calcular posição de cada nó de dado
      nodes.forEach((node) => {
        // Distância até a frente de onda de organização
        const distToWave = waveFront - node.gx;
        let targetOrg = 0;

        if (cycleTime < waveCycle * 0.75) {
          // Fase de organização: conforme a onda passa, os dados convergem para a grade
          if (distToWave > 0) {
            targetOrg = Math.min(1, distToWave / 250);
          }
        } else {
          // Fase de leve dispersão e respiração antes do próximo ciclo
          const decay = (cycleTime - waveCycle * 0.75) / (waveCycle * 0.25);
          targetOrg = Math.max(0, 1 - decay);
        }

        // Interação com o mouse: o cursor funciona como um ímã organizador ("dar direção aos dados")
        if (mouse.active) {
          const dxMouse = node.gx - mouse.x;
          const dyMouse = node.gy - mouse.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < mouse.radius) {
            const mouseForce = 1 - distMouse / mouse.radius;
            targetOrg = Math.max(targetOrg, mouseForce);
          }
        }

        // Interpolação suave do progresso de montagem (easing exponencial)
        node.organizeProgress += (targetOrg - node.organizeProgress) * 0.055;

        // Posição no modo disperso (com movimento browniano suave)
        node.floatAngle += node.floatSpeed * 0.04;
        const currentSx = node.sx + Math.cos(node.floatAngle) * node.floatRadiusX;
        const currentSy = node.sy + Math.sin(node.floatAngle) * node.floatRadiusY;

        // Posição final interpolada (de disperso para perfeitamente montado na grade)
        node.x = currentSx + (node.gx - currentSx) * node.organizeProgress;
        node.y = currentSy + (node.gy - currentSy) * node.organizeProgress;
      });

      // 2. Desenhar linhas estruturadas de conexão entre nós vizinhos organizados
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (n1.organizeProgress < 0.15) continue;

        // Conectar com vizinho à direita e abaixo
        const rightNeighbor = nodes.find(n => n.r === n1.r && n.c === n1.c + 1);
        const bottomNeighbor = nodes.find(n => n.c === n1.c && n.r === n1.r + 1);

        [rightNeighbor, bottomNeighbor].forEach(n2 => {
          if (n2 && n2.organizeProgress > 0.15) {
            const linkStrength = Math.min(n1.organizeProgress, n2.organizeProgress);
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(23, 107, 82, ${0.18 * linkStrength})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }

      // 3. Atualizar e desenhar pulsos luminosos trafegando pelas linhas montadas
      maybeSpawnPulse();
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const pulse = pulses[pIdx];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulses.splice(pIdx, 1);
          continue;
        }

        const px = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.progress;
        const py = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(23, 107, 82, 0.75)';
        ctx.fill();
      }

      // 4. Desenhar os nós e fragmentos de dados
      nodes.forEach((node) => {
        const currentAlpha = 0.15 + node.organizeProgress * 0.65;
        ctx.save();
        ctx.translate(node.x, node.y);

        if (node.type === 'cross') {
          // Marcador de coordenada (+): gira suavemente até alinhar a 0 graus na montagem
          const rotAngle = (1 - node.organizeProgress) * (node.floatAngle * 0.5);
          ctx.rotate(rotAngle);
          ctx.strokeStyle = `rgba(23, 107, 82, ${currentAlpha})`;
          ctx.lineWidth = 1.2;
          const s = node.size;
          ctx.beginPath();
          ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
          ctx.moveTo(0, -s); ctx.lineTo(0, s);
          ctx.stroke();
        } else if (node.type === 'bar') {
          // Micro-barra vertical (inspirada no símbolo Pulso): ganha escala vertical ao se montar
          const barH = 5 + node.organizeProgress * 9;
          ctx.fillStyle = `rgba(23, 107, 82, ${currentAlpha * 0.9})`;
          ctx.fillRect(-1.5, -barH / 2, 3, barH);
        } else if (node.type === 'metric') {
          // Ponto de dado com micro-texto de coordenada quando organizado
          ctx.beginPath();
          ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(23, 107, 82, ${currentAlpha})`;
          ctx.fill();

          if (node.organizeProgress > 0.45 && !mobile.matches) {
            ctx.font = '500 8.5px "Manrope", sans-serif';
            ctx.fillStyle = `rgba(82, 94, 89, ${0.4 * (node.organizeProgress - 0.45) * 1.8})`;
            ctx.fillText(node.metricText, 6, 3);
          }
        } else {
          // Ponto clássico com anel sutil quando estruturado
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(23, 107, 82, ${currentAlpha})`;
          ctx.fill();

          if (node.organizeProgress > 0.6) {
            ctx.beginPath();
            ctx.arc(0, 0, 4.5 * node.organizeProgress, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(45, 140, 110, ${0.25 * node.organizeProgress})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    }

    // Ouvintes de evento de cursor no Hero
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    }, { passive: true });

    heroSection.addEventListener('mouseenter', () => {
      mouse.active = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.active = false;
    });

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Stop ambient work offscreen, in background tabs and on preference changes.
    function syncCanvas() {
      cancelAnimationFrame(animationFrameId);
      if (isVisible && !document.hidden && !reduced.matches) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }
    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      syncCanvas();
    }, { threshold: 0.05 });
    document.addEventListener('visibilitychange', syncCanvas);
    reduced.addEventListener('change', syncCanvas);
    observer.observe(heroSection);
  }

  /* ==========================================================================
     4. PALCO DO MÉTODO COM EQUALIZAÇÃO DAS BARRAS DO SÍMBOLO PULSO
     ========================================================================== */
  function initMethodStage() {
    const stage = document.querySelector('.stage-container');
    const flow = document.querySelector('.stage-flow');
    const canvas = document.querySelector('.stage-svg-canvas');
    const button = document.getElementById('stage-control-btn');
    const label = document.getElementById('stage-control-text');
    const icon = document.getElementById('stage-control-icon');

    if (!stage || !flow || !canvas || !button) return;

    const paths = [...document.querySelectorAll('.flow-path')];
    const particles = [...document.querySelectorAll('.flow-particle')];
    const sources = [...document.querySelectorAll('.source-card')];
    const bars = [...document.querySelectorAll('.stage-bar')];
    const tags = [...document.querySelectorAll('.pulse-step-tag')];
    const rows = [...document.querySelectorAll('.table-row')];
    const outputs = [...document.querySelectorAll('.output-card')];
    const resultDetails = outputs.map(output => (output && typeof output.querySelectorAll === 'function' ? [...output.querySelectorAll('[data-result]')] : []));

    const phases = [...document.querySelectorAll('.stage-phase, .stage-mobile-phase')];
    const hubZone = document.querySelector('.zone-pulse-hub');
    const tableZone = document.querySelector('.zone-structured-table');
    let lengths = [];

    const icons = {
      play: '<polygon points="4 2 12 7 4 12 4 2"/>',
      pause: '<path d="M5 2v10M10 2v10"/>',
      replay: '<path d="M1 1v4h4M2.51 9a6 6 0 1 0 1.2-5.46L1 5"/>'
    };

    let state = 'idle', started = false, visible = false, autoPaused = false;
    let readyToStart = false;
    let elapsed = 0, lastTime = null, frame;
    let duration = mobile.matches ? 6000 : 9000;

    function updateControl() {
      label.textContent = state === 'playing' ? 'Pausar animação' : state === 'paused' ? 'Continuar animação' : started ? 'Rever animação' : 'Ver animação';
      icon.innerHTML = icons[state === 'playing' ? 'pause' : started && state !== 'paused' ? 'replay' : 'play'];
      button.hidden = reduced.matches;
    }

    function layoutPaths() {
      const bounds = flow.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      canvas.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      const hub = document.querySelector('.pulse-symbol-stage');
      const table = document.querySelector('.zone-structured-table');
      if (!hub || !table) return;

      const vertical = window.matchMedia('(max-width: 1000px)').matches;
      const point = (el, edge) => {
        const r = el.getBoundingClientRect();
        return vertical
          ? { x: r.left + r.width / 2 - bounds.left, y: (edge === 'right' ? r.bottom : r.top) - bounds.top }
          : { x: r[edge] - bounds.left, y: r.top + r.height / 2 - bounds.top };
      };
      const connect = (path, from, to) => {
        if (vertical) {
          const midY = (from.y + to.y) / 2;
          path.setAttribute('d', `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`);
          return;
        }
        const mid = (from.x + to.x) / 2;
        path.setAttribute('d', `M ${from.x} ${from.y} C ${mid} ${from.y}, ${mid} ${to.y}, ${to.x} ${to.y}`);
      };

      sources.forEach((source, i) => {
        if (!paths[i]) return;
        if (vertical) {
          // Exit sideways so upper-row routes never cross lower source cards.
          const r = source.getBoundingClientRect();
          const left = i % 2 === 0;
          const x = (left ? r.left : r.right) - bounds.left;
          const y = r.top + r.height / 2 - bounds.top;
          const rail = x + (left ? -10 : 10);
          const target = point(hub, 'left');
          const mergeY = target.y - 24;
          paths[i].setAttribute('d', `M ${x} ${y} Q ${rail} ${y}, ${rail} ${y + 10} L ${rail} ${mergeY - 14} Q ${rail} ${mergeY}, ${target.x} ${mergeY} L ${target.x} ${target.y}`);
        } else connect(paths[i], point(source, 'right'), point(hub, 'left'));
      });
      if (paths[4]) connect(paths[4], point(hub, 'right'), point(table, 'left'));
      outputs.forEach((output, i) => {
        if (!paths[i + 5]) return;
        if (vertical) {
          const from = point(table, 'right');
          const rect = output.getBoundingClientRect();
          const x = rect.left - bounds.left;
          const y = rect.top + rect.height / 2 - bounds.top;
          const rail = x - 14;
          paths[i + 5].setAttribute('d', `M ${from.x} ${from.y} C ${from.x} ${from.y + 18}, ${rail} ${from.y + 12}, ${rail} ${from.y + 28} L ${rail} ${y - 8} Q ${rail} ${y}, ${x} ${y}`);
        } else {
          connect(paths[i + 5], point(table, 'right'), point(output, 'left'));
        }
      });
      lengths = paths.map(path => path.getTotalLength());
      render(state === 'playing' || state === 'paused' ? Math.min(elapsed / duration, 1) : 1);
    }

    // One clock drives every visual, including pause and replay.
    const routes = [
      [450, 1600], [850, 1600], [1250, 1600], [1650, 1600],
      [4000, 1350], [6050, 1100], [6550, 1100], [7050, 1100]
    ];
    function render(progress) {
      const timeMs = progress * 9000;
      const clamp = value => Math.max(0, Math.min(1, value));
      const phase = timeMs < 3000 ? 0 : timeMs < 4500 ? 1 : timeMs < 6050 ? 2 : 3;
      phases.forEach((item, i) => {
        const step = Number(item.dataset.stagePhase);
        item.classList.toggle('is-current', progress < 1 && step === phase);
        item.classList.toggle('is-done', progress === 1 || step < phase);
      });
      paths.forEach((path, i) => {
        const [start, travel] = routes[i];
        path.classList.toggle('is-active', timeMs >= start);
        const length = lengths[i] || 0;
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = length * (1 - clamp((timeMs - start) / travel));
      });
      sources.forEach((source, i) => {
        source.classList.toggle('is-sending', timeMs >= routes[i][0] && timeMs < routes[i][0] + routes[i][1]);
        source.classList.toggle('is-organized', timeMs >= routes[i][0] + routes[i][1]);
      });
      particles.forEach((particle, i) => {
        const [start, travel] = routes[i];
        const t = (timeMs - start) / travel;
        const moving = t > 0 && t < 1;
        particle.style.opacity = moving ? Math.min(1, t * 10, (1 - t) * 10) : 0;
        if (moving && lengths[i]) {
          const point = paths[i].getPointAtLength(lengths[i] * t);
          particle.setAttribute('cx', point.x);
          particle.setAttribute('cy', point.y);
        }
      });
      const processing = timeMs >= 1800 && timeMs < 4600;
      hubZone.classList.toggle('is-processing', processing);
      tableZone.classList.toggle('is-receiving', timeMs >= 4400 && timeMs < 6050);
      bars.forEach((bar, i) => {
        const envelope = Math.sin(Math.PI * clamp((timeMs - 1800) / 2800));
        const scale = 1 + Math.sin(timeMs / 180 - i * .65) * .3 * envelope;
        bar.style.transform = `scaleY(${scale})`;
      });
      tags.forEach((tag, i) => {
        tag.classList.toggle('is-active', processing && Math.min(2, Math.floor((timeMs - 1800) / 934)) === i);
      });
      rows.forEach((row, i) => row.classList.toggle('is-visible', timeMs >= 5200 + i * 350));
      outputs.forEach((output, i) => {
        const arrival = routes[i + 5][0] + routes[i + 5][1];
        output.classList.toggle('is-visible', timeMs >= arrival);
        output.classList.toggle('is-arriving', timeMs >= arrival && timeMs < arrival + 650);
        resultDetails[i].forEach((detail, index) => {
          const order = Number(detail.dataset.order || index);
          const t = progress === 1 ? 1 : clamp((timeMs - arrival - Math.min(order, 4) * 65) / 650);
          const eased = 1 - Math.pow(1 - t, 3);
          const kind = detail.dataset.result;
          if (kind === 'bar') {
            detail.style.transform = `scaleY(${.08 + eased * .92})`;
          } else if (kind === 'trend') {
            detail.style.strokeDasharray = '100';
            detail.style.strokeDashoffset = 100 * (1 - eased);
          } else if (kind === 'ring') {
            detail.style.strokeDasharray = `${(order === 0 ? 55 : 28) * eased} 100`;
          } else {
            detail.style.opacity = .15 + .85 * eased;
            detail.style.transform = `translateY(${(1 - eased) * 5}px)`;
          }
          const counter = detail.querySelector('[data-count]');
          if (counter) counter.textContent = Math.round(Number(counter.dataset.count) * eased);
        });
      });
    }

    function tick(now) {
      if (state !== 'playing') return;
      if (lastTime !== null) elapsed += now - lastTime;
      lastTime = now;
      render(Math.min(elapsed / duration, 1));
      if (elapsed >= duration) {
        state = 'completed';
        stage.classList.remove('is-animating');
        updateControl();
      } else {
        frame = requestAnimationFrame(tick);
      }
    }

    function pause(automatic = false) {
      if (state !== 'playing') return;
      cancelAnimationFrame(frame);
      state = 'paused';
      autoPaused = automatic;
      lastTime = null;
      updateControl();
    }

    function play() {
      if (reduced.matches) return;
      if (state !== 'paused') {
        elapsed = 0;
        duration = mobile.matches ? 6000 : 9000;
        render(0);
      }
      started = true;
      autoPaused = false;
      state = 'playing';
      lastTime = null;
      stage.classList.add('is-animating');
      updateControl();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    }

    function syncVisibility() {
      if (!visible || document.hidden) pause(true);
      else if (state === 'paused' && autoPaused) play();
      else if (!started && readyToStart && !mobile.matches && !reduced.matches) play();
    }

    button.addEventListener('click', () => state === 'playing' ? pause() : play());
    document.addEventListener('visibilitychange', syncVisibility);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        const entry = entries[0];
        visible = entry.isIntersecting;
        readyToStart = entry.intersectionRatio >= 0.35;
        if (started || entry.intersectionRatio >= 0.35) syncVisibility();
      }, { threshold: [0, 0.35] }).observe(stage);
    }

    function resetForPreference() {
      cancelAnimationFrame(frame);
      state = 'idle';
      autoPaused = false;
      elapsed = 0;
      stage.classList.remove('is-animating');
      render(1);
      updateControl();
      layoutPaths();
    }

    reduced.addEventListener('change', resetForPreference);
    mobile.addEventListener('change', resetForPreference);
    if ('ResizeObserver' in window) new ResizeObserver(layoutPaths).observe(flow);
    else window.addEventListener('resize', layoutPaths);
    resetForPreference();
  }

  /* ==========================================================================
     INICIALIZAÇÃO GERAL
     ========================================================================== */
  function init() {
    initHeroDataCanvas();
    initMethodStage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
