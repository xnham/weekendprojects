document.addEventListener('DOMContentLoaded', function() {
    const projectsContainer = document.getElementById('weekend-projects');
    
    // Generate HTML for each project
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'weekend-project-card';
        projectCard.setAttribute('data-project-id', project.id);
        
        // Determine number of slides
        const hasExtraContent = project.extraContent ? true : false;
        const numSlides = hasExtraContent ? 3 : 2;
        const slideWidth = hasExtraContent ? 33.333 : 50;
        
        let slidesHTML = `
            <!-- Slide 1: Long Description -->
            <div class="slider-slide">
                <div class="weekend-project-description">
                    ${formatDescription(project.longDescription)}
                </div>
            </div>
            <!-- Slide 2: Impact -->
            <div class="slider-slide">
                <div class="weekend-project-impact">
                    ${formatImpact(project.impact)}
                </div>
            </div>
        `;
        
        // Add third slide if extraContent exists
        if (hasExtraContent) {
            slidesHTML += `
                <!-- Slide 3: Extra Content -->
                <div class="slider-slide">
                    <div class="weekend-project-extra">
                        ${formatDescription(project.extraContent)}
                    </div>
                </div>
            `;
        }
        
        // Generate dots HTML
        let dotsHTML = `
            <button class="slider-dot active" data-slide="0"></button>
            <button class="slider-dot" data-slide="1"></button>
        `;
        
        if (hasExtraContent) {
            dotsHTML += `<button class="slider-dot" data-slide="2"></button>`;
        }
        
        // Custom link texts (with defaults if not provided)
        const firstLinkText = project.linkText || "See more >";
        const secondLinkText = project.extraContentLinkText || "Next >";
        
        projectCard.innerHTML = `
            <div class="weekend-project-content">
                <div class="weekend-project-left-column">
                    <div class="weekend-project-header">
                        <div class="weekend-project-header-left">
                            <div class="weekend-project-value ${project.value}">↑ ${project.value}</div>
                            <div class="weekend-project-title">${project.title}</div>
                        </div>
                        <div class="weekend-project-id">${String(project.id).padStart(2, '0')}</div>
                    </div>
                    <div class="weekend-project-slider">
                        <div class="slider-container">
                            <div class="slider-track" style="width: ${numSlides * 100}%;">
                                ${slidesHTML}
                            </div>
                            <!-- Slider Controls: Links + Navigation -->
                            <div class="slider-controls">
                                <div class="slider-links">
                                    <div class="slider-back" style="visibility: hidden;">
                                        <a href="#" class="slider-back-link" data-direction="back">&lt; Back</a>
                                    </div>
                                    <div class="slider-forward">
                                        <a href="#" class="slider-link" data-direction="forward">${firstLinkText}</a>
                                    </div>
                                </div>
                                <div class="slider-nav">
                                    ${dotsHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="weekend-project-image-column">
                    <img src="images/${project.image}" alt="${project.title}">
                </div>
            </div>
            <div class="weekend-project-tools">
                ${generateToolsHTML(project.tools)}
            </div>
        `;
        
        projectsContainer.appendChild(projectCard);
    });
    
    // Initialize sliders
    initializeSliders();
});

// Helper function to format description with paragraphs
function formatDescription(description) {
    return description.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('');
}

// Helper function to format impact with paragraphs
function formatImpact(impact) {
    return impact.split('\n').map(line => `<p>${line}</p>`).join('');
}

// Helper function to generate tools HTML
function generateToolsHTML(tools) {
    return tools.map(tool => `<span class="weekend-project-tool">${tool}</span>`).join('');
}

// Initialize slider functionality with variable number of slides and conditional links
function initializeSliders() {
    const projectCards = document.querySelectorAll('.weekend-project-card');
    
    projectCards.forEach(card => {
        const sliderTrack = card.querySelector('.slider-track');
        const sliderDots = card.querySelectorAll('.slider-dot');
        const forwardLink = card.querySelector('.slider-link');
        const backLink = card.querySelector('.slider-back-link');
        const backContainer = card.querySelector('.slider-back');
        const forwardContainer = card.querySelector('.slider-forward');
        
        // Get the project ID to find the corresponding project data
        const projectId = parseInt(card.getAttribute('data-project-id'));
        const project = projects.find(p => p.id === projectId);
        
        // Get link texts from project data
        const firstLinkText = project.linkText || "See more >";
        const secondLinkText = project.extraContentLinkText || "Next >";
        
        if (!sliderTrack) {
            console.error('Slider elements not found');
            return;
        }
        
        // Calculate width per slide based on number of slides
        const numSlides = sliderDots.length;
        const slideWidth = 100 / numSlides;
        
        // Variable to track current slide
        let currentSlide = 0;
        
        // Function to update navigation based on current slide
        function updateNavigation() {
            // Update active dot
            sliderDots.forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
            });
            
            // Update visibility and text of back/forward links based on current slide
            if (currentSlide === 0) {
                // First slide: Hide back, show forward with first link text
                backContainer.style.visibility = 'hidden';
                forwardContainer.style.visibility = 'visible';
                forwardLink.textContent = firstLinkText;
            } else if (currentSlide === 1 && numSlides > 2) {
                // Second slide with a third slide available: Show both links
                backContainer.style.visibility = 'visible';
                forwardContainer.style.visibility = 'visible';
                forwardLink.textContent = secondLinkText;
            } else if (currentSlide === numSlides - 1) {
                // Last slide: Show back, hide forward
                backContainer.style.visibility = 'visible';
                forwardContainer.style.visibility = 'hidden';
            } else {
                // Middle slide with no third slide: Show back, hide forward
                backContainer.style.visibility = 'visible';
                forwardContainer.style.visibility = 'visible';
                forwardLink.textContent = firstLinkText;
            }
        }
        
        // Function to navigate to a specific slide
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            sliderTrack.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
            updateNavigation();
        }
        
        // Set up click handlers for dots
        sliderDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                goToSlide(slideIndex);
            });
        });
        
        // Set up click handler for the forward link
        if (forwardLink) {
            forwardLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Go to next slide if not on the last slide
                if (currentSlide < numSlides - 1) {
                    goToSlide(currentSlide + 1);
                }
            });
        }
        
        // Set up click handler for the back link
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Go to previous slide if not on the first slide
                if (currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                }
            });
        }
        
        // Initialize navigation state
        updateNavigation();
    });
}