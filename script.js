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