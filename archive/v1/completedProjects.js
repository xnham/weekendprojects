const projects = [
    {
        id: 5,
        title: "Miss Penny | Daily 8 AM text to track expenses against budget",
        value: "money", // "money", "time", "sanity", "fun", or "insight"
        shortDescription: "Daily text to track expenses against budget",
        longDescription: "Despite monthly vows to spend more mindfully, I consistently blew our family budget on restaurants and impulse Amazon purchases, largely because I lacked real-time insight into my spending habits.\n\nMiss Penny fixes this by sending a daily 8 AM text showing exactly how I'm tracking against our dining out and shopping budgets.",
        impact: "Reduced monthly expenses by $680\nEliminated budget anxiety\nCreated sustainable spending habits",
        extraContent: "Role of AI",
        linkText: "See impact >",
        extraContentLinkText: "Role of AI >",
        launchDate: new Date(2025, 1, 1), // February 1, 2025
        image: "miss-penny.gif",
        tools: ["GitHub Actions", "Google Apps Script", "Google Sheets", "OpenAI", "Python", "Sheet SMS", "Tiller Money"],
        timeSaved: {
            daily: 0, // minutes saved per day
            hasCalculator: false
        }
    },
    {
        id: 4,
        title: "Expeditr | Automate grocery shopping",
        value: "sanity",
        shortDescription: "Automate grocery shopping",
        longDescription: "Meal planning used to mean an hour of weekly torture: juggling multiple browser tabs for recipes while searching for ingredients on FreshDirect, often adding common items like garlic multiple times.\n\nExpeditr solves this headache by automatically converting up to 10 recipe URLs into one consolidated ingredient list, organized by category.",
        impact: "Reduced monthly expenses by $500\nEliminated budget anxiety\nCreated sustainable spending habits",
        extraContent: "Role of AI",
        linkText: "See impact >",
        extraContentLinkText: "Role of AI >",
        launchDate: new Date(2024, 10, 10), // November 10, 2024
        image: "expeditr.gif",
        tools: ["Anthropic", "Heroku", "Node.js", "Perplexity", "Python + Quart", "React + Vite", "REST API"],
        timeSaved: {
            weekly: 30, // minutes saved per week
            hasCalculator: true
        }
    },
    {
        id: 3,
        title: "Parse Emails and Turn Them into a Database",
        value: "time",
        shortDescription: "Parse emails and turn them into a database",
        longDescription: "A tennis club's after-school program was drowning in paper: application submissions arrived as emails that were printed and filed, forcing the program director to either manage everything from hard copies or manually transfer hundreds of applications to spreadsheets.\n\nUsing Google Apps Script, I automated the transfer of application data from emails to Google Sheets, organizing students by semester and schedule, tracking dismissal times and transportation needs, managing staff assignments, maintaining contact details, and categorizing program revenues.",
        impact: "Impact metrics...",
        linkText: "See impact >",
        launchDate: new Date(2024, 7, 14), // August 14, 2024
        image: "jdp.gif",
        tools: ["Google Apps Script", "Google Sheets"],
        timeSaved: {
            weekly: 60, // minutes saved per week
            hasCalculator: true
        }
    },
    {
        id: 2,
        title: "Custom Google Calendar Integration",
        value: "insight",
        shortDescription: "Custom Google Calendar integration",
        longDescription: "The tennis instructors at a local club had to constantly call the front desk to check their lesson schedules because the club's scheduling system lacked mobile-friendly access.\n\nI made a simple web scraper to automatically post each instructor's lesson schedule and court assignments directly to their Google Calendar.",
        impact: "Impact metrics...",
        linkText: "See impact >",
        launchDate: new Date(2024, 7, 6), // July 6, 2024
        image: "joe-calendar.gif",
        tools: ["Google Calendar", "Node.js"],
        timeSaved: {
            daily: 15, // minutes saved per day
            hasCalculator: true
        },
        alternativeUses: [
            "eat 72 extra meals.", 
            "get 182 foot massages.", 
            "fly around the world twice.",
            "read 15 books.",
            "explore 30 museums."
        ]
    },
    {
        id: 1,
        title: "Web Scraper + Email Notification",
        value: "time",
        shortDescription: "Web scraper + email notification",
        longDescription: "My tennis video company's workflow requires constant monitoring of tennis club court schedules to determine when to send videos, which courts they're from, and who should receive them. This process used to require manual checks several times daily.\n\nI built a web scraper to automate this entirely, sending updates to Google Sheets and triggering email notifications as needed.",
        impact: "This solution saves me 15 minutes a day. It eliminates a small yet significant cognitive load from my days, allowing me to focus on other work and enjoy personal time without interruptions.",
        linkText: "See impact >",
        launchDate: new Date(2024, 4, 10), // May 10, 2024
        image: "scraper.gif",
        tools: ["Google Sheets", "Node.js"],
        timeSaved: {
            daily: 15, // minutes saved per day
            hasCalculator: true
        },
        alternativeUses: [
            "take 22 hiking trips.", 
            "play 60 tennis matches.", 
            "walk from Las Vegas to Mexico.",
            "watch Stranger Things seasons 1-3 4x.",
            "drive from NYC to LA and back."
        ]
    },
    // Add more projects as needed
];