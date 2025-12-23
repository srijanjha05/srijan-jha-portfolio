import './styles/style.css';
import VanillaTilt from 'vanilla-tilt';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// === ANIMATIONS ===
function initAnimations() {
    // 1. Hero Reveal (Page Load)
    const heroTl = gsap.timeline();
    heroTl.from(".navbar", { y: -100, opacity: 0, duration: 1, ease: "power3.out", clearProps: "all" })
        .from(".tile--profile", { scale: 0.9, opacity: 0, duration: 1, ease: "back.out(1.7)", clearProps: "all" }, "-=0.5")
        .from(".tile--stack, .tile--info", { y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", clearProps: "all" }, "-=0.5");

    // 2. Section Titles Slide Up
    gsap.utils.toArray(".section-title").forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            clearProps: "all"
        });
    });

    // 3. Project & Media Grids Stagger
    // Select all grids except home (which is animated on load)
    const grids = document.querySelectorAll("section:not(#home) .bento-grid");

    grids.forEach(grid => {
        // Select tiles inside this specific grid
        const tiles = grid.querySelectorAll(".tile");

        gsap.from(tiles, {
            scrollTrigger: {
                trigger: grid,
                start: "top 75%",
                toggleActions: "play none none reverse"
            },
            y: 100,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            stagger: 0.1, // The "fantastic" staggered effect
            ease: "power2.out",
            clearProps: "all" // Critical for hover effects to work after animation
        });
    });
}

// Initialize Animations
initAnimations();

// === TILT EFFECT ===
// Re-init tilt for dynamic content compatibility if needed, though here it's static
VanillaTilt.init(document.querySelectorAll(".tile"), {
    max: 5,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
});

// === PARTICLE BACKGROUND SYSTEM ===
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const mouse = { x: null, y: null };

// Configuration
const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 150;
const MOUSE_DISTANCE = 200;

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(255, 215, 0, ${Math.random() * 0.5 + 0.1})`; // Gold tint
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Interaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < MOUSE_DISTANCE) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (MOUSE_DISTANCE - distance) / MOUSE_DISTANCE;
                const directionX = forceDirectionX * force * 0.6;
                const directionY = forceDirectionY * force * 0.6;

                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    connectParticles();
}

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let distance = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
            if (distance < (CONNECTION_DISTANCE * CONNECTION_DISTANCE)) {
                let opacity = 1 - (distance / (CONNECTION_DISTANCE * CONNECTION_DISTANCE));
                ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.15})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

window.addEventListener('resize', init);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

init();
animate();
