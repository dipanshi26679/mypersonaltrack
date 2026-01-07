let monthlyChart;
const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let selectedDate = 8; // Dipanshi, To-Do starts 8th Jan

const routines = [
    "Wakeup (7:00 AM)", "Pre-workout Meal (7:30 - 8:00)AM", "Workout (8:00 - 8:35)AM",
    "Bath & Refresh (8:35 - 8:50)AM", "Breakfast (8:50 - 9:15)AM", "Crochet (9:15 - 9:30)AM",
    "STUDY SLOT 1 (9:30 - 11:15)AM", "Mid-Morning Snack (11:15 - 11:30)AM", "STUDY SLOT 2 (11:30AM - 1:30PM)",
    "Lunch (1:30 - 2:30)PM", "Rest & Nap (2:30 - 3:30)PM", "Pre-Evening Snack (3:30 - 4:00)PM",
    "STUDY SLOT 3 (4:00 - 5:30)PM", "Crochet/Walk (5:30 - 6:00)PM", "STUDY SLOT 4 (6:00 - 7:30)PM", 
    "Dinner (7:30 - 8:30)PM", "RIVISION (8:40 - 10:00)PM", "Schedule Next Day (10:00-10:30)PM", "Sleep (11:00 PM)"
];

const classSlots = ["STUDY SLOT 1", "Mid-Morning Snack", "STUDY SLOT 2", "Lunch", "Rest & Nap", "Pre-Evening Snack", "STUDY SLOT 3", "Crochet/Walk", "STUDY SLOT 4"];

function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + '-page').classList.add('active');
    document.getElementById('btn-' + tab).classList.add('active');
    if(tab === 'todo') renderSidebar();
}

function renderRoutine() {
    const mIdx = parseInt(document.getElementById('month-picker').value);
    const startDay = (mIdx === 0) ? 8 : 1; 
    const daysCount = monthDays[mIdx];

    document.getElementById('table-head').innerHTML = '<th>Tasks</th>' + 
        Array.from({length: daysCount - startDay + 1}, (_, i) => {
            const d = i + startDay;
            return `<th>${d}<br><small>${dayNames[new Date(2026, mIdx, d).getDay()]}</small></th>`;
        }).join('');

    document.getElementById('table-body').innerHTML = routines.map(task => {
        let row = `<tr><td>${task}</td>`;
        for (let d = startDay; d <= daysCount; d++) {
            const isMWF = [1, 3, 5].includes(new Date(2026, mIdx, d).getDay());
            const key = `lt26-m${mIdx}-d${d}-${task.replace(/\s/g, '')}`;
            const checked = localStorage.getItem(key) === 'true' ? 'checked' : '';
            let content = `<input type="checkbox" data-day="${d}" onchange="track('${key}', this)" ${checked}>`;
            if (isMWF && classSlots.some(s => task.includes(s))) content = `<span style="font-size:9px; color:#4e5561">CLASS</span>`;
            row += `<td>${content}</td>`;
        }
        return row + '</tr>';
    }).join('');
    calculateScores();
}

function track(k, el) { localStorage.setItem(k, el.checked); calculateScores(); updateChart(); }

function calculateScores() {
    const mIdx = parseInt(document.getElementById('month-picker').value);
    const startDay = (mIdx === 0) ? 8 : 1;
    let footHtml = '<td>Score %</td>';
    for (let d = startDay; d <= monthDays[mIdx]; d++) {
        const boxes = document.querySelectorAll(`input[data-day="${d}"]`);
        const checked = Array.from(boxes).filter(b => b.checked).length;
        const score = boxes.length > 0 ? Math.round((checked / boxes.length) * 100) : 0;
        footHtml += `<td>${score}%</td>`;
    }
    document.getElementById('table-foot').innerHTML = footHtml;
}

function renderSidebar() {
    const mIdx = document.getElementById('month-picker').value;
    const sDay = (mIdx == 0) ? 8 : 1;
    const sidebar = document.getElementById('date-list');
    let html = '';
    for(let i = sDay; i <= monthDays[mIdx]; i++) {
        html += `<div class="date-item ${i === selectedDate ? 'active' : ''}" onclick="selectDate(${i})">
            ${monthLabels[mIdx]} ${i}, 2026
        </div>`;
    }
    sidebar.innerHTML = html;
    renderTodos();
}

function selectDate(d) { selectedDate = d; renderSidebar(); }

function addTodo() {
    const input = document.getElementById('todo-input');
    const mIdx = document.getElementById('month-picker').value;
    if (!input.value.trim()) return;
    const key = `todo-v4-m${mIdx}-d${selectedDate}`;
    let list = JSON.parse(localStorage.getItem(key)) || [];
    list.push({ id: Date.now(), text: input.value, done: false });
    localStorage.setItem(key, JSON.stringify(list));
    input.value = '';
    renderTodos();
}

function renderTodos() {
    const mIdx = document.getElementById('month-picker').value;
    document.getElementById('current-todo-title').innerText = `${monthLabels[mIdx]} ${selectedDate} History`;
    const key = `todo-v4-m${mIdx}-d${selectedDate}`;
    const list = JSON.parse(localStorage.getItem(key)) || [];
    document.getElementById('todo-list').innerHTML = list.map(t => `
        <li class="todo-item">
            <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo(${t.id})">
            <span style="${t.done ? 'text-decoration:line-through; opacity:0.4' : ''}">${t.text}</span>
            <span class="delete-btn" onclick="deleteTodo(${t.id})">×</span>
        </li>`).join('') || '<p style="text-align:center; opacity:0.2;">No History Available</p>';
}

function toggleTodo(id) {
    const key = `todo-v4-m${document.getElementById('month-picker').value}-d${selectedDate}`;
    let list = JSON.parse(localStorage.getItem(key)).map(t => t.id === id ? {...t, done: !t.done} : t);
    localStorage.setItem(key, JSON.stringify(list));
    renderTodos();
}

function deleteTodo(id) {
    const key = `todo-v4-m${document.getElementById('month-picker').value}-d${selectedDate}`;
    let list = JSON.parse(localStorage.getItem(key)).filter(t => t.id !== id);
    localStorage.setItem(key, JSON.stringify(list));
    renderTodos();
}

function initChart() {
    const ctx = document.getElementById('monthlyBarChart').getContext('2d');
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: monthLabels, datasets: [{ data: Array(12).fill(0), backgroundColor: '#00ff88', borderRadius: 5 }] },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }
    });
    updateChart();
}

function updateChart() {
    const averages = monthLabels.map((_, m) => {
        let done = 0, total = 0;
        const sDay = (m === 0) ? 8 : 1;
        routines.forEach(t => {
            for (let d = sDay; d <= monthDays[m]; d++) {
                const key = `lt26-m${m}-d${d}-${t.replace(/\s/g, '')}`;
                const isMWF = [1, 3, 5].includes(new Date(2026, m, d).getDay());
                if (!(isMWF && classSlots.some(s => t.includes(s)))) {
                    total++;
                    if (localStorage.getItem(key) === 'true') done++;
                }
            }
        });
        return total > 0 ? Math.round((done / total) * 100) : 0;
    });
    if (monthlyChart) { monthlyChart.data.datasets[0].data = averages; monthlyChart.update(); }
}

document.getElementById('month-picker').addEventListener('change', () => { 
    selectedDate = (document.getElementById('month-picker').value == 0) ? 8 : 1;
    renderRoutine(); renderSidebar(); updateChart();
});

window.onload = () => { renderRoutine(); initChart(); };
