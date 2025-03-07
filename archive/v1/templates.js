const templates = {
    navigation: `
    <nav class="nav">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="index.html">
                    <img src="images/eggs_ham.png" alt="xnham logo" title="xnham">
                </a>
            </div>
            <div class="nav-hamburger">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </div>
            <ul class="nav-links">
                <li><a href="index.html">Portfolio</a></li>
                <li><a href="next.html">Next</a></li>
                <li><a href="about.html">About</a></li>
            </ul>
        </div>
    </nav>`,
    
    footer: `
    <footer>
        <p>© xnham <span id="current-year"></span> | New York, NY</p>
    </footer>`
};

function loadTemplates() {
    // Insert navigation
    document.body.insertAdjacentHTML('afterbegin', templates.navigation);
    
    // Insert footer
    document.body.insertAdjacentHTML('beforeend', templates.footer);
    
    // Update copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Setup logo hover animation
    setupLogoAnimation();
    
    // Setup mobile navigation
    setupMobileNav();
}

function setupLogoAnimation() {
    const logoImg = document.querySelector('.nav-logo img');
    if (!logoImg) return;
    
    const staticSrc = 'images/eggs_ham.png';
    const animatedSrc = 'images/eggs_ham_animated.gif';
    
    logoImg.addEventListener('mouseenter', () => {
        logoImg.src = animatedSrc;
    });
    
    logoImg.addEventListener('mouseleave', () => {
        logoImg.src = staticSrc;
    });
}

function setupMobileNav() {
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;
    
    // Toggle mobile menu when hamburger is clicked
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close mobile menu when clicking on a link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && 
            !e.target.closest('.nav-hamburger') && 
            navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

document.addEventListener('DOMContentLoaded', loadTemplates); 