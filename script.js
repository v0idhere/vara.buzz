// Floating purple pixel particles
const container = document.querySelector(".particles");
const colors = ["#b18cff", "#d4c2ff", "#8b5cf6", "#ffffff"];

function spawnParticle() {
  const p = document.createElement("div");
  p.className = "particle";
  const size = [4, 6, 8][Math.floor(Math.random() * 3)];
  p.style.width = p.style.height = size + "px";
  p.style.left = Math.random() * 100 + "vw";
  p.style.background = colors[Math.floor(Math.random() * colors.length)];
  p.style.animationDuration = 6 + Math.random() * 6 + "s";
  container.appendChild(p);
  p.addEventListener("animationend", () => p.remove());
}

setInterval(spawnParticle, 350);

// Random splash text, like the Minecraft title screen
const splashes = [
  "Coming Soon!",
  "Now in purple!",
  "100% blocky!",
  "Crafted with love!",
  "Plugins incoming!",
  "Also try Vara's mods!",
];
const splash = document.querySelector(".splash");
splash.textContent = splashes[Math.floor(Math.random() * splashes.length)];

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll(".section-title, .section-sub, .card, .panel");
revealEls.forEach((el, i) => {
  el.classList.add("reveal");
  if (el.classList.contains("card")) {
    el.style.transitionDelay = (Array.from(el.parentNode.children).indexOf(el) * 0.12) + "s";
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => observer.observe(el));

// ---------- Pixel burst on click ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("click", (e) => {
  if (reduceMotion) return;
  for (let i = 0; i < 12; i++) {
    const b = document.createElement("div");
    b.className = "burst";
    const angle = (Math.PI * 2 * i) / 12;
    const dist = 40 + Math.random() * 40;
    b.style.left = e.clientX + "px";
    b.style.top = e.clientY + "px";
    b.style.background = colors[Math.floor(Math.random() * colors.length)];
    b.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    b.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    document.body.appendChild(b);
    b.addEventListener("animationend", () => b.remove());
  }
});

// ---------- Purple pixel cursor trail ----------
let lastTrail = 0;
document.addEventListener("mousemove", (e) => {
  if (reduceMotion) return;
  const now = Date.now();
  if (now - lastTrail < 40) return;
  lastTrail = now;
  const t = document.createElement("div");
  t.className = "trail";
  t.style.left = e.clientX + "px";
  t.style.top = e.clientY + "px";
  document.body.appendChild(t);
  t.addEventListener("animationend", () => t.remove());
});

// =========================================================
// SCROLL ANIMATIONS
// =========================================================
const nav = document.querySelector(".nav");
const hero = document.querySelector(".hero");
const progressFill = document.querySelector(".scroll-progress-fill");
const backToTop = document.querySelector(".back-to-top");
const scrollHint = document.querySelector(".scroll-hint");
const navLinks = document.querySelectorAll(".nav nav a");
const sections = document.querySelectorAll("section[id]");

// Split section titles into letters for the pop-in effect
document.querySelectorAll(".section-title").forEach((title) => {
  const text = title.textContent;
  title.textContent = "";
  title.setAttribute("aria-label", text);
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--i", i);
    span.textContent = ch === " " ? " " : ch;
    title.appendChild(span);
  });
});

let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;

  progressFill.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  nav.classList.toggle("scrolled", y > 40);
  backToTop.classList.toggle("show", y > 500);
  scrollHint.classList.toggle("hidden", y > 60);

  // Parallax (only while the hero is on screen)
  if (!reduceMotion && y < window.innerHeight) {
    hero.style.setProperty("--sy", y);
  }

  // Active nav link
  let current = "home";
  sections.forEach((s) => {
    if (y >= s.offsetTop - window.innerHeight / 3) current = s.id;
  });
  if (y >= max - 4) current = sections[sections.length - 1].id; // at the bottom
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();

// =========================================================
// MINECRAFT BUTTON EFFECTS
// =========================================================

// --- Click sound (sounds/click.mp3) ---
const clickSound = new Audio("sounds/click.mp3");
clickSound.preload = "auto";
clickSound.volume = 0.6;

function playClick() {
  // Clone so fast clicks can overlap instead of cutting each other off
  const s = clickSound.cloneNode();
  s.volume = clickSound.volume;
  s.play().catch(() => { /* browser blocked audio */ });
}

// --- Block pieces that pop out and fall with gravity ---
function breakBlock(el, x, y) {
  if (reduceMotion) return;
  const color = getComputedStyle(el).backgroundColor;
  for (let i = 0; i < 10; i++) {
    const c = document.createElement("div");
    c.className = "block-chunk";
    const size = 6 + Math.floor(Math.random() * 3) * 2;
    c.style.width = c.style.height = size + "px";
    c.style.left = x + "px";
    c.style.top = y + "px";
    c.style.background = i % 3 === 0 ? "#fff" : color;
    document.body.appendChild(c);

    let vx = (Math.random() - 0.5) * 8;
    let vy = -4 - Math.random() * 5;
    let px = 0, py = 0, life = 0;
    (function step() {
      vy += 0.45; // gravity
      px += vx;
      py += vy;
      life++;
      c.style.transform = `translate(${px}px, ${py}px)`;
      c.style.opacity = 1 - life / 45;
      if (life < 45) requestAnimationFrame(step);
      else c.remove();
    })();
  }
}

document.querySelectorAll(".mc-btn, .back-to-top").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    playClick();
    breakBlock(btn, e.clientX, e.clientY);
  });
});

// --- Minecraft item tooltip ---
const tooltip = document.createElement("div");
tooltip.className = "mc-tooltip";
tooltip.setAttribute("aria-hidden", "true");
document.body.appendChild(tooltip);

document.querySelectorAll("[data-tooltip]").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    const [name, lore] = el.dataset.tooltip.split("|");
    tooltip.innerHTML = "";
    const title = document.createElement("div");
    title.textContent = name;
    tooltip.appendChild(title);
    if (lore) {
      const l = document.createElement("div");
      l.className = "lore";
      l.textContent = lore;
      tooltip.appendChild(l);
    }
    tooltip.classList.add("show");
  });
  el.addEventListener("mousemove", (e) => {
    // Keep it on screen, offset from the cursor like in-game
    const w = tooltip.offsetWidth;
    let x = e.clientX + 16;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - 16;
    tooltip.style.left = x + "px";
    tooltip.style.top = e.clientY - 30 + "px";
  });
  el.addEventListener("mouseleave", () => tooltip.classList.remove("show"));
});

// =========================================================
// SCROLL DIRECTION ANIMATIONS (up vs down)
// =========================================================

// Replay the reveal every time something comes back on screen,
// so it animates when scrolling down AND when scrolling up.
const replayObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio >= 0.15) {
      entry.target.classList.add("visible");
    } else if (!entry.isIntersecting) {
      // Fully off screen: reset it so it can animate in again
      entry.target.classList.remove("visible");
    }
  });
}, { threshold: [0, 0.15] });
document.querySelectorAll(".reveal").forEach((el) => replayObserver.observe(el));

let lastY = window.scrollY;
let velocity = 0;   // smoothed scroll speed
let wobbleRunning = false;

function wobble() {
  // Ease the speed back to 0 so the lean springs back after you stop
  velocity *= 0.88;
  if (Math.abs(velocity) < 0.05) velocity = 0;

  const skew = Math.max(-5, Math.min(5, velocity * 0.12));
  document.body.style.setProperty("--skew", skew.toFixed(2));
  document.body.style.setProperty("--push", (-velocity * 1.5).toFixed(1));

  if (velocity !== 0) requestAnimationFrame(wobble);
  else wobbleRunning = false;
}

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const delta = y - lastY;
  if (Math.abs(delta) < 3) return; // ignore tiny jitters

  // Direction class on <body>: scroll-down or scroll-up
  const goingDown = delta > 0;
  document.body.classList.toggle("scroll-down", goingDown);
  document.body.classList.toggle("scroll-up", !goingDown);

  if (!reduceMotion) {
    // Hide the menu when going down (past the top), show it when going up
    nav.classList.toggle("nav-hidden", goingDown && y > 200);

    velocity = velocity * 0.6 + delta * 0.4;
    if (!wobbleRunning) {
      wobbleRunning = true;
      requestAnimationFrame(wobble);
    }
  }

  lastY = y;
}, { passive: true });


// =========================================================
// MINECART SCROLL RIDE
// =========================================================
const cart = document.querySelector(".cart");
let cartLastY = window.scrollY;
let cartTilt = 0;
let cartStopTimer;

function moveCart() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
  const x = progress * (window.innerWidth - cart.offsetWidth);

  cart.style.setProperty("--cart-x", x + "px");
  cart.style.setProperty("--wheel-spin", (y * 1.5) + "deg"); // wheels turn with the page

  const delta = y - cartLastY;
  cartLastY = y;
  if (delta === 0) return;

  // Lean in the direction it's rolling, more when faster
  cartTilt = Math.max(-8, Math.min(8, delta * 0.25));
  cart.style.setProperty("--cart-tilt", cartTilt + "deg");
  cart.classList.add("rolling");

  // Sparks fly off the back wheel when scrolling fast
  if (!reduceMotion && Math.abs(delta) > 25) {
    const rect = cart.getBoundingClientRect();
    const backX = delta > 0 ? rect.left + 8 : rect.right - 8;
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      s.style.left = backX + "px";
      s.style.top = rect.bottom - 6 + "px";
      s.style.background = ["#fff35c", "#ffb13b", "#ffffff"][i % 3];
      s.style.setProperty("--sx", (delta > 0 ? -1 : 1) * (10 + Math.random() * 25) + "px");
      s.style.setProperty("--sy", -(4 + Math.random() * 18) + "px");
      document.body.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    }
  }

  // Settle back when scrolling stops
  clearTimeout(cartStopTimer);
  cartStopTimer = setTimeout(() => {
    cart.classList.remove("rolling");
    cart.style.setProperty("--cart-tilt", "0deg");
  }, 140);
}

let cartTicking = false;
window.addEventListener("scroll", () => {
  if (!cartTicking) {
    cartTicking = true;
    requestAnimationFrame(() => {
      moveCart();
      cartTicking = false;
    });
  }
}, { passive: true });
window.addEventListener("resize", moveCart);
moveCart();

// =========================================================
// PLUGIN DOWNLOAD PICKERS (platform + version), one per plugin popup
// =========================================================
// To release a new version: add it at the TOP of that plugin's "versions",
// with a file for every platform that has a build.
const GH_RELEASES = "https://github.com/v0idhere/vara.buzz/releases/download";
const PLATFORM_NAMES = {
  paper: "Paper", bukkit: "Bukkit / Spigot", folia: "Folia",
  fabric: "Fabric", forge: "Forge", neoforge: "NeoForge",
  bungeecord: "BungeeCord", velocity: "Velocity", waterfall: "Waterfall",
};
const PROXIES = ["bungeecord", "velocity", "waterfall"];
const MOD_LOADERS = ["fabric", "forge", "neoforge"];

const PLUGIN_DOWNLOADS = {
  "varavaults-details": {
    name: "VaraVaults",
    serverWord: "Vaults live",
    worksOn: {
      paper: "Works on Paper, Purpur and other Paper forks. Needs <b>LuckPerms</b>.",
    },
    versions: [
      {
        id: "1.0.2",
        label: "v1.0.2 (Latest) - Minecraft 1.21.x",
        files: { paper: `${GH_RELEASES}/v1.0.2/VaraVaults-1.0.2-Paper.jar` },
      },
      {
        id: "1.0.1",
        label: "v1.0.1 - Minecraft 1.21.x",
        files: { paper: `${GH_RELEASES}/v1.0.1/VaraVaults-1.0.1-Paper.jar` },
      },
    ],
  },
  "varatrade-details": {
    name: "VaraTrade",
    serverWord: "Trades happen",
    worksOn: {
      paper: "Works on Paper, Purpur and other Paper forks. No required plugins!",
      bukkit: "Works on Bukkit and Spigot. No required plugins!",
      folia: "Folia is fully supported. No required plugins!",
    },
    versions: [
      {
        id: "1.0.0",
        label: "v1.0.0 (Latest) - Minecraft 1.20.6 - 1.21.x",
        // One jar works on all three
        files: {
          paper: `${GH_RELEASES}/varatrade-v1.0.0/VaraTrade-1.0.0.jar`,
          bukkit: `${GH_RELEASES}/varatrade-v1.0.0/VaraTrade-1.0.0.jar`,
          folia: `${GH_RELEASES}/varatrade-v1.0.0/VaraTrade-1.0.0.jar`,
        },
      },
    ],
  },
};

function liveTooltip(el) {
  el.addEventListener("mouseenter", () => {
    const [name, lore] = (el.dataset.tooltip || "").split("|");
    tooltip.innerHTML = "";
    const t = document.createElement("div");
    t.textContent = name;
    tooltip.appendChild(t);
    if (lore) {
      const l = document.createElement("div");
      l.className = "lore";
      l.textContent = lore;
      tooltip.appendChild(l);
    }
    tooltip.classList.add("show");
  });
  el.addEventListener("mousemove", (e) => {
    const w = tooltip.offsetWidth;
    let x = e.clientX + 16;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - 16;
    tooltip.style.left = x + "px";
    tooltip.style.top = e.clientY - 30 + "px";
  });
  el.addEventListener("mouseleave", () => tooltip.classList.remove("show"));
}

function setupPicker(dialog, cfg) {
  const buttons = dialog.querySelectorAll(".platform");
  const select = dialog.querySelector(".version-select");
  const status = dialog.querySelector(".platform-status");
  const download = dialog.querySelector(".download-btn");
  if (!buttons.length || !select || !status || !download) return;
  let current = "paper";

  cfg.versions.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.label;
    select.appendChild(opt);
  });

  function render() {
    const version = cfg.versions.find((v) => v.id === select.value) || cfg.versions[0];
    const name = PLATFORM_NAMES[current];
    const file = version.files[current];

    buttons.forEach((btn) => {
      const id = btn.dataset.platform;
      const has = !!version.files[id];
      const proxy = PROXIES.includes(id);
      btn.classList.toggle("is-ok", has);
      btn.classList.toggle("is-soon", !has && !proxy);
      btn.classList.toggle("is-proxy", proxy);
      btn.dataset.label = has ? "Available" : proxy ? "Proxy" : "Coming soon";
      btn.setAttribute("aria-checked", id === current ? "true" : "false");
    });

    download.classList.remove("is-disabled");
    download.removeAttribute("aria-disabled");
    download.onclick = null;

    if (file) {
      const fileName = file.split("/").pop();
      status.className = "platform-status ok";
      status.innerHTML = `<b>Available!</b> ${cfg.worksOn[current] || ""}`;
      download.href = file;
      download.setAttribute("download", fileName);
      download.textContent = "Download " + fileName;
      download.dataset.tooltip = `Download|${fileName}`;
    } else if (PROXIES.includes(current)) {
      status.className = "platform-status proxy";
      status.innerHTML = `<b>${name} is a proxy.</b> ${cfg.serverWord} on your game servers, so install the <b>Paper</b> version on each server behind ${name}.`;
      download.removeAttribute("href");
      download.removeAttribute("download");
      download.textContent = "Get the Paper version";
      download.dataset.tooltip = "Paper version|Switch to the Paper download";
      download.onclick = (e) => {
        e.preventDefault();
        select_("paper");
      };
    } else {
      const why = MOD_LOADERS.includes(current)
        ? `${name} is a mod loader, so it needs a mod version of ${cfg.name}.`
        : `A ${name} build of ${cfg.name} is being crafted.`;
      const tip = current === "bukkit" && version.files.paper
        ? " Tip: Paper runs all Bukkit & Spigot plugins, so you can switch to Paper today."
        : "";
      status.className = "platform-status soon";
      status.innerHTML = `<b>Coming soon!</b> ${why}${tip}`;
      download.removeAttribute("href");
      download.removeAttribute("download");
      download.classList.add("is-disabled");
      download.setAttribute("aria-disabled", "true");
      download.textContent = "Coming Soon";
      download.dataset.tooltip = "Coming Soon|Not available for this platform yet";
      download.onclick = (e) => e.preventDefault();
    }
  }

  function select_(id) {
    current = id;
    render();
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => {
    playClick();
    select_(btn.dataset.platform);
  }));
  select.addEventListener("change", render);
  liveTooltip(download);
  render();
}

Object.entries(PLUGIN_DOWNLOADS).forEach(([id, cfg]) => {
  const dialog = document.getElementById(id);
  if (dialog) setupPicker(dialog, cfg);
});

// Open / close the popups
document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dialog = document.getElementById(btn.dataset.open);
    if (!dialog) return;
    tooltip.classList.remove("show");
    dialog.showModal();
    const body = dialog.querySelector(".dialog-body");
    const target = btn.dataset.scroll && document.getElementById(btn.dataset.scroll);
    body.scrollTop = target ? target.offsetTop - body.offsetTop - 8 : 0;
  });
});
document.querySelectorAll(".mc-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close")?.addEventListener("click", () => {
    playClick();
    dialog.close();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close(); // click outside closes it
  });
});

// =========================================================
// VARA HELPER (purple crystal golem)
// =========================================================
(() => {
  const helper = document.getElementById("helper");
  const golem = document.getElementById("golem");
  const hit = document.getElementById("helper-hit");
  const bubble = document.getElementById("helper-bubble");
  const text = document.getElementById("helper-text");
  const menu = document.getElementById("helper-menu");
  const callBtn = document.getElementById("helper-call");
  if (!helper) return;

  const FRAME_W = 90;
  const FRAME_H = 64;
  const ANIMS = {
    idle:   { src: "images/golem/golem-idle.png",   frames: 8,  fps: 8,  loop: true },
    walk:   { src: "images/golem/golem-walk.png",   frames: 10, fps: 10, loop: true },
    attack: { src: "images/golem/golem-attack.png", frames: 11, fps: 16, loop: false },
    hurt:   { src: "images/golem/golem-hurt.png",   frames: 4,  fps: 10, loop: false },
    die:    { src: "images/golem/golem-die.png",    frames: 13, fps: 12, loop: false },
  };
  // Load every sprite sheet once; frames are drawn from these images
  Object.values(ANIMS).forEach((a) => {
    a.img = new Image();
    a.img.onload = () => { if (anim === a) draw(); };
    a.img.src = a.src;
  });

  // The golem is a 90x64 canvas (CSS makes it bigger, pixel-sharp).
  // A canvas can only ever show ONE frame, so the sheet can't "leak" like a background image.
  const ctx = golem.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // ---------------------------------------------------- sprite player
  // Driven by JS (not CSS), so the golem still breathes when Windows animations are off.
  let anim = null;
  let frame = 0;
  let reverse = false;
  let onDone = null;
  let lastTick = 0;

  function play(name, opts = {}) {
    anim = ANIMS[name];
    anim.name = name;
    reverse = !!opts.reverse;
    onDone = opts.onDone || null;
    frame = reverse ? anim.frames - 1 : 0;
    lastTick = 0;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, FRAME_W, FRAME_H);
    if (anim && anim.img.complete && anim.img.naturalWidth) {
      ctx.drawImage(anim.img, frame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
    }
  }

  function step() {
    const last = reverse ? 0 : anim.frames - 1;
    if (frame === last) {
      if (anim.loop) frame = reverse ? anim.frames - 1 : 0;
      else if (onDone) { const cb = onDone; onDone = null; cb(); return false; }
      else return false;
    } else {
      frame += reverse ? -1 : 1;
    }
    return true;
  }

  function tick(now) {
    if (anim) {
      if (!lastTick) lastTick = now;
      // Catch up on missed frames, so timing stays right even on a slow or busy computer
      let steps = Math.min(30, Math.floor((now - lastTick) * anim.fps / 1000));
      if (steps > 0) {
        lastTick += steps * 1000 / anim.fps;
        const current = anim;
        while (steps-- > 0 && anim === current && step()) {}
        draw();
      }
    }
    walkStep(now);
    requestAnimationFrame(tick);
  }

  // ---------------------------------------------------- walking around
  let x = 12;
  let targetX = null;
  let lastWalk = 0;
  let busy = false;        // attacking / hurt / talking with menu
  let hidden = false;

  function setX(v) {
    x = v;
    helper.style.setProperty("--hx", Math.round(x) + "px");
  }
  function face(dir) {
    golem.style.setProperty("--face", dir < 0 ? -1 : 1);
  }

  function walkStep(now) {
    if (targetX === null) { lastWalk = now; return; }
    const dt = Math.min(0.05, (now - lastWalk) / 1000);
    lastWalk = now;
    const speed = 55; // px per second
    const dir = Math.sign(targetX - x);
    const next = x + dir * speed * dt;
    if ((dir > 0 && next >= targetX) || (dir < 0 && next <= targetX) || dir === 0) {
      setX(targetX);
      targetX = null;
      play("idle");
    } else {
      setX(next);
    }
  }

  function wanderSoon() {
    setTimeout(() => {
      if (!hidden && !busy && targetX === null && bubble.hidden && !reduceMotion) {
        const width = helper.offsetWidth;
        const max = Math.max(12, Math.min(window.innerWidth * 0.35, window.innerWidth - width - 12));
        const to = 12 + Math.random() * (max - 12);
        if (Math.abs(to - x) > 30) {
          targetX = to;
          face(to - x);
          play("walk");
        }
      }
      wanderSoon();
    }, 7000 + Math.random() * 8000);
  }

  function stopWalking() {
    if (targetX !== null) {
      targetX = null;
      play("idle");
    }
  }

  // ---------------------------------------------------- talking
  let typeTimer = null;
  let hideTimer = null;

  function say(message, { menuOpen = false, ms = 5500 } = {}) {
    if (hidden) return;
    clearInterval(typeTimer);
    clearTimeout(hideTimer);
    bubble.hidden = false;
    menu.hidden = !menuOpen;
    text.textContent = "";
    let i = 0;
    typeTimer = setInterval(() => {               // typewriter effect
      text.textContent = message.slice(0, ++i);
      if (i >= message.length) clearInterval(typeTimer);
    }, 22);
    if (!menuOpen) hideTimer = setTimeout(closeBubble, ms);
  }

  function closeBubble() {
    clearInterval(typeTimer);
    clearTimeout(hideTimer);
    bubble.hidden = true;
    menu.hidden = true;
    busy = false;
  }

  const TIPS = [
    "Tip: in-game, /pv opens your vaults!",
    "Psst... scroll really fast. The minecart throws sparks!",
    "Every button here clicks like Minecraft. Try one!",
    "Shift + Click a vault in VaraVaults to change its icon.",
    "VaraVaults needs LuckPerms. Don't forget it!",
    "More plugins are being crafted right now...",
  ];
  let tipIndex = Math.floor(Math.random() * TIPS.length);

  // ---------------------------------------------------- clicking the golem
  let pokes = [];

  hit.addEventListener("click", () => {
    if (hidden) return;
    playClick();
    stopWalking();

    const now = Date.now();
    pokes = pokes.filter((t) => now - t < 2500);
    pokes.push(now);
    if (pokes.length >= 5) {                       // poked too much!
      pokes = [];
      busy = true;
      play("hurt", { onDone: () => play("idle") });
      say("Ouch! Stop poking me, I'm made of crystals!", { ms: 3000 });
      return;
    }

    if (!bubble.hidden && !menu.hidden) {          // second click closes the menu
      closeBubble();
      return;
    }
    busy = true;
    play("attack", { onDone: () => play("idle") }); // happy stomp
    say("Hey! I'm the Vara Helper. How can I help you?", { menuOpen: true });
  });

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    playClick();
    const action = btn.dataset.action;
    if (action === "plugins") {
      closeBubble();
      document.getElementById("plugins").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    } else if (action === "download") {
      closeBubble();
      document.querySelector('[data-open="varavaults-details"]')?.click();
    } else if (action === "top") {
      closeBubble();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    } else if (action === "hide") {
      hideHelper();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !bubble.hidden) closeBubble();
  });

  // ---------------------------------------------------- hide / call back
  function hideHelper() {
    say("Okay, bye! Click \"Helper\" to call me back.", { ms: 1800 });
    busy = true;
    setTimeout(() => {
      closeBubble();
      play("die", {
        onDone: () => {
          hidden = true;
          helper.hidden = true;
          callBtn.hidden = false;
          try { localStorage.setItem("varaHelperHidden", "1"); } catch (e) {}
        },
      });
    }, 1600);
  }

  callBtn.addEventListener("click", () => {
    playClick();
    hidden = false;
    helper.hidden = false;
    callBtn.hidden = true;
    try { localStorage.removeItem("varaHelperHidden"); } catch (e) {}
    play("die", {                                 // crumble in reverse = rebuild!
      reverse: true,
      onDone: () => {
        play("idle");
        say("I'm back! Click me if you need anything.");
      },
    });
  });

  // ---------------------------------------------------- talk about what you're looking at
  const seen = new Set();
  const sectionLines = {
    plugins: "This is VaraVaults, our first plugin! Hit Download and pick your platform.",
    about: "Vara's Plugins makes cute & powerful Minecraft plugins. More are coming!",
  };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (entry.isIntersecting && !seen.has(id) && sectionLines[id] && bubble.hidden) {
        seen.add(id);
        say(sectionLines[id]);
      }
    });
  }, { threshold: 0.5 });
  Object.keys(sectionLines).forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  // A random tip now and then
  setInterval(() => {
    if (!hidden && bubble.hidden && targetX === null && document.visibilityState === "visible") {
      say(TIPS[tipIndex++ % TIPS.length]);
    }
  }, 40000);

  // ---------------------------------------------------- start
  let startHidden = false;
  try { startHidden = localStorage.getItem("varaHelperHidden") === "1"; } catch (e) {}

  setX(12);
  play("idle");
  requestAnimationFrame(tick);
  if (startHidden) {
    hidden = true;
    helper.hidden = true;
    callBtn.hidden = false;
  } else {
    setTimeout(() => say("Hi! I'm the Vara Helper. Click me if you need anything!"), 1500);
  }
  wanderSoon();
  window.addEventListener("resize", () => {
    const max = window.innerWidth - helper.offsetWidth - 12;
    if (x > max) setX(Math.max(12, max));
  });
})();

// =========================================================
// DOWNLOAD COUNTERS (real numbers from GitHub Releases)
// =========================================================
(() => {
  const REPO = "v0idhere/vara.buzz";
  const CACHE_KEY = "varaDownloadStats";
  const CACHE_MS = 10 * 60 * 1000; // ask GitHub at most every 10 minutes per visitor

  const fmt = (n) => n.toLocaleString("en-US");

  function show(stats) {
    const total = document.getElementById("stat-downloads");
    if (total) {
      total.textContent = fmt(stats.total);
      total.classList.add("count-pop");
    }
    document.querySelectorAll("[data-downloads]").forEach((el) => {
      el.textContent = fmt(stats.perPlugin[el.dataset.downloads] || 0);
      el.classList.add("count-pop");
    });
  }

  async function load() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.time < CACHE_MS) return show(cached.stats);
    } catch (e) {}

    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`);
      if (!res.ok) throw new Error("GitHub " + res.status);
      const releases = await res.json();
      const stats = { total: 0, perPlugin: {} };
      releases.forEach((rel) => rel.assets.forEach((asset) => {
        if (!asset.name.endsWith(".jar")) return;
        // "VaraVaults-1.0.2-Paper.jar" -> plugin "VaraVaults"
        const plugin = asset.name.split("-")[0];
        stats.total += asset.download_count;
        stats.perPlugin[plugin] = (stats.perPlugin[plugin] || 0) + asset.download_count;
      }));
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), stats })); } catch (e) {}
      show(stats);
    } catch (e) {
      // GitHub unreachable: hide the numbers instead of showing wrong ones
      document.querySelectorAll("#stat-downloads, [data-downloads]").forEach((el) => { el.textContent = "-"; });
    }
  }

  load();
})();

// =========================================================
// LIKES (hearts) — stored on our Cloudflare Worker
// =========================================================
(() => {
  const LIKES_API = "https://varabuzz-likes.dowyclient.workers.dev";
  const buttons = document.querySelectorAll("[data-like]");
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const counts = {};
  let total = 0;

  function render() {
    total = Object.values(counts).reduce((a, b) => a + b, 0);
    const totalEl = document.getElementById("stat-likes");
    if (totalEl) totalEl.textContent = fmt(total);
    document.querySelectorAll("[data-likes]").forEach((el) => {
      el.textContent = fmt(counts[el.dataset.likes] || 0);
    });
  }

  function setLiked(btn, liked) {
    btn.setAttribute("aria-pressed", liked ? "true" : "false");
    btn.dataset.tooltip = liked
      ? `Liked!|Click again to remove your like`
      : `Like|Click the heart if you like ${btn.dataset.like}`;
  }

  function heartBurst(btn) {
    if (reduceMotion) return;
    const r = btn.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const b = document.createElement("div");
      b.className = "like-burst";
      const angle = (Math.PI * 2 * i) / 10;
      b.style.left = r.left + 18 + "px";
      b.style.top = r.top + r.height / 2 + "px";
      b.style.background = i % 2 ? "#ff4f7b" : "#ffd1e6";
      b.style.setProperty("--dx", Math.cos(angle) * 34 + "px");
      b.style.setProperty("--dy", Math.sin(angle) * 34 + "px");
      document.body.appendChild(b);
      b.addEventListener("animationend", () => b.remove());
    }
  }

  async function load() {
    try {
      const res = await fetch(`${LIKES_API}/likes`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      Object.assign(counts, data.counts);
      buttons.forEach((btn) => setLiked(btn, data.liked.includes(btn.dataset.like)));
      render();
    } catch (e) {
      document.querySelectorAll("#stat-likes, [data-likes]").forEach((el) => { el.textContent = "-"; });
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const plugin = btn.dataset.like;
      const like = btn.getAttribute("aria-pressed") !== "true";
      playClick();

      // Update the screen right away, then confirm with the server
      setLiked(btn, like);
      counts[plugin] = Math.max(0, (counts[plugin] || 0) + (like ? 1 : -1));
      render();
      if (like) {
        btn.classList.remove("pop");
        void btn.offsetWidth;
        btn.classList.add("pop");
        heartBurst(btn);
      }

      btn.disabled = true;
      try {
        const res = await fetch(`${LIKES_API}/${like ? "like" : "unlike"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plugin }),
        });
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        counts[plugin] = data.count;
        setLiked(btn, data.liked);
      } catch (e) {
        // Server didn't accept it: undo on screen
        setLiked(btn, !like);
        counts[plugin] = Math.max(0, (counts[plugin] || 0) + (like ? -1 : 1));
      }
      btn.disabled = false;
      render();
    });
  });

  load();
})();
