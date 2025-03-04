let calcPieChart, calcBarChart, pieChart, habitsChart, goalsChart;
let habitsChartType = 'bar';
let userData = {
    socialMediaTime: {
        instagram: { hours: 0, history: [] },
        tiktok: { hours: 0, history: [] },
        twitter: { hours: 0, history: [] },
        telegram: { hours: 0, history: [] },
        facebook: { hours: 0, history: [] },
        youtube: { hours: 0, history: [] },
        linkedin: { hours: 0, history: [] },
        snapchat: { hours: 0, history: [] }
    },
    goals: {},
    achievements: []
};
let manualCalculationResult = null;

function startCalculator() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('calculator-container').style.display = 'block';
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');

    if (tabId === 'stats') updateStats();
    if (tabId === 'habits') updateHabits();
    if (tabId === 'advice') showAdvice();
    if (tabId === 'goals') updateGoals();
    if (tabId === 'calc') { updateCalcPieChart(); updateCalcBarChart(); }
    if (tabId === 'profile') loadProfile();
}

function calculateTime() {
    const socialMedia = document.getElementById('socialMedia').value;
    const hours = parseFloat(document.getElementById('hours').value) || 0;

    userData.socialMediaTime[socialMedia].hours += hours;
    userData.socialMediaTime[socialMedia].history.push({ date: new Date().toLocaleString(), hours });

    const totalHours = userData.socialMediaTime[socialMedia].hours;
    document.getElementById('result').innerHTML = `
        <h3><i class="ri-global-line"></i> ${socialMedia}</h3>
        <p><i class="ri-timer-line"></i> Total Hours: ${totalHours.toFixed(1)}</p>
        <p><i class="ri-calendar-line"></i> Last Entry: ${hours.toFixed(1)} hr (${new Date().toLocaleString()})</p>
    `;

    updateCalcPieChart();
    updateCalcBarChart();
    checkGoals(socialMedia, hours);
    checkAchievements();
    localStorage.setItem('userData', JSON.stringify(userData));
}

function clearCalc() {
    const socialMedia = document.getElementById('socialMedia').value;
    userData.socialMediaTime[socialMedia].hours = 0;
    userData.socialMediaTime[socialMedia].history = [];
    document.getElementById('result').innerHTML = `<p><i class="ri-delete-bin-line"></i> Data for ${socialMedia} cleared!</p>`;
    document.getElementById('manualResult').innerHTML = '';
    manualCalculationResult = null;
    updateCalcPieChart();
    updateCalcBarChart();
    localStorage.setItem('userData', JSON.stringify(userData));
}

function calculateManualTime() {
    const socialMedia = document.getElementById('socialMedia').value;
    const date = document.getElementById('calcDate').value || new Date().toISOString().split('T')[0];
    const manualHours = parseFloat(document.getElementById('manualHours').value) || 0;
    const subtractHours = parseFloat(document.getElementById('subtractHours').value) || 0;
    const multiplyFactor = parseFloat(document.getElementById('multiplyFactor').value) || 1;

    let currentHours = userData.socialMediaTime[socialMedia].hours;
    let result = currentHours + manualHours - subtractHours;
    result *= multiplyFactor;

    if (result < 0) {
        notifyUser('Result cannot be negative!');
        return;
    }

    manualCalculationResult = { socialMedia, date, hours: result - currentHours };
    document.getElementById('manualResult').innerHTML = `
        <p><i class="ri-calculator-line"></i> Preview Result for ${socialMedia} on ${date}:</p>
        <p><i class="ri-timer-line"></i> Added: ${manualHours.toFixed(1)}, Subtracted: ${subtractHours.toFixed(1)}, Multiplied by: ${multiplyFactor}</p>
        <p><i class="ri-timer-line"></i> New Total: ${result.toFixed(1)} hr</p>
        <p><i class="ri-information-line"></i> Press "Save" to apply changes</p>
    `;
}

function saveManualTime() {
    if (!manualCalculationResult) {
        notifyUser('Calculate first!');
        return;
    }

    const { socialMedia, date, hours } = manualCalculationResult;
    userData.socialMediaTime[socialMedia].hours += hours;
    userData.socialMediaTime[socialMedia].history.push({ date, hours });

    document.getElementById('manualResult').innerHTML = `
        <p><i class="ri-save-line"></i> Saved for ${socialMedia} on ${date}</p>
        <p><i class="ri-timer-line"></i> Total: ${userData.socialMediaTime[socialMedia].hours.toFixed(1)} hr</p>
    `;

    updateCalcPieChart();
    updateCalcBarChart();
    checkGoals(socialMedia, hours);
    checkAchievements();
    localStorage.setItem('userData', JSON.stringify(userData));
    manualCalculationResult = null;
}

function cancelManualTime() {
    manualCalculationResult = null;
    document.getElementById('manualResult').innerHTML = '<p><i class="ri-close-line"></i> Calculation canceled</p>';
}

function copyManualResult() {
    const manualResult = document.getElementById('manualResult').innerText;
    navigator.clipboard.writeText(manualResult)
        .then(() => notifyUser('Result copied to clipboard!'))
        .catch(err => notifyUser('Copy error: ' + err));
}

function addManualTime() {
    const socialMedia = document.getElementById('socialMedia').value;
    const date = document.getElementById('calcDate').value || new Date().toISOString().split('T')[0];
    const hours = parseFloat(document.getElementById('manualHours').value) || 0;

    if (hours > 0) {
        userData.socialMediaTime[socialMedia].hours += hours;
        userData.socialMediaTime[socialMedia].history.push({ date, hours });
        document.getElementById('manualResult').innerHTML = `
            <p><i class="ri-add-line"></i> Added ${hours.toFixed(1)} hr for ${socialMedia} on ${date}</p>
            <p><i class="ri-timer-line"></i> Total: ${userData.socialMediaTime[socialMedia].hours.toFixed(1)} hr</p>
        `;
        updateCalcPieChart();
        updateCalcBarChart();
        checkGoals(socialMedia, hours);
        checkAchievements();
        localStorage.setItem('userData', JSON.stringify(userData));
    } else {
        notifyUser('Enter hours to add!');
    }
}

function subtractTime() {
    const socialMedia = document.getElementById('socialMedia').value;
    const date = document.getElementById('calcDate').value || new Date().toISOString().split('T')[0];
    const hours = parseFloat(document.getElementById('subtractHours').value) || 0;

    if (hours > 0) {
        if (userData.socialMediaTime[socialMedia].hours >= hours) {
            userData.socialMediaTime[socialMedia].hours -= hours;
            userData.socialMediaTime[socialMedia].history.push({ date, hours: -hours });
            document.getElementById('manualResult').innerHTML = `
                <p><i class="ri-subtract-line"></i> Subtracted ${hours.toFixed(1)} hr for ${socialMedia} on ${date}</p>
                <p><i class="ri-timer-line"></i> Total: ${userData.socialMediaTime[socialMedia].hours.toFixed(1)} hr</p>
            `;
            updateCalcPieChart();
            updateCalcBarChart();
            localStorage.setItem('userData', JSON.stringify(userData));
        } else {
            notifyUser('Not enough hours to subtract!');
        }
    } else {
        notifyUser('Enter hours to subtract!');
    }
}

function multiplyTime() {
    const socialMedia = document.getElementById('socialMedia').value;
    const date = document.getElementById('calcDate').value || new Date().toISOString().split('T')[0];
    const factor = parseFloat(document.getElementById('multiplyFactor').value) || 1;

    if (factor > 0) {
        const originalHours = userData.socialMediaTime[socialMedia].hours;
        userData.socialMediaTime[socialMedia].hours *= factor;
        const newHours = userData.socialMediaTime[socialMedia].hours - originalHours;
        userData.socialMediaTime[socialMedia].history.push({ date, hours: newHours });
        document.getElementById('manualResult').innerHTML = `
            <p><i class="ri-multiply-line"></i> Multiplied by ${factor} for ${socialMedia} on ${date}</p>
            <p><i class="ri-timer-line"></i> Total: ${userData.socialMediaTime[socialMedia].hours.toFixed(1)} hr</p>
        `;
        updateCalcPieChart();
        updateCalcBarChart();
        checkGoals(socialMedia, newHours);
        checkAchievements();
        localStorage.setItem('userData', JSON.stringify(userData));
    } else {
        notifyUser('Enter a multiplication factor greater than 0!');
    }
}

function updateCalcPieChart() {
    const ctx = document.getElementById('calcPieChart').getContext('2d');
    if (calcPieChart) calcPieChart.destroy();

    const labels = Object.keys(userData.socialMediaTime).filter(sm => userData.socialMediaTime[sm].hours > 0);
    const data = labels.map(sm => userData.socialMediaTime[sm].hours);

    calcPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#4a7aa5', 
                    '#6b8eba',
                    '#87a8d0', 
                    '#b3c9e6', 
                    '#d9e4f5', 
                    '#a0b8d6', 
                    '#c2d2e8', 
                    '#e6eef5' 
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#4a5a7a', padding: 20 } }, // Холодний синій для легенди
                tooltip: { callbacks: { label: context => `${context.label}: ${context.raw.toFixed(1)} hr` } }
            },
            animation: { animateScale: true, animateRotate: true, duration: 1500 }
        }
    });
}

function updateCalcBarChart() {
    const ctx = document.getElementById('calcBarChart').getContext('2d');
    if (calcBarChart) calcBarChart.destroy();

    const labels = Object.keys(userData.socialMediaTime);
    const data = labels.map(sm => userData.socialMediaTime[sm].hours);

    calcBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Hours',
                data,
                backgroundColor: '#87a8d0', 
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#6b8eba' 
            }]
        },
        options: {
            responsive: true,
            scales: { 
                y: { beginAtZero: true, grid: { color: '#b3c9e6' } }, 
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { labels: { color: '#4a5a7a' } }, 
                tooltip: { callbacks: { label: context => `${context.label}: ${context.raw.toFixed(1)} hr` } }
            },
            animation: { duration: 2000, easing: 'easeOutBounce' }
        }
    });
}

function toggleCalcChart(type) {
    document.getElementById('calcPieChart').style.display = type === 'pie' ? 'block' : 'none';
    document.getElementById('calcBarChart').style.display = type === 'bar' ? 'block' : 'none';
}

function setGoal() {
    const socialMedia = document.getElementById('goalMedia').value;
    const goalHours = parseFloat(document.getElementById('goalHours').value) || 0;
    userData.goals[socialMedia] = goalHours;
    updateGoals();
    localStorage.setItem('userData', JSON.stringify(userData));
}

function deleteGoal() {
    const socialMedia = document.getElementById('goalMedia').value;
    delete userData.goals[socialMedia];
    updateGoals();
    localStorage.setItem('userData', JSON.stringify(userData));
}

function updateGoals() {
    const goalStatus = document.getElementById('goalStatus');
    goalStatus.innerHTML = '<h3><i class="ri-flag-line"></i> Your Goals</h3>';
    Object.entries(userData.goals).forEach(([sm, limit]) => {
        const used = userData.socialMediaTime[sm].hours / 365;
        const status = used > limit ? 'Exceeded' : 'Within';
        goalStatus.innerHTML += `
            <p><i class="ri-global-line"></i> ${sm}: Limit ${limit} hr/day, Used ${used.toFixed(1)} (${status})</p>
        `;
    });

    const ctx = document.getElementById('goalsChart').getContext('2d');
    if (goalsChart) goalsChart.destroy();

    const labels = Object.keys(userData.goals);
    const usedData = labels.map(sm => userData.socialMediaTime[sm].hours / 365);
    const goalData = labels.map(sm => userData.goals[sm]);

    goalsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Used (hr/day)', data: usedData, backgroundColor: '#6b8eba', borderColor: '#87a8d0', borderWidth: 2 }, // Середній і світло-синій
                { label: 'Limit (hr/day)', data: goalData, backgroundColor: '#4a7aa5', borderColor: '#6b8eba', borderWidth: 2 }  // Темно-синій і середній синій
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, grid: { color: '#b3c9e6' } } }, // Холодний синій для сітки
            plugins: { tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.raw.toFixed(1)} hr` } } },
            animation: { duration: 1500, easing: 'easeInOutQuart' }
        }
    });
}

function checkGoals(socialMedia, hours) {
    if (userData.goals[socialMedia]) {
        const dailyUsed = userData.socialMediaTime[socialMedia].hours / 365;
        if (dailyUsed > userData.goals[socialMedia]) {
            notifyUser(`Attention! You exceeded the limit for ${socialMedia} by ${dailyUsed.toFixed(1)} hours.`);
        }
    }
}

function updateStats(type = 'doughnut') {
    const period = document.getElementById('periodFilter').value;
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';
    const totalHours = Object.values(userData.socialMediaTime).reduce((sum, m) => sum + m.hours, 0);

    Object.entries(userData.socialMediaTime).forEach(([sm, data]) => {
        if (data.hours > 0) {
            const percent = (data.hours / totalHours * 100) || 0;
            statsGrid.innerHTML += `
                <div class="stat-card" onclick="showHistory('${sm}')">
                    <h3><i class="ri-global-line"></i> ${sm}</h3>
                    <p><i class="ri-timer-line"></i> ${data.hours.toFixed(1)} hr</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    if (pieChart) pieChart.destroy();

    const labels = Object.keys(userData.socialMediaTime).filter(sm => userData.socialMediaTime[sm].hours > 0);
    const data = labels.map(sm => userData.socialMediaTime[sm].hours);

    pieChart = new Chart(pieCtx, {
        type: type,
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#4a7aa5', 
                    '#6b8eba', 
                    '#87a8d0', 
                    '#b3c9e6', 
                    '#d9e4f5', 
                    '#a0b8d6', 
                    '#c2d2e8', 
                    '#e6eef5'  
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#4a5a7a' } }, // Холодний синій для легенди
                tooltip: { callbacks: { label: context => `${context.label}: ${context.raw.toFixed(1)} hr` } }
            },
            animation: { duration: 2000, easing: 'easeOutElastic' }
        }
    });
}

function toggleStatsChart(type) {
    updateStats(type);
}

function showHistory(socialMedia) {
    const history = userData.socialMediaTime[socialMedia].history;
    let historyText = `<h3><i class="ri-history-line"></i> History for ${socialMedia}</h3>`;
    history.forEach(entry => {
        historyText += `<p><i class="ri-calendar-line"></i> ${entry.date}: ${entry.hours.toFixed(1)} hr</p>`;
    });
    document.getElementById('statsGrid').innerHTML = historyText + '<button onclick="updateStats()"><i class="ri-arrow-left-line"></i> Back</button>';
}

function showDetailedStats(socialMedia) {
    const data = userData.socialMediaTime[socialMedia];
    alert(`Details for ${socialMedia}:\n- Total: ${data.hours.toFixed(1)} hr\n- Entries: ${data.history.length}\n- Average: ${(data.hours / data.history.length || 0).toFixed(1)} hr/entry`);
}

function updateHabits() {
    const habitsReport = document.getElementById('habitsReport');
    const totalHours = Object.values(userData.socialMediaTime).reduce((sum, m) => sum + m.hours, 0);
    habitsReport.innerHTML = `
        <h3><i class="ri-hotel-line"></i> Habits Analysis</h3>
        <p><i class="ri-timer-line"></i> Total Hours: ${totalHours.toFixed(1)}</p>
        <p><i class="ri-calendar-line"></i> Average Hours per Day: ${(totalHours / 365).toFixed(1)}</p>
        <p><i class="ri-star-line"></i> Most Active Social Media: ${findMostActiveSocialMedia()}</p>
        <button onclick="predictUsage()"><i class="ri-line-chart-line"></i> Predict</button>
    `;

    const habitsCtx = document.getElementById('habitsChart').getContext('2d');
    if (habitsChart) habitsChart.destroy();

    const labels = Object.keys(userData.socialMediaTime).filter(sm => userData.socialMediaTime[sm].hours > 0);
    const data = labels.map(sm => userData.socialMediaTime[sm].hours);

    habitsChart = new Chart(habitsCtx, {
        type: habitsChartType,
        data: {
            labels,
            datasets: [{
                label: 'Hours',
                data,
                backgroundColor: habitsChartType === 'bar' ? '#87a8d0' : [ // Світло-синій для стовпчиків
                    '#4a7aa5', '#6b8eba', '#87a8d0', '#b3c9e6', 
                    '#d9e4f5', '#a0b8d6', '#c2d2e8', '#e6eef5'
                ],
                borderWidth: 2,
                borderColor: habitsChartType === 'bar' ? '#6b8eba' : '#ffffff', // Темніший синій для межі стовпчиків
                tension: habitsChartType === 'line' ? 0.4 : 0
            }]
        },
        options: {
            responsive: true,
            scales: habitsChartType === 'bar' || habitsChartType === 'line' ? { 
                y: { beginAtZero: true, grid: { color: '#b3c9e6' } } // Холодний синій для сітки
            } : {},
            plugins: { 
                tooltip: { callbacks: { label: context => `${context.label}: ${context.raw.toFixed(1)} hr` } }
            },
            animation: { duration: 2000, easing: 'easeOutBack' }
        }
    });
}

function toggleHabitsChartType(type) {
    habitsChartType = type;
    updateHabits();
}

function predictUsage() {
    const totalHours = Object.values(userData.socialMediaTime).reduce((sum, m) => sum + m.hours, 0);
    const prediction = (totalHours / 365) * 30;
    notifyUser(`Usage Prediction for Next 30 Days: ${prediction.toFixed(1)} hours`);
}

function findMostActiveSocialMedia() {
    return Object.entries(userData.socialMediaTime).reduce((max, [sm, data]) => 
        data.hours > max[1].hours ? [sm, data] : max, ['', { hours: 0 }])[0];
}

function showAdvice() {
    const totalHours = Object.values(userData.socialMediaTime).reduce((sum, m) => sum + m.hours, 0);
    const dailyAverage = totalHours / 365;
    let advice = '';
    if (dailyAverage > 3) advice = 'You spend a lot of time on social media. Try reducing it to 2 hours a day.';
    else if (dailyAverage > 1) advice = 'Not bad, but consider replacing 30 minutes with active rest.';
    else advice = 'Great! You maintain a perfect balance.';

    document.getElementById('adviceContent').innerHTML = `
        <h2><i class="ri-lightbulb-line"></i> Advice</h2>
        <p>${advice}</p>
        <p><i class="ri-timer-line"></i> Average Hours per Day: ${dailyAverage.toFixed(1)}</p>
    `;
}

function generateDetailedAdvice() {
    const mostActive = findMostActiveSocialMedia();
    const totalHours = userData.socialMediaTime[mostActive].hours;
    notifyUser(`Detailed Advice:\n- Most Active Social Media: ${mostActive} (${totalHours.toFixed(1)} hr).\n- Reduce its usage by 20%.\n- Set a goal in the "Goals" tab.`);
}

function shareAdvice() {
    const totalHours = Object.values(userData.socialMediaTime).reduce((sum, m) => sum + m.hours, 0);
    const dailyAverage = totalHours / 365;
    const text = `My average social media time: ${dailyAverage.toFixed(1)} hr/day! Check yours with the Futuristic Time Calculator!`;
    if (navigator.share) {
        navigator.share({ title: 'My Habits', text, url: window.location.href })
            .catch(err => console.error('Share error:', err));
    } else {
        alert('Share manually: ' + text);
    }
}

function saveProfile() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const bio = document.getElementById('bio').value;

    const profileData = { username, email, bio };
    localStorage.setItem('profileData', JSON.stringify(profileData));
    document.getElementById('profileStatus').innerHTML = '<p><i class="ri-save-line"></i> Changes saved!</p>';
    checkAchievements();
}

function loadProfile() {
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    document.getElementById('username').value = profileData.username || '';
    document.getElementById('email').value = profileData.email || '';
    document.getElementById('bio').value = profileData.bio || '';
    document.getElementById('profileStatus').innerHTML = userData.achievements.length > 0 ? 
        `<p><i class="ri-trophy-line"></i> Achievements: ${userData.achievements.length}</p>` : '';
}

function clearProfile() {
    localStorage.removeItem('profileData');
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('bio').value = '';
    document.getElementById('profileStatus').innerHTML = '<p><i class="ri-eraser-line"></i> Profile cleared!</p>';
}

function showAchievements() {
    const achievementsList = userData.achievements.map(a => `<p><i class="ri-trophy-line"></i> ${a}</p>`).join('');
    document.getElementById('profileStatus').innerHTML = `
        <h3><i class="ri-trophy-line"></i> Achievements</h3>
        ${achievementsList || '<p>No achievements yet!</p>'}
    `;
}

function checkAchievements() {
    const totalHours = Object.values(userData.socialMediaTime).reduce((sum, m) => sum + m.hours, 0);
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    if (totalHours > 100 && !userData.achievements.includes('100 Hours on Social Media')) {
        userData.achievements.push('100 Hours on Social Media');
        notifyUser('New Achievement: 100 Hours on Social Media!');
    }
    if (profileData.username && !userData.achievements.includes('Profile Completed')) {
        userData.achievements.push('Profile Completed');
        notifyUser('New Achievement: Profile Completed!');
    }
    localStorage.setItem('userData', JSON.stringify(userData));
}

function applySettings() {
    const fontSize = document.getElementById('fontSize').value;
    const notifications = document.getElementById('notifications').value;
    document.body.style.fontSize = fontSize;
    localStorage.setItem('settings', JSON.stringify({ 
        fontSize, 
        theme: document.getElementById('theme').value, 
        notifications 
    }));
}

function applyTheme() {
    const theme = document.getElementById('theme').value;
    if (theme === 'dark') {
        document.body.style.background = 'linear-gradient(135deg, #2a3d5e, #1a2c4a)'; 
        document.body.style.color = '#ffffff';
        document.querySelector('.container').style.background = 'rgba(42, 61, 94, 0.9)';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #d9e4f5, #b3c9e6)';
        document.body.style.color = '#4a5a7a';
        document.querySelector('.container').style.background = 'rgba(255, 255, 255, 0.97)';
    }
    updateAllCharts();
    localStorage.setItem('settings', JSON.stringify({ 
        fontSize: document.getElementById('fontSize').value, 
        theme, 
        notifications: document.getElementById('notifications').value 
    }));
}

function resetData() {
    if (confirm('Reset all data?')) {
        userData = {
            socialMediaTime: {
                instagram: { hours: 0, history: [] },
                tiktok: { hours: 0, history: [] },
                twitter: { hours: 0, history: [] },
                telegram: { hours: 0, history: [] },
                facebook: { hours: 0, history: [] },
                youtube: { hours: 0, history: [] },
                linkedin: { hours: 0, history: [] },
                snapchat: { hours: 0, history: [] }
            },
            goals: {},
            achievements: userData.achievements
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        updateAllCharts();
        showAdvice();
        updateGoals();
    }
}

function exportData() {
    const dataStr = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time_calculator_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            userData = JSON.parse(event.target.result);
            localStorage.setItem('userData', JSON.stringify(userData));
            updateAllCharts();
            showAdvice();
            updateGoals();
            loadProfile();
            notifyUser('Data imported successfully!');
        };
        reader.readAsText(file);
    };
    input.click();
}

function notifyUser(message) {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    if (settings.notifications !== 'off') {
        alert(message);
    }
}

function updateAllCharts() {
    updateCalcPieChart();
    updateCalcBarChart();
    updateStats();
    updateHabits();
    updateGoals();
}

// Load data
if (localStorage.getItem('userData')) {
    userData = JSON.parse(localStorage.getItem('userData'));
}
if (localStorage.getItem('settings')) {
    const settings = JSON.parse(localStorage.getItem('settings'));
    document.getElementById('fontSize').value = settings.fontSize || '16px';
    document.getElementById('theme').value = settings.theme || 'light';
    document.getElementById('notifications').value = settings.notifications || 'on';
    applySettings();
    applyTheme();
}

loadProfile();
updateAllCharts();