const templates = {
    navigation: `
    <nav class="nav">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="index.html">
                    <img src="images/eggs_ham.png" alt="xnham logo" title="xnham">
                </a>
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
}

document.addEventListener('DOMContentLoaded', loadTemplates); 