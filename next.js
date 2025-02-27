const projects = [
    {
        id: 1,
        title: "Apple Watch Timestamp App",
        details: "An Apple Watch app that lets tennis players record timestamps with one tap. The timestamps are then used to automatically annotate corresponding video recording, making it easy to review notable moments from a tennis session.",
        value: "fun",
        votes: 0,
        follows: 0
    },
    {
        id: 2,
        title: "AI Grocery Shopping Assistant",
        details: "An AI agent that turns recipe URLs into a loaded shopping cart and understands your preferences based on past orders. Save 60 minutes a week.",
        value: "time",
        votes: 0,
        follows: 0
    },
    {
        id: 3,
        title: "Miss Penny 2.0",
        details: "Like Miss Penny 1.0, but instantly updated with every transaction, including pending ones, and with enhanced transaction categorization.",
        value: "money",
        votes: 0,
        follows: 0
    },
    {
        id: 4,
        title: "Cardboard Costume Creator",
        details: "A collection of patterns and step-by-step guides for creating amazing costumes from cardboard. Win Halloween with a resourceful and creative spirit.",
        value: "fun",
        votes: 0,
        follows: 0
    },
    {
        id: 5,
        title: "Practice Small Talk",
        details: "An AI Agent that helps you practice small talk in a safe, judgment-free environment. Try different scenarios, personality types, and difficulty levels. Get real-time feedback on engagement and natural flow.",
        value: "fun",
        votes: 0,
        follows: 0
    },
    {
        id: 6,
        title: "Take the Bias out of News",
        details: "A browser extension that rewrites news articles from your favorite publication in a neutral tone. Avoid getting baited into fear or anger.",
        value: "sanity",
        votes: 0,
        follows: 0
    },
    {
        id: 7,
        title: "Browse Fashion from Indie Boutiques Near You, Tinder-Style",
        details: "A mobile app that lets you swipe fashion items from local indie boutiques. Stay hip while supporting the community.",
        value: "fun",
        votes: 0,
        follows: 0
    },
    {
        id: 8,
        title: "Personalized Curation of Weekend Activities",
        details: "An AI Agent that diligently scours all the event listings to find the top five perfect activities just for you.",
        value: "fun",
        votes: 0,
        follows: 0
    },
    {
        id: 9,
        title: "Know Exactly How to Negotiate a Car Lease",
        details: "A dynamic coaching system that helps you decipher the complexity of car lease structures. Negotiate with self-assuredness and save thousands.",
        value: "money",
        votes: 0,
        follows: 0
    },
    {
        id: 10,
        title: "Second Brain",
        details: "TBD.",
        value: "time",
        votes: 0,
        follows: 0
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const projectList = document.getElementById('projectList');
    const emailModal = document.getElementById('emailModal');
    const confirmModal = document.getElementById('confirmModal');
    const followForm = document.getElementById('followForm');
    const closeModalBtn = document.querySelector('.next-close-modal');
    
    // User data management
    const getUserData = () => {
        const data = localStorage.getItem('nextUserData');
        return data ? JSON.parse(data) : { 
            email: '', 
            follows: [], 
            likes: {} 
        };
    };
    
    const saveUserData = (data) => {
        localStorage.setItem('nextUserData', JSON.stringify(data));
    };
    
    // Shuffle array function (Fisher-Yates algorithm)
    const shuffleArray = (array) => {
        const shuffled = [...array]; // Create a copy to avoid modifying the original
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
        }
        return shuffled;
    };
    
    // Render projects in 2-column layout with randomized order
    const renderProjects = () => {
        // Clear existing projects
        projectList.innerHTML = '';
        
        // Get user data
        const userData = getUserData();
        
        // Shuffle the projects array for random order
        const shuffledProjects = shuffleArray(projects);
        
        // Create post-it notes for each project
        shuffledProjects.forEach(project => {
            // Check if user has liked this project
            const isLiked = userData.likes[project.id] || false;
            
            // Check if user is following this project
            const isFollowing = userData.follows.includes(project.id);
            
            // Create post-it note
            const postIt = document.createElement('div');
            postIt.className = 'next-post-it';
            
            postIt.innerHTML = `
            <div class="next-post-it-header">
                <span class="weekend-project-value ${project.value}">↑ ${project.value}</span>
            </div>
            <h3 class="next-post-it-title">${project.title}</h3>
            <div class="next-post-it-details">${project.details}</div>
            <div class="next-post-it-actions">
                <button class="next-like-button ${isLiked ? 'next-liked' : ''}" data-id="${project.id}">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                    <span>${isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button class="next-follow-button ${isFollowing ? 'next-following' : ''}" data-id="${project.id}">
                    <i class="${isFollowing ? 'fas' : 'far'} fa-bell"></i>
                    <span>${isFollowing ? 'Following' : 'Follow'}</span>
                </button>
                <div class="next-counters">
                    ${formatCounters(project.votes, project.follows)}
                </div>
            </div>
            `;
            
            // Add post-it to the list
            projectList.appendChild(postIt);
        });
    };
    
    // Handle like button clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.next-like-button')) {
            const likeBtn = e.target.closest('.next-like-button');
            const projectId = parseInt(likeBtn.dataset.id);
            const textSpan = likeBtn.querySelector('span');
            
            // Get user data
            let userData = getUserData();
            
            // Find the project
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                // Toggle like status
                if (userData.likes[projectId]) {
                    // Unlike
                    delete userData.likes[projectId];
                    likeBtn.classList.remove('next-liked');
                    project.votes--;
                    textSpan.textContent = 'Like';
                } else {
                    // Like
                    userData.likes[projectId] = true;
                    likeBtn.classList.add('next-liked');
                    project.votes++;
                    textSpan.textContent = 'Liked';
                    
                    // Track event in GA
                    if (typeof gtag === 'function') {
                        gtag('event', 'like_project', {
                            'event_category': 'engagement',
                            'event_label': project.title,
                            'project_id': projectId
                        });
                    }
                }
                
                // Update counters
                const countersEl = likeBtn.closest('.next-post-it-actions').querySelector('.next-counters');
                countersEl.textContent = formatCounters(project.votes, project.follows);
                
                // Save user data
                saveUserData(userData);
            }
        }
    });
    
    // Handle follow button clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.next-follow-button')) {
            const followBtn = e.target.closest('.next-follow-button');
            const projectId = parseInt(followBtn.dataset.id);
            
            // Get user data
            let userData = getUserData();
            
            // Find the project
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                const isFollowing = userData.follows.includes(projectId);
                
                // Toggle follow status
                if (isFollowing) {
                    // Unfollow
                    userData.follows = userData.follows.filter(id => id !== projectId);
                    followBtn.classList.remove('next-following');
                    followBtn.querySelector('span').textContent = 'Follow';
                    project.follows--;
                    
                    // Show brief confirmation
                    showConfirmation(`No longer following "${project.title}"`);
                } else {
                    // Check if email exists
                    if (userData.email) {
                        // Already have email, just follow
                        userData.follows.push(projectId);
                        followBtn.classList.add('next-following');
                        followBtn.querySelector('span').textContent = 'Following';
                        project.follows++;
                        
                        // Show brief confirmation
                        showConfirmation(`Now following "${project.title}"`);
                        
                        // Track event in GA
                        if (typeof gtag === 'function') {
                            gtag('event', 'follow_project', {
                                'event_category': 'engagement',
                                'event_label': project.title,
                                'project_id': projectId
                            });
                        }
                    } else {
                        // Need email, show modal
                        document.getElementById('projectId').value = projectId;
                        emailModal.style.display = 'flex';
                    }
                }
                
                // Save user data
                saveUserData(userData);
            }
        }
    });
    
    // Handle email form submission
    followForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectId = parseInt(document.getElementById('projectId').value);
        const email = document.getElementById('email').value.trim();
        
        if (email) {
            // Get user data
            let userData = getUserData();
            
            // Save email
            userData.email = email;
            
            // Add project to follows
            if (!userData.follows.includes(projectId)) {
                userData.follows.push(projectId);
            }
            
            // Find the project
            const project = projects.find(p => p.id === projectId);
            if (project) {
                project.follows++;
            }
            
            // Save user data
            saveUserData(userData);
            
            // Close modal
            emailModal.style.display = 'none';
            
            // Update UI
            renderProjects();
            
            // Show confirmation
            showConfirmation(`Now following "${project.title}"`);
            
            // Reset form
            followForm.reset();
            
            // Track event in GA
            if (typeof gtag === 'function') {
                gtag('event', 'email_provided', {
                    'event_category': 'engagement',
                    'event_label': project.title,
                    'project_id': projectId
                });
            }
        }
    });
    
    // Show brief confirmation message
    const showConfirmation = (message) => {
        document.getElementById('confirmMessage').textContent = message;
        confirmModal.style.display = 'flex';
        
        // Auto hide after 2 seconds
        setTimeout(() => {
            confirmModal.style.display = 'none';
        }, 2000);
    };
    
    // Close modal when clicking X
    closeModalBtn.addEventListener('click', function() {
        emailModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === emailModal) {
            emailModal.style.display = 'none';
        }
    });
    
    // Initialize by rendering projects
    renderProjects();
});

// Add this function to format the counters text
function formatCounters(likes, followers) {
    // No likes or followers
    if (likes === 0 && followers === 0) {
        return "";
    }
    
    // Only likes
    if (likes > 0 && followers === 0) {
        return `${likes} ${likes === 1 ? 'like' : 'likes'}`;
    }
    
    // Only followers
    if (likes === 0 && followers > 0) {
        return `${followers} ${followers === 1 ? 'follower' : 'followers'}`;
    }
    
    // Both likes and followers
    return `${likes} ${likes === 1 ? 'like' : 'likes'} & ${followers} ${followers === 1 ? 'follower' : 'followers'}`;
} 