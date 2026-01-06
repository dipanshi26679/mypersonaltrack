let monthlyChart;
const monthDays = [31, 28, 31, 30, 31, 30]; // Jan - June
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- MONTHLY ROUTINES CONFIGURATION ---
// Aap yahan har mahine ka schedule alag se change kar sakte hain
const routines = {
    0: [ // JANUARY SCHEDULE
        "Wakeup (6:00 AM)", "Pre-workout prep (6:30 - 7:00)AM", "Workout (7:00 - 7:35)AM",
        "Bath & Refresh (7:35 - 7:50)AM", "Breakfast (7:50 - 8:15)AM", "Crochet (8:15 - 8:30)AM",
        "STUDY SLOT 1 (8:30 - 10:15)AM", "Tea break (10:15 - 10:30)AM", "Revision (10:30 - 12:30)AM",
        "Lunch (12:30 - 1:00)", "Rest & Nap (1:00 - 3:30)", "Crochet Refresh (3:30 - 4:00)",
        "STUDY SLOT 2 (4:00 - 5:15)", "Crochet/Walk (5:15 - 5:30)", "Free Time (5:30 - 7:30)",
        "STUDY SLOT 3 (7:30 - 8:00)", "Dinner (8:00 - 8:30)", "Sleep (10:00 PM)"
    ],
    1: [ // FEBRUARY SCHEDULE (Example Change)
        "Wakeup (5:45 AM)", "Morning Yoga", "Workout", "Breakfast", "Intense Study Slot",
        "Lunch", "Project Work", "Free Time", "Dinner", "Sleep"
    ]
    // Baaki months ke liye aap 2: [], 3: [] karke add kar sakte hain. 
    // Agar koi month nahi likhenge, toh wo January wala default use karega.
};

function initChart() {
    const ctx = document.getElementById('monthlyBarChart').getContext('2d');
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: '#00ff88',
                borderRadius: 5,
                barThickness: 22
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true, max: 100,
                    ticks: { color: '#94a3b8', stepSize: 20, callback: v => v + '%' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' } 
                },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
    updateMonthlyAverages();
}

function render() {
    const mIdx = parseInt(document.getElementById('month-picker').value);
    const startDay = (mIdx === 0) ? 7 : 1;
    const daysCount = monthDays[mIdx];
    
    // Current Month ki routine select karein (Default to Jan if not defined)
    const currentRoutine = routines[mIdx] || routines[0];
    
    document.getElementById('table-head').innerHTML = '<th>Routine Item</th>' + 
        Array.from({length: daysCount - startDay + 1}, (_, i) => {
            const d = i + startDay;
            return `<th>${d}<br><small>${dayNames[new Date(2026, mIdx, d).getDay()]}</small></th>`;
        }).join('');

    let bodyHtml = '';
    currentRoutine.forEach(task => {
        bodyHtml += `<tr><td>${task}</td>`;
        for (let d = startDay; d <= daysCount; d++) {
            const dateObj = new Date(2026, mIdx, d);
            const isMWF = [1, 3, 5].includes(dateObj.getDay());
            // Unique key for storage based on month and task name
            const key = `gp26-m${mIdx}-d${d}-${task.replace(/\s/g, '')}`;
            const checked = localStorage.getItem(key) === 'true' ? 'checked' : '';
            
            let content = `<input type="checkbox" data-day="${d}" onchange="track('${key}', this)" ${checked}>`;
            
            // MWF Class Logic for January Routine
            const classSlots = ["Tea break", "Revision", "Lunch", "Rest & Nap", "Crochet Refresh", "STUDY SLOT 2", "Crochet/Walk", "Free Time"];
            if (mIdx === 0 && isMWF && classSlots.some(s => task.includes(s))) {
                content = `<span style="font-size:9px; color:#4e5561">CLASS</span>`;
            }
            
            bodyHtml += `<td>${content}</td>`;
        }
        bodyHtml += '</tr>';
    });
    document.getElementById('table-body').innerHTML = bodyHtml;

    let footHtml = '<td>Daily Score %</td>';
    for (let d = startDay; d <= daysCount; d++) footHtml += `<td id="score-${d}">0%</td>`;
    document.getElementById('table-foot').innerHTML = footHtml;

    calculateDailyScores();
}

function track(key, el) {
    localStorage.setItem(key, el.checked);
    calculateDailyScores();
    updateMonthlyAverages();
}

function calculateDailyScores() {
    const mIdx = parseInt(document.getElementById('month-picker').value);
    const startDay = (mIdx === 0) ? 7 : 1;
    for (let d = startDay; d <= monthDays[mIdx]; d++) {
        const boxes = document.querySelectorAll(`input[data-day="${d}"]`);
        const checked = Array.from(boxes).filter(b => b.checked).length;
        const score = boxes.length > 0 ? Math.round((checked / boxes.length) * 100) : 0;
        const cell = document.getElementById(`score-${d}`);
        if (cell) cell.innerText = score + "%";
    }
}

function updateMonthlyAverages() {
    const averages = monthLabels.map((_, m) => {
        let done = 0, total = 0;
        const sDay = (m === 0) ? 7 : 1;
        const monthRoutine = routines[m] || routines[0];
        
        for (let d = sDay; d <= monthDays[m]; d++) {
            monthRoutine.forEach(t => {
                const dateObj = new Date(2026, m, d);
                const isMWF = [1, 3, 5].includes(dateObj.getDay());
                const classSlots = ["Tea break", "Revision", "Lunch", "Rest & Nap", "Crochet Refresh", "STUDY SLOT 2", "Crochet/Walk", "Free Time"];
                
                if (!(m === 0 && isMWF && classSlots.some(s => t.includes(s)))) {
                    total++;
                    if (localStorage.getItem(`gp26-m${m}-d${d}-${t.replace(/\s/g, '')}`) === 'true') done++;
                }
            });
        }
        return total > 0 ? Math.round((done / total) * 100) : 0;
    });
    monthlyChart.data.datasets[0].data = averages;
    monthlyChart.update();
}

document.getElementById('month-picker').addEventListener('change', render);
window.onload = () => { initChart(); render(); };