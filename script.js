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

    /* ===== THEME TOGGLE (DARK/LIGHT MODE) ===== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.querySelector('.dark-icon');
    const lightIcon = document.querySelector('.light-icon');
    
    // Check local storage or system preference
    const currentTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
    }

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            darkIcon.style.display = 'block';
            lightIcon.style.display = 'none';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            darkIcon.style.display = 'none';
            lightIcon.style.display = 'block';
        }
        // Re-init particles with new theme colors
        if(typeof createParticles === 'function') {
            createParticles();
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
        
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const colors = isLight ? [
            'rgba(2, 132, 199, 0.6)',  // Darker Cyan
            'rgba(124, 58, 237, 0.6)', // Darker Violet
            'rgba(219, 39, 119, 0.6)'  // Darker Pink
        ] : [
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
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        ctx.fillStyle = isLight ? 'rgba(248, 250, 252, 0.2)' : 'rgba(3, 7, 18, 0.2)'; 
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connectParticles();
    }

    function connectParticles() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const lineBaseColor = isLight ? '124, 58, 237' : '139, 92, 246'; // Violet RGB

        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + 
                               ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                
                if (distance < (width / 12) * (height / 12)) {
                    opacityValue = 1 - (distance / 10000);
                    ctx.strokeStyle = `rgba(${lineBaseColor}, ${opacityValue * 0.3})`;
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

    /* ===== EMAILJS CONTACT FORM INTEGRATION ===== */
    const contactForm = document.getElementById('contact-form');
    // Ensure emailjs is loaded
    if (contactForm && typeof emailjs !== 'undefined') {
        // We use dummy initialize because user will replace with their own.
        emailjs.init('YOUR_PUBLIC_KEY');

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('send-btn');
            const btnText = btn.querySelector('.btn-text');
            const btnLoader = btn.querySelector('.btn-loader');
            const toast = document.getElementById('form-toast');
            
            // Basic validation
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            if (!name || !email || !message) {
                showToast(toast, 'error', 'Please fill in all required fields.');
                return;
            }

            // Show loading state
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            btn.disabled = true;

            // Send Email Template variables to EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                subject: document.getElementById('contact-subject').value || 'New connection from Portfolio',
                message: message
            };

            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
                .then(function() {
                    showToast(toast, 'success', 'Message sent successfully! I will get back to you soon.');
                    contactForm.reset();
                    resetBtn(btn, btnText, btnLoader);
                }, function(error) {
                    console.error('EmailJS Error:', error);
                    showToast(toast, 'error', 'Failed to send message. Please replace YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, and YOUR_PUBLIC_KEY with actual EmailJS keys.');
                    resetBtn(btn, btnText, btnLoader);
                });
        });

        function showToast(toastEl, type, message) {
            toastEl.className = 'form-toast ' + type;
            toastEl.innerHTML = type === 'success' ? `<i class="fas fa-check-circle"></i> <span>${message}</span>` : `<i class="fas fa-exclamation-circle"></i> <span>${message}</span>`;
            
            // Auto hide toast
            setTimeout(() => {
                toastEl.style.opacity = '0';
                setTimeout(() => {
                    toastEl.classList.remove('success', 'error');
                    toastEl.style.display = 'none';
                    toastEl.style.opacity = '1';
                }, 300);
            }, 6000);
        }

        function resetBtn(btn, btnText, btnLoader) {
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            btn.disabled = false;
        }
    }

});
