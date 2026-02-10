// UI Rendering and Updates Module
class UIManager {
    constructor(taskManager, scheduleManager, subjectManager, timerManager, dataManager) {
        this.taskManager = taskManager;
        this.scheduleManager = scheduleManager;
        this.subjectManager = subjectManager;
        this.timerManager = timerManager;
        this.dataManager = dataManager;
        this.currentWeek = new Date();
    }

    updateStats() {
        const stats = this.taskManager.getTaskStats();
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('studyStreak').textContent = this.dataManager.studyStreak;
        document.getElementById('pomodoroCount').textContent = this.dataManager.pomodoroCount;
    }

    renderDashboard() {
        this.renderTodaySchedule();
        this.renderUpcomingTasks();
        this.renderProgressCircle();
    }

    renderTodaySchedule() {
        const todaySchedules = this.scheduleManager.getTodaySchedules();
        const container = document.getElementById('todaySchedule');

        if (todaySchedules.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No schedules for today</p>';
            return;
        }

        container.innerHTML = todaySchedules.map(schedule => `
            <div class="schedule-item">
                <strong>${schedule.title}</strong>
                <div>${schedule.startTime} - ${schedule.endTime}</div>
                <div style="font-size: 0.9em; opacity: 0.8;">${schedule.subject}</div>
            </div>
        `).join('');
    }

    renderUpcomingTasks() {
        const upcomingTasks = this.taskManager.getUpcomingTasks(5);
        const container = document.getElementById('upcomingTasks');

        if (upcomingTasks.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No upcoming tasks</p>';
            return;
        }

        container.innerHTML = upcomingTasks.map(task => `
            <div class="task-item" onclick="completeTask(${task.id})">
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>${task.subject}</span>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderProgressCircle() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50;
        const stats = this.taskManager.getTaskStats();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e1e5e9';
        ctx.lineWidth = 8;
        ctx.stroke();

        if (stats.percentage > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * stats.percentage / 100));
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 8;
            ctx.stroke();
        }

        document.getElementById('progressPercentage').textContent = Math.round(stats.percentage) + '%';
    }

    renderTasks() {
        const container = document.getElementById('taskList');
        const filters = {
            subject: document.getElementById('filterSubject').value,
            status: document.getElementById('filterStatus').value,
            priority: document.getElementById('filterPriority').value
        };
        const filteredTasks = this.taskManager.getFilteredTasks(filters);

        if (filteredTasks.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No tasks found</p>';
            return;
        }

        container.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.status}">
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>${task.subject}</span>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                        <span>Status: ${task.status}</span>
                    </div>
                    ${task.description ? `<p style="margin-top: 8px; color: #666;">${task.description}</p>` : ''}
                </div>
                <div class="task-actions">
                    ${task.status !== 'completed' ? `<button class="btn-complete" onclick="completeTask(${task.id})">Complete</button>` : ''}
                    <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderWeeklyCalendar() {
        const container = document.getElementById('weeklyCalendar');
        const startOfWeek = this.getStartOfWeek(this.currentWeek);
        const weekText = `${startOfWeek.toLocaleDateString()} - ${new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
        
        document.getElementById('currentWeek').textContent = weekText;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let html = '';

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000);
            const daySchedules = this.scheduleManager.getSchedulesByDate(day);

            html += `
                <div class="day-column">
                    <div class="day-header">
                        ${days[i]}<br>
                        ${day.getDate()}
                    </div>
                    ${daySchedules.map(schedule => `
                        <div class="schedule-item" onclick="editSchedule(${schedule.id})">
                            <div>${schedule.title}</div>
                            <div>${schedule.startTime}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    getStartOfWeek(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day;
        return new Date(start.setDate(diff));
    }

    renderSubjects() {
        const container = document.getElementById('subjectsList');
        container.innerHTML = '';

        this.subjectManager.subjects.forEach(subject => {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';
            subjectCard.innerHTML = `
                <div class="subject-header" style="border-left: 4px solid ${subject.color}">
                    <div class="subject-info">
                        <h3>${subject.name}</h3>
                        <span class="subject-code">${subject.code}</span>
                        <span class="priority-badge priority-${subject.priority}">${subject.priority}</span>
                    </div>
                    <div class="subject-actions">
                        <button onclick="studyPlanner.editSubject(${subject.id})" class="btn-icon" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="studyPlanner.deleteSubject(${subject.id})" class="btn-icon btn-danger" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="subject-description">${subject.description}</p>
                <div class="subject-stats">
                    <div class="stat">
                        <span class="stat-label">Target Hours/Week:</span>
                        <span class="stat-value">${subject.targetHours}h</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Tasks:</span>
                        <span class="stat-value">${this.taskManager.getSubjectTaskCount(subject.name)}</span>
                    </div>
                </div>
            `;
            container.appendChild(subjectCard);
        });
    }

    updateSubjectDropdowns() {
        const dropdowns = ['quickSubject', 'taskSubject', 'scheduleSubject', 'filterSubject'];
        
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;

            const selectedValue = dropdown.value;
            dropdown.innerHTML = '';
            
            if (dropdownId === 'filterSubject') {
                dropdown.innerHTML = '<option value="all">All Subjects</option>';
            }

            this.subjectManager.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.name;
                option.textContent = subject.name;
                dropdown.appendChild(option);
            });

            dropdown.value = selectedValue;
        });
    }

    renderProgressCharts() {
        this.renderWeeklyChart();
        this.renderSubjectChart();
        this.updateMetrics();
    }

    renderWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = days.map(() => Math.floor(Math.random() * 8) + 1);

        const barWidth = 30;
        const spacing = 10;
        const maxValue = Math.max(...data);

        data.forEach((value, index) => {
            const x = index * (barWidth + spacing) + spacing;
            const height = (value / maxValue) * 120;
            const y = 150 - height;

            ctx.fillStyle = '#667eea';
            ctx.fillRect(x, y, barWidth, height);

            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(days[index], x + barWidth / 2, 170);
            ctx.fillText(value + 'h', x + barWidth / 2, y - 5);
        });
    }

    renderSubjectChart() {
        const canvas = document.getElementById('subjectChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const subjects = {};
        this.taskManager.tasks.forEach(task => {
            subjects[task.subject] = (subjects[task.subject] || 0) + 1;
        });

        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        const total = Object.values(subjects).reduce((sum, count) => sum + count, 0);

        let startAngle = 0;
        Object.entries(subjects).forEach(([subject, count], index) => {
            const sliceAngle = (count / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            startAngle += sliceAngle;
        });
    }

    updateMetrics() {
        const totalHours = this.taskManager.tasks.reduce((sum, task) => sum + (task.estimatedTime || 1), 0);
        const avgStudyTime = this.taskManager.tasks.length > 0 ? (totalHours / 7).toFixed(1) : 0;
        const focusScore = Math.floor(Math.random() * 30) + 70;
        const tasksPerDay = this.taskManager.tasks.length > 0 ? (this.taskManager.tasks.length / 7).toFixed(1) : 0;

        document.getElementById('avgStudyTime').textContent = avgStudyTime + 'h';
        document.getElementById('focusScore').textContent = focusScore + '%';
        document.getElementById('tasksPerDay').textContent = tasksPerDay;
    }

    updateTimerDisplay() {
        document.getElementById('timerTime').textContent = this.timerManager.getTimeDisplay();
        document.getElementById('timerMode').textContent = this.timerManager.getModeDisplay();
        this.updateTodayStudyTime();
        this.drawTimerCircle();
    }

    drawTimerCircle() {
        const canvas = document.getElementById('timerCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const progress = this.timerManager.getProgress();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e1e5e9';
        ctx.lineWidth = 8;
        ctx.stroke();

        if (progress > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * progress));
            ctx.strokeStyle = this.timerManager.timerState.mode === 'focus' ? '#667eea' : '#4caf50';
            ctx.lineWidth = 8;
            ctx.stroke();
        }
    }

    updateTodayStudyTime() {
        const { hours, minutes } = this.timerManager.getTodayStudyTime();
        document.getElementById('todayStudyTime').textContent = `${hours}h ${minutes}m`;
    }
}
