const projects = [
    {
        id: 1,
        title: "Apple Watch Timestamp App",
        details: "An Apple Watch app that lets tennis players record timestamps with one tap. The timestamps are then used to automatically annotate corresponding video recording, making it easy to review notable moments from a tennis session.",
        value: "fun",
        dummyVotes: 0,
        dummyFollows: 8,
        show: true
    },
    {
        id: 2,
        title: "AI Grocery Shopping Assistant",
        details: "An AI agent that turns recipe URLs into a loaded shopping cart and understands your preferences based on past orders. Save 60 minutes a week.",
        value: "time",
        dummyVotes: 24,
        dummyFollows: 13,
        show: false
    },
    {
        id: 3,
        title: "Miss Penny 2.0",
        details: "Like Miss Penny 1.0, but instantly updated with every transaction, including pending ones, and with enhanced transaction categorization.",
        value: "money",
        dummyVotes: 31,
        dummyFollows: 0,
        show: false
    },
    {
        id: 4,
        title: "Cardboard Costume Creator",
        details: "A collection of patterns and step-by-step guides for creating amazing costumes from cardboard. Win Halloween with a resourceful and creative spirit.",
        value: "fun",
        dummyVotes: 12,
        dummyFollows: 0,
        show: true
    },
    {
        id: 5,
        title: "Practice Small Talk",
        details: "An AI Agent that helps you practice small talk in a safe, judgment-free environment. Try different scenarios, personality types, and difficulty levels. Get real-time feedback on engagement and natural flow.",
        value: "fun",
        dummyVotes: 1,
        dummyFollows: 1,
        show: true
    },
    {
        id: 6,
        title: "Take the Bias out of News",
        details: "A browser extension that rewrites news articles from your favorite publication in a neutral tone. Avoid getting baited into fear or anger.",
        value: "sanity",
        dummyVotes: 43,
        dummyFollows: 27,
        show: true
    },
    {
        id: 7,
        title: "Browse Fashion from Indie Boutiques Near You, Tinder-Style",
        details: "A mobile app that lets you swipe fashion items from local indie boutiques. Stay hip while supporting the community.",
        value: "fun",
        dummyVotes: 21,
        dummyFollows: 9,
        show: true
    },
    {
        id: 8,
        title: "Personalized Curation of Weekend Activities",
        details: "An AI Agent that diligently scours all the event listings to find the top five perfect activities just for you.",
        value: "fun",
        dummyVotes: 35,
        dummyFollows: 22,
        show: true
    },
    {
        id: 9,
        title: "Know Exactly How to Negotiate a Car Lease",
        details: "A dynamic coaching system that helps you decipher the complexity of car lease structures. Negotiate with self-assuredness and save thousands.",
        value: "money",
        dummyVotes: 19,
        dummyFollows: 11,
        show: true
    },
    {
        id: 10,
        title: "Second Brain",
        details: "TBD.",
        value: "time",
        dummyVotes: 26,
        dummyFollows: 15,
        show: true
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const projectList = document.getElementById('projectList');
    const emailModal = document.getElementById('emailModal');
    const confirmModal = document.getElementById('confirmModal');
    const followForm = document.getElementById('followForm');
    const closeModalBtn = document.querySelector('.future-project-close-modal');
    const emailInput = document.getElementById('email');
    const submitButton = document.querySelector('.future-project-submit-button');
    
    // Disable submit button initially
    submitButton.disabled = true;
    submitButton.classList.add('disabled');
    
    // Email validation function
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Email input validation
    emailInput.addEventListener('input', function() {
        const isValid = validateEmail(this.value.trim());
        submitButton.disabled = !isValid;
        
        if (isValid) {
            submitButton.classList.remove('disabled');
        } else {
            submitButton.classList.add('disabled');
        }
    });
    
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
    
    // Render projects in 2-column layout without shuffling
    const renderProjects = () => {
        // Clear existing projects
        projectList.innerHTML = '';
        
        // Get user data
        const userData = getUserData();
        
        // Use original order of projects (no shuffling) but filter by show attribute
        projects.filter(project => project.show).forEach(project => {
            // Check if user has liked this project
            const isLiked = userData.likes[project.id] || false;
            
            // Check if user is following this project
            const isFollowing = userData.follows.includes(project.id);
            
            // Create post-it note
            const postIt = document.createElement('div');
            postIt.className = 'future-project-post-it';
            
            postIt.innerHTML = `
            <div class="future-project-post-it-header">
                <span class="completed-project-value ${project.value}">↑ ${project.value}</span>
            </div>
            <h3 class="future-project-post-it-title">${project.title}</h3>
            <div class="future-project-post-it-details">${project.details}</div>
            <div class="future-project-post-it-actions">
                <div class="future-project-buttons">
                    <button class="future-project-like-button ${isLiked ? 'future-project-liked' : ''}" data-id="${project.id}">
                        <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                        <span>${isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button class="future-project-follow-button ${isFollowing ? 'future-project-following' : ''}" data-id="${project.id}">
                        <i class="${isFollowing ? 'fas' : 'far'} fa-bell"></i>
                        <span>${isFollowing ? 'Following' : 'Follow'}</span>
                    </button>
                </div>
                <div class="future-project-counters"> 
                    ${formatCounters(project.dummyVotes, project.dummyFollows)}
                </div>
            </div>
            `;
            
            // Add post-it to the list
            projectList.appendChild(postIt);
        });
    };
    
    // Handle like button clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.future-project-like-button')) {
            const likeBtn = e.target.closest('.future-project-like-button');
            const projectId = parseInt(likeBtn.dataset.id);
            const textSpan = likeBtn.querySelector('span');
            const iconElement = likeBtn.querySelector('i');
            
            // Get user data
            let userData = getUserData();
            
            // Find the project
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                // Toggle like status - only change the visual state
                if (userData.likes[projectId]) {
                    // Unlike
                    delete userData.likes[projectId];
                    likeBtn.classList.remove('future-project-liked');
                    textSpan.textContent = 'Like';
                    iconElement.className = 'far fa-heart';
                } else {
                    // Like
                    userData.likes[projectId] = true;
                    likeBtn.classList.add('future-project-liked');
                    textSpan.textContent = 'Liked';
                    iconElement.className = 'fas fa-heart';
                    
                    // Track event in GA
                    if (typeof gtag === 'function') {
                        gtag('event', 'like_project', {
                            'event_category': 'engagement',
                            'event_label': project.title,
                            'project_id': projectId
                        });
                    }
                }
                
                // Save user data
                saveUserData(userData);
            }
        }
    });
    
    // Handle follow button clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.future-project-follow-button')) {
            const followBtn = e.target.closest('.future-project-follow-button');
            const projectId = parseInt(followBtn.dataset.id);
            const iconElement = followBtn.querySelector('i');
            
            // Get user data
            let userData = getUserData();
            
            // Find the project
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                const isFollowing = userData.follows.includes(projectId);
                
                // Toggle follow status - only change the visual state
                if (isFollowing) {
                    // Unfollow
                    userData.follows = userData.follows.filter(id => id !== projectId);
                    followBtn.classList.remove('future-project-following');
                    followBtn.querySelector('span').textContent = 'Follow';
                    iconElement.className = 'far fa-bell';
                    
                    // Remove confirmation popup
                    // showConfirmation(`No longer following "${project.title}"`);
                } else {
                    // Check if email exists
                    if (userData.email) {
                        // Already have email, just follow
                        userData.follows.push(projectId);
                        followBtn.classList.add('future-project-following');
                        followBtn.querySelector('span').textContent = 'Following';
                        iconElement.className = 'fas fa-bell';
                        
                        // Remove confirmation popup
                        // showConfirmation(`Now following "${project.title}"`);
                        
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
            
            // Save user data
            saveUserData(userData);
            
            // Close modal
            emailModal.style.display = 'none';
            
            // Update UI
            renderProjects();
            
            // Remove confirmation popup
            // showConfirmation(`Now following "${project.title}"`);
            
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
    
    // Add test button functionality
    const testBtn = document.getElementById('testEmailModal');
    if (testBtn) {
        testBtn.addEventListener('click', function() {
            // Set a dummy project ID
            document.getElementById('projectId').value = 1;
            // Show the modal
            emailModal.style.display = 'flex';
        });
    }
    
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