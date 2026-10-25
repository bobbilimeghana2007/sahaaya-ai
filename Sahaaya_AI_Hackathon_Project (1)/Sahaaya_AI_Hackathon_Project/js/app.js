/**
 * Sahaaya AI — Learn at Your Pace
 * Vanilla JS application logic
 */

(function () {
  "use strict";

  // ---------- Storage helpers ----------
  const STORAGE_KEYS = {
    tasks: "sahaaya_tasks",
    quizPoints: "sahaaya_quiz_points",
    focusSessions: "sahaaya_focus_sessions",
    prefs: "sahaaya_prefs",
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  // ---------- State ----------
  let tasks = loadJSON(STORAGE_KEYS.tasks, []);
  let quizPoints = loadJSON(STORAGE_KEYS.quizPoints, 0);
  let focusSessions = loadJSON(STORAGE_KEYS.focusSessions, 0);
  let prefs = loadJSON(STORAGE_KEYS.prefs, {
    darkMode: false,
    largeText: false,
    highContrast: false,
    reducedMotion: false,
  });

  let currentFilter = "all";
  let timerInterval = null;
  let timerSeconds = 25 * 60;
  let timerRunning = false;
  let timerPaused = false;
  const TIMER_TOTAL = 25 * 60;

  // Quiz state
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  // ---------- DOM refs ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ---------- Navigation ----------
  function showSection(id) {
    $$(".section").forEach((s) => {
      s.hidden = s.id !== id;
      s.classList.toggle("active", s.id === id);
    });
    $$(".nav-item").forEach((btn) => {
      const active = btn.dataset.section === id;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-current", active ? "page" : "false");
    });
    // Close mobile menu
    $("#sidebar")?.classList.remove("open");
    $("#sidebarOverlay").hidden = true;
    $("#menuToggle")?.setAttribute("aria-expanded", "false");
    // Scroll top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  });

  // Mobile menu
  $("#menuToggle")?.addEventListener("click", () => {
    const sidebar = $("#sidebar");
    const open = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", open);
    $("#sidebarOverlay").hidden = !open;
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });
  $("#sidebarOverlay")?.addEventListener("click", () => {
    $("#sidebar").classList.remove("open");
    $("#sidebarOverlay").hidden = true;
    $("#menuToggle").setAttribute("aria-expanded", "false");
  });

  // ---------- Greeting ----------
  function updateGreeting() {
    const h = new Date().getHours();
    let g = "Good day";
    if (h < 12) g = "Good morning";
    else if (h < 17) g = "Good afternoon";
    else g = "Good evening";
    const el = $("#greeting");
    if (el) el.textContent = `${g}, learner 👋`;
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(msg, duration = 2800) {
    const el = $("#globalToast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, duration);
  }

  // ---------- Tasks ----------
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function persistTasks() {
    saveJSON(STORAGE_KEYS.tasks, tasks);
    updateStats();
    renderDashboardTasks();
    renderPlannerTasks();
  }

  function addTask(name, category) {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast("Please enter a task name.");
      return false;
    }
    tasks.unshift({
      id: uid(),
      name: trimmed,
      category: category || "Study",
      done: false,
      created: Date.now(),
    });
    persistTasks();
    showToast("Task added ✓");
    return true;
  }

  function toggleTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = !t.done;
    persistTasks();
    if (t.done) showToast("Nice work — task completed!");
  }

  function deleteTask(id) {
    tasks = tasks.filter((x) => x.id !== id);
    persistTasks();
    showToast("Task removed");
  }

  function filteredTasks() {
    if (currentFilter === "todo") return tasks.filter((t) => !t.done);
    if (currentFilter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }

  function renderTaskItem(t, full = false) {
    const li = document.createElement("li");
    li.className = "task-item" + (t.done ? " done" : "");
    li.dataset.id = t.id;

    const check = document.createElement("button");
    check.className = "task-check";
    check.setAttribute("aria-label", t.done ? "Mark incomplete" : "Mark complete");
    check.innerHTML = t.done ? "✓" : "";
    check.addEventListener("click", () => toggleTask(t.id));

    const name = document.createElement("span");
    name.className = "task-name";
    name.textContent = t.name;

    li.append(check, name);

    if (full) {
      const cat = document.createElement("span");
      cat.className = "task-cat";
      cat.textContent = t.category;
      li.append(cat);

      const del = document.createElement("button");
      del.className = "task-delete";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "×";
      del.addEventListener("click", () => deleteTask(t.id));
      li.append(del);
    }

    return li;
  }

  function renderDashboardTasks() {
    const list = $("#dashboardTasks");
    const empty = $("#dashboardEmpty");
    if (!list) return;
    list.innerHTML = "";
    const open = tasks.filter((t) => !t.done).slice(0, 5);
    open.forEach((t) => list.append(renderTaskItem(t, false)));
    if (empty) empty.hidden = open.length > 0;
  }

  function renderPlannerTasks() {
    const list = $("#plannerTasks");
    const empty = $("#plannerEmpty");
    if (!list) return;
    list.innerHTML = "";
    const filtered = filteredTasks();
    filtered.forEach((t) => list.append(renderTaskItem(t, true)));
    if (empty) empty.hidden = filtered.length > 0;

    const all = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const todo = all - done;
    const set = (id, n) => {
      const el = $(id);
      if (el) el.textContent = n;
    };
    set("#countAll", all);
    set("#countTodo", todo);
    set("#countDone", done);
  }

  // Task form
  $("#taskForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#taskName").value;
    const cat = $("#taskCategory").value;
    if (addTask(name, cat)) {
      $("#taskName").value = "";
      $("#taskName").focus();
    }
  });

  $("#quickAddTask")?.addEventListener("click", () => {
    showSection("planner");
    setTimeout(() => $("#taskName")?.focus(), 100);
  });

  // Filters
  $$(".filter-tab[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      $$(".filter-tab[data-filter]").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      renderPlannerTasks();
    });
  });

  // ---------- Stats & progress ----------
  function updateStats() {
    const done = tasks.filter((t) => t.done).length;
    const total = tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const momentum = done + focusSessions + Math.floor(quizPoints / 10);

    const set = (id, v) => {
      const el = $(id);
      if (el) el.textContent = v;
    };
    set("#tasksCompleted", done);
    set("#focusSessions", focusSessions);
    set("#momentum", momentum);
    set("#quizPoints", quizPoints);
    set("#progressPercent", pct + "%");

    const fill = $("#progressFill");
    if (fill) fill.style.width = pct + "%";
    const bar = $("#progressBar");
    if (bar) bar.setAttribute("aria-valuenow", pct);
  }

  // ---------- Focus timer ----------
  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function updateTimerUI() {
    const display = $("#timerDisplay");
    if (display) display.textContent = formatTime(timerSeconds);
    const circle = $("#timerProgress");
    if (circle) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference * (1 - timerSeconds / TIMER_TOTAL);
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = offset;
    }
    $("#timerStart").disabled = timerRunning && !timerPaused;
    $("#timerPause").disabled = !timerRunning || timerPaused;
  }

  function startTimer() {
    if (timerRunning && !timerPaused) return;
    if (timerPaused) {
      timerPaused = false;
    } else if (!timerRunning) {
      timerRunning = true;
      if (timerSeconds <= 0) timerSeconds = TIMER_TOTAL;
    }
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerPaused = false;
        focusSessions += 1;
        saveJSON(STORAGE_KEYS.focusSessions, focusSessions);
        updateStats();
        showToast("Focus session complete! Great job 🎯");
        updateTimerUI();
        return;
      }
      timerSeconds -= 1;
      updateTimerUI();
    }, 1000);
    updateTimerUI();
  }

  function pauseTimer() {
    if (!timerRunning || timerPaused) return;
    clearInterval(timerInterval);
    timerPaused = true;
    updateTimerUI();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerPaused = false;
    timerSeconds = TIMER_TOTAL;
    updateTimerUI();
  }

  $("#timerStart")?.addEventListener("click", startTimer);
  $("#timerPause")?.addEventListener("click", pauseTimer);
  $("#timerReset")?.addEventListener("click", resetTimer);

  // ---------- Mindful break ----------
  const breathPhrases = [
    "Breathe in slowly…",
    "Hold gently…",
    "Breathe out slowly…",
    "Rest for a moment…",
  ];
  let breathIdx = 0;
  let breathInterval = null;

  function openMindful() {
    const modal = $("#mindfulModal");
    if (!modal) return;
    modal.hidden = false;
    breathIdx = 0;
    $("#mindfulInstruction").textContent = breathPhrases[0];
    clearInterval(breathInterval);
    breathInterval = setInterval(() => {
      breathIdx = (breathIdx + 1) % breathPhrases.length;
      $("#mindfulInstruction").textContent = breathPhrases[breathIdx];
    }, 4000);
  }

  function closeMindful() {
    $("#mindfulModal").hidden = true;
    clearInterval(breathInterval);
  }

  $("#mindfulBreakBtn")?.addEventListener("click", openMindful);
  $("#mindfulClose")?.addEventListener("click", closeMindful);
  $("#mindfulBackdrop")?.addEventListener("click", closeMindful);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#mindfulModal").hidden) closeMindful();
  });

  // ---------- Learn with Sahaaya (rule-based tutor) ----------
  const tutorResponses = {
    "explain ai in simple words":
      "Artificial Intelligence (AI) is when computers are designed to do tasks that usually need human thinking — like recognising patterns, answering questions, or making suggestions. Think of it as teaching a computer to notice patterns in data and use them to help people. It is not magic; it is maths, data, and carefully written programs.",
    "help me plan my study today":
      "Here is a simple plan you can adapt:\n1. Pick 1–2 topics only (avoid overload).\n2. Spend 25 minutes focused study, then a short break.\n3. Do one practice question or summary.\n4. Note one thing you understood better.\nUse the Study Planner in this app to add those tasks, and start the Focus timer when you are ready.",
    "break a difficult topic into three steps":
      "Try this three-step approach for any hard topic:\n1. Overview — read or watch a short intro so you know the main idea.\n2. Core pieces — list 3–5 key concepts and learn each one separately.\n3. Apply — explain it in your own words or solve one simple example.\nCome back tomorrow and do one more example. Small steps add up.",
    "i feel overwhelmed by exams":
      "Feeling overwhelmed is common. Try this:\n• Write down only the next small action (e.g. “revise chapter 2 summary for 20 minutes”).\n• Use the Focus timer for one short session.\n• Take a mindful break when you need it.\n• Remember: progress is more important than perfection. You do not have to finish everything today.\nIf stress stays high, talk to a teacher, friend, or counsellor — this app is a support tool, not a replacement for real help.",
    "explain python basics":
      "Python is a beginner-friendly programming language. A few basics:\n• Variables store values: name = \"Sahaaya\"\n• Print shows output: print(name)\n• Lists hold multiple items: scores = [10, 20, 30]\n• Conditions decide what runs: if score > 50: print(\"Pass\")\n• Loops repeat actions: for x in scores: print(x)\nStart with free lessons on freeCodeCamp or Kaggle Learn (see Resource Library). Practise a little every day.",
  };

  function getTutorReply(userText) {
    const key = userText.trim().toLowerCase().replace(/[?.!]+$/, "");
    if (tutorResponses[key]) return tutorResponses[key];

    // Fuzzy matches
    if (/ai|artificial intelligence/.test(key)) return tutorResponses["explain ai in simple words"];
    if (/plan|study today|schedule/.test(key)) return tutorResponses["help me plan my study today"];
    if (/break|steps|difficult|hard topic/.test(key)) return tutorResponses["break a difficult topic into three steps"];
    if (/overwhelm|exam|stress|anxious/.test(key)) return tutorResponses["i feel overwhelmed by exams"];
    if (/python|coding basics|programming/.test(key)) return tutorResponses["explain python basics"];

    return "Thanks for your question! This is a local demo tutor with a limited set of prepared answers. Try one of the suggested prompts above, or explore the Resource Library for free courses. In a future version, this can connect to a real AI model via a secure backend.";
  }

  function appendMessage(text, role) {
    const container = $("#chatMessages");
    if (!container) return;
    const div = document.createElement("div");
    div.className = "message " + role;
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = role === "user" ? "👤" : "🌱";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    // Safe text: use textContent / create elements, not innerHTML with user input
    text.split("\n").forEach((line, i) => {
      if (i > 0) bubble.append(document.createElement("br"));
      bubble.append(document.createTextNode(line));
    });
    div.append(avatar, bubble);
    container.append(div);
    container.scrollTop = container.scrollHeight;
  }

  function sendChat(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    appendMessage(trimmed, "user");
    const reply = getTutorReply(trimmed);
    setTimeout(() => appendMessage(reply, "assistant"), 350);
  }

  $("#chatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chatInput");
    sendChat(input.value);
    input.value = "";
  });

  $$(".prompt-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      sendChat(chip.dataset.prompt || chip.textContent);
    });
  });

  // ---------- Quiz ----------
  const quizData = [
    {
      q: "What does AI stand for?",
      options: ["Artificial Intelligence", "Automatic Internet", "Advanced Interface", "Applied Information"],
      correct: 0,
      explain: "AI stands for Artificial Intelligence — systems that perform tasks that typically require human intelligence.",
    },
    {
      q: "Which symbol is used to start a comment in Python?",
      options: ["//", "#", "/*", "--"],
      correct: 1,
      explain: "In Python, a single-line comment starts with the # symbol.",
    },
    {
      q: "Machine learning is best described as:",
      options: [
        "Writing every rule by hand for a program",
        "Teaching computers to learn patterns from data",
        "Only used for video games",
        "A type of computer hardware",
      ],
      correct: 1,
      explain: "Machine learning lets systems improve from data without being explicitly programmed for every case.",
    },
    {
      q: "Which practice helps digital safety?",
      options: [
        "Using the same password everywhere",
        "Sharing passwords with friends",
        "Using unique, strong passwords and enabling 2FA",
        "Clicking unknown links quickly",
      ],
      correct: 2,
      explain: "Strong unique passwords and two-factor authentication (2FA) greatly improve account security.",
    },
    {
      q: "Why is website accessibility important?",
      options: [
        "It only matters for designers",
        "It makes sites usable for people with different abilities",
        "It makes websites load slower",
        "It is only required for mobile apps",
      ],
      correct: 1,
      explain: "Accessibility ensures people with diverse abilities can use websites effectively — good design for everyone.",
    },
  ];

  function renderQuiz() {
    const area = $("#quizQuestionArea");
    const results = $("#quizResults");
    if (!area || !results) return;

    if (quizIndex >= quizData.length) {
      area.hidden = true;
      results.hidden = false;
      $("#finalScore").textContent = quizScore;
      const msg =
        quizScore >= 40
          ? "Excellent work! You have a solid grasp of the basics."
          : quizScore >= 20
          ? "Good effort! Review the explanations and try again when ready."
          : "Keep practising — every attempt builds understanding.";
      $("#resultsMessage").textContent = msg;
      quizPoints = Math.max(quizPoints, quizScore); // keep highest or accumulate? Spec: save earned points
      // Accumulate total points earned across retakes would inflate; we save current session score as total if higher, or add once
      // Spec: "Save earned points using LocalStorage" — we'll add the session score once at end
      // Actually better: store cumulative. On first complete, add. On retake, only add new if we track separately.
      // Simple approach: set quizPoints to max(current stored, this score) for demo, or accumulate.
      // Spec says "Ten points per correct answer" and "Save earned points". We'll accumulate on each completed quiz.
      const prev = loadJSON(STORAGE_KEYS.quizPoints, 0);
      // To avoid double-counting on retake within same page load we already finished once;
      // On retake we reset quizScore so we can award again (practice mode).
      saveJSON(STORAGE_KEYS.quizPoints, prev + quizScore);
      quizPoints = prev + quizScore;
      updateStats();
      return;
    }

    area.hidden = false;
    results.hidden = true;
    quizAnswered = false;

    const item = quizData[quizIndex];
    $("#quizQuestion").textContent = item.q;
    $("#quizProgressText").textContent = `Question ${quizIndex + 1} of ${quizData.length}`;
    const pct = (quizIndex / quizData.length) * 100;
    $("#quizProgressFill").style.width = pct + "%";

    const opts = $("#quizOptions");
    opts.innerHTML = "";
    item.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.type = "button";
      btn.textContent = opt;
      btn.addEventListener("click", () => selectAnswer(i));
      opts.append(btn);
    });

    $("#quizFeedback").hidden = true;
    $("#quizNext").hidden = true;
  }

  function selectAnswer(index) {
    if (quizAnswered) return;
    quizAnswered = true;
    const item = quizData[quizIndex];
    const options = $$(".quiz-option");
    options.forEach((btn, i) => {
      btn.disabled = true;
      if (i === item.correct) btn.classList.add("correct");
      if (i === index && index !== item.correct) btn.classList.add("incorrect");
      if (i === index) btn.classList.add("selected");
    });

    const feedback = $("#quizFeedback");
    feedback.hidden = false;
    if (index === item.correct) {
      quizScore += 10;
      feedback.className = "quiz-feedback correct";
      feedback.textContent = "Correct! " + item.explain;
    } else {
      feedback.className = "quiz-feedback incorrect";
      feedback.textContent = "Not quite. " + item.explain;
    }
    $("#quizNext").hidden = false;
    $("#quizNext").textContent = quizIndex === quizData.length - 1 ? "See results" : "Next question";
  }

  $("#quizNext")?.addEventListener("click", () => {
    quizIndex += 1;
    renderQuiz();
  });

  $("#quizRetake")?.addEventListener("click", () => {
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    renderQuiz();
  });

  // ---------- Resources ----------
  const resources = [
    {
      name: "Kaggle Learn",
      cat: "AI & Data",
      desc: "Free micro-courses on Python, ML, data visualisation, and more.",
      url: "https://www.kaggle.com/learn",
      icon: "📊",
    },
    {
      name: "Google Machine Learning",
      cat: "AI & Data",
      desc: "Crash courses and guides from Google on ML concepts and tools.",
      url: "https://developers.google.com/machine-learning",
      icon: "🧠",
    },
    {
      name: "Elements of AI",
      cat: "AI & Data",
      desc: "A free online course that introduces AI in plain language.",
      url: "https://www.elementsofai.com/",
      icon: "✨",
    },
    {
      name: "freeCodeCamp",
      cat: "Coding",
      desc: "Interactive coding curriculum covering web development and more.",
      url: "https://www.freecodecamp.org/learn/",
      icon: "💻",
    },
    {
      name: "MDN Web Docs",
      cat: "Coding",
      desc: "The definitive reference for HTML, CSS, and JavaScript.",
      url: "https://developer.mozilla.org/",
      icon: "📖",
    },
    {
      name: "GitHub Skills",
      cat: "Coding",
      desc: "Learn Git and GitHub through guided, hands-on courses.",
      url: "https://skills.github.com/",
      icon: "🐙",
    },
    {
      name: "Microsoft Learn",
      cat: "Career",
      desc: "Free training modules across technology and career skills.",
      url: "https://learn.microsoft.com/en-us/training/",
      icon: "📘",
    },
    {
      name: "GitHub Student Developer Pack",
      cat: "Career",
      desc: "Free tools and services for verified students.",
      url: "https://education.github.com/pack",
      icon: "🎒",
    },
  ];

  let resourceCat = "All";
  let resourceQuery = "";

  function renderResources() {
    const grid = $("#resourcesGrid");
    const empty = $("#resourcesEmpty");
    if (!grid) return;
    grid.innerHTML = "";
    const q = resourceQuery.toLowerCase();
    const filtered = resources.filter((r) => {
      const catOk = resourceCat === "All" || r.cat === resourceCat;
      const searchOk =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.cat.toLowerCase().includes(q);
      return catOk && searchOk;
    });
    filtered.forEach((r) => {
      const card = document.createElement("article");
      card.className = "resource-card glass-card";
      card.innerHTML = `
        <span class="resource-icon" aria-hidden="true">${r.icon}</span>
        <span class="resource-cat">${r.cat}</span>
        <h3>${r.name}</h3>
        <p>${r.desc}</p>
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Open resource</a>
      `;
      grid.append(card);
    });
    if (empty) empty.hidden = filtered.length > 0;
  }

  $$(".filter-tab[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      resourceCat = btn.dataset.cat;
      $$(".filter-tab[data-cat]").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      renderResources();
    });
  });

  $("#resourceSearch")?.addEventListener("input", (e) => {
    resourceQuery = e.target.value;
    renderResources();
  });

  // ---------- Accessibility & Settings ----------
  function applyPrefs() {
    document.documentElement.setAttribute("data-theme", prefs.darkMode ? "dark" : "light");
    document.documentElement.setAttribute("data-text", prefs.largeText ? "large" : "normal");
    document.documentElement.setAttribute("data-contrast", prefs.highContrast ? "high" : "normal");
    document.documentElement.setAttribute("data-motion", prefs.reducedMotion ? "reduce" : "normal");

    const sync = (id, val) => {
      const el = $(id);
      if (el) el.setAttribute("aria-checked", String(val));
    };
    sync("#darkModeToggle", prefs.darkMode);
    sync("#largeTextToggle", prefs.largeText);
    sync("#highContrastToggle", prefs.highContrast);
    sync("#reducedMotionToggle", prefs.reducedMotion);

    // Mobile theme icon
    const icon = $(".theme-icon");
    if (icon) icon.textContent = prefs.darkMode ? "☀️" : "🌙";
  }

  function togglePref(key) {
    prefs[key] = !prefs[key];
    saveJSON(STORAGE_KEYS.prefs, prefs);
    applyPrefs();
  }

  $("#darkModeToggle")?.addEventListener("click", () => togglePref("darkMode"));
  $("#largeTextToggle")?.addEventListener("click", () => togglePref("largeText"));
  $("#highContrastToggle")?.addEventListener("click", () => togglePref("highContrast"));
  $("#reducedMotionToggle")?.addEventListener("click", () => togglePref("reducedMotion"));
  $("#themeToggleMobile")?.addEventListener("click", () => togglePref("darkMode"));

  // Export
  $("#exportData")?.addEventListener("click", () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tasks,
      quizPoints,
      focusSessions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sahaaya-tasks-export.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Tasks exported as JSON");
  });

  // Clear data
  $("#clearData")?.addEventListener("click", () => {
    if (!confirm("Clear all local data (tasks, quiz points, preferences)? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEYS.tasks);
    localStorage.removeItem(STORAGE_KEYS.quizPoints);
    localStorage.removeItem(STORAGE_KEYS.focusSessions);
    localStorage.removeItem(STORAGE_KEYS.prefs);
    tasks = [];
    quizPoints = 0;
    focusSessions = 0;
    prefs = { darkMode: false, largeText: false, highContrast: false, reducedMotion: false };
    applyPrefs();
    updateStats();
    renderDashboardTasks();
    renderPlannerTasks();
    showToast("All local data cleared");
  });

  // Language note
  $("#langSelect")?.addEventListener("change", (e) => {
    if (e.target.value === "te") {
      showToast("Telugu is a preview only. Main content remains in English.");
      e.target.value = "en";
    }
  });

  // ---------- Init ----------
  function init() {
    updateGreeting();
    applyPrefs();
    updateStats();
    renderDashboardTasks();
    renderPlannerTasks();
    updateTimerUI();
    renderQuiz();
    renderResources();

    // Respect system reduced-motion if user hasn't set preference yet
    if (!loadJSON(STORAGE_KEYS.prefs, null) && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prefs.reducedMotion = true;
      saveJSON(STORAGE_KEYS.prefs, prefs);
      applyPrefs();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
