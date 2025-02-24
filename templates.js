const templates = {
    navigation: `
    <nav class="nav">
        <div class="nav-container">
            <div class="nav-logo">
                <img src="images/eggs_ham.png" alt="xnham logo">
            </div>
            <ul class="nav-links">
                <li><a href="index.html">Weekend Projects</a></li>
                <li><a href="vote.html">Vote</a></li>
                <li><a href="about.html">About Me</a></li>
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