// Rotating text effect
const rotatingTexts = ['^Claude', '^Cursor', '^Replit', '^n8n', '^AutoGPT', '^Gumloop', '^VAPI'];
let currentIndex = 0;
const rotatingElement = document.getElementById('rotating-text');

function getRandomIndex(currentIndex, arrayLength) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * arrayLength);
    } while (newIndex === currentIndex);
    return newIndex;
}

function updateRotatingText() {
    rotatingElement.style.opacity = '0';
    
    setTimeout(() => {
        currentIndex = getRandomIndex(currentIndex, rotatingTexts.length);
        rotatingElement.textContent = rotatingTexts[currentIndex];
        rotatingElement.style.opacity = '1';
    }, 500);
}

// Initial text update
updateRotatingText();

// Update text every 3 seconds
setInterval(updateRotatingText, 3000);

// Slider functionality
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.weekend-project-card');
    
    projectCards.forEach(card => {
        const sliderTrack = card.querySelector('.slider-track');
        const sliderDots = card.querySelectorAll('.slider-dot');
        
        // Set up click handlers for dots
        sliderDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                const numSlides = sliderDots.length;
                const slideWidth = 100 / numSlides;
                
                // Update slider position with dynamic width calculation
                sliderTrack.style.transform = `translateX(-${slideIndex * slideWidth}%)`;
                
                // Update active dot
                sliderDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    });
}); 