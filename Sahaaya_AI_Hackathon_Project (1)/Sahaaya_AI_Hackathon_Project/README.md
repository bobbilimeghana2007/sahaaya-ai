# Sahaaya AI — Learn at Your Pace

**Beyond the Screen** · Student Innovation Hackathon Project

An inclusive student learning and personal growth workspace that helps students study effectively, organise their time, practise concepts, discover free educational resources, and build career skills.

> **“Your future is built one small step at a time.”**

---

## Problem statement

Many students struggle to:

- Organise daily learning into manageable tasks  
- Find trustworthy free educational resources  
- Practise consistently without feeling overwhelmed  
- Use digital tools that respect different learning needs and accessibility preferences  

Generic chatbots or cluttered dashboards often fail to provide a calm, practical, inclusive study environment.

## Proposed solution

**Sahaaya AI** combines in one student-friendly workspace:

- A personalised overview dashboard with progress tracking  
- A fully functional study planner (with LocalStorage persistence)  
- A 25-minute focus timer and mindful-break tool  
- A local demo learning companion (rule-based, no paid API)  
- Interactive beginner quizzes with scoring  
- A searchable resource library of free learning starting points  
- Career growth paths and a four-week roadmap  
- Accessibility settings (dark mode, larger text, high contrast, reduced motion)  

All data stays in the browser. No sign-up, no backend, no API keys required for this version.

## Target users

- College and university students  
- Beginners exploring AI, coding, or career skills  
- Learners who prefer structured, calm interfaces  
- Students who benefit from accessibility options  

## Main features

| Section | Features |
|--------|----------|
| **Overview** | Greeting, motivational headline, progress cards, today’s tasks, focus timer, mindful break |
| **Learn with Sahaaya** | Chat-style interface with suggested prompts; **local demo tutor — no live AI model connected** |
| **Study Planner** | Add / complete / delete / filter tasks; categories; LocalStorage |
| **Quick Challenges** | 5-question quiz (AI, Python, ML, digital safety, accessibility); scoring; retake |
| **Resource Library** | Search + category filters; curated free resources with safe external links |
| **Career Growth** | Three learning paths + four-week roadmap |
| **Accessibility & Settings** | Dark mode, larger text, high contrast, reduced motion; export / clear data |

## Technology stack

- **HTML5** — semantic structure  
- **CSS3** — responsive layout, glass cards, themes, animations  
- **Vanilla JavaScript** — all interactions, LocalStorage  
- No frameworks, no build step, no paid APIs  

## Project structure

```
Sahaaya_AI_Hackathon_Project/
├── index.html          # Main application
├── README.md           # This file
├── LICENSE             # MIT License
├── css/
│   └── styles.css      # All styles, themes, responsive rules
└── js/
    └── app.js          # Application logic
```

## How to run locally

### Option 1 — Open the file

1. Download or clone the project.  
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).  

### Option 2 — Local server (recommended)

```bash
cd Sahaaya_AI_Hackathon_Project
python -m http.server 8000
```

Then visit: [http://localhost:8000](http://localhost:8000)

## How to deploy free with GitHub Pages

1. Create a **public** GitHub repository.  
2. Upload the project files so that **`index.html` is at the repository root** (or keep the folder and set the Pages source accordingly).  
3. Go to **Settings → Pages**.  
4. Under **Source**, choose **Deploy from a branch**.  
5. Select the `main` (or `master`) branch and the **/ (root)** folder.  
6. Click **Save**.  
7. Wait one to two minutes, then open the public URL shown (e.g. `https://username.github.io/repo-name/`).  
8. Test the live site on desktop and mobile.

## How to test the project

- [ ] Every navigation item opens the correct section  
- [ ] Add, complete, filter, and delete tasks; refresh — data persists  
- [ ] Start / pause / resume / reset the focus timer  
- [ ] Send tutor prompts (suggested and custom)  
- [ ] Complete the quiz and retake it  
- [ ] Search and filter the resource library; external links open correctly  
- [ ] Toggle dark mode, larger text, high contrast, reduced motion  
- [ ] Export tasks as JSON; clear data with confirmation  
- [ ] Open and close the mindful-break modal  
- [ ] Check layout at ~375px, 768px, 1024px, and 1440px  
- [ ] No console errors in the browser developer tools  

## Prototype limitations

- The learning companion is a **local rule-based demo**, not a live generative AI model.  
- Language selector (English / Telugu) is a **preview only**; main content is English.  
- No user accounts, cloud sync, or backend.  
- Quiz and task data are limited to the current browser.  
- External resource links depend on third-party sites remaining available.  

## Privacy and data storage

- Tasks, quiz points, focus session count, and accessibility preferences are stored in **browser LocalStorage** only.  
- No data is sent to any server.  
- No passwords, API keys, or personal identifiers are collected.  
- You can export your tasks as JSON or clear all local data from Settings.  

## Future improvements

- Optional secure backend AI integration (with clear user consent)  
- Full Telugu (and other) translations  
- Optional account sync across devices  
- More quiz topics and adaptive difficulty  
- Spaced-repetition reminders  
- Offline support via service worker  

## Suggested 60–90 second demo script for judges

1. **(0–15 s)** Open the Overview. Point out the headline *“Your future is built one small step at a time”*, progress cards, and today’s tasks.  
2. **(15–30 s)** Add a task in the Study Planner; mark one complete; show the progress bar updating.  
3. **(30–45 s)** Start the Focus timer briefly, then open the Mindful break.  
4. **(45–60 s)** Go to Learn with Sahaaya — emphasise the **“Local demo tutor — no live AI”** banner; send a suggested prompt.  
5. **(60–75 s)** Run through one or two quiz questions; show the Resource Library filters.  
6. **(75–90 s)** Toggle dark mode and larger text; mention LocalStorage privacy and free GitHub Pages deployment. Close with the inclusive, low-friction design and social impact.  

---

## Innovation & impact (for presentation)

- **Problem:** Students need calm, organised, accessible tools — not another generic chatbot.  
- **Solution:** One workspace that unites planning, practice, focus, resources, career paths, and accessibility.  
- **Innovation:** Inclusive, low-friction design with honest local demo AI, full client-side persistence, and no mandatory accounts.  
- **Social impact:** Makes free learning starting points easier to find and supports healthier study habits.  
- **Sustainability:** Static files, free resources, no paid APIs required.  

---

Built with care for the **Beyond the Screen** student innovation hackathon.
