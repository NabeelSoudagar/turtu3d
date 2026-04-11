import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// --- Core Variables ---
const frameCount = 192;
const images = [];
const turtu = { frame: 0 };
let loadedCount = 0;
let loaderHidden = false;

const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');

const currentFrame = (index) => (
    `/assets/frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

// --- Core Functions ---

function render() {
    if (!images[turtu.frame]) return;
    const img = images[turtu.frame];
    if (!img.complete) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}

function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    
    const loaderTl = gsap.timeline();
    loaderTl.to('.loader-bar', { width: '100%', duration: 1, ease: 'power2.inOut' })
    .to('.loader', {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        onComplete: () => {
            document.querySelector('.loader').style.display = 'none';
        }
    });
}

const preloadImages = () => {
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (i === 0) render();
            if (loadedCount === 30) hideLoader(); // Hide early once initial batch is ready
        };
        img.onerror = () => {
            console.error("Failed to load:", img.src);
            loadedCount++;
        };
        img.src = currentFrame(i);
        images.push(img);
    }
};

// --- Initialization ---

// 1. Setup Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Setup Canvas
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 3. Preload Assets
preloadImages();

// 4. Setup Scroll Animation
gsap.to(turtu, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
    },
    onUpdate: render,
});

// 5. App Showcase Scroll Animation
const featureSteps = gsap.utils.toArray('.feature-step');
const showcaseScreens = gsap.utils.toArray('.showcase-screen');

featureSteps.forEach((step, i) => {
    ScrollTrigger.create({
        trigger: step,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
            updateShowcase(i);
        },
        onEnterBack: () => {
            updateShowcase(i);
        },
    });
});

function updateShowcase(index) {
    featureSteps.forEach((step, i) => {
        if (i === index) step.classList.add('active');
        else step.classList.remove('active');
    });
    
    showcaseScreens.forEach((screen, i) => {
        if (i === index) screen.classList.add('active');
        else screen.classList.remove('active');
    });
}




// 7. UI Animations
gsap.to('.hero-title', { opacity: 1, y: 0, duration: 1, delay: 0.5 });
gsap.to('.hero-subtitle', { opacity: 1, y: 0, duration: 1, delay: 0.8 });

const sections = gsap.utils.toArray('section:not(.hero-section):not(.app-showcase-section)');
sections.forEach(section => {
    gsap.from(section, {
        scrollTrigger: { trigger: section, start: 'top 85%' },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
    });
});

const stats = document.querySelectorAll('.stat-number');
stats.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    gsap.to(stat, {
        scrollTrigger: { trigger: stat, start: 'top 95%' },
        innerText: target,
        duration: 2.5,
        snap: { innerText: 1 },
        ease: 'power1.inOut',
        onUpdate: function() { stat.innerHTML = Math.ceil(this.targets()[0].innerText); }
    });
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Logo Transparency Processor
const processLogo = async () => {
    const logoIcons = document.querySelectorAll('.logo-icon');
    if (logoIcons.length === 0) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = '/assets/logo.webp';
    
    await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
    });

    if (!img.complete || img.naturalWidth === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Threshold for black (allow slight variations if needed)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If it's very dark, make it transparent
        if (r < 10 && g < 10 && b < 10) {
            data[i + 3] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    const transparentLogoUrl = canvas.toDataURL();

    logoIcons.forEach(icon => {
        icon.style.webkitMaskImage = `url(${transparentLogoUrl})`;
        icon.style.maskImage = `url(${transparentLogoUrl})`;
    });
};

processLogo();

// Ultimate safety hide
setTimeout(hideLoader, 6000);
