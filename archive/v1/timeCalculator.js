// Time calculator for completed projects
document.addEventListener('DOMContentLoaded', function() {
    // Find all time calculator containers
    const calculatorContainers = document.querySelectorAll('.time-calculator-container');
    
    // Initialize each calculator
    calculatorContainers.forEach(container => {
        const projectId = parseInt(container.getAttribute('data-project-id'));
        const project = projects.find(p => p.id === projectId);
        
        if (!project || !project.timeSaved) return;
        
        // Create tab structure
        const tabsHTML = `
            <div class="time-calculator-tabs">
                <button class="time-tab active" data-tab="time-saved-per-year">Time saved per year</button>
                <button class="time-tab" data-tab="time-saved-so-far">Time saved so far</button>
            </div>
            <div class="time-calculator-content">
                <div class="time-calculator-slide active" id="time-saved-per-year">
                    <div class="time-calculator-slide-content">
                        <div class="time-annual-value">${calculateAnnualTimeSaved(project)}</div>
                        <div class="time-alternative-use">
                            One could use this time to
                            <div class="rotating-use-text-wrapper">
                                <span class="rotating-use-text">hike 220 miles</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="time-calculator-slide" id="time-saved-so-far">
                    <div class="time-calculator-slide-content">
                        <div class="time-counter">
                            <table class="time-counter-table">
                                <tr class="time-counter-values">
                                    <td><span class="hours">0</span></td>
                                    <td class="time-counter-separator">:</td>
                                    <td><span class="minutes">0</span></td>
                                    <td class="time-counter-separator">:</td>
                                    <td><span class="seconds">0</span></td>
                                </tr>
                                <tr class="time-counter-labels">
                                    <td>hrs</td>
                                    <td></td>
                                    <td>mins</td>
                                    <td></td>
                                    <td>secs</td>
                                </tr>
                            </table>
                        </div>
                        <div class="time-launch-date">since launch on ${formatDate(project.launchDate)}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert the HTML into the container
        container.innerHTML = tabsHTML;
        
        // Initialize tab switching
        initTabs(container);
        
        // Initialize time counter
        initTimeCounter(container, project);
        
        // Initialize rotating text for alternative uses
        if (project.alternativeUses) {
            initRotatingUseText(container, project.alternativeUses);
        } else {
            // Default alternatives if not specified in project
            initRotatingUseText(container, [
                "hike 220 miles",
                "watch 45 movies",
                "read 18 novels",
                "learn a new language",
                "complete 6 online courses"
            ]);
        }
    });
});

function initTabs(container) {
    const tabs = container.querySelectorAll('.time-tab');
    const slides = container.querySelectorAll('.time-calculator-slide');
    const tabsContainer = container.querySelector('.time-calculator-tabs');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and slides
            tabs.forEach(t => t.classList.remove('active'));
            slides.forEach(s => s.classList.remove('active'));
            
            // Activate clicked tab
            tab.classList.add('active');
            
            // Handle sliding indicator
            if (index === 0) {
                tabsContainer.classList.remove('second-tab-active');
            } else {
                tabsContainer.classList.add('second-tab-active');
            }
            
            // Activate corresponding slide
            const targetSlideId = tab.getAttribute('data-tab');
            container.querySelector(`#${targetSlideId}`).classList.add('active');
        });
    });
}

function initTimeCounter(container, project) {
    const hoursElement = container.querySelector('.hours');
    const minutesElement = container.querySelector('.minutes');
    const secondsElement = container.querySelector('.seconds');
    
    if (!hoursElement || !minutesElement || !secondsElement) return;
    
    // Calculate time saved (minutes per day or per week)
    const minutesPerDay = project.timeSaved.daily || 0;
    const minutesPerWeek = project.timeSaved.weekly || 0;
    
    // Convert to minutes per day
    const dailyMinutes = minutesPerDay + (minutesPerWeek / 7);
    
    // Calculate minutes saved since launch
    const now = new Date();
    const launchDate = new Date(project.launchDate);
    const daysSinceLaunch = (now - launchDate) / (1000 * 60 * 60 * 24);
    let minutesSaved = dailyMinutes * daysSinceLaunch;
    
    // Initialize counter
    updateCounter(hoursElement, minutesElement, secondsElement, minutesSaved);
    
    // Calculate increment per 10ms for smoother animation
    const incrementPer10ms = dailyMinutes / (24 * 60 * 60 * 100); // Daily minutes / (seconds in day * 100)
    
    // Update counter more frequently (every 10ms) for smoother animation
    setInterval(() => {
        minutesSaved += incrementPer10ms;
        updateCounter(hoursElement, minutesElement, secondsElement, minutesSaved);
    }, 10); // Update every 10ms instead of 1000ms
}

function updateCounter(hoursElement, minutesElement, secondsElement, totalMinutes) {
    // Calculate hours, minutes, seconds
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    // Calculate seconds with 3 decimal places for visible continuous updates
    const totalSeconds = (totalMinutes * 60) % 60;
    const secondsWithDecimals = totalSeconds.toFixed(3);
    
    // Update display
    hoursElement.textContent = hours;
    minutesElement.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsElement.textContent = secondsWithDecimals;
}

function initRotatingUseText(container, useTexts) {
    if (!useTexts || useTexts.length === 0) return;
    
    const rotatingWrapper = container.querySelector('.rotating-use-text-wrapper');
    if (!rotatingWrapper) return;
    
    let currentIndex = 0;
    let isAnimating = false;
    
    // Clear any existing text first to prevent overlapping
    rotatingWrapper.innerHTML = '';
    
    // Set initial text
    const initialText = document.createElement('span');
    initialText.className = 'rotating-use-text';
    initialText.textContent = useTexts[currentIndex];
    rotatingWrapper.appendChild(initialText);
    
    // Function to perform the text rotation
    function rotateText() {
        if (isAnimating) return;
        isAnimating = true;
        
        // Get current text element
        const currentText = rotatingWrapper.querySelector('.rotating-use-text');
        if (!currentText) {
            isAnimating = false;
            return;
        }
        
        // Animate current text out (moving DOWN)
        currentText.style.animation = 'slideOutDown 0.4s forwards';
        
        // After animation completes, remove it and add the new one
        setTimeout(() => {
            // Remove the old text
            rotatingWrapper.innerHTML = '';
            
            // Update text index
            currentIndex = (currentIndex + 1) % useTexts.length;
            
            // Create and add new text
            const newText = document.createElement('span');
            newText.className = 'rotating-use-text';
            newText.textContent = useTexts[currentIndex];
            rotatingWrapper.appendChild(newText);
            
            // Animate new text in (coming from ABOVE)
            newText.style.animation = 'slideInDown 0.4s forwards';
            
            // Reset animation flag after animation completes
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }, 500);
    }
    
    // Rotate text every 3 seconds
    setInterval(rotateText, 3000);
}

function calculateAnnualTimeSaved(project) {
    // Calculate annual time saved in hours
    const minutesPerDay = project.timeSaved.daily || 0;
    const minutesPerWeek = project.timeSaved.weekly || 0;
    
    const annualMinutes = (minutesPerDay * 365) + (minutesPerWeek * 52);
    const annualHours = annualMinutes / 60;
    
    // Format as "91 hours = 11 workdays"
    const workdays = Math.round(annualHours / 8);
    return `${Math.round(annualHours)} hours = ${workdays} workdays`;
}

function formatDate(date) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
} 