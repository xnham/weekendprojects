// Combined projects file with both completed and future projects
export const projects = [
    // Completed projects
    {
        id: 1,
        title: "Web Scraper + Email Notification",
        status: "completed",
        value: "time",
        beneficiary: "work/business",
        shortDescription: "Web scraper + email notification",
        longDescription: "My tennis video company's workflow requires constant monitoring of tennis club court schedules to determine when to send videos, which courts they're from, and who should receive them. This process used to require manual checks several times daily.\n\nI built a web scraper to automate this entirely, sending updates to Google Sheets and triggering email notifications as needed.\n\nThis solution saves me 15 minutes a day. It eliminates a small yet significant cognitive load from my days, allowing me to focus on other work and enjoy personal time without interruptions.",
        impact: true,
        extraContent: null,
        linkText: "See calculations >",
        extraContentLinkText: null,
        launchDate: new Date(2024, 4, 10), // May 10, 2024
        image: "scraper.gif",
        tools: ["Google Sheets", "Node.js"],
        timeSaved: {
            daily: 15, // minutes saved per day
            hasCalculator: true,
            alternativeUses: [
                "take 22 hiking trips.", 
                "play 60 tennis matches.", 
                "walk from Las Vegas to Mexico.",
                "watch Stranger Things seasons 1-3 4x.",
                "drive from NYC to LA and back."
            ]
        },
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 2,
        title: "Custom Google Calendar Integration",
        status: "completed",
        value: "insight",
        beneficiary: "work/business",
        shortDescription: "Custom Google Calendar integration",
        longDescription: "The tennis instructors at a local club had to constantly call the front desk to check their lesson schedules because the club's scheduling system lacked mobile-friendly access.\n\nI made a simple web scraper to automatically post each instructor's lesson schedule and court assignments directly to their Google Calendar.",
        impact: true,
        extraContent: null,
        linkText: "See impact >",
        extraContentLinkText: null,
        launchDate: new Date(2024, 7, 6), // July 6, 2024
        image: "joe-calendar.gif",
        tools: ["Google Calendar", "Node.js"],
        timeSaved: {
            daily: 15, // minutes saved per day
            hasCalculator: true,
            alternativeUses: [
                "eat 72 extra meals.", 
                "get 182 foot massages.", 
                "fly around the world twice.",
                "read 15 books.",
                "explore 30 museums."
            ]
        },
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 3,
        title: "Parse Emails and Turn Them Into a Database",
        status: "completed",
        value: "time",
        beneficiary: "work/business",
        shortDescription: "Parse emails and turn them into a database",
        longDescription: "A tennis club's after-school program was overwhelmed with paper: applications arrived via email, were printed and filed, forcing the director to manage from hard copies or manually transfer data to spreadsheets.\n\nUsing Google Apps Script, I automated the transfer of application data from emails to Google Sheets, organizing students by semester, tracking dismissal times and transportation needs, managing staff assignments, and maintaining contact details.\n\nThis solution saved the program director approximately an hour per week.",
        impact: true,
        extraContent: null,
        linkText: "See calculations >",
        extraContentLinkText: null,
        launchDate: new Date(2024, 7, 14), // August 14, 2024
        image: "jdp.gif",
        tools: ["Google Apps Script", "Google Sheets"],
        timeSaved: {
            weekly: 60, // minutes saved per week
            hasCalculator: true,
            alternativeUses: [
                "become a proficient ukulele player.",
                "run 11 marathons at a moderate pace.",
                "build a bench for the entryway.",
                "write a children's book.",
                "create a small garden."
            ]
        },
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 4,
        title: "Expeditr | Consolidate Recipe URLs Into One Ingredient List",
        status: "completed",
        value: "sanity",
        beneficiary: "household",
        shortDescription: "Consolidate recipe URLs into one ingredient list",
        longDescription: "Meal planning used to mean an hour of weekly torture: juggling multiple browser tabs for recipes while searching for ingredients on FreshDirect, often adding common items like garlic multiple times.\n\nExpeditr solves this headache by automatically converting up to 10 recipe URLs into one consolidated ingredient list, organized by category.",
        impact: true,
        extraContent: "",
        linkText: "See impact >",
        extraContentLinkText: "",
        launchDate: new Date(2024, 10, 10), // November 10, 2024
        image: "expeditr.gif",
        tools: ["Anthropic", "Heroku", "Node.js", "Perplexity", "Python + Quart", "React + Vite", "REST API"],
        timeSaved: {
            weekly: 30, // minutes saved per week
            hasCalculator: true,
            alternativeUses: [
                "prepare for a presentation",
                "do a yoga session",
                "call an old friend",
                "take a relaxing bath",
                "meditate for stress relief"
            ]
        },
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 6,
        title: "Miss Penny | Daily 8 AM Text to Track Expenses Against Budget",
        status: "completed",
        value: "money",
        beneficiary: "household",
        shortDescription: "Daily text to track expenses against budget",
        longDescription: "Despite monthly vows to spend more mindfully, our family consistently blew the budget on restaurants and impulse Amazon purchases, largely because we lacked real-time insight into our spending habits.\n\nMiss Penny fixes this by sending a daily 8 AM text showing exactly how we're tracking against our dining out and shopping budgets.\n\nSo far, the daily text messages have helped us reduce our spending by $680 a month on average.",
        impact: true,
        extraContent: "",
        linkText: "See impact >",
        extraContentLinkText: "",
        launchDate: new Date(2025, 1, 1), // February 1, 2025
        image: "miss-penny.gif",
        tools: ["GitHub Actions", "Google Apps Script", "Google Sheets", "OpenAI", "Python", "Sheet SMS", "Tiller Money"],
        moneySaved: {
            daily: 22.36, // dollars saved per day
            hasCalculator: false,
            alternativeUses: [
                "rent a private island in Belize for a night.",
                "commission three life-size ice sculptures.",
                "buy two high-end smart toilets.",
                "fly business class from NYC to Singapore and back.",
                "rent a giant billboard in Times Square for 13 minutes."
            ]
        },
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 5,
        title: "Weekend Projects | This Website",
        status: "completed",
        value: "fun",
        beneficiary: "personal",
        shortDescription: "Project portfolio",
        longDescription: "I needed a personal website to synthesize my excitement around AI-assisted software development. Webflow used to be my go-to tool for building websites. However, I'm not patient enough to dig deep into its knowledge base to pull off all kinds of elaborate tricks needed to customize all the things I want to customize. Plus, Webflow would've cost me $300/year for the features I needed.\n\nI ended up building this website from scratch with Cursor. I got to implement real-time calculators, custom sliders, databases, and even AI voice agent integration. I also became familiar with Svelte, a framework previously completely foreign to me. All at zero hosting cost!",
        impact: false,
        extraContent: "",
        linkText: "See impact >",
        extraContentLinkText: "",
        launchDate: new Date(2025, 1, 1), // February 1, 2025
        image: "wp.gif",
        tools: ["GitHub Actions", "Google Apps Script", "Google Sheets", "OpenAI", "Python", "Sheet SMS", "Tiller Money"],
        moneySaved: {
            daily: 5.5, // $5.50 saved per day ($2000/365)
            alternativeUses: [
                "buy a high-end camera", 
                "take a weekend trip to a nearby city",
                "upgrade your computer",
                "get a year's worth of streaming services",
                "eat at 10 nice restaurants"
            ]
        },
        likes: 0,
        follows: 0,
        show: true
    },
    {
        id: 106,
        title: "One-Tap Timestamps on Apple Watch",
        status: "future",
        value: "insight",
        beneficiary: "personal",
        shortDescription: "Record tennis session timestamps with one tap",
        longDescription: "When recording my tennis practice sessions, it's often difficult to find important moments later when reviewing the footage. I need a simple way to mark key events in real-time.\n\nI'd like to build an Apple Watch app to let me create timestamp markers while I'm recording myself. Later, I could easily jump to these marked moments when watching the video, saving me from tediously scrubbing through the entire recording.\n\nI'm planning to integrate this tool with <a href='https://www.ocamsclub.com' target='_blank'>Ocams's</a> video recording system to benefit Ocams users. However, it would also be valuable for anyone who records live events regularly and wants to quickly locate specific moments afterward.",
        impact: false,
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null, // Not scheduled yet
        image: "placeholder.gif", // Will need a placeholder image
        tools: [],
        timeSaved: {
            daily: 0,
            weekly: 0,
            hasCalculator: false,
            alternativeUses: [
                "review video footage more efficiently",
                "focus on technique improvements",
                "create highlight reels faster",
                "increase productive practice time",
                "share specific coaching moments"
            ]
        },
        likes: 0,
        follows: 8,
        show: true
    },
    {
        id: 107,
        title: "AI Grocery Shopping Assistant",
        status: "future",
        value: "time",
        beneficiary: "household",
        shortDescription: "AI-powered grocery shopping automation",
        longDescription: "An AI agent that turns recipe URLs into a loaded shopping cart and understands your preferences based on past orders. Save 60 minutes a week.",
        impact: false,
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: ["AI"],
        timeSaved: {
            weekly: 60,
            hasCalculator: true,
            alternativeUses: [
                "have weekly game nights with family",
                "take a cooking class",
                "start a creative hobby",
                "exercise twice a week",
                "read a book each month"
            ]
        },
        likes: 24,
        follows: 13,
        show: false
    },
    {
        id: 108,
        title: "Miss Penny 2.0",
        status: "future",
        value: "money",
        beneficiary: "household",
        shortDescription: "Enhanced expense tracking with real-time updates",
        longDescription: "Like Miss Penny 1.0, but instantly updated with every transaction, including pending ones, and with enhanced transaction categorization.",
        impact: false,
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: [],
        moneySaved: {
            daily: 0,
            hasCalculator: false,
            alternativeUses: [
                "save 15% more for retirement",
                "reduce debt by $2,400 annually",
                "increase emergency fund by $200/month",
                "afford one extra vacation each year",
                "upgrade home appliances without financing"
            ]
        },
        likes: 31,
        follows: 0,
        show: false
    },
    {
        id: 109,
        title: "Second Brain",
        status: "future",
        value: "time",
        beneficiary: "work/business",
        shortDescription: "Your personal second brain",
        longDescription: "I struggle with information overload from technology and business newsletters. These resources seem valuable but aren't immediately relevant, forcing me to choose between protecting my focus and giving in to FOMO.\n\nI plan to build a personal knowledge repository where I can save these resources for later use. When needed, I'll ask questions like \"What advice do my saved materials offer about identifying ideal customers?\" and have an LLM search my personally curated articles for insights.",
        impact: false,
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: [],
        timeSaved: {
            daily: 0,
            hasCalculator: false,
            alternativeUses: [
                "create weekly business strategy reviews",
                "develop a thought leadership blog",
                "research competitors more thoroughly",
                "design better products with deeper insights",
                "keep up with industry trends effortlessly"
            ]
        },
        likes: 26,
        follows: 15,
        show: true
    },
    {
        id: 110,
        title: "Take the Negative Bias out of News",
        status: "future",
        value: "sanity",
        beneficiary: "personal",
        shortDescription: "Rewrite news in a neutral tone",
        longDescription: "Reading the newspaper leaves me drained, not from the information but from how it's framed. Headlines exploit our natural attention to threats with negative, alarming language. I want to stay informed but without the emotional manipulation.\n\nI'd love to have a browser extension that automatically rewrites news content in a neutral tone while preserving the original site's styling and layout. This would create a natural reading experience with the same information but without the anxiety.\n\nI hope this tool would help news readers everywhere stay informed about world events without the mental fatigue that arises from negative framing.",
        impact: false,
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: ["Browser Extension"],
        timeSaved: {
            daily: 0,
            hasCalculator: false,
            alternativeUses: [
                "reduce daily anxiety levels",
                "maintain better emotional balance",
                "make more rational decisions",
                "improve sleep quality",
                "develop a more balanced worldview"
            ]
        },
        likes: 43,
        follows: 27,
        show: true
    },
    {
        id: 111,
        title: "Car Lease Offer Analyzer",
        status: "future",
        value: "money",
        beneficiary: "household",
        shortDescription: "Car lease negotiation coaching system",
        longDescription: "When negotiating a car lease, the consumer often feels outmatched by the dealer's control over information. Key details like money factors, incentives, and fees are unclear, making it hard to know if they're getting a fair deal. Unlike car loans with legally mandated APR disclosures, car leases remain frustratingly opaque with complex calculations.\n\nI want to help car lease consumers confidently assess offers so they can negotiate without second-guessing. It sounds like they could use a lease advisor tool to let them input lease offers and receive an instant assessment. The tool will highlight missing details, suggest follow-up questions, and provide clear, data-driven recommendations—empowering consumers to negotiate with confidence and avoid hidden costs.",
        impact: false,
        extraContent: null,
        linkText: "Follow for updates >",
        extraContentLinkText: null,
        launchDate: null,
        image: "placeholder.gif",
        tools: [],
        moneySaved: {
            daily: 0,
            hasCalculator: false,
            alternativeUses: [
                "save $2,500 on a 36-month lease",
                "avoid $900 in hidden fees",
                "negotiate $45 lower monthly payments",
                "get better terms on excess mileage",
                "understand the real cost of a lease buyout"
            ]
        },
        likes: 19,
        follows: 11,
        show: true
    },
    {
        id: 115,
        title: "Practice Small Talk",
        status: "future",
        value: "fun", 
        beneficiary: "personal",
        shortDescription: "AI-powered small talk practice environment",
        longDescription: "I want to be a better communicator, and like with everything else, practice is key. While I am familiar with techniques such as active listening and avoiding yes/no questions, practicing them \"in the wild\" feels risky. (The last thing I need is to weird out my conversation partners even more!)\n\nI'd love to build a tool to let myself and others practice communication skills with AI conversation partners. It will allow the user to isolate specific techniques, receive real-time feedback, and review recordings to track progress. Unlike real-world interactions, one can practice without fear of messing up.",
        impact: false,
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
        id: 112,
        title: "Cardboard Costume Creator",
        status: "future",
        value: "fun",
        beneficiary: "household",
        shortDescription: "Amazing costumes from simple cardboard",
        longDescription: "A collection of patterns and step-by-step guides for creating amazing costumes from cardboard. Win Halloween with a resourceful and creative spirit.",
        impact: false,
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
        show: false
    },
    {
        id: 113,
        title: "Neighborhood Boutique Browser",
        status: "future",
        value: "fun",
        beneficiary: "community",
        shortDescription: "Swipe to discover local fashion",
        longDescription: "I want to shop in person at neighborhood boutiques, but I lack the patience to browse the stores blindly or research their websites one by one.\n\nI'd love to build an app that pulls all clothing images from the local store websites and presents them in a swipeable, Tinder-like interface. I could swipe left and right while waiting for the bus or my salad. After swiping through items, I'd know exactly which local stores to check out. Also, the swiping data could provide valuable insights to boutique owners about what people like and don't like.",
        impact: false,
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
        id: 114,
        title: "Family Weekend Newsletter",
        status: "future",
        value: "fun",
        beneficiary: "household",
        shortDescription: "AI-curated perfect weekend activities",
        longDescription: "Every weekend, my husband and I feel the pressure to find 'good' activities for our young son. We want great ideas without spending hours scrolling through newsletters and websites. The signal-to-noise ratio of these resources can be kinda low.\n\nI'd love to have a tool that automatically scans information sources and delivers a personalized email each Friday with five curated activities that match the vibe we're looking for.",
        impact: false,
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
        id: 116,
        title: "Friend Catch-Upper",
        status: "future",
        value: "fun",
        beneficiary: "personal",
        shortDescription: "Call your friends automatically to gather intel about them",
        longDescription: "As time goes by, my friends and I get busier with family and work. It's harder to stay in touch. We slowly and sadly fade from each other's immediate consciousness.\n\nGrowing new friendships is also challenging. Spontaneous hangouts and random chitchats that are so helpful for exploring new connections are disappearing from our culture. (Doesn't it feel like everything needs to be scheduled, agenda-ed and calendar-invited these days?)\n\nAs silly as it may sound—actually, the silliness may be the point here—I'd love to have a robot call my friends periodically to say hello and find out what's going on in their lives. My friends will hopefully find it amusing to be interviewed by a robot, and the topics uncovered will hopefully lead to real, engaging, robotless conversations afterward.",
        impact: false,
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
        likes: 24,
        follows: 17,
        show: true
    },
    {
        id: 117,
        title: "Meal, Book, and Science Recommender",
        status: "future",
        value: "time",
        beneficiary: "household",
        shortDescription: "Recommendation system for meals, books, and science activities",
        longDescription: "Our family needs to plan meals every week, pick new children's books every three weeks, and come up with a science activity every two weeks. Researching and evaluating all the options takes a huge amount of energy.\n\nAutomating these tasks would be a huge help. Given a database of recipes, books, and science activities, a recommender system could learn our family's preferences and deliver tailored suggestions on schedule. Heck, it could even order the books from the library for us.",
        impact: false,
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
        likes: 13,
        follows: 11,
        show: true
    },
];
