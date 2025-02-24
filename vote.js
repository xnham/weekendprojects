const projects = [
    {
        id: 1,
        title: "Apple Watch Timestamp App",
        details: "An Apple Watch app that lets tennis players record timestamps with one tap. The timestamps are then used to automatically annotate corresponding video recording, making it easy to review notable moments from a tennis session."
    },
    {
        id: 2,
        title: "AI Grocery Shopping Assistant",
        details: "An AI agent that turns recipe URLs into a loaded shopping cart and understands your preferences based on past orders. Save 60 minutes a week."
    },
    {
        id: 3,
        title: "Miss Penny 2.0",
        details: "Like Miss Penny 1.0, but instantly updated with every transaction, including pending ones, and with enhanced transaction categorization.",
        votes: 0
    },
    {
        id: 4,
        title: "Cardboard Costume Creator",
        details: "A collection of patterns and step-by-step guides for creating amazing costumes from cardboard. Win Halloween with a resourceful and creative spirit.",
        votes: 0
    },
    {
        id: 5,
        title: "Practice Small Talk",
        details: "An AI Agent that helps you practice small talk in a safe, judgment-free environment. Try different scenarios, personality types, and difficulty levels. Get real-time feedback on engagement and natural flow.",
        votes: 0
    },
    {
        id: 6,
        title: "Take the Bias out of News",
        details: "A browser extension that rewrites news articles from your favorite publication in a neutral tone. Avoid getting baited into fear or anger.",
        votes: 0
    },
    {
        id: 7,
        title: "Browse Fashion from Indie Boutiques Near You, Tinder-Style",
        details: "A mobile app that lets you swipe fashion items from local indie boutiques. Stay hip while supporting the community.",
        votes: 0
    },
    {
        id: 8,
        title: "Personalized Curation of Weekend Activities",
        details: "An AI Agent that diligently scours all the event listings to find the top five perfect activities just for you.",
        votes: 0
    },
    {
        id: 9,
        title: "Know Exactly How to Negotiate a Car Lease",
        details: "A dynamic coaching system that helps you decipher the complexity of car lease structures. Negotiate with self-assuredness and save thousands.",
        votes: 0
    },
    {
        id: 10,
        title: "Second Brain",
        details: "TBD.",
        votes: 0
    },
    {
        id: 11,
        title: "Live Streamer from IP Cameras",
        details: "TBD.",
        votes: 0
    }
];

const projectList = document.getElementById('projectList');

projects.forEach(project => {
    const projectElement = document.createElement('div');
    projectElement.className = 'project-item';
    projectElement.innerHTML = `
        <div class="project-content">
            <div class="project-title">
                <span>${project.title}</span>
            </div>
            <div class="project-details">
                ${project.details}
            </div>
        </div>
        <div class="vote-section">
            <button class="like-button" onclick="handleLike(${project.id}, '${project.title}')">
                <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </button>
        </div>
    `;
    projectList.appendChild(projectElement);
});

async function handleLike(projectId, projectTitle) {
    const button = event.target.closest('.like-button');
    
    // Disable button to prevent multiple clicks
    button.disabled = true;
    button.classList.add('active');

    // Track like with Google Analytics
    gtag('event', 'like', {
        'event_category': 'engagement',
        'event_label': projectTitle,
        'value': 1
    });

    // Send email notification (you'll need to set up an endpoint for this)
    try {
        await fetch('/api/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                projectId: projectId,
                projectTitle: projectTitle
            })
        });
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
} 