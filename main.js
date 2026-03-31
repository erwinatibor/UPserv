document.addEventListener("DOMContentLoaded", () => {
    // Hero section click (Particle Burst + Sound Effect)
    const heroSection = document.getElementById('hero-section');
    const burstSound = document.getElementById('burst-sound');
    if (heroSection) {
        heroSection.addEventListener('click', () => {
            // Play sound effect
            if (burstSound) {
                burstSound.currentTime = 0;
                burstSound.play().catch(e => console.log("Audio play blocked by browser:", e));
            }
            // Trigger 3D particle burst (if WebGL function is present)
            if (typeof window.triggerParticleBurst === 'function') {
                window.triggerParticleBurst();
            }
        });
    }

    // Matrix Rain Overlay
    const mCanvas = document.getElementById('matrix-canvas');
    if (mCanvas) {
        const mCtx = mCanvas.getContext('2d');
        let mWidth, mHeight;

        const resizeMatrix = () => {
            mWidth = mCanvas.width = mCanvas.parentElement.clientWidth;
            mHeight = mCanvas.height = mCanvas.parentElement.clientHeight;
        };
        window.addEventListener('resize', resizeMatrix);
        resizeMatrix();

        const words = ['GEO', 'LLM', 'AI', 'MUM', 'RAG', 'AEO', 'SCHEMA', 'DATA', 'NLP', 'JSON'];
        const fontSize = 16;
        let columns = Math.floor(mWidth / (fontSize * 3.5));
        let drops = Array(columns).fill(1).map(() => Math.random() * 100);

        let matrixColor = '#d3a4ff';
        window.setMatrixColor = (color) => { matrixColor = color; };

        const drawMatrix = () => {
            mCtx.fillStyle = 'rgba(26, 26, 26, 0.1)';
            mCtx.fillRect(0, 0, mWidth, mHeight);

            mCtx.fillStyle = matrixColor;
            mCtx.font = 'bold ' + fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = words[Math.floor(Math.random() * words.length)];
                mCtx.fillText(text, i * fontSize * 3.5, drops[i] * fontSize);
                if (drops[i] * fontSize > mHeight && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        setInterval(drawMatrix, 40);
    }

    // ====================================================================
    // LIQUID WATER TRAIL EFFECT
    // ====================================================================
    const fCanvas = document.getElementById('fluid-canvas');
    if (fCanvas) {
        const fCtx = fCanvas.getContext('2d');
        let fWidth, fHeight;

        const resizeFluid = () => {
            fWidth = fCanvas.width = window.innerWidth;
            fHeight = fCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeFluid);
        resizeFluid();

        let trail = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let lastMouseX = mouseX;
        let lastMouseY = mouseY;
        let isMoving = false;

        const color1 = { r: 0, g: 212, b: 255 };
        const color2 = { r: 138, g: 43, b: 226 };

        const isDesktop = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        if (isDesktop) {
            document.addEventListener('mousemove', (event) => {
                mouseX = event.clientX;
                mouseY = event.clientY;
                isMoving = true;
            });

            let lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                const scrollDelta = currentScrollY - lastScrollY;
                lastScrollY = currentScrollY;

                for (let p of trail) {
                    p.y -= scrollDelta;
                }
                mouseY -= scrollDelta * 0.1;
                isMoving = true;
            });
        }

        function addFluidDrop(x, y) {
            trail.push({
                x: x, y: y,
                age: 0,
                size: 3,
                maxSize: 14 + Math.random() * 8,
                life: 18 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3
            });
        }

        window.triggerParticleBurst = () => {
            for(let i = 0; i < 8; i++) {
                trail.push({
                    x: mouseX + (Math.random() - 0.5) * 40,
                    y: mouseY + (Math.random() - 0.5) * 40,
                    age: 0, size: 8, maxSize: 40 + Math.random() * 20,
                    life: 25 + Math.random() * 15,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4
                });
            }
        };

        function animateFluid() {
            requestAnimationFrame(animateFluid);
            fCtx.clearRect(0, 0, fWidth, fHeight);

            if (isMoving) {
                const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
                if (dist > 25) {
                    const steps = Math.floor(dist / 25);
                    for (let i = 0; i < steps; i++) {
                        addFluidDrop(lastMouseX + (mouseX - lastMouseX) * (i / steps), lastMouseY + (mouseY - lastMouseY) * (i / steps));
                    }
                } else {
                    addFluidDrop(mouseX, mouseY);
                }
                lastMouseX = mouseX;
                lastMouseY = mouseY;
                isMoving = false;
            }

            for (let i = 0; i < trail.length; i++) {
                const p = trail[i];
                p.age++;
                p.x += p.vx;
                p.y += p.vy - 0.15;

                const progress = p.age / p.life;
                if (progress >= 1) {
                    trail.splice(i, 1);
                    i--;
                    continue;
                }

                const currentSize = p.size + (p.maxSize - p.size) * Math.sin(progress * Math.PI / 2);
                const opacity = (1 - Math.pow(progress, 2)) * 0.2;

                const r = Math.round(color1.r + (color2.r - color1.r) * progress);
                const g = Math.round(color1.g + (color2.g - color1.g) * progress);
                const b = Math.round(color1.b + (color2.b - color1.b) * progress);

                const grad = fCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
                grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
                grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                fCtx.fillStyle = grad;
                fCtx.beginPath();
                fCtx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
                fCtx.fill();
            }
        }
        animateFluid();
    }
});


// ====================================================================
// FAQ SCRIPT
// ====================================================================
(function () {

  // --- Accordion ---
  var triggers = document.querySelectorAll('.faq-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var answerId = trigger.getAttribute('aria-controls');
      var answer = document.getElementById(answerId);
      var icon = trigger.querySelector('.faq-icon svg');
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all others
      triggers.forEach(function (t) {
        var a = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-expanded', 'false');
        if (a) a.style.maxHeight = '0';
        var ic = t.querySelector('.faq-icon svg');
        if (ic) ic.style.transform = 'rotate(0deg)';
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
        icon.style.transform = 'rotate(45deg)';
      }
    });
  });

  // --- Stage Filter ---
  var stageBtns = document.querySelectorAll('.faq-stage-btn');
  var faqItems = document.querySelectorAll('.faq-item');
  var stageLabels = document.querySelectorAll('.faq-stage-label');

  stageBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stage = btn.dataset.stage;

      // Update active button
      stageBtns.forEach(function (b) {
        b.classList.remove('active', 'bg-brand-dark', 'text-white');
        b.classList.add('bg-white', 'text-brand-dark');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active', 'bg-brand-dark', 'text-white');
      btn.classList.remove('bg-white', 'text-brand-dark');
      btn.setAttribute('aria-pressed', 'true');

      // Close all open answers first
      triggers.forEach(function (t) {
        var a = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-expanded', 'false');
        if (a) a.style.maxHeight = '0';
        var ic = t.querySelector('.faq-icon svg');
        if (ic) ic.style.transform = 'rotate(0deg)';
      });

      // Show/hide items and stage labels
      const incomingFaq = [];
      const outgoingFaq = [];

      const allFaqElements = [...Array.from(faqItems), ...Array.from(stageLabels)];

      allFaqElements.forEach(el => {
          const match = (stage === 'all' || el.dataset.stage === stage);
          const isVisible = el.style.display !== 'none';

          if (match && !isVisible) incomingFaq.push(el);
          if (!match && isVisible) outgoingFaq.push(el);
      });

      const tlFaq = gsap.timeline();

      if (outgoingFaq.length) {
          tlFaq.to(outgoingFaq, { opacity: 0, x: -30, duration: 0.2, stagger: 0.02, ease: "power2.in", onComplete: () => outgoingFaq.forEach(el => el.style.display = 'none') });
      }
      if (incomingFaq.length) {
          tlFaq.call(() => incomingFaq.forEach(el => el.style.display = ''));
          tlFaq.fromTo(incomingFaq, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.04, ease: "back.out(1.2)", clearProps: "all" });
      }
    });
  });

})();


// ====================================================================
// GSAP 3D SCROLL ANIMATIONS
// ====================================================================
gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.matchMedia({
  "(prefers-reduced-motion: no-preference)": function() {

    // === HERO 93% SPLIT TEXT ANIMATION ===
    gsap.from(".hero-split-char", {
      y: 80,
      opacity: 0,
      rotateX: -80,
      transformPerspective: 800,
      transformOrigin: "bottom center",
      duration: 1.2,
      stagger: 0.15,
      ease: "back.out(1.5)",
      delay: 0.3
    });

    // === HERO 93% WOBBLE HOVER ===
    const heroChars = document.querySelectorAll(".hero-split-char");
    heroChars.forEach(char => {
        char.addEventListener("mouseenter", () => {
            gsap.to(char, {
                y: -20,
                scaleY: 1.15,
                scaleX: 0.9,
                rotateZ: Math.random() * 8 - 4,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        char.addEventListener("mouseleave", () => {
            gsap.to(char, {
                y: 0,
                scaleY: 1,
                scaleX: 1,
                rotateZ: 0,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // === 810 MILLION SPLIT TEXT ANIMATION ===
    gsap.from(".stat-split-char", {
      scrollTrigger: {
          trigger: ".stat-heading-container",
          start: "top 85%",
          toggleActions: "play none none none"
      },
      y: 60,
      opacity: 0,
      rotateX: -80,
      transformPerspective: 800,
      transformOrigin: "bottom center",
      duration: 1,
      stagger: 0.08,
      ease: "back.out(1.5)"
    });

    // === LUSION-STYLE MAGNETIC 3D HOVER (BOXES) ===
    if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const hoverCards = document.querySelectorAll('#blog article, #pricing > div > div, .portfolio-card');

        hoverCards.forEach(card => {
          card.addEventListener('mousemove', function(e) {
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;

              const rotateX = ((y - centerY) / centerY) * -12;
              const rotateY = ((x - centerX) / centerX) * 12;

              gsap.to(card, {
                  rotateX: rotateX,
                  rotateY: rotateY,
                  y: -12,
                  transformPerspective: 1200,
                  transformOrigin: "center center",
                  ease: "power2.out",
                  duration: 0.4
              });
          });

          card.addEventListener('mouseleave', function() {
              gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, ease: "elastic.out(1, 0.4)", duration: 1.2, clearProps: "transform" });
          });
        });

        // === MAGNETIC BUTTON HOVER (BOOK A DEMO & HERO SCAN) ===
        const magneticBtns = document.querySelectorAll('a[href*="calendly.com"], #hero-scan-btn, #prev-btn, #next-btn');

        magneticBtns.forEach(btn => {
          btn.addEventListener('mousemove', function(e) {
              const rect = btn.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;

              const rotateX = ((y - centerY) / centerY) * -15;
              const rotateY = ((x - centerX) / centerX) * 15;

              const moveX = ((x - centerX) / centerX) * 10;
              const moveY = ((y - centerY) / centerY) * 10;

              gsap.to(btn, {
                  rotateX: rotateX,
                  rotateY: rotateY,
                  x: moveX,
                  y: moveY - 4,
                  transformPerspective: 800,
                  transformOrigin: "center center",
                  ease: "power2.out",
                  duration: 0.4
              });
          });

          btn.addEventListener('mouseleave', function() {
              gsap.to(btn, { rotateX: 0, rotateY: 0, x: 0, y: 0, ease: "elastic.out(1, 0.4)", duration: 1.2, clearProps: "transform" });
          });
        });

    }

    const sections = ["#pricing", "#portfolio", "#faq", "#blog", "#ai-audit-tool", "#how-it-works"];

    sections.forEach(secId => {
      const section = document.querySelector(secId);
      if (!section) return;

      const selectors = 'h2, h3, p, .portfolio-card, .faq-item, article, div[class*="border-2"], div[class*="border-t-4"]';
      let targets = Array.from(section.querySelectorAll(selectors));

      targets = targets.filter(el => {
        let p = el.parentElement;
        while (p && p !== section) {
          if (p.matches(selectors)) return false;
          p = p.parentElement;
        }
        return true;
      });

      const headings = targets.filter(t => t.tagName === 'H2' || t.tagName === 'H3' || t.classList.contains('text-5xl'));
      const otherElements = targets.filter(t => !headings.includes(t));

      if (headings.length > 0) {
        gsap.from(headings, {
          y: 80,
          opacity: 0,
          rotateX: -45,
          skewY: 5,
          scale: 0.9,
          transformOrigin: "left bottom",
          stagger: 0.15,
          duration: 1.2,
          ease: "back.out(1.4)",
          clearProps: "all",
          scrollTrigger: { trigger: secId, start: "top 85%", toggleActions: "play none none none" }
        });
      }

      if (otherElements.length > 0) {
        gsap.from(otherElements, {
          y: 50,
          opacity: 0,
          scale: 0.96,
          stagger: 0.08,
          duration: 1,
          ease: "power4.out",
          clearProps: "all",
          scrollTrigger: { trigger: secId, start: "top 85%", toggleActions: "play none none none" }
        });
      }

    });

  }
});


// ====================================================================
// Nodum Signal Network JS
// ====================================================================
(function(){
    var SCENES=[
        {words:[{text:'CHATGPT',path:0,delay:0},{text:'GEMINI',path:1,delay:280},{text:'PERPLEXITY',path:2,delay:560},{text:'META AI',path:3,delay:840}],eye:'Who we are',msg:'Upserv is an AI technology company\nthat makes businesses visible to AI.',sub:'upserv.ai'},
        {words:[{text:'AI-READABLE',path:0,delay:0},{text:'VERIFIED DATA',path:2,delay:350},{text:'19 PLATFORMS',path:1,delay:700},{text:'BROADCAST',path:3,delay:1050}],eye:'What we do',msg:'We build AI-readable websites and\nbroadcast your data into 19 AI platforms.',sub:'ChatGPT \u00b7 Gemini \u00b7 Perplexity \u00b7 Grok'},
        {words:[{text:'DENTAL CLINIC',path:3,delay:0},{text:'RESTAURANT',path:0,delay:300},{text:'AUTO REPAIR',path:1,delay:600},{text:'LAW FIRM',path:2,delay:900}],eye:'Who we serve',msg:'Local service businesses across the US\nthat depend on customers finding them.',sub:'Dental \u00b7 Medical \u00b7 Food \u00b7 Trades \u00b7 Legal'},
        {words:[{text:'GOOGLE MUM',path:0,delay:0},{text:'800M USERS',path:2,delay:400},{text:'3-5 RESULTS',path:1,delay:800}],eye:'Why it matters',msg:'In 2026, AI replaced keyword search.\nAI now picks 3-5 businesses per query.',sub:'Google MUM \u00b7 ChatGPT Ads \u00b7 Feb 2026'},
        {words:[{text:'91-95%',path:1,delay:0},{text:'NOT BUILT',path:3,delay:400},{text:'FOR AI',path:0,delay:800}],eye:'The problem',msg:'91-95% of small business websites\nare invisible to AI recommendations.',sub:"If AI can\u2019t find you \u2014 you don\u2019t exist."},
        {words:[{text:'UPSERV.AI',path:0,delay:0},{text:'7 DAYS',path:2,delay:350},{text:'GHOST SCORE',path:1,delay:700},{text:'$1,000',path:3,delay:1050}],eye:'Get visible now',msg:'AI-ready website live in 7 days.\nFree Ghost Score audit to start.',sub:'Starting at $1,000 \u00b7 19 platforms'},
    ];
    var DURS=[10200,10400,10600,10200,10000,10800];
    var par=document.getElementById('particles'),msg=document.getElementById('center-msg'),eyeEl=document.getElementById('cm-eye'),mainEl=document.getElementById('cm-main'),subEl=document.getElementById('cm-sub'),core=document.getElementById('core');
    var paths=[0,1,2,3].map(function(i){return document.getElementById('pp'+i);});
    var navs=[0,1,2,3].map(function(i){return document.getElementById('snav'+i);});
    var nodeEls=[0,1,2,3].map(function(i){return document.getElementById('n'+i);});
    var cur=0,raf=null,tid=null,t0=null,pt=[];
    if(!par||!paths[0])return;
    function reset(){while(par.firstChild)par.removeChild(par.firstChild);nodeEls.forEach(function(n){if(n){n.style.borderColor='rgba(255,255,255,0.08)';n.style.boxShadow='0 24px 48px rgba(0,0,0,0.25)';}});navs.forEach(function(a){if(a){a.style.background='rgba(255,255,255,0.1)';a.style.boxShadow='';}});core.style.borderColor='rgba(255,255,255,0.1)';core.style.boxShadow='0 32px 64px rgba(0,0,0,0.4),inset 0 2px 4px rgba(255,255,255,0.1)';msg.style.opacity='0';}
    function go(i){clearTimeout(tid);cancelAnimationFrame(raf);pt.forEach(clearTimeout);pt=[];reset();cur=i;fire(i);tick(i);}
    function tick(i){t0=performance.now();(function lp(n){var p=Math.min((n-t0)/DURS[i]*100,100);if(p<100)raf=requestAnimationFrame(lp);})(performance.now());tid=setTimeout(function(){go((cur+1)%SCENES.length);},DURS[i]);}
    function showMsg(i){var s=SCENES[i];eyeEl.textContent=s.eye;mainEl.innerHTML=s.msg.replace(/\n/g,'<br>');subEl.textContent=s.sub;msg.style.opacity='1';var t=setTimeout(function(){msg.style.opacity='0';core.style.borderColor='rgba(255,255,255,0.1)';core.style.boxShadow='0 32px 64px rgba(0,0,0,0.4),inset 0 2px 4px rgba(255,255,255,0.1)';},5000);pt.push(t);}
    function fire(si){var sc=SCENES[si],tot=sc.words.length,arr=0;sc.words.forEach(function(item){var pe=paths[item.path],nd=nodeEls[item.path],na=navs[item.path];if(!pe)return;var len=pe.getTotalLength();var t=setTimeout(function(){if(nd){nd.style.borderColor='rgba(0,212,255,0.5)';nd.style.boxShadow='0 24px 48px rgba(0,0,0,0.25),0 0 24px rgba(0,212,255,0.14)';}if(na){na.style.background='rgba(0,212,255,0.4)';na.style.boxShadow='0 0 8px rgba(0,212,255,0.5)';}travel(item.text,pe,len,function(){if(nd){nd.style.borderColor='rgba(255,255,255,0.08)';nd.style.boxShadow='0 24px 48px rgba(0,0,0,0.25)';}if(na){na.style.background='rgba(255,255,255,0.1)';na.style.boxShadow='';}arr++;if(arr===tot){core.style.borderColor='rgba(0,212,255,0.6)';core.style.boxShadow='0 32px 64px rgba(0,0,0,0.4),0 0 48px rgba(0,212,255,0.2)';showMsg(si);}});},item.delay);pt.push(t);});}
    function travel(word,pe,len,done){var ns='http://www.w3.org/2000/svg';var dot=document.createElementNS(ns,'circle');dot.setAttribute('r','3.5');dot.setAttribute('fill','#00D4FF');dot.setAttribute('opacity','0');dot.style.filter='drop-shadow(0 0 6px #00D4FF)';par.appendChild(dot);var txt=document.createElementNS(ns,'text');txt.setAttribute('font-family',"'Outfit',sans-serif");txt.setAttribute('font-size','10');txt.setAttribute('font-weight','700');txt.setAttribute('fill','#00D4FF');txt.setAttribute('opacity','0');txt.setAttribute('letter-spacing','1.5');txt.style.filter='drop-shadow(0 0 4px rgba(0,212,255,0.7))';txt.textContent=word;par.appendChild(txt);var DUR=1050,s=null;function frame(ts){if(!s)s=ts;var f=Math.min((ts-s)/DUR,1);var e=f<.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2;var p2=pe.getPointAtLength(e*len);var pb=pe.getPointAtLength(Math.max(0,(e-.055)*len));var a=f<.1?f/.1:f<.75?1:1-(f-.75)/.25;dot.setAttribute('cx',p2.x);dot.setAttribute('cy',p2.y);dot.setAttribute('opacity',(a*.9).toFixed(2));txt.setAttribute('x',pb.x-word.length*3.2);txt.setAttribute('y',pb.y+4);txt.setAttribute('opacity',(a*.85).toFixed(2));if(f<1){requestAnimationFrame(frame);}else{try{par.removeChild(dot);par.removeChild(txt);}catch(e2){}if(done)done();}}requestAnimationFrame(frame);}
    // === HERO BOX LABELS + PLAY-TO-CENTER ===
    var heroData = [
        { title: 'Who we are', eye: 'Who we are', desc: 'Upserv is an AI technology company\nthat makes businesses visible to AI.', sub: 'upserv.ai' },
        { title: 'What we do', eye: 'What we do', desc: 'We build AI-readable websites and\nbroadcast your data into 19 AI platforms.', sub: 'ChatGPT \u00b7 Gemini \u00b7 Perplexity \u00b7 Grok' },
        { title: 'Who we serve', eye: 'Who we serve', desc: 'Local service businesses across the US\nthat depend on customers finding them.', sub: 'Dental \u00b7 Medical \u00b7 Food \u00b7 Trades \u00b7 Legal' },
        { title: 'Why it matters', eye: 'Why it matters', desc: 'In 2026, AI replaced keyword search.\nAI now picks 3\u20135 businesses per query.', sub: 'Google MUM \u00b7 ChatGPT Ads \u00b7 Feb 2026' }
    ];
    var activeHero = -1;
    var heroMsgTimeout = null;

    nodeEls.forEach(function(node, i) {
        var lbl = document.createElement('div');
        lbl.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:31;pointer-events:none;';
        lbl.innerHTML = '<span style="font-family:\'Outfit\',sans-serif;font-size:12px;font-weight:800;color:#00D4FF;text-transform:uppercase;letter-spacing:0.12em;text-shadow:0 0 12px rgba(255,107,74,0.3);text-align:center;line-height:1.4;">' + heroData[i].title + '</span>';
        node.appendChild(lbl);

        var playBtn = node.querySelector('div[style*="align-self:flex-end"]');
        if (playBtn) {
            playBtn.style.cursor = 'pointer';
            playBtn.style.zIndex = '35';
            playBtn.style.position = 'relative';
            playBtn.style.transition = 'transform 0.2s, background 0.2s';
            playBtn.addEventListener('mouseenter', function() {
                playBtn.style.background = 'rgba(255,107,74,0.3)';
                playBtn.style.transform = 'scale(1.15)';
            });
            playBtn.addEventListener('mouseleave', function() {
                playBtn.style.background = 'rgba(255,255,255,0.1)';
                playBtn.style.transform = 'scale(1)';
            });
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showHeroInCenter(i);
            });
        }
    });

    function showHeroInCenter(i) {
        if (activeHero === i) {
            dismissHeroMsg();
            return;
        }
        if (heroMsgTimeout) { clearTimeout(heroMsgTimeout); heroMsgTimeout = null; }

        nodeEls.forEach(function(n, idx) {
            if (n) {
                n.style.borderColor = idx === i ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)';
                n.style.boxShadow = idx === i ? '0 24px 48px rgba(0,0,0,0.25),0 0 24px rgba(0,212,255,0.14)' : '0 24px 48px rgba(0,0,0,0.25)';
            }
            if (navs[idx]) {
                navs[idx].style.background = idx === i ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)';
                navs[idx].style.boxShadow = idx === i ? '0 0 8px rgba(0,212,255,0.5)' : '';
            }
        });

        core.style.borderColor = 'rgba(0,212,255,0.6)';
        core.style.boxShadow = '0 32px 64px rgba(0,0,0,0.4),0 0 48px rgba(0,212,255,0.2)';

        var h = heroData[i];
        eyeEl.textContent = h.eye;
        mainEl.innerHTML = h.desc.replace(/\n/g, '<br>');
        subEl.textContent = h.sub;
        msg.style.opacity = '0';
        setTimeout(function() { msg.style.opacity = '1'; }, 50);

        activeHero = i;
        heroMsgTimeout = setTimeout(function() { dismissHeroMsg(); }, 300000);
    }

    function dismissHeroMsg() {
        msg.style.opacity = '0';
        core.style.borderColor = 'rgba(255,255,255,0.1)';
        core.style.boxShadow = '0 32px 64px rgba(0,0,0,0.4),inset 0 2px 4px rgba(255,255,255,0.1)';
        nodeEls.forEach(function(n) {
            if (n) { n.style.borderColor = 'rgba(255,255,255,0.08)'; n.style.boxShadow = '0 24px 48px rgba(0,0,0,0.25)'; }
        });
        navs.forEach(function(a) {
            if (a) { a.style.background = 'rgba(255,255,255,0.1)'; a.style.boxShadow = ''; }
        });
        activeHero = -1;
        if (heroMsgTimeout) { clearTimeout(heroMsgTimeout); heroMsgTimeout = null; }
    }

    go(0);
})();


// ====================================================================
// Ghost Score Gauge Animation
// ====================================================================
(function() {
    var arc = document.getElementById('gauge-arc');
    var num = document.getElementById('gauge-num');
    if (!arc || !num) return;
    var target = 87;
    var circumference = 264;
    setTimeout(function() {
        arc.style.strokeDashoffset = circumference - (circumference * target / 100);
        var current = 0;
        var step = target / 60;
        function tick() {
            current += step;
            if (current >= target) { num.textContent = target; return; }
            num.textContent = Math.round(current);
            requestAnimationFrame(tick);
        }
        tick();
    }, 800);
})();


// ====================================================================
// Scroll Reveal Animations
// ====================================================================
(function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    var reveals = document.querySelectorAll('#pricing, #faq, #blog, #ai-audit-tool, #how-it-works');
    reveals.forEach(function(sec) {
        var els = sec.querySelectorAll(':scope > div > h2, :scope > div > p, :scope > div > div');
        if (els.length) {
            gsap.from(els, {
                y: 30, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out',
                scrollTrigger: { trigger: sec, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }
    });
})();


// ====================================================================
// Scroll Progress Bar
// ====================================================================
(function() {
    var bar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', function() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        bar.style.width = pct + '%';
    });
})();


// ====================================================================
// Theme Toggle
// ====================================================================
(function() {
    var toggle = document.getElementById('theme-toggle');
    var html = document.documentElement;

    // Restore saved preference
    if (localStorage.getItem('theme') === 'light') {
        html.classList.add('light');
    }

    toggle.addEventListener('click', function() {
        html.classList.toggle('light');
        localStorage.setItem('theme', html.classList.contains('light') ? 'light' : 'dark');
    });
})();
