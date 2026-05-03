/* ── 다크모드/라이트모드 토글 ── */
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// 이전 접속 기록 무시, 항상 다크모드로 시작
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
});

/* ── 아코디언 ── */
function toggleRow(el) { el.classList.toggle('active'); }

/* ── 스무스 스크롤 ── */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        var t = document.querySelector(this.getAttribute('href'));
        if (t) window.scrollTo({ top: t.offsetTop - 68, behavior: 'smooth' });
    });
});

/* ── 헤더 그림자, 스크롤 & 위로 가기 버튼 이벤트 ── */
const header = document.querySelector('header');
const scrollTopBtn = document.getElementById('scroll-top-btn');
const infoSection = document.getElementById('info');

window.addEventListener('scroll', function() {
    const shadowColor = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)';
    
    if (window.scrollY > 50) {
        header.style.boxShadow = `0 10px 40px ${shadowColor}`;
    } else {
        header.style.boxShadow = 'none';
    }

    // Information 섹션이 화면에 보이면 위로 가기 버튼 나타남
    if (infoSection) {
        const infoRect = infoSection.getBoundingClientRect();
        // 화면 높이 안에 Information 섹션의 상단이 들어왔을 때
        if (infoRect.top < window.innerHeight) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }
});

// 위로 가기 버튼 클릭 시 최상단으로 스크롤
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 인터랙티브 도트 캔버스 애니메이션 ── */
const popupCanvas = document.getElementById('popup-canvas');
const ctx = popupCanvas.getContext('2d');
let dots = [];
let mouse = { x: -1000, y: -1000 };
let lastMouseTime = Date.now();
let isPopupVisible = true;

function initCanvas() {
    popupCanvas.width = window.innerWidth;
    popupCanvas.height = window.innerHeight;
    dots = [];
    const spacing = 20; 
    for (let x = 0; x <= popupCanvas.width + spacing; x += spacing) {
        for (let y = 0; y <= popupCanvas.height + spacing; y += spacing) {
            dots.push({ 
                baseX: x, baseY: y, 
                x: x, y: y, 
                r: 1, targetR: 1 
            });
        }
    }
}

window.addEventListener('resize', () => {
    if (isPopupVisible) initCanvas();
    initHeroCanvas();
});

const introPopup = document.getElementById('intro-popup');
introPopup.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMouseTime = Date.now(); 
});
introPopup.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

function animateCanvas(time) {
    if (!isPopupVisible) return; 
    requestAnimationFrame(animateCanvas);

    ctx.clearRect(0, 0, popupCanvas.width, popupCanvas.height);

    const now = Date.now();
    const idleTime = now - lastMouseTime;
    const isIdle = idleTime > 3000; 
    const idleProgress = Math.min((idleTime - 3000) / 1000, 1); 

    for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];
        let dx = dot.baseX - mouse.x;
        let dy = dot.baseY - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180 && !isIdle) {
            const force = (180 - dist) / 180;
            dot.targetR = 1.5 + force * 3.5; 
            dot.x = dot.baseX + (dx / dist) * force * 5; 
            dot.y = dot.baseY + (dy / dist) * force * 5;
        } else {
            dot.targetR = 1.2;
            dot.x += (dot.baseX - dot.x) * 0.1;
            dot.y += (dot.baseY - dot.y) * 0.1;
        }

        if (isIdle && idleProgress > 0) {
            const wave = Math.sin(time * 0.002 + dot.baseX * 0.01 + dot.baseY * 0.01);
            dot.targetR = 1.2 + wave * 0.6 * idleProgress; 
            dot.x = dot.baseX + Math.cos(time * 0.001 + dot.baseY * 0.01) * 3 * idleProgress; 
            dot.y = dot.baseY + Math.sin(time * 0.001 + dot.baseX * 0.01) * 3 * idleProgress;
        }

        dot.r += (dot.targetR - dot.r) * 0.2;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.1, dot.r), 0, Math.PI * 2);
        
        if (dot.r > 2 && !isIdle) {
            ctx.fillStyle = `rgba(202, 255, 51, ${Math.min(0.9, dot.r / 5)})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.08, dot.r / 3)})`;
        }
        ctx.fill();
    }
}

initCanvas();
animateCanvas(0);

/* ── 메인 화면(히어로) 미세 도트 캔버스 애니메이션 ── */
const heroCanvas = document.getElementById('hero-canvas');
const heroCtx = heroCanvas.getContext('2d');
const heroSection = document.querySelector('.hero');
let heroDots = [];
let heroMouse = { x: -1000, y: -1000 };
let heroLastMouseTime = Date.now();

function initHeroCanvas() {
    heroCanvas.width = heroSection.offsetWidth;
    heroCanvas.height = heroSection.offsetHeight;
    heroDots = [];
    const spacing = 18; 
    for (let x = 0; x <= heroCanvas.width + spacing; x += spacing) {
        for (let y = 0; y <= heroCanvas.height + spacing; y += spacing) {
            heroDots.push({ 
                baseX: x, baseY: y, 
                x: x, y: y, 
                r: 0.8, targetR: 0.8 
            });
        }
    }
}

heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    heroMouse.x = e.clientX - rect.left;
    heroMouse.y = e.clientY - rect.top;
    heroLastMouseTime = Date.now();
});
heroSection.addEventListener('mouseleave', () => {
    heroMouse.x = -1000;
    heroMouse.y = -1000;
});

function animateHeroCanvas(time) {
    requestAnimationFrame(animateHeroCanvas);

    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

    const now = Date.now();
    const idleTime = now - heroLastMouseTime;
    const isIdle = idleTime > 3000; 
    const idleProgress = Math.min((idleTime - 3000) / 1000, 1);
    
    const isDark = document.body.classList.contains('dark-mode');
    const baseRGB = isDark ? '255, 255, 255' : '0, 0, 0';

    for (let i = 0; i < heroDots.length; i++) {
        let dot = heroDots[i];
        let dx = dot.baseX - heroMouse.x;
        let dy = dot.baseY - heroMouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120 && !isIdle) {
            const force = (120 - dist) / 120;
            dot.targetR = 1.0 + force * 2.0; 
            dot.x = dot.baseX + (dx / dist) * force * 3; 
            dot.y = dot.baseY + (dy / dist) * force * 3;
        } else {
            dot.targetR = 0.8;
            dot.x += (dot.baseX - dot.x) * 0.1;
            dot.y += (dot.baseY - dot.y) * 0.1;
        }

        if (isIdle && idleProgress > 0) {
            const wave = Math.sin(time * 0.002 + dot.baseX * 0.015 + dot.baseY * 0.015);
            dot.targetR = 0.8 + wave * 0.4 * idleProgress; 
            dot.x = dot.baseX + Math.cos(time * 0.001 + dot.baseY * 0.015) * 1.5 * idleProgress; 
            dot.y = dot.baseY + Math.sin(time * 0.001 + dot.baseX * 0.015) * 1.5 * idleProgress;
        }

        dot.r += (dot.targetR - dot.r) * 0.2;

        heroCtx.beginPath();
        heroCtx.arc(dot.x, dot.y, Math.max(0.1, dot.r), 0, Math.PI * 2);
        
        if (dot.r > 1.2 && !isIdle) {
            heroCtx.fillStyle = `rgba(202, 255, 51, ${Math.min(0.8, dot.r / 3)})`;
        } else {
            heroCtx.fillStyle = `rgba(${baseRGB}, ${Math.min(0.15, dot.r / 3)})`;
        }
        heroCtx.fill();
    }
}

initHeroCanvas();
animateHeroCanvas(0);

/* ── 팝업 닫기 ── */
document.getElementById('enter-btn').addEventListener('click', function() {
    document.getElementById('intro-popup').classList.add('hidden');
    document.body.classList.remove('no-scroll');
    isPopupVisible = false; 
    window.scrollTo(0, 0);
});

/* ── 상담 카운터 ── */
(function() {
    var current = Math.random() < 0.5 ? 3 : 4;
    var MAX     = 6;
    var el      = document.getElementById('counter');
    el.textContent = current;

    var timer = setInterval(function() {
        if (current >= MAX) { clearInterval(timer); return; }
        current++;
        el.textContent = current;
    }, 9000); // 9초 간격으로 수정
})();

/* ── 모바일 메뉴 토글 ── */
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenuContainer = document.getElementById('nav-menu-container');

if (mobileMenuToggle && navMenuContainer) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenuContainer.classList.toggle('open');
    });

    // 메뉴 항목 클릭 시 모바일 메뉴 닫기
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            navMenuContainer.classList.remove('open');
        });
    });
}
