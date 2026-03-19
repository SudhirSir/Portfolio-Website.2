// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

    /* ===== MOBILE MENU & NAVBAR ===== */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const glassNav = document.querySelector('.glass-nav');

    // Toggle Mobile Menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // Change Nav styling on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            glassNav.classList.add('scrolled');
        } else {
            glassNav.classList.remove('scrolled');
        }
    });

    /* ===== CUSTOM CURSOR ===== */
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    
    // Check if device supports hover (not touch-only)
    if (window.matchMedia("(hover: hover)").matches) {
        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;

            // Direct update for the dot for responsiveness
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Slightly delayed animate for the outline
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 150, fill: "forwards" });
        });

        // Add hover effects to links and buttons
        const hoverElements = document.querySelectorAll('a, button, .btn, .nav-link, .social-icon');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hover-active');
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hover-active');
            });
        });
    } else {
        // Hide custom cursor on mobile/touch devices
        if(cursorDot) cursorDot.style.display = 'none';
        if(cursorOutline) cursorOutline.style.display = 'none';
        document.documentElement.style.cursor = 'auto'; // Restore default
    }

    /* ===== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ===== */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve if we only want it to animate once
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    /* ===== 3D INTERACTIVE PARTICLE CANVAS BACKGROUND ===== */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Mouse interaction parameters
    let mouse = { 
        x: null, 
        y: null, 
        radius: 150 
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    // Handle touch interactions for mobile
    window.addEventListener('touchmove', (e) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    });
    
    window.addEventListener('touchend', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor(x, y, dx, dy, size, color) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.size = size;
            this.color = color;
            this.density = (Math.random() * 30) + 1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Check boundaries
            if (this.x > width || this.x < 0) this.dx = -this.dx;
            if (this.y > height || this.y < 0) this.dy = -this.dy;

            // Move particle
            this.x += this.dx;
            this.y += this.dy;

            // Mouse interaction (repel effect)
            if (mouse.x && mouse.y) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            this.draw();
        }
    }

    function createParticles() {
        particles = [];
        // Adjust particle count based on screen size so it isn't laggy on mobile
        let particleRatio = (window.innerWidth < 768) ? 8000 : 12000;
        let numberOfParticles = (width * height) / particleRatio; 
        
        // Premium tech color palette (Adapted for dark mode)
        const colors = [
            'rgba(14, 165, 233, 0.8)', // Cyan
            'rgba(139, 92, 246, 0.8)', // Violet
            'rgba(236, 72, 153, 0.8)'  // Pink
        ];
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.5;
            let x = (Math.random() * ((width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((height - size * 2) - (size * 2)) + size * 2);
            let dx = (Math.random() - 0.5) * 0.5; // slow drift
            let dy = (Math.random() - 0.5) * 0.5;
            let color = colors[Math.floor(Math.random() * colors.length)];
            
            particles.push(new Particle(x, y, dx, dy, size, color));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        // Add subtle trail effect
        ctx.fillStyle = 'rgba(3, 7, 18, 0.2)'; // Match new bg-color (dark)
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connectParticles();
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + 
                               ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                
                if (distance < (width / 12) * (height / 12)) {
                    opacityValue = 1 - (distance / 10000);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacityValue * 0.3})`; // Violet for lines
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', () => {
        initCanvas();
        createParticles();
    });

    // Initialize Canvas
    initCanvas();
    createParticles();
    animate();

    /* ===== GLITCH TEXT EFFECT ===== */
    // Add dynamic glitching to hero title
    const glitchTitle = document.querySelector('.glitch');
    if(glitchTitle) {
        setInterval(() => {
            glitchTitle.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            setTimeout(() => {
                glitchTitle.style.transform = 'translate(0, 0)';
            }, 50);
        }, 3000);
    }

});
