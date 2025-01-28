class ProjectsDashboard {
    constructor() {
        this.projects = [
            {
                title: "#5 miss penny: get daily 8 AM texts to stay on budget",
                image: "miss-penny.gif",
                date: new Date(2025, 0), // January 2025
                why: '<p>Month after month, we decimated our budget by spending too much on restaurants and silly Amazon purchases.</p></br><p>"We\'ll spend more mindfully next month," we\'d declare. Well... that rarely worked.</p></br><p>A big reason why was that we had no real-time insight into where we stood against our budget. What we needed was a simple daily expense report. Yet, I couldn\'t find a personal finance app that would send alerts about just a few custom, discretionary categories.</p></br><p>So I built a simple solution called Miss Penny: It sends a text daily at 8 AM showing how we\'re tracking against our eating and shopping budgets.',
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
                why: "<p>Our family plans meals by lining up recipes for the week and then ordering the ingredients from FreshDirect.</p></br><p>I used to have such a painful time doing this. I'd open five or six tabs on my browser, one for each recipe. I'd then look for each ingredient on FreshDirect, juggling yet another tab. I'd often have to add common ingredients (like garlic or lemon) multiple times.</p></br><p>This tedious process equaled an hour of torture per week. At some point, I couldn't take it anymore.</p></br><p>I built a tool called Expeditr: It automatically converts up to 10 recipe URLs into a consolidated list of ingredients, organized by category (produce, meat, seafood, etc.).</p></br><p>My weekly grocery shopping went from a wheeze to a breeze.</p></br><p>Next up: add a bot next to do the actual shopping based on our family's past product choices.",
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
                title: "#3 turn emails into a google sheet",
                image: "jdp.gif",
                date: new Date(2024, 7), // August 2024           
                why: "<p>The tennis club I previously mentioned runs a sizeable after-school program. Their application process involved a web form that converted submissions into emails, which were then printed and stored in a filing cabinet.</p></br><p>The program director had two options:</p><ol><li>He could manage everything (scheduling, refunds, attendance, instructor assignments, transportation, and a dozen other things) using the hard copies, or</li><li>he could manually transfer information from hundreds of application forms to a spreadsheet and go from there.</li></ol><p>Neither option was exactly a winner.</p></br><p>To streamline the program director's workflow, I created a script to transfer application data from emails to Google Sheets automatically. The resulting spreadsheet:<ul><li>organizes students by program semester, type, and schedule,</li><li>creates clear audit trails with timestamps for all changes,</li><li>tracks each student's dismissal times and transportation needs,</li><li>handles staff assignments and automatically pulls in staff information,</li><li>maintains comprehensive family contact details in one place,</li><li>compiles and categorizes program revenues by source.</li></ul>",
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
                title: "#2 post tennis lessons on google calendar",
                image: "joe-calendar.gif",
                date: new Date(2024, 7), // August 2024           
                why: '<p>The tennis instructors at a club near me call the club\'s receptionists several times a day to check their lesson schedules. (While they can theoretically check their schedules online, the website isn\'t mobile-friendly.)</p></br><p>I modified the <a href="#project-1">court schedule monitor</a> to automatically post each instructor\'s lesson schedule to their Google Calendar. As a bonus, they can also instantly see which court they\'re assigned to.',
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
                title: "#1 monitor tennis club court schedules",
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
    }

    initializeProjects() {
        const projectsContainer = document.querySelector('.projects');
        
        const projectsHTML = this.projects.map(project => {
            // Extract project number from title (e.g., "#5" -> "5")
            const projectId = project.title.split(' ')[0].replace('#', '');
            
            return `
                <div id="project-${projectId}" class="project-card">
                    <div class="card-3d">
                        <div class="face front">
                            <div class="project-header">
                                <h2>${project.title}</h2>
                                <div class="project-date">
                                    ${project.date.toLocaleDateString('en-US', { 
                                        month: 'long',
                                        year: 'numeric'
                                    }).toLowerCase()}
                                </div>
                            </div>
                            <div class="project-content">
                                <div class="project-image">
                                    <img src="images/${project.image}" alt="${project.title}">
                                </div>
                                <div class="project-info">
                                    <div class="project-why">${project.why}</div>
                                    <div class="project-tools">
                                        ${project.tools.map((tool, index) => 
                                            index === project.tools.length - 1
                                                ? `<span class="tool">${tool}</span>`
                                                : `<span class="tool-group"><span class="tool">${tool}</span><span class="tool-separator">|</span></span>`
                                        ).join('')}
                                    </div>
                                </div>
                                <div class="project-savings">
                                    <div class="savings-header">
                                        <div class="savings-amount" data-project="${project.title}">
                                            ${this.formatMoney(project.savings.current)}
                                        </div>
                                    </div>
                                    <p class="savings-explanation">${project.calcMethod.replace(/\n/g, '<br>')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="face right"></div>
                        <div class="face bottom"></div>
                    </div>
                </div>
            `;
        }).join('');

        projectsContainer.innerHTML = projectsHTML;
    }

    startSavingsUpdates() {
        setInterval(() => {
            this.projects.forEach(project => {
                const newAmount = project.savings.formula();
                const element = document.querySelector(`[data-project="${project.title}"]`);
                if (element) {
                    element.innerHTML = this.formatMoney(newAmount);
                }
            });
        }, 100);  // Update every 100ms instead of 1000ms
    }

    formatMoney(amount) {
        const [dollars, cents] = amount.toFixed(5).split('.');
        const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const zeroClass = amount === 0 ? 'zero-amount' : '';
        return `<span class="${zeroClass} updating">$${formattedDollars}<sup>.${cents}</sup></span>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize projects
    new ProjectsDashboard();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});