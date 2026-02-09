class StudyPlanner {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        this.subjects = JSON.parse(localStorage.getItem('subjects')) || this.getDefaultSubjects();
        this.settings = JSON.parse(localStorage.getItem('settings')) || this.getDefaultSettings();
        this.currentWeek = new Date();
        this.timerState = {
            time: 25 * 60,
            isRunning: false,
            mode: 'focus',
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15
        };
        this.pomodoroCount = parseInt(localStorage.getItem('pomodoroCount')) || 0;
        this.studyStreak = parseInt(localStorage.getItem('studyStreak')) || 0;
        this.init();
    }

    init() {
        this.updateStats();
        this.renderDashboard();
        this.renderTasks();
        this.renderWeeklyCalendar();
        this.renderProgressCharts();
        this.renderSubjects();
        this.initTimer();
        this.setupEventListeners();
        this.checkDailyStreak();
        this.applyTheme();
        this.initializeSettings();
        this.updateSubjectDropdowns();
        this.checkDeadlineAlerts();
        
        // Set up periodic deadline checking every 30 minutes
        setInterval(() => {
            this.checkDeadlineAlerts();
        }, 30 * 60 * 1000);
    }

    getDefaultSubjects() {
        return [
            { id: 1, name: 'Mathematics', code: 'MATH', priority: 'high', color: '#ef4444', description: 'Mathematics and related topics', targetHours: 8, createdAt: new Date().toISOString() },
            { id: 2, name: 'Science', code: 'SCI', priority: 'high', color: '#22c55e', description: 'Science subjects', targetHours: 6, createdAt: new Date().toISOString() },
            { id: 3, name: 'English', code: 'ENG', priority: 'medium', color: '#3b82f6', description: 'English language and literature', targetHours: 4, createdAt: new Date().toISOString() },
            { id: 4, name: 'History', code: 'HIST', priority: 'medium', color: '#f59e0b', description: 'History and social studies', targetHours: 3, createdAt: new Date().toISOString() },
            { id: 5, name: 'Programming', code: 'PROG', priority: 'high', color: '#8b5cf6', description: 'Computer programming and coding', targetHours: 10, createdAt: new Date().toISOString() }
        ];
    }

    getDefaultSettings() {
        return {
            theme: 'dark',
            accentColor: '#3b82f6',
            enableNotifications: true,
            alertTime: 30,
            defaultStudyTime: 25,
            weekStart: 1
        };
    }

    setupEventListeners() {
        document.getElementById('quickTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addQuickTask();
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSchedule();
        });

        document.getElementById('subjectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubject();
        });
    }

    // Subject Management Methods
    renderSubjects() {
        const container = document.getElementById('subjectsList');
        container.innerHTML = '';

        this.subjects.forEach(subject => {
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
                        <span class="stat-value">${this.getSubjectTaskCount(subject.name)}</span>
                    </div>
                </div>
            `;
            container.appendChild(subjectCard);
        });
    }

    getSubjectTaskCount(subjectName) {
        return this.tasks.filter(task => task.subject === subjectName).length;
    }

    addSubject() {
        const name = document.getElementById('subjectName').value.trim();
        const code = document.getElementById('subjectCode').value.trim();
        const priority = document.getElementById('subjectPriority').value;
        const color = document.getElementById('subjectColor').value;
        const description = document.getElementById('subjectDescription').value.trim();
        const targetHours = parseInt(document.getElementById('subjectTargetHours').value);

        if (!name) return;

        const subject = {
            id: Date.now(),
            name,
            code: code || name.substring(0, 4).toUpperCase(),
            priority,
            color,
            description,
            targetHours,
            createdAt: new Date().toISOString()
        };

        this.subjects.push(subject);
        this.saveData();
        this.renderSubjects();
        this.updateSubjectDropdowns();
        this.closeSubjectModal();
    }

    editSubject(id) {
        const subject = this.subjects.find(s => s.id === id);
        if (!subject) return;

        document.getElementById('subjectName').value = subject.name;
        document.getElementById('subjectCode').value = subject.code;
        document.getElementById('subjectPriority').value = subject.priority;
        document.getElementById('subjectColor').value = subject.color;
        document.getElementById('subjectDescription').value = subject.description;
        document.getElementById('subjectTargetHours').value = subject.targetHours;

        document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
        document.getElementById('subjectModal').style.display = 'block';

        document.getElementById('subjectForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateSubject(id);
        };
    }

    updateSubject(id) {
        const index = this.subjects.findIndex(s => s.id === id);
        if (index === -1) return;

        this.subjects[index] = {
            ...this.subjects[index],
            name: document.getElementById('subjectName').value.trim(),
            code: document.getElementById('subjectCode').value.trim(),
            priority: document.getElementById('subjectPriority').value,
            color: document.getElementById('subjectColor').value,
            description: document.getElementById('subjectDescription').value.trim(),
            targetHours: parseInt(document.getElementById('subjectTargetHours').value)
        };

        this.saveData();
        this.renderSubjects();
        this.updateSubjectDropdowns();
        this.closeSubjectModal();
    }

    deleteSubject(id) {
        if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) return;

        this.subjects = this.subjects.filter(s => s.id !== id);
        this.saveData();
        this.renderSubjects();
        this.updateSubjectDropdowns();
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

            this.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.name;
                option.textContent = subject.name;
                dropdown.appendChild(option);
            });

            dropdown.value = selectedValue;
        });
    }

    addQuickTask() {
        const title = document.getElementById('quickTaskInput').value.trim();
        const subject = document.getElementById('quickSubject').value;
        const priority = document.getElementById('quickPriority').value;

        if (!title) return;

        const task = {
            id: Date.now(),
            title,
            subject,
            priority,
            status: 'pending',
            createdAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        this.tasks.push(task);
        this.saveData();
        this.updateStats();
        this.renderDashboard();
        this.renderTasks();

        document.getElementById('quickTaskInput').value = '';
    }

    addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const subject = document.getElementById('taskSubject').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const estimatedTime = document.getElementById('taskEstimatedTime').value;

        if (!title) return;

        const task = {
            id: Date.now(),
            title,
            description,
            subject,
            priority,
            status: 'pending',
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            estimatedTime: estimatedTime || 1,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveData();
        this.updateStats();
        this.renderDashboard();
        this.renderTasks();
        this.closeTaskModal();
    }

    addSchedule() {
        const title = document.getElementById('scheduleTitle').value.trim();
        const date = document.getElementById('scheduleDate').value;
        const subject = document.getElementById('scheduleSubject').value;
        const startTime = document.getElementById('scheduleStartTime').value;
        const endTime = document.getElementById('scheduleEndTime').value;
        const notes = document.getElementById('scheduleNotes').value.trim();

        if (!title || !date || !startTime || !endTime) return;

        const schedule = {
            id: Date.now(),
            title,
            date,
            subject,
            startTime,
            endTime,
            notes
        };

        // Check for conflicts
        if (this.checkScheduleConflict(schedule)) {
            if (!confirm('This schedule conflicts with an existing one. Do you want to add it anyway?')) {
                return;
            }
        }

        this.schedules.push(schedule);
        this.saveData();
        this.renderWeeklyCalendar();
        this.renderDashboard();
        this.closeScheduleModal();
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('studyStreak').textContent = this.studyStreak;
        document.getElementById('pomodoroCount').textContent = this.pomodoroCount;
    }

    renderDashboard() {
        this.renderTodaySchedule();
        this.renderUpcomingTasks();
        this.renderProgressCircle();
    }

    renderTodaySchedule() {
        const today = new Date().toISOString().split('T')[0];
        const todaySchedules = this.schedules.filter(schedule => schedule.date === today);
        const container = document.getElementById('todaySchedule');

        if (todaySchedules.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No schedules for today</p>';
            return;
        }

        container.innerHTML = todaySchedules
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(schedule => `
                <div class="schedule-item">
                    <strong>${schedule.title}</strong>
                    <div>${schedule.startTime} - ${schedule.endTime}</div>
                    <div style="font-size: 0.9em; opacity: 0.8;">${schedule.subject}</div>
                </div>
            `).join('');
    }

    renderUpcomingTasks() {
        const upcomingTasks = this.tasks
            .filter(task => task.status === 'pending')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

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

        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = this.tasks.length;
        const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e1e5e9';
        ctx.lineWidth = 8;
        ctx.stroke();

        if (percentage > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * percentage / 100));
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 8;
            ctx.stroke();
        }

        document.getElementById('progressPercentage').textContent = Math.round(percentage) + '%';
    }

    renderTasks() {
        const container = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

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

    getFilteredTasks() {
        let filtered = [...this.tasks];

        const subjectFilter = document.getElementById('filterSubject').value;
        const statusFilter = document.getElementById('filterStatus').value;
        const priorityFilter = document.getElementById('filterPriority').value;

        if (subjectFilter !== 'all') {
            filtered = filtered.filter(task => task.subject === subjectFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        if (priorityFilter !== 'all') {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }

        return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
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
            const dayString = day.toISOString().split('T')[0];
            const daySchedules = this.schedules.filter(schedule => schedule.date === dayString);

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
        this.tasks.forEach(task => {
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
        const totalHours = this.tasks.reduce((sum, task) => sum + (task.estimatedTime || 1), 0);
        const avgStudyTime = this.tasks.length > 0 ? (totalHours / 7).toFixed(1) : 0;
        const focusScore = Math.floor(Math.random() * 30) + 70;
        const tasksPerDay = this.tasks.length > 0 ? (this.tasks.length / 7).toFixed(1) : 0;

        document.getElementById('avgStudyTime').textContent = avgStudyTime + 'h';
        document.getElementById('focusScore').textContent = focusScore + '%';
        document.getElementById('tasksPerDay').textContent = tasksPerDay;
    }

    initTimer() {
        this.updateTimerDisplay();
        this.drawTimerCircle();
    }

    startTimer() {
        if (!this.timerState.isRunning) {
            this.timerState.isRunning = true;
            this.timerInterval = setInterval(() => {
                if (this.timerState.time > 0) {
                    this.timerState.time--;
                    this.updateTimerDisplay();
                    this.drawTimerCircle();
                } else {
                    this.completeTimerSession();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.pauseTimer();
        this.timerState.time = this.timerState.focusTime * 60;
        this.timerState.mode = 'focus';
        this.updateTimerDisplay();
        this.drawTimerCircle();
    }

    completeTimerSession() {
        this.pauseTimer();
        
        if (this.timerState.mode === 'focus') {
            this.pomodoroCount++;
            localStorage.setItem('pomodoroCount', this.pomodoroCount);
            this.updateStats();
            
            const isLongBreak = this.pomodoroCount % 4 === 0;
            this.timerState.mode = isLongBreak ? 'longBreak' : 'shortBreak';
            this.timerState.time = isLongBreak ? this.timerState.longBreak * 60 : this.timerState.shortBreak * 60;
        } else {
            this.timerState.mode = 'focus';
            this.timerState.time = this.timerState.focusTime * 60;
        }
        
        this.updateTimerDisplay();
        this.drawTimerCircle();
        this.showNotification('Timer Complete!');
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.time / 60);
        const seconds = this.timerState.time % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerTime').textContent = timeString;
        document.getElementById('timerMode').textContent = 
            this.timerState.mode === 'focus' ? 'Focus Time' :
            this.timerState.mode === 'shortBreak' ? 'Short Break' : 'Long Break';
        
        this.updateTodayStudyTime();
    }

    drawTimerCircle() {
        const canvas = document.getElementById('timerCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const totalTime = this.timerState.mode === 'focus' ? this.timerState.focusTime * 60 :
                         this.timerState.mode === 'shortBreak' ? this.timerState.shortBreak * 60 :
                         this.timerState.longBreak * 60;
        
        const progress = (totalTime - this.timerState.time) / totalTime;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e1e5e9';
        ctx.lineWidth = 8;
        ctx.stroke();

        if (progress > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * progress));
            ctx.strokeStyle = this.timerState.mode === 'focus' ? '#667eea' : '#4caf50';
            ctx.lineWidth = 8;
            ctx.stroke();
        }
    }

    updateTodayStudyTime() {
        const studiedMinutes = this.pomodoroCount * 25;
        const hours = Math.floor(studiedMinutes / 60);
        const minutes = studiedMinutes % 60;
        document.getElementById('todayStudyTime').textContent = `${hours}h ${minutes}m`;
    }

    checkDailyStreak() {
        const lastStudyDate = localStorage.getItem('lastStudyDate');
        const today = new Date().toDateString();
        
        if (lastStudyDate !== today && this.pomodoroCount > 0) {
            this.studyStreak++;
            localStorage.setItem('studyStreak', this.studyStreak);
            localStorage.setItem('lastStudyDate', today);
            this.updateStats();
        }
    }

    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Smart Study Planner', { body: message });
        } else {
            alert(message);
        }
    }

    saveData() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
        localStorage.setItem('subjects', JSON.stringify(this.subjects));
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    // Settings Methods
    initializeSettings() {
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('accentColor').value = this.settings.accentColor;
        document.getElementById('enableNotifications').checked = this.settings.enableNotifications;
        document.getElementById('alertTime').value = this.settings.alertTime;
        document.getElementById('defaultStudyTime').value = this.settings.defaultStudyTime;
        document.getElementById('weekStart').value = this.settings.weekStart;
    }

    applyTheme() {
        const theme = this.settings.theme;
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.className = prefersDark ? 'dark-theme' : 'light-theme';
        } else {
            document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
        }
        document.documentElement.style.setProperty('--accent-color', this.settings.accentColor);
    }

    // Settings Event Handlers
    changeTheme() {
        this.settings.theme = document.getElementById('themeSelect').value;
        this.applyTheme();
        this.saveData();
    }

    changeAccentColor() {
        this.settings.accentColor = document.getElementById('accentColor').value;
        this.applyTheme();
        this.saveData();
    }

    toggleNotifications() {
        this.settings.enableNotifications = document.getElementById('enableNotifications').checked;
        this.saveData();
    }

    // Data Management
    exportData() {
        const data = {
            tasks: this.tasks,
            schedules: this.schedules,
            subjects: this.subjects,
            settings: this.settings,
            pomodoroCount: this.pomodoroCount,
            studyStreak: this.studyStreak,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                    this.tasks = data.tasks || [];
                    this.schedules = data.schedules || [];
                    this.subjects = data.subjects || this.getDefaultSubjects();
                    this.settings = { ...this.getDefaultSettings(), ...data.settings };
                    this.pomodoroCount = data.pomodoroCount || 0;
                    this.studyStreak = data.studyStreak || 0;

                    localStorage.setItem('pomodoroCount', this.pomodoroCount);
                    localStorage.setItem('studyStreak', this.studyStreak);
                    this.saveData();
                    
                    alert('Data imported successfully!');
                    location.reload();
                }
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    }

    resetAllData() {
        if (confirm('This will delete ALL your data including tasks, schedules, subjects, and settings. This action cannot be undone. Are you sure?')) {
            if (confirm('Are you absolutely sure? This will permanently delete everything.')) {
                localStorage.clear();
                location.reload();
            }
        }
    }

    // Enhanced Deadline Alerts
    checkDeadlineAlerts() {
        if (!this.settings.enableNotifications) return;

        const now = new Date();
        const alertTime = this.settings.alertTime * 60 * 1000; // Convert to milliseconds

        this.tasks.forEach(task => {
            if (task.status === 'completed') return;
            
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();

            if (timeDiff > 0 && timeDiff <= alertTime) {
                this.showNotification(`Task Due Soon: ${task.title}`, `Due on ${dueDate.toLocaleDateString()}`);
            }
        });
    }

    showNotification(title, body) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/favicon.ico' });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { body, icon: '/favicon.ico' });
                    }
                });
            }
        }
    }

    // Schedule Conflict Detection
    checkScheduleConflict(newSchedule) {
        const newStart = new Date(`${newSchedule.date} ${newSchedule.startTime}`);
        const newEnd = new Date(`${newSchedule.date} ${newSchedule.endTime}`);

        return this.schedules.some(schedule => {
            if (schedule.id === newSchedule.id) return false; // Skip self when editing
            
            const existingStart = new Date(`${schedule.date} ${schedule.startTime}`);
            const existingEnd = new Date(`${schedule.date} ${schedule.endTime}`);

            return (newStart < existingEnd && newEnd > existingStart);
        });
    }
}

const studyPlanner = new StudyPlanner();

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'progress') {
        setTimeout(() => studyPlanner.renderProgressCharts(), 100);
    }
}

function openTaskModal() {
    document.getElementById('taskModal').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('taskForm').reset();
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
}

function openScheduleModal() {
    document.getElementById('scheduleModal').classList.add('active');
    document.getElementById('scheduleForm').reset();
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

function completeTask(taskId) {
    const task = studyPlanner.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = 'completed';
        studyPlanner.saveData();
        studyPlanner.updateStats();
        studyPlanner.renderDashboard();
        studyPlanner.renderTasks();
    }
}

function editTask(taskId) {
    const task = studyPlanner.tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskSubject').value = task.subject;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskEstimatedTime').value = task.estimatedTime || '';
        
        document.getElementById('taskModal').classList.add('active');
        
        document.getElementById('taskForm').onsubmit = function(e) {
            e.preventDefault();
            
            task.title = document.getElementById('taskTitle').value.trim();
            task.description = document.getElementById('taskDescription').value.trim();
            task.subject = document.getElementById('taskSubject').value;
            task.priority = document.getElementById('taskPriority').value;
            task.dueDate = document.getElementById('taskDueDate').value;
            task.estimatedTime = document.getElementById('taskEstimatedTime').value;
            
            studyPlanner.saveData();
            studyPlanner.updateStats();
            studyPlanner.renderDashboard();
            studyPlanner.renderTasks();
            closeTaskModal();
            
            document.getElementById('taskForm').onsubmit = null;
        };
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        studyPlanner.tasks = studyPlanner.tasks.filter(t => t.id !== taskId);
        studyPlanner.saveData();
        studyPlanner.updateStats();
        studyPlanner.renderDashboard();
        studyPlanner.renderTasks();
    }
}

function editSchedule(scheduleId) {
    const schedule = studyPlanner.schedules.find(s => s.id === scheduleId);
    if (schedule) {
        document.getElementById('scheduleTitle').value = schedule.title;
        document.getElementById('scheduleDate').value = schedule.date;
        document.getElementById('scheduleSubject').value = schedule.subject;
        document.getElementById('scheduleStartTime').value = schedule.startTime;
        document.getElementById('scheduleEndTime').value = schedule.endTime;
        document.getElementById('scheduleNotes').value = schedule.notes || '';
        
        document.getElementById('scheduleModal').classList.add('active');
    }
}

function filterTasks() {
    studyPlanner.renderTasks();
}

function previousWeek() {
    studyPlanner.currentWeek.setDate(studyPlanner.currentWeek.getDate() - 7);
    studyPlanner.renderWeeklyCalendar();
}

function nextWeek() {
    studyPlanner.currentWeek.setDate(studyPlanner.currentWeek.getDate() + 7);
    studyPlanner.renderWeeklyCalendar();
}

function startTimer() {
    studyPlanner.startTimer();
}

function pauseTimer() {
    studyPlanner.pauseTimer();
}

function resetTimer() {
    studyPlanner.resetTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    
    document.getElementById('focusTime').addEventListener('change', (e) => {
        studyPlanner.timerState.focusTime = parseInt(e.target.value);
        if (studyPlanner.timerState.mode === 'focus' && !studyPlanner.timerState.isRunning) {
            studyPlanner.timerState.time = studyPlanner.timerState.focusTime * 60;
            studyPlanner.updateTimerDisplay();
            studyPlanner.drawTimerCircle();
        }
    });
    
    document.getElementById('shortBreak').addEventListener('change', (e) => {
        studyPlanner.timerState.shortBreak = parseInt(e.target.value);
    });
    
    document.getElementById('longBreak').addEventListener('change', (e) => {
        studyPlanner.timerState.longBreak = parseInt(e.target.value);
    });
});

// Global Functions for Subject Management
function openSubjectModal() {
    document.getElementById('subjectModalTitle').textContent = 'Add New Subject';
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectModal').style.display = 'block';
    
    document.getElementById('subjectForm').onsubmit = (e) => {
        e.preventDefault();
        studyPlanner.addSubject();
    };
}

function closeSubjectModal() {
    document.getElementById('subjectModal').style.display = 'none';
}

// Global Functions for Settings
function changeTheme() {
    studyPlanner.changeTheme();
}

function changeAccentColor() {
    studyPlanner.changeAccentColor();
}

function toggleNotifications() {
    studyPlanner.toggleNotifications();
}

function exportData() {
    studyPlanner.exportData();
}

function importData(fileInput) {
    studyPlanner.importData(fileInput);
}

function resetAllData() {
    studyPlanner.resetAllData();
}