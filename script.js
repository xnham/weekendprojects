class ProjectsDashboard {
    constructor() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        this.projects = [
            {
                title: "#5 miss penny: get daily 8 AM texts to stay on budget",
                image: "miss-penny.gif",
                date: new Date(2025, 0), // January 2025
                why: '<p>Month after month, I decimated our family\'s budget by spending too much on restaurants and silly Amazon purchases.</p></br><p>"I\'ll spend more mindfully next month," I\'d declare. Well... that rarely worked.</p></br><p>A big reason why was that I had no real-time insight into where I stood against our budget. What I needed was a simple daily expense report. Yet, I couldn\'t find a personal finance app that would send alerts about just a few custom, discretionary categories.</p></br><p>So I built a simple solution called Miss Penny: It sends a text daily at 8 AM showing how I\'m tracking against our eating and shopping budgets.</p></br><p>Improvement plans:</p><ul><li>I noticed that if I had already gone over budget for the month, I tended to just give up and overspend even more. So, Miss Penny v2 will track expenses on a rolling 30-day basis rather than by calendar month.</li><li>The current version only tracks expenses that have posted to our bank accounts, so there\'s a 2-3 day lag in the updates. I\'d like to explore ways to include pending transactions as well.</li></ul>',
                tools: ["GitHub Actions", "Google Apps Script", "Google Sheets", "OpenAI", "Python", "Sheet SMS", "Tiller Money"],
                calcMethod: "cumulative reduction in expenses\n~$500/month",
                savings: {
                    current: 0,
                    startDate: new Date(2025, 0, 1, 12, 0, 0),  // January 1, 2025
                    savingsPerSecond: 0.0001897389192,
                    formula: function() {
                        const secondsElapsed = (Date.now() - this.startDate) / 1000;
                        return secondsElapsed > 0 ? secondsElapsed * this.savingsPerSecond : 0;
                    }
                }
            },
            {
                title: "#4 expeditr: turn recipe URLs into consolidated ingredient list",
                image: "expeditr.gif",
                date: new Date(2024, 9), // October 2024
                why: '<p>Our family plans meals by lining up recipes for the week and then ordering the ingredients from FreshDirect.</p></br><p>I used to have such a painful time doing this. I\'d open five or six tabs on my browser, one for each recipe. I\'d then look for each ingredient on FreshDirect, juggling yet another tab. I\'d often have to add common ingredients (like garlic or lemon) multiple times.</p></br><p>This tedious process equaled an hour of torture per week. At some point, I couldn\'t take it anymore.</p></br><p>I built a tool called <a href="https://www.expeditrturbo.com" target="_blank">Expeditr</a>: It automatically converts up to 10 recipe URLs into a consolidated list of ingredients, organized by category (produce, meat, seafood, etc.).</p></br><p>My weekly grocery shopping went from a wheeze to a breeze.</p></br><p>Next up: add a bot next to do the actual shopping based on our family\'s past product choices.',
                tools: ["Anthropic", "Heroku", "Node.js", "Perplexity", "Python + Quart", "React + Vite", "REST API"],
                calcMethod: "cumulative time saved × $30/hr\n\nI did an experiment to compare how long it took to plan meals with and without Expeditr. I found that Expeditr saved ~20 minutes per week.\n\nThe time saving is modest, but the happiness boost is profound.",
                savings: {
                    current: 0,
                    startDate: new Date(2024, 9, 15, 12, 0, 0),  // October 15, 2024
                    savingsPerSecond: 0.00001653439153,
                    formula: function() {
                        const secondsElapsed = (Date.now() - this.startDate) / 1000;
                        return secondsElapsed > 0 ? secondsElapsed * this.savingsPerSecond : 0;
                    }
                }
            },
            {
                title: "#3 turn emails into a spreadsheet",
                image: "jdp.gif",
                date: new Date(2024, 7), // August 2024           
                why: '<p>The tennis club <a href="#project-2">I previously mentioned</a> runs a sizeable after-school program. Their application process involved a web form that converted submissions into emails, which were then printed and stored in a filing cabinet.</p></br><p>The program director had two options:</p><ol><li>He could manage everything (scheduling, refunds, attendance, instructor assignments, transportation, and a dozen other things) using the hard copies, or</li><li>he could manually transfer information from hundreds of application forms to a spreadsheet and go from there.</li></ol><p>Neither option was exactly a winner.</p></br><p>To streamline the program director\'s workflow, I created a script to transfer application data from emails to Google Sheets automatically. The resulting spreadsheet:</p><ul><li>organizes students by program semester, type, and schedule,</li><li>creates clear audit trails with timestamps for all changes,</li><li>tracks each student\'s dismissal times and transportation needs,</li><li>handles staff assignments and automatically pulls in staff information,</li><li>maintains comprehensive family contact details in one place,</li><li>compiles and categorizes program revenues by source.</li></ul>',
                tools: ["Google Apps Script", "Google Sheets"],
                calcMethod: "cumulative time saved × $30 hourly rate\n\nDigital record-keeping saves the club ~60 minutes/week on average, accounting for seasonal variations.",
                savings: {
                    current: 0,
                    startDate: new Date(2024, 7, 15, 12, 0, 0),  // August 15, 2024
                    savingsPerSecond: 0.0000496031746,
                    formula: function() {
                        const secondsElapsed = (Date.now() - this.startDate) / 1000;
                        return secondsElapsed > 0 ? secondsElapsed * this.savingsPerSecond : 0;
                    }
                }
            },
            {
                title: "#2 custom google calendar auto-updates",
                image: "joe-calendar.gif",
                date: new Date(2024, 7), // August 2024           
                why: '<p>The tennis instructors at a club near me call the club\'s receptionists several times a day to check their lesson schedules. (In theory, they can check their schedules online, but the website isn\'t mobile-friendly.)</p></br><p>I modified the <a href="#project-1">court schedule monitor</a> to automatically post each instructor\'s lesson schedule to their Google Calendar. As a bonus, they can also instantly see which court they\'re assigned to.',
                tools: ["Google Calendar", "Node.js"],
                calcMethod: "cumulative time saved × $30 hourly rate\n\nAutomatically updated Google Calendar saves an instructor ~10 minutes/day.",
                savings: {
                    current: 0,
                    startDate: new Date(2024, 7, 1, 12, 0, 0),  // August 1, 2024
                    savingsPerSecond: 0.00005787037037,
                    formula: function() {
                        const secondsElapsed = (Date.now() - this.startDate) / 1000;
                        return secondsElapsed > 0 ? secondsElapsed * this.savingsPerSecond : 0;
                    }
                }
            },
            {
                title: "#1 tennis club court schedule monitor",
                image: "scraper.gif",
                date: new Date(2024, 4), // May 2024           
                why: '<p><a href="https://www.ocamsclub.com" target="_blank">My company</a> records and sends videos to tennis players automatically every time they play. Our workflow requires monitoring each tennis club\'s court schedule to determine when to send videos, which courts they\'re from, and who should receive them.</p></br><p>We used to have to check the court schedules manually several times a day, which was definitely not ideal.</p></br><p>I wrote a web scraper to automate this process. The script sends updates to Google Sheets and sends email notifications.</p></br><p>PS: This was my first weekend (coding) project! 🥳',
                tools: ["Google Sheets","Node.js"],
                calcMethod: "cumulative time saved × $30 hourly rate\n\nAutomated schedule monitoring saves us ~10 minutes/day.",
                savings: {
                    current: 0,
                    startDate: new Date(2024, 4, 15, 12, 0, 0),  // May 15, 2024
                    savingsPerSecond: 0.00005787037037,
                    formula: function() {
                        const secondsElapsed = (Date.now() - this.startDate) / 1000;
                        return secondsElapsed > 0 ? secondsElapsed * this.savingsPerSecond : 0;
                    }
                }
            }
        ];

        this.initializeProjects();
        this.startSavingsUpdates();
        this.initializeFloatingActions();
    }

    initializeProjects() {
        const projectsContainer = document.querySelector('.projects');
        
        const projectsHTML = this.projects.map(project => {
            const projectId = project.title.split(' ')[0].replace('#', '');
            
            const toolsHTML = project.tools.map((tool, index) => `
                <div class="tool-group">
                    <span class="tool">${tool}</span>
                    ${index < project.tools.length - 1 ? '<span class="tool-separator">|</span>' : ''}
                </div>
            `).join('');

            return `
                <div class="project" data-project="${project.title}">
                    <div class="project-card">
                        <div class="project-header">
                            <h2>${project.title}</h2>
                            <div class="project-date">${project.date.toLocaleDateString('en-US', { 
                                month: 'long',
                                year: 'numeric'
                            }).toLowerCase()}</div>
                        </div>
                        <div class="project-content">
                            <div class="project-image">
                                <img src="images/${project.image}" alt="${project.title}">
                            </div>
                            <div class="project-info">
                                <div class="project-why">${project.why}</div>
                                <div class="project-tools">
                                    ${toolsHTML}
                                </div>
                            </div>
                            <div class="project-savings">
                                <div class="savings-header">
                                    <div class="savings-amount ${project.savings === 0 ? 'zero-amount' : ''}">
                                        $<span>${Math.floor(project.savings.formula()).toLocaleString()}</span><sup>.${project.savings.formula().toFixed(5).split('.')[1]}</sup>
                                    </div>
                                </div>
                                <div class="savings-explanation">${project.calcMethod.replace(/\n/g, '<br>')}</div>
                            </div>
                        </div>
                    </div>
                    <div class="floating-actions">
                        <button class="action-button like-button" data-project-id="${projectId}">
                            <span class="action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </span>
                            <span class="action-label">i want this</span>
                        </button>
                        <button class="action-button share-button" data-project-id="${projectId}">
                            <span class="action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"></path>
                                </svg>
                            </span>
                            <span class="action-label">share</span>
                        </button>
                        <button class="action-button message-button" data-project-id="${projectId}">
                            <span class="action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z"></path>
                                </svg>
                            </span>
                            <span class="action-label">message</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        projectsContainer.innerHTML = projectsHTML;

        // Add click handler for like buttons
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const button = e.currentTarget;
                button.classList.add('liked');
                
                // Create and show feedback message
                const feedback = document.createElement('div');
                feedback.className = 'feedback-message';
                feedback.innerHTML = `
                    <div class="feedback-text">
                        Nice!<br>
                        Say more?
                    </div>
                    <img src="images/arrow.png" class="feedback-arrow" alt="arrow">
                `;
                
                // Remove any existing feedback
                const existingFeedback = document.querySelector('.feedback-message');
                if (existingFeedback) {
                    existingFeedback.remove();
                }
                
                // Add new feedback to floating-actions instead of button
                const floatingActions = button.parentElement;
                floatingActions.appendChild(feedback);
                
                // Position feedback relative to like button
                const buttonRect = button.getBoundingClientRect();
                feedback.style.left = `${buttonRect.width + 16}px`; // 16px = 1rem
                feedback.style.top = `${buttonRect.top - floatingActions.getBoundingClientRect().top}px`;
                
                // Find and highlight/dim buttons
                const messageButton = floatingActions.querySelector('.message-button');
                const shareButton = floatingActions.querySelector('.share-button');
                messageButton.classList.add('highlight');
                button.classList.add('highlight');
                shareButton.classList.add('highlight');
                
                // Make visible after a brief delay (for animation)
                setTimeout(() => {
                    feedback.classList.add('visible');
                }, 10);
                
                // Remove after 4 seconds
                setTimeout(() => {
                    feedback.classList.remove('visible');
                    messageButton.classList.remove('highlight');
                    button.classList.remove('highlight');
                    shareButton.classList.remove('highlight');
                    setTimeout(() => {
                        feedback.remove();
                    }, 800);
                }, 4000);
            });
        });

        // Add click handler for share buttons
        document.querySelectorAll('.share-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const button = e.currentTarget;
                const projectId = button.getAttribute('data-project-id');
                
                // Copy the URL with project ID to clipboard
                const url = `${window.location.href}#project-${projectId}`;
                await navigator.clipboard.writeText(url);
                
                // Add shared state and update label
                button.classList.add('shared');
                button.querySelector('.action-label').textContent = 'shared';
                
                // Create and show feedback message
                const feedback = document.createElement('div');
                feedback.className = 'feedback-message';
                feedback.innerHTML = `
                    <div class="feedback-text">
                        Link copied!
                    </div>
                `;
                
                // Remove any existing feedback
                const existingFeedback = document.querySelector('.feedback-message');
                if (existingFeedback) {
                    existingFeedback.remove();
                }
                
                // Add new feedback to floating-actions
                const floatingActions = button.parentElement;
                floatingActions.appendChild(feedback);
                
                // Position feedback relative to share button
                const buttonRect = button.getBoundingClientRect();
                feedback.style.left = `${buttonRect.width + 16}px`; // 16px = 1rem
                feedback.style.top = `${buttonRect.top - floatingActions.getBoundingClientRect().top}px`;
                
                // Make visible after a brief delay (for animation)
                setTimeout(() => {
                    feedback.classList.add('visible');
                }, 10);
                
                // Remove after 4 seconds
                setTimeout(() => {
                    feedback.classList.remove('visible');
                    setTimeout(() => {
                        feedback.remove();
                    }, 800);
                }, 4000);
            });
        });
    }

    initializeLikeButtons() {
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const button = e.currentTarget;
                
                // Toggle liked state
                button.classList.add('liked');
                
                // Create and show feedback message
                const feedback = document.createElement('div');
                feedback.className = 'feedback-message';
                feedback.innerHTML = `
                    <div class="feedback-text">
                        Thanks!<br>
                        Tell me more?
                    </div>
                    <img src="images/arrow.png" class="feedback-arrow" alt="arrow">
                `;
                
                // Remove any existing feedback
                const existingFeedback = button.querySelector('.feedback-message');
                if (existingFeedback) {
                    existingFeedback.remove();
                }
                
                // Add new feedback
                button.appendChild(feedback);
                
                // Find and highlight message button
                const messageButton = button.parentElement.querySelector('.message-button');
                messageButton.classList.add('highlight');
                
                // Make visible after a brief delay (for animation)
                setTimeout(() => {
                    feedback.classList.add('visible');
                }, 10);
                
                // Remove after 1 minute
                setTimeout(() => {
                    feedback.classList.remove('visible');
                    messageButton.classList.remove('highlight');  // Remove highlight
                    setTimeout(() => {
                        feedback.remove();
                    }, 300); // Wait for fade out animation
                }, 60000);
            });
        });
    }

    startSavingsUpdates() {
        this.projects.forEach(project => {
            const updateAmount = () => {
                const newAmount = project.savings.formula();
                const element = document.querySelector(`[data-project="${project.title}"]`);
                if (element) {
                    element.querySelector('.savings-amount').innerHTML = 
                        `$<span>${Math.floor(newAmount).toLocaleString()}</span><sup>.${newAmount.toFixed(5).split('.')[1]}</sup>`;
                }
                requestAnimationFrame(updateAmount);
            };
            requestAnimationFrame(updateAmount);
        });
    }

    renderTools(tools) {
        return tools.map(tool => {
            return `<span class="tool">${tool}</span>`;
        }).join('');
    }
}

// At the end of script.js
document.addEventListener('DOMContentLoaded', () => {
    new ProjectsDashboard();
});