/* ---------------- Audio helpers (synth chimes, no files needed) ---------------- */
let audioCtx = null;
function getCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function chime(freq = 880, dur = 0.35, type = 'sine', gainPeak = 0.06){
  try{
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  }catch(e){ /* audio unavailable, ignore */ }
}
function chimeSequence(notes){
  notes.forEach((f, i) => setTimeout(() => chime(f, 0.4, 'sine', 0.05), i * 90));
}

function tryPlay(el){
  if(!el) return;
  el.volume = 0.35;
  el.play().catch(() => { /* autoplay blocked until user gesture, fine */ });
}
function fadeAudio(el, to, duration = 1200){
  if(!el) return;
  const from = el.volume;
  const start = performance.now();
  function step(t){
    const p = Math.min(1, (t - start) / duration);
    el.volume = from + (to - from) * p;
    if(p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------------- Starfield background ---------------- */
(function starfield(){
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];
  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = Array.from({length: 70}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.2,
      phase: Math.random() * Math.PI * 2
    }));
  }
  window.addEventListener('resize', resize);
  resize();
  function draw(t){
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#E8CD6B';
    stars.forEach(s => {
      const o = 0.15 + Math.abs(Math.sin(t / 1400 + s.phase)) * 0.55;
      ctx.globalAlpha = o;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ---------------- Sparkle fields (loading / intro) ---------------- */
function seedSparkles(container, count){
  for(let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 3) + 's';
    container.appendChild(s);
  }
}
seedSparkles(document.getElementById('sparkleField'), 40);
seedSparkles(document.getElementById('introSparkles'), 24);

/* ---------------- Loading sequence ---------------- */
window.addEventListener('load', () => {
  const fill = document.getElementById('loaderFill');
  const loading = document.getElementById('loading');
  const intro = document.getElementById('intro');
  let p = 0;
  const t = setInterval(() => {
    p += Math.random() * 14 + 6;
    if(p >= 100){
      p = 100;
      clearInterval(t);
      setTimeout(() => {
        loading.style.transition = 'opacity 0.8s ease';
        loading.style.opacity = '0';
        setTimeout(() => {
          loading.style.display = 'none';
          revealIntro();
        }, 800);
      }, 300);
    }
    fill.style.width = p + '%';
  }, 180);
});

function revealIntro(){
  const nameReveal = document.getElementById('nameReveal');
  const name = 'Marina';
  nameReveal.innerHTML = '';
  [...name].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = ch;
    span.style.animationDelay = (i * 0.08) + 's';
    nameReveal.appendChild(span);
  });
  setTimeout(() => {
    document.getElementById('goldUnderline').classList.add('drawn');
  }, 100);
  tryPlay(document.getElementById('pianoAudio'));
}

document.getElementById('beginBtn').addEventListener('click', () => {
  const intro = document.getElementById('intro');
  const story = document.getElementById('story');
  intro.style.transition = 'opacity 0.7s ease';
  intro.style.opacity = '0';
  setTimeout(() => {
    intro.style.display = 'none';
    story.hidden = false;
    initScrollReveal();
  }, 700);
});

/* ---------------- Scroll reveal for chapters ---------------- */
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.35 });
  items.forEach(el => io.observe(el));
}

/* ---------------- Mini game ---------------- */
(function initGame(){
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('gameStartBtn');
  const tracker = document.getElementById('wordTracker');
  const CSS_SIZE = 360;
  canvas.width = CSS_SIZE;
  canvas.height = CSS_SIZE;

  const WORDS = ['Brave', 'Kind', 'Curious', 'Independent', 'Fearless'];
  let player, stars, keys, running, foundCount;

  function resetGame(){
    player = { x: 180, y: 180, r: 12, vx: 0, vy: 0 };
    stars = WORDS.map((word) => ({
      x: 40 + Math.random() * 280,
      y: 40 + Math.random() * 280,
      r: 8,
      word,
      taken: false,
      pulse: Math.random() * Math.PI
    }));
    keys = {};
    foundCount = 0;
    tracker.querySelectorAll('.word-slot').forEach(el => el.classList.remove('found'));
  }

  function drawCharacter(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = '#E8CD6B';
    ctx.lineWidth = 1.6;
    ctx.fillStyle = 'rgba(232,205,107,0.08)';
    ctx.beginPath();
    ctx.arc(0, -6, 7, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(0, 16);
    ctx.moveTo(-7, 8);
    ctx.lineTo(7, 8);
    ctx.moveTo(0, 16);
    ctx.lineTo(-6, 26);
    ctx.moveTo(0, 16);
    ctx.lineTo(6, 26);
    ctx.stroke();
    ctx.restore();
  }

  function drawStar(s, t){
    const glow = 0.5 + Math.sin(t / 300 + s.pulse) * 0.35;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.shadowColor = 'rgba(212,175,55,0.8)';
    ctx.shadowBlur = 12 + glow * 8;
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    for(let i = 0; i < 5; i++){
      const a1 = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const a2 = a1 + Math.PI / 5;
      ctx.lineTo(Math.cos(a1) * s.r, Math.sin(a1) * s.r);
      ctx.lineTo(Math.cos(a2) * (s.r * 0.42), Math.sin(a2) * (s.r * 0.42));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function loop(t){
    if(!running) return;
    ctx.clearRect(0, 0, CSS_SIZE, CSS_SIZE);

    const speed = 2.6;
    let dx = 0, dy = 0;
    if(keys['ArrowLeft']) dx -= 1;
    if(keys['ArrowRight']) dx += 1;
    if(keys['ArrowUp']) dy -= 1;
    if(keys['ArrowDown']) dy += 1;
    const len = Math.hypot(dx, dy) || 1;
    player.x += (dx / len) * speed;
    player.y += (dy / len) * speed;
    player.x = Math.max(14, Math.min(CSS_SIZE - 14, player.x));
    player.y = Math.max(14, Math.min(CSS_SIZE - 14, player.y));

    stars.forEach(s => {
      if(s.taken) return;
      drawStar(s, t);
      const d = Math.hypot(player.x - s.x, player.y - s.y);
      if(d < s.r + player.r){
        s.taken = true;
        foundCount++;
        chime(660 + foundCount * 80, 0.4, 'triangle', 0.06);
        const slot = tracker.querySelector(`[data-word="${s.word}"]`);
        if(slot) slot.classList.add('found');
        if(foundCount >= WORDS.length){
          running = false;
          setTimeout(() => {
            chimeSequence([523, 659, 784, 988]);
            document.getElementById('giftSection').scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      }
    });

    drawCharacter(player);
    if(running) requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', e => {
    if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)){
      if(running) e.preventDefault();
      keys[e.key] = true;
    }
  }, { passive: false });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  startBtn.addEventListener('click', () => {
    resetGame();
    running = true;
    startBtn.textContent = 'Restart';
    requestAnimationFrame(loop);
  });

  resetGame();
  drawCharacter(player);
  stars.forEach(s => drawStar(s, 0));
})();

/* ---------------- Gift box + confetti ---------------- */
(function initGift(){
  const box = document.getElementById('giftBox');
  const hint = document.getElementById('giftHint');
  const canvas = document.getElementById('burstCanvas');
  const ctx = canvas.getContext('2d');
  let opened = false;

  function resizeBurst(){
    const rect = box.closest('.gift-screen').getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resizeBurst);

  function launchConfetti(){
    resizeBurst();
    const colors = ['#D4AF37', '#E8CD6B', '#F5EFE2', '#FFFFFF'];
    const boxRect = box.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const originX = boxRect.left - canvasRect.left + boxRect.width / 2;
    const originY = boxRect.top - canvasRect.top;

    const particles = Array.from({ length: 90 }, () => ({
      x: originX,
      y: originY,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 9 - 3,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1
    }));

    function step(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if(p.life <= 0) return;
        alive = true;
        p.vy += 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.008;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if(alive) requestAnimationFrame(step);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(step);
  }

  box.addEventListener('click', () => {
    if(opened) return;
    opened = true;
    box.classList.add('opened');
    hint.textContent = '';
    chimeSequence([440, 554, 659, 880]);
    fadeAudio(document.getElementById('pianoAudio'), 0, 900);
    tryPlay(document.getElementById('orchestralAudio'));
    launchConfetti();
    setTimeout(launchConfetti, 260);
    setTimeout(() => {
      document.getElementById('birthdaySection').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  });
})();

/* ---------------- Candles ---------------- */
(function initCandles(){
  const cake = document.getElementById('cake');
  const count = 32;
  for(let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'candle';
    const left = 8 + (i / (count - 1)) * 134;
    c.style.left = left + 'px';
    c.style.animationDelay = (Math.random() * 1.4) + 's';
    cake.appendChild(c);
  }
})();

/* ---------------- Letter typewriter ---------------- */
(function initLetter(){
  const target = document.getElementById('letterText');
  const skipBtn = document.getElementById('skipLetterBtn');
  const section = document.getElementById('letterSection');

  const letter = `Dear Marina,

Happy Birthday.

I wanted to make you something a little different this year.

Not because I couldn't buy you a gift, but because I wanted to create something that was completely yours. Something that only you would ever receive.

You've inspired me to become more confident, to trust myself more, and to believe that there are still genuinely kind people in this world. People who stay. People who care. People who make life brighter simply by being themselves. Thank you for being one of those people.

We're different in many ways. You're fashion. I'm technology. You're outgoing. I'm quieter. But underneath all of that, I think we're actually very similar. We're both people who stay true to ourselves. We both care deeply. And we both know that the best things in life are the people we choose to keep.

I'm not always great at saying how much people mean to me. So... I made this instead. Because creating something felt more like me than trying to find the perfect words.

I hope that no matter where life takes us, different cities, different careers, different adventures, you'll always have a friend in me. Whether you like it or not... you're kind of stuck with me now.

I admire your courage. Your curiosity. Your independence. And most of all, the way you never stop being yourself. Never lose that.

Happy Birthday, Marina. Thank you for making my life a little brighter.

With love,
Sonali`;

  let typing = false, done = false, timeoutId;

  function typeOut(){
    if(typing || done) return;
    typing = true;
    let i = 0;
    target.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '\u00A0';

    function step(){
      if(i >= letter.length){
        cursor.remove();
        typing = false;
        done = true;
        return;
      }
      target.textContent = letter.slice(0, i + 1);
      target.appendChild(cursor);
      i++;
      timeoutId = setTimeout(step, 14);
    }
    step();
  }

  function showAll(){
    clearTimeout(timeoutId);
    typing = false;
    done = true;
    target.textContent = letter;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) typeOut();
    });
  }, { threshold: 0.4 });
  io.observe(section);

  skipBtn.addEventListener('click', showAll);
})();
