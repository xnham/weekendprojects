// Combined projects file with both completed and future projects
export const projects = [
    // Completed projects
    {
        id: 1,
        title: "Web Scraper + Email Notification",
        status: "completed",
        value: "time",
        shortDescription: "Web scraper + email notification",
        longDescription: "My tennis video company's workflow requires constant monitoring of tennis club court schedules to determine when to send videos, which courts they're from, and who should receive them. This process used to require manual checks several times daily.\n\nI built a web scraper to automate this entirely, sending updates to Google Sheets and triggering email notifications as needed.",
        impact: "This solution saves me 15 minutes a day. It eliminates a small yet significant cognitive load from my days, allowing me to focus on other work and enjoy personal time without interruptions.",
        extraContent: null,
        linkText: "See impact >",
        extraContentLinkText: null,
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
        ],
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 2,
        title: "Custom Google Calendar Integration",
        status: "completed",
        value: "insight",
        shortDescription: "Custom Google Calendar integration",
        longDescription: "The tennis instructors at a local club had to constantly call the front desk to check their lesson schedules because the club's scheduling system lacked mobile-friendly access.\n\nI made a simple web scraper to automatically post each instructor's lesson schedule and court assignments directly to their Google Calendar.",
        impact: "Impact metrics...",
        extraContent: null,
        linkText: "See impact >",
        extraContentLinkText: null,
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
        ],
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 3,
        title: "Parse Emails and Turn Them into a Database",
        status: "completed",
        value: "time",
        shortDescription: "Parse emails and turn them into a database",
        longDescription: "A tennis club's after-school program was drowning in paper: application submissions arrived as emails that were printed and filed, forcing the program director to either manage everything from hard copies or manually transfer hundreds of applications to spreadsheets.\n\nUsing Google Apps Script, I automated the transfer of application data from emails to Google Sheets, organizing students by semester and schedule, tracking dismissal times and transportation needs, managing staff assignments, maintaining contact details, and categorizing program revenues.",
        impact: "Impact metrics...",
        extraContent: null,
        linkText: "See impact >",
        extraContentLinkText: null,
        launchDate: new Date(2024, 7, 14), // August 14, 2024
        image: "jdp.gif",
        tools: ["Google Apps Script", "Google Sheets"],
        timeSaved: {
            weekly: 60, // minutes saved per week
            hasCalculator: true
        },
        alternativeUses: [],
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 4,
        title: "Expeditr | Automate grocery shopping",
        status: "completed",
        value: "sanity",
        shortDescription: "Automate grocery shopping",
        longDescription: "Meal planning used to mean an hour of weekly torture: juggling multiple browser tabs for recipes while searching for ingredients on FreshDirect, often adding common items like garlic multiple times.\n\nExpeditr solves this headache by automatically converting up to 10 recipe URLs into one consolidated ingredient list, organized by category.",
        impact: "Reduced monthly expenses by $680\nEliminated budget anxiety\nCreated sustainable spending habits",
        extraContent: "Role of AI",
        linkText: "See impact >",
        extraContentLinkText: "Role of AI >",
        launchDate: new Date(2024, 10, 10), // November 10, 2024
        image: "expeditr.gif",
        tools: ["Anthropic", "Heroku", "Node.js", "Perplexity", "Python + Quart", "React + Vite", "REST API"],
        timeSaved: {
            weekly: 30, // minutes saved per week
            hasCalculator: true
        },
        alternativeUses: [],
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 5,
        title: "Miss Penny | Daily 8 AM text to track expenses against budget",
        status: "completed",
        value: "money",
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
        },
        alternativeUses: [],
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 6,
        title: "One-Tap Timestamps on Apple Watch",
        status: "future",
        value: "insight",
        shortDescription: "Record tennis session timestamps with one tap",
        longDescription: "Mark important moments in a real-time recording with a single tap on the Apple Watch. When reviewing your recording later, the saved timestamps lets you find those important moments quickly.\n\nPerfect for athletes reviewing performance videos, sales professionals flagging key points in Zoom calls, or anyone who needs to quickly identify important moments during recordings for efficient review later.",
        impact: "TBD",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null, // Not scheduled yet
        image: "placeholder.gif", // Will need a placeholder image
        tools: [],
        timeSaved: {
            daily: 0,
            weekly: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 0,
        follows: 8,
        show: true
    },
    {
        id: 7,
        title: "AI Grocery Shopping Assistant",
        status: "future",
        value: "time",
        shortDescription: "AI-powered grocery shopping automation",
        longDescription: "An AI agent that turns recipe URLs into a loaded shopping cart and understands your preferences based on past orders. Save 60 minutes a week.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: ["AI"],
        timeSaved: {
            weekly: 60,
            hasCalculator: true
        },
        alternativeUses: [],
        likes: 24,
        follows: 13,
        show: false
    },
    {
        id: 8,
        title: "Miss Penny 2.0",
        status: "future",
        value: "money",
        shortDescription: "Enhanced expense tracking with real-time updates",
        longDescription: "Like Miss Penny 1.0, but instantly updated with every transaction, including pending ones, and with enhanced transaction categorization.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: [],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 31,
        follows: 0,
        show: false
    },
    {
        id: 9,
        title: "Second Brain",
        status: "future",
        value: "time",
        shortDescription: "Your personal second brain",
        longDescription: "Don't let FOMO disrupt your priorities. Save newsletters and articles that seem valuable but you don't have time to read now.\n\nStore content easily in your \"Second Brain\" repository and search it intelligently when needed. Simply ask questions like \"What advice do my saved materials offer about identifying ideal customers?\" and get relevant insights from your personally curated knowledge base.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: [],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 26,
        follows: 15,
        show: true
    },
    {
        id: 10,
        title: "Take the Bias out of News",
        status: "future",
        value: "sanity",
        shortDescription: "Rewrite news in a neutral tone",
        longDescription: "A browser extension that rewrites news articles from your favorite publication in a neutral tone. Avoid getting baited into fear or anger.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: ["Browser Extension"],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 43,
        follows: 27,
        show: true
    },
    {
        id: 11,
        title: "Practice Small Talk",
        status: "future",
        value: "fun", 
        shortDescription: "AI-powered small talk practice environment",
        longDescription: "An AI Agent that helps you practice small talk in a safe, judgment-free environment. Try different scenarios, personality types, and difficulty levels. Get real-time feedback on engagement and natural flow.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: ["AI"],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 1,
        follows: 1,
        show: true
    },
    {
        id: 12,
        title: "Cardboard Costume Creator",
        status: "future",
        value: "fun",
        shortDescription: "Amazing costumes from simple cardboard",
        longDescription: "A collection of patterns and step-by-step guides for creating amazing costumes from cardboard. Win Halloween with a resourceful and creative spirit.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: [],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 12,
        follows: 0,
        show: true
    },
    {
        id: 13,
        title: "Browse Fashion from Indie Boutiques Near You, Tinder-Style",
        status: "future",
        value: "fun",
        shortDescription: "Swipe to discover local fashion",
        longDescription: "A mobile app that lets you swipe fashion items from local indie boutiques. Stay hip while supporting the community.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: ["Mobile App"],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 21,
        follows: 9,
        show: true
    },
    {
        id: 14,
        title: "Personalized Curation of Weekend Activities",
        status: "future",
        value: "fun",
        shortDescription: "AI-curated perfect weekend activities",
        longDescription: "An AI Agent that diligently scours all the event listings to find the top five perfect activities just for you.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: ["AI"],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 35,
        follows: 22,
        show: true
    },
    {
        id: 15,
        title: "Know Exactly How to Negotiate a Car Lease",
        status: "future",
        value: "money",
        shortDescription: "Car lease negotiation coaching system",
        longDescription: "A dynamic coaching system that helps you decipher the complexity of car lease structures. Negotiate with self-assuredness and save thousands.",
        impact: "Coming soon...",
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: [],
        timeSaved: {
            daily: 0,
            hasCalculator: false
        },
        alternativeUses: [],
        likes: 19,
        follows: 11,
        show: true
    }
];
