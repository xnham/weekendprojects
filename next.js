const projects = [
    {
        id: 1,
        title: "Apple Watch Timestamp App",
        details: "An Apple Watch app that lets tennis players record timestamps with one tap. The timestamps are then used to automatically annotate corresponding video recording, making it easy to review notable moments from a tennis session.",
        votes: 0
    },
    {
        id: 2,
        title: "AI Grocery Shopping Assistant",
        details: "An AI agent that turns recipe URLs into a loaded shopping cart and understands your preferences based on past orders. Save 60 minutes a week.",
        votes: 0
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
    projectElement.className = 'next-project-item';
    projectElement.innerHTML = `
        <div class="next-project-content">
            <div class="next-project-title">
                <span>${project.title}</span>
            </div>
            <div class="next-project-details">
                ${project.details}
            </div>
        </div>
    `;
    projectList.appendChild(projectElement);
}); 