// --- DOM Elements ---
const orb = document.getElementById('orb');
const glow = document.getElementById('glow');
const scoreInput = document.getElementById('myScore');
const totalInput = document.getElementById('totalMarks');
const messageTitle = document.getElementById('message-title');
const messageBody = document.getElementById('message-body');
const trendBadge = document.getElementById('trendBadge');
const historyContainer = document.getElementById('historyContainer');
const body = document.body;
const overlay = document.getElementById('overlay');
const syncToggle = document.getElementById('syncToggle');
const demoBtn = document.getElementById('demoBtn');
const examSelect = document.getElementById('examSelect');
const dreamMarksGroup = document.getElementById('dreamMarksGroup');
const dreamMarksInput = document.getElementById('dreamMarks');
const enterBtn = document.getElementById('enterBtn');

// Login Elements
const loginModal = document.getElementById('login-modal');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('login-error');
const welcomeBanner = document.getElementById('welcome-banner');
const welcomeText = document.getElementById('welcome-text');
const logoutBtn = document.getElementById('logoutBtn');

// Onboarding Elements
const onboardingModal = document.getElementById('onboarding-modal');
const onboardExam = document.getElementById('onboardExam');
const onboardTotal = document.getElementById('onboardTotal');
const onboardGoal = document.getElementById('onboardGoal');
const onboardDate = document.getElementById('onboardDate');
const onboardBtn = document.getElementById('onboardBtn');

// Leaderboard Elements
const leaderboardPanel = document.getElementById('leaderboard-panel');
const leaderboardToggle = document.getElementById('leaderboard-toggle');
const leaderboardContent = document.getElementById('leaderboard-content');
const leaderboardBody = document.getElementById('leaderboard-body');
const leaderboardArrow = document.getElementById('leaderboard-arrow');

// Tab Elements
const tabScore = document.getElementById('tab-score');
const tabStudy = document.getElementById('tab-study');
const tabDashboard = document.getElementById('tab-dashboard');
const scorePanel = document.getElementById('score-panel');
const studyPanel = document.getElementById('study-panel');
const dashboardPanel = document.getElementById('dashboard-panel');

// Study Space Elements
const timerDisplay = document.getElementById('timer-display');
const startFocusBtn = document.getElementById('startFocusBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const timerComment = document.getElementById('timer-comment');

// Dashboard Elements (Stats Grid)
const statScores = document.getElementById('stat-scores');
const statAvg = document.getElementById('stat-avg');
const statPomos = document.getElementById('stat-pomos');
const statStreak = document.getElementById('stat-streak');
const studyGraph = document.getElementById('study-graph');

// Focus Tab Stats
const focusPomos = document.getElementById('focus-pomos');
const focusMins = document.getElementById('focus-mins');

let isDemoRunning = false;
let currentColor = null;
let currentUsername = null;
let currentUserData = null;

// --- Pomodoro Timer State ---
let timerState = 'IDLE'; // IDLE, FOCUS, BREAK, PAUSED
let timeLeft = 25 * 60; // seconds
let timerInterval = null;
let pomodorosToday = 0;
const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

// Gen Z Quirky Comments
const TIMER_COMMENTS = {
    IDLE: "ready to lock in? 🔒",
    FOCUS: "you're cooking rn 🔥",
    BREAK: "touch grass (briefly) 🌿",
    PAUSED: "phone check? be so fr 😐",
    DONE: "pomodoro secured 💅"
};

const STREAK_COMMENTS = {
    0: "no streak yet... start one? 👀",
    1: "baby streak 🐣",
    3: "cooking... 🍳",
    7: "LOCKED IN 🔒🔥",
    14: "actual menace 💀",
    30: "bro touched greatness 👑"
};

const POMO_COMMENTS = {
    0: "",
    1: "1 down, keep pushing 💪",
    2: "2 down, you're cooking 🔥",
    3: "3 down, one more for the set 🎯",
    4: "4 POMOS?! certified grinder 💪"
};

// --- Auth System ---
const WELCOME_MESSAGES = {
    0: "Back already? Obsessed much? 😏",
    1: "24 hours? Not bad. Let's cook! 🍳",
    2: "2 days since we saw you. Missed you... jk, STUDY. 📚",
    3: "3 days?! The books are getting dusty, princess. 👑",
    7: "Almost a WEEK?! Lock in!! 🔒",
    14: "2 WEEKS?! Did you forget about your dreams? 💀",
    30: "{days} DAYS?! Were you in a COMA?! 🚨"
};

function getWelcomeMessage(days) {
    if (days === 0) return WELCOME_MESSAGES[0];
    if (days === 1) return WELCOME_MESSAGES[1];
    if (days <= 3) return WELCOME_MESSAGES[2];
    if (days <= 6) return WELCOME_MESSAGES[3];
    if (days <= 13) return WELCOME_MESSAGES[7];
    if (days <= 29) return WELCOME_MESSAGES[14];
    return WELCOME_MESSAGES[30].replace('{days}', days);
}

async function handleLogin() {
    const username = usernameInput.value.trim().toLowerCase();
    loginError.textContent = '';

    if (!username || username.length < 2) {
        loginError.textContent = 'Need at least 2 characters, bestie.';
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (data.status === 'success') {
            currentUsername = username;
            currentUserData = data.user;
            localStorage.setItem('bulb_username', username);

            loginModal.style.display = 'none';

            // Check if new user needs onboarding
            if (data.isNewUser || !data.user.onboarded) {
                onboardingModal.style.display = 'flex';
            } else {
                showMainApp(data);
            }
        } else {
            loginError.textContent = data.message || 'Login failed. Try again.';
        }
    } catch (e) {
        console.error('Login failed', e);
        loginError.textContent = 'Connection error. Is the server running?';
    }
}

function showMainApp(data) {
    welcomeBanner.style.display = 'flex';
    leaderboardPanel.style.display = 'block';

    // Show welcome message
    const msg = getWelcomeMessage(data.daysSince);
    welcomeText.innerHTML = `<strong>${data.daysSince} day${data.daysSince !== 1 ? 's' : ''}</strong> since we saw you!<br>${msg}`;

    // Show exam info from onboarding
    const examDisplay = document.getElementById('exam-display');
    if (examDisplay && data.user.exam) {
        const examName = data.user.exam.replace('_', ' ');
        const goal = data.user.goal || '?';
        const total = data.user.total_marks || 800;
        examDisplay.innerHTML = `📚 <strong>${examName}</strong> | Goal: ${goal}/${total}`;
    }

    // Set hidden inputs from user profile
    if (data.user.exam) {
        examSelect.value = data.user.exam;
    }
    if (data.user.total_marks) {
        totalInput.value = data.user.total_marks;
    }

    // Load existing history
    if (data.user && data.user.scores && data.user.scores.length > 0) {
        const lastScores = data.user.scores.slice(-5);
        renderHistoryDots(lastScores);
    }

    // Load leaderboard
    fetchLeaderboard();
}

async function handleOnboarding() {
    try {
        const response = await fetch(`/api/onboarding/${currentUsername}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exam: onboardExam.value,
                total_marks: Number(onboardTotal.value) || 800,
                goal: Number(onboardGoal.value) || 0,
                exam_date: onboardDate.value
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            currentUserData = data.user;
            onboardingModal.style.display = 'none';
            showMainApp({ daysSince: 0, user: data.user });
        }
    } catch (e) {
        console.error('Onboarding failed', e);
    }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();

        if (data.status === 'success') {
            renderLeaderboard(data.leaderboard);
        }
    } catch (e) {
        console.error('Leaderboard fetch failed', e);
    }
}

function renderLeaderboard(leaderboard) {
    leaderboardBody.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.display_name}</td>
            <td>${entry.weekly_avg}%</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

function handleLogout() {
    localStorage.removeItem('bulb_username');
    currentUsername = null;
    currentUserData = null;
    loginModal.style.display = 'flex';
    welcomeBanner.style.display = 'none';
    leaderboardPanel.style.display = 'none';
    usernameInput.value = '';
}

// Check login on page load
async function checkExistingLogin() {
    const savedUsername = localStorage.getItem('bulb_username');
    if (savedUsername) {
        usernameInput.value = savedUsername;
        await handleLogin();
    }
}

// Event listeners
loginBtn.addEventListener('click', handleLogin);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});
logoutBtn.addEventListener('click', handleLogout);
onboardBtn.addEventListener('click', handleOnboarding);

// Leaderboard toggle
leaderboardToggle.addEventListener('click', () => {
    leaderboardContent.classList.toggle('open');
    leaderboardArrow.style.transform = leaderboardContent.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';
});

// Initialize on load
checkExistingLogin();

// --- Exam Selection ---
examSelect.addEventListener('change', () => {
    if (examSelect.value === 'CUSTOM') {
        dreamMarksGroup.style.display = 'flex';
        totalInput.value = '';
        totalInput.disabled = true;
    } else {
        dreamMarksGroup.style.display = 'none';
        totalInput.disabled = false;
        if (examSelect.value === 'USMLE') {
            totalInput.value = '300';
        } else if (examSelect.value === 'NEET_PG') {
            totalInput.value = '800';
        }
    }
});

// --- Color Configuration ---
const COLORS = [
    { threshold: 0, r: 255, g: 0, b: 0, title: "CRITICAL FAILURE", msg: "Bruh... we need to talk 😬" },
    { threshold: 40, r: 255, g: 165, b: 0, title: "BELOW AVERAGE", msg: "Oof, you got this next time! 💪" },
    { threshold: 60, r: 255, g: 255, b: 0, title: "NEEDS IMPROVEMENT", msg: "Not bad, not bad... keep grinding! 📚" },
    { threshold: 75, r: 0, g: 255, b: 0, title: "GOOD PERFORMANCE", msg: "Ayyy, solid work! 🔥" },
    { threshold: 90, r: 138, g: 43, b: 226, title: "EXCELLENT!", msg: "YOOOOO LESSSS GOOOOOO!!! 🎉🚀" }
];

// --- Orb Update ---
async function updateOrb(score, total) {
    if (!score && score !== 0) {
        resetOrb();
        return;
    }

    const percentage = (score / total) * 100;

    // Find color based on percentage
    let color = COLORS[0];
    for (let c of COLORS) {
        if (percentage >= c.threshold) {
            color = c;
        }
    }

    currentColor = color;

    const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;
    const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;

    // Apply visual effects
    document.documentElement.style.setProperty('--glow-color', rgba);
    orb.style.background = `radial-gradient(circle at 30% 30%, #555, ${rgb})`;

    // Update Text
    messageTitle.innerText = `${percentage.toFixed(1)}% — ${color.title}`;
    messageBody.innerText = color.msg;
    messageTitle.style.color = rgb;
    messageBody.style.color = "#fff";

    // Animations
    glow.classList.remove('pulsing-slow', 'pulsing-fast');
    body.classList.remove('shaking');
    overlay.classList.remove('glitch-active');

    if (percentage < 40) {
        body.classList.add('shaking');
        overlay.classList.add('glitch-active');
        setTimeout(() => {
            body.classList.remove('shaking');
            overlay.classList.remove('glitch-active');
        }, 500);
    } else if (percentage >= 90) {
        glow.classList.add('pulsing-fast');
        triggerConfetti(color);
    } else if (percentage >= 75) {
        glow.classList.add('pulsing-slow');
    }

    // Backend Sync
    if (syncToggle.checked) {
        syncToBulb(color);
    }

    // Record Score (User-Scoped)
    await recordScoreAndContext(score, total, examSelect.value, percentage);
}

function resetOrb() {
    document.documentElement.style.setProperty('--glow-color', 'transparent');
    orb.style.background = `radial-gradient(circle at 30% 30%, #444, #000)`;
    messageTitle.innerText = "";
    messageBody.innerText = "Enter your score...";
    messageTitle.style.color = "rgba(255,255,255,0.6)";
    glow.className = 'glow';
    currentColor = null;
    hideTrend();
}

function triggerConfetti(color) {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [`#${componentToHex(color.r)}${componentToHex(color.g)}${componentToHex(color.b)}`]
    });
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// --- Backend Sync ---
async function syncToBulb(color) {
    try {
        await fetch('/api/set-color', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(color)
        });
    } catch (e) {
        console.error("Bulb sync failed", e);
    }
}

// --- Score Recording (User-Scoped) ---
async function recordScoreAndContext(score, total, exam, percentage) {
    if (!currentUsername) return;

    try {
        const response = await fetch(`/api/record-score/${currentUsername}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                exam: exam,
                score: score,
                total: total,
                percentage: percentage
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            updateTrendAndHistory(data.previous, data.history, percentage);
        }
    } catch (e) {
        console.error("Score record failed", e);
    }
}

function renderHistoryDots(history) {
    historyContainer.innerHTML = '';
    history.forEach(entry => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        const p = entry.percentage;
        if (p >= 90) dot.style.background = '#8a2be2';
        else if (p >= 75) dot.style.background = '#00ff00';
        else if (p >= 60) dot.style.background = '#ffff00';
        else if (p >= 40) dot.style.background = '#ffa500';
        else dot.style.background = '#ff0000';
        historyContainer.appendChild(dot);
    });
}

function updateTrendAndHistory(previous, history, currentPercentage) {
    renderHistoryDots(history);

    if (previous) {
        const delta = currentPercentage - previous.percentage;
        trendBadge.style.display = 'inline-block';

        if (delta > 0) {
            trendBadge.className = 'trend-badge trend-up';
            trendBadge.innerText = `+${delta.toFixed(1)}% 📈`;
            if (delta >= 5) {
                messageBody.innerText = "MAJOR GLOW UP! 📈 You cooked! 🔥";
            }
        } else if (delta < 0) {
            trendBadge.className = 'trend-badge trend-down';
            trendBadge.innerText = `${delta.toFixed(1)}% 📉`;
            if (delta <= -5) {
                messageBody.innerText = "Fell off... Lock in immediately! 💀";
            }
        } else {
            trendBadge.style.display = 'none';
        }
    } else {
        hideTrend();
    }
}

function hideTrend() {
    if (trendBadge) trendBadge.style.display = 'none';
}

// --- Event Listeners ---
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        const errorDiv = document.getElementById('error-msg');
        errorDiv.textContent = '';
        let totalVal = totalInput.value.trim();
        if (examSelect.value === 'CUSTOM') totalVal = dreamMarksInput.value.trim();
        const scoreVal = scoreInput.value.trim();

        if (!totalVal || isNaN(totalVal) || Number(totalVal) <= 0) {
            errorDiv.textContent = 'Total marks must be a positive number.';
            resetOrb();
            return;
        }
        if (scoreVal === '' || isNaN(scoreVal)) {
            errorDiv.textContent = 'Score must be a number.';
            resetOrb();
            return;
        }
        const scoreNum = Number(scoreVal);
        const totalNum = Number(totalVal);

        if (scoreNum < 0 || scoreNum > totalNum) {
            errorDiv.textContent = `Score must be between 0 and ${totalNum}.`;
            resetOrb();
            return;
        }

        updateOrb(scoreNum, totalNum);

        const tierAnnouncer = document.getElementById('tier-announcer');
        if (tierAnnouncer && currentColor) {
            tierAnnouncer.textContent = `${(scoreNum / totalNum * 100).toFixed(1)}% – ${currentColor.msg}`;
        }
    });
}

// Share button
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        try {
            const container = document.querySelector('.container');
            const canvas = await html2canvas(container);
            const dataUrl = canvas.toDataURL('image/png');
            const tweetText = encodeURIComponent(`My exam score turned my room ${currentColor.msg.toLowerCase()}! 🎉`);
            const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(dataUrl)}`;
            window.open(tweetUrl, '_blank');
        } catch (e) {
            console.error('Share failed', e);
        }
    });
}

// Demo Mode (removed from UI, but kept for safety)
if (demoBtn) {
    demoBtn.addEventListener('click', () => {
        if (isDemoRunning) return;
        isDemoRunning = true;
        scoreInput.disabled = true;
        const errorDiv = document.getElementById('error-msg');
        if (errorDiv) errorDiv.textContent = '';

        const demoScores = [30, 50, 65, 80, 95];
        const total = 100;

        let i = 0;
        const interval = setInterval(() => {
            scoreInput.value = demoScores[i];
            updateOrb(demoScores[i], total);
            i++;

            if (i >= demoScores.length) {
                clearInterval(interval);
                setTimeout(() => {
                    isDemoRunning = false;
                    scoreInput.disabled = false;
                    scoreInput.value = '';
                    resetOrb();
                }, 2000);
            }
        }, 1500);
    });
}

// --- Tab Switching ---
const orbContainer = document.querySelector('.orb-container');

function switchTab(activeTab) {
    // Reset all tabs
    [tabScore, tabStudy, tabDashboard].forEach(t => t && t.classList.remove('active'));
    [scorePanel, studyPanel, dashboardPanel].forEach(p => p && (p.style.display = 'none'));

    // Activate selected
    if (activeTab === 'score') {
        tabScore && tabScore.classList.add('active');
        scorePanel && (scorePanel.style.display = 'block');
        if (orbContainer) orbContainer.style.display = 'flex';
    } else if (activeTab === 'study') {
        tabStudy && tabStudy.classList.add('active');
        studyPanel && (studyPanel.style.display = 'block');
        if (orbContainer) orbContainer.style.display = 'none';
    } else if (activeTab === 'dashboard') {
        tabDashboard && tabDashboard.classList.add('active');
        dashboardPanel && (dashboardPanel.style.display = 'block');
        if (orbContainer) orbContainer.style.display = 'none';
        loadDashboard();
    }
}

if (tabScore) tabScore.addEventListener('click', () => switchTab('score'));
if (tabStudy) tabStudy.addEventListener('click', () => switchTab('study'));
if (tabDashboard) tabDashboard.addEventListener('click', () => switchTab('dashboard'));

// --- Dashboard Data Loader ---
async function loadDashboard() {
    if (!currentUsername) return;

    try {
        // Load study history
        const studyRes = await fetch(`/api/study-history/${currentUsername}`);
        const studyData = await studyRes.json();

        if (studyData.status === 'success') {
            // Streak stat
            if (statStreak) statStreak.textContent = studyData.streak;

            // Total pomos (from history)
            const totalP = studyData.history.reduce((sum, d) => sum + Math.floor(d.duration_mins / 25), 0);
            if (statPomos) statPomos.textContent = totalP;

            // Study graph (7-day dots)
            if (studyGraph) {
                studyGraph.innerHTML = '';
                studyData.history.forEach(day => {
                    const row = document.createElement('div');
                    row.className = 'dot-row';

                    const label = document.createElement('span');
                    label.className = 'day-label';
                    label.textContent = day.day_name;

                    const dotsContainer = document.createElement('div');
                    dotsContainer.className = 'dots';

                    for (let i = 0; i < 8; i++) {
                        const dot = document.createElement('div');
                        dot.className = 'dot';
                        if (i < day.dots) {
                            dot.classList.add('filled');
                            if (day.dots >= 6) dot.classList.add('high');
                        }
                        dotsContainer.appendChild(dot);
                    }

                    row.appendChild(label);
                    row.appendChild(dotsContainer);
                    studyGraph.appendChild(row);
                });
            }
        }

        // Load score stats from user data
        if (currentUserData && currentUserData.scores) {
            const scores = currentUserData.scores;

            // Total scores count
            if (statScores) statScores.textContent = scores.length;

            // Avg score
            if (statAvg && scores.length > 0) {
                const avg = scores.reduce((sum, s) => sum + (s.percentage || 0), 0) / scores.length;
                statAvg.textContent = `${Math.round(avg)}%`;
            }
        }

    } catch (e) {
        console.error('Failed to load dashboard', e);
    }
}

// --- Update Focus Tab Stats ---
function updateFocusStats() {
    if (focusPomos) focusPomos.textContent = `${pomodorosToday} pomo${pomodorosToday !== 1 ? 's' : ''}`;
    if (focusMins) {
        const mins = pomodorosToday * 25;
        focusMins.textContent = `${mins} min today`;
    }
}

// --- Pomodoro Timer Functions ---
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
}

function startTimer() {
    if (timerState === 'IDLE') {
        timerState = 'FOCUS';
        timeLeft = FOCUS_TIME;
        // Start session on backend
        fetch(`/api/session/start/${currentUsername}`, { method: 'POST' });
    }

    // Show/hide buttons
    startFocusBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    stopBtn.style.display = 'inline-block';

    // Update quirky comment
    if (timerComment) timerComment.textContent = TIMER_COMMENTS[timerState] || TIMER_COMMENTS.FOCUS;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);

            if (timerState === 'FOCUS') {
                // Completed a pomodoro
                pomodorosToday++;
                updatePomodoroDots();

                // Switch to break
                timerState = 'BREAK';
                timeLeft = (pomodorosToday % 4 === 0) ? LONG_BREAK_TIME : BREAK_TIME;
                if (timerComment) timerComment.textContent = TIMER_COMMENTS.DONE;

                // Auto-start break
                setTimeout(() => {
                    if (timerComment) timerComment.textContent = TIMER_COMMENTS.BREAK;
                    startTimer();
                }, 2000);
            } else {
                // Break done, ready for next focus
                timerState = 'IDLE';
                timeLeft = FOCUS_TIME;
                if (timerComment) timerComment.textContent = TIMER_COMMENTS.IDLE;
                startFocusBtn.style.display = 'inline-block';
                startFocusBtn.textContent = 'Start Focus 🎯';
                pauseBtn.style.display = 'none';
                stopBtn.style.display = 'none';
            }
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerState = 'PAUSED';
    startFocusBtn.textContent = 'Resume 🎯';
    startFocusBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    if (timerComment) timerComment.textContent = TIMER_COMMENTS.PAUSED;
}

function stopTimer() {
    clearInterval(timerInterval);

    // End session on backend
    fetch(`/api/session/end/${currentUsername}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pomodoros: pomodorosToday })
    });

    // Reset state
    timerState = 'IDLE';
    timeLeft = FOCUS_TIME;
    updateTimerDisplay();

    startFocusBtn.textContent = 'Start Focus 🎯';
    startFocusBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'none';
    if (timerComment) timerComment.textContent = "session ended. good work! 🎉";

    // Refresh study history
    loadStudyHistory();
}

function updatePomodoroDots() {
    if (!pomodoroDots) return;
    let dots = '';
    const completed = pomodorosToday % 4;
    for (let i = 0; i < 4; i++) {
        dots += (i < completed || (pomodorosToday > 0 && completed === 0)) ? '● ' : '○ ';
    }
    pomodoroDots.textContent = dots.trim();

    // Update pomodoro comment
    if (pomodoroComment) {
        pomodoroComment.textContent = POMO_COMMENTS[Math.min(pomodorosToday, 4)] || '';
    }
}

// Study Space event listeners
if (startFocusBtn) startFocusBtn.addEventListener('click', startTimer);
if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
if (stopBtn) stopBtn.addEventListener('click', stopTimer);

// --- Study History & Dot Graph ---
async function loadStudyHistory() {
    if (!currentUsername) return;

    try {
        const response = await fetch(`/api/study-history/${currentUsername}`);
        const data = await response.json();

        if (data.status === 'success') {
            renderDotGraph(data.history);
            if (streakBadge) {
                // Quirky streak comments
                let comment = STREAK_COMMENTS[0];
                if (data.streak >= 30) comment = STREAK_COMMENTS[30];
                else if (data.streak >= 14) comment = STREAK_COMMENTS[14];
                else if (data.streak >= 7) comment = STREAK_COMMENTS[7];
                else if (data.streak >= 3) comment = STREAK_COMMENTS[3];
                else if (data.streak >= 1) comment = STREAK_COMMENTS[1];

                streakBadge.textContent = comment;
            }
        }
    } catch (e) {
        console.error('Failed to load study history', e);
    }
}

function renderDotGraph(history) {
    if (!dotGraph) return;
    dotGraph.innerHTML = '';

    history.forEach(day => {
        const row = document.createElement('div');
        row.className = 'dot-row';

        const label = document.createElement('span');
        label.className = 'day-label';
        label.textContent = day.day_name;

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots';

        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i < day.dots) {
                dot.classList.add('filled');
                if (day.dots >= 6) dot.classList.add('high');
            }
            dotsContainer.appendChild(dot);
        }

        row.appendChild(label);
        row.appendChild(dotsContainer);
        dotGraph.appendChild(row);
    });
}
