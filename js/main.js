// Main Application - Initialization and Global Functions
class StudyPlanner {
    constructor() {
        // Initialize all managers
        this.dataManager = new DataManager();
        this.taskManager = new TaskManager(this.dataManager);
        this.scheduleManager = new ScheduleManager(this.dataManager);
        this.subjectManager = new SubjectManager(this.dataManager);
        this.timerManager = new TimerManager(this.dataManager);
        this.settingsManager = new SettingsManager(this.dataManager);
        this.notificationManager = new NotificationManager(this.dataManager, this.taskManager);
        this.uiManager = new UIManager(
            this.taskManager,
            this.scheduleManager,
            this.subjectManager,
            this.timerManager,
            this.dataManager
        );
        
        this.init();
    }

    init() {
        this.uiManager.updateStats();
        this.uiManager.renderDashboard();
        this.uiManager.renderTasks();
        this.uiManager.renderWeeklyCalendar();
        this.uiManager.renderProgressCharts();
        this.uiManager.renderSubjects();
        this.uiManager.updateTimerDisplay();
        this.settingsManager.applyTheme();
        this.settingsManager.initialize();
        this.uiManager.updateSubjectDropdowns();
        this.notificationManager.requestPermission();
        this.notificationManager.checkDeadlineAlerts();
        this.notificationManager.checkDailyStreak();
        this.setupEventListeners();
        
        // Set up periodic deadline checking
        setInterval(() => {
            this.notificationManager.checkDeadlineAlerts();
        }, 30 * 60 * 1000);

        // Set up timer update interval
        setInterval(() => {
            if (this.timerManager.timerState.isRunning) {
                this.uiManager.updateTimerDisplay();
            }
        }, 1000);
    }

    setupEventListeners() {
        // Quick Task Form
        document.getElementById('quickTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('quickTaskInput').value.trim();
            const subject = document.getElementById('quickSubject').value;
            const priority = document.getElementById('quickPriority').value;
            
            this.taskManager.addQuickTask(title, subject, priority);
            this.uiManager.updateStats();
            this.uiManager.renderDashboard();
            this.uiManager.renderTasks();
            document.getElementById('quickTaskInput').value = '';
        });

        // Task Form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const taskData = {
                title: document.getElementById('taskTitle').value.trim(),
                description: document.getElementById('taskDescription').value.trim(),
                subject: document.getElementById('taskSubject').value,
                priority: document.getElementById('taskPriority').value,
                dueDate: document.getElementById('taskDueDate').value,
                estimatedTime: document.getElementById('taskEstimatedTime').value
            };
            
            this.taskManager.addTask(taskData);
            this.uiManager.updateStats();
            this.uiManager.renderDashboard();
            this.uiManager.renderTasks();
            closeTaskModal();
        });

        // Schedule Form
        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const scheduleData = {
                title: document.getElementById('scheduleTitle').value.trim(),
                date: document.getElementById('scheduleDate').value,
                subject: document.getElementById('scheduleSubject').value,
                startTime: document.getElementById('scheduleStartTime').value,
                endTime: document.getElementById('scheduleEndTime').value,
                notes: document.getElementById('scheduleNotes').value.trim()
            };
            
            if (this.scheduleManager.checkScheduleConflict(scheduleData)) {
                if (!confirm('This schedule conflicts with an existing one. Do you want to add it anyway?')) {
                    return;
                }
            }

            this.scheduleManager.addSchedule(scheduleData);
            this.uiManager.renderWeeklyCalendar();
            this.uiManager.renderDashboard();
            closeScheduleModal();
        });

        // Subject Form
        document.getElementById('subjectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const subjectData = {
                name: document.getElementById('subjectName').value.trim(),
                code: document.getElementById('subjectCode').value.trim(),
                priority: document.getElementById('subjectPriority').value,
                color: document.getElementById('subjectColor').value,
                description: document.getElementById('subjectDescription').value.trim(),
                targetHours: parseInt(document.getElementById('subjectTargetHours').value)
            };
            
            this.subjectManager.addSubject(subjectData);
            this.uiManager.renderSubjects();
            this.uiManager.updateSubjectDropdowns();
            closeSubjectModal();
        });

        // Timer Controls
        document.getElementById('focusTime').addEventListener('change', (e) => {
            this.timerManager.setFocusTime(parseInt(e.target.value));
            this.uiManager.updateTimerDisplay();
        });
        
        document.getElementById('shortBreak').addEventListener('change', (e) => {
            this.timerManager.setShortBreak(parseInt(e.target.value));
        });
        
        document.getElementById('longBreak').addEventListener('change', (e) => {
            this.timerManager.setLongBreak(parseInt(e.target.value));
        });
    }

    // Subject Management
    editSubject(id) {
        const subject = this.subjectManager.getSubject(id);
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
            this.subjectManager.updateSubject(id, {
                name: document.getElementById('subjectName').value.trim(),
                code: document.getElementById('subjectCode').value.trim(),
                priority: document.getElementById('subjectPriority').value,
                color: document.getElementById('subjectColor').value,
                description: document.getElementById('subjectDescription').value.trim(),
                targetHours: parseInt(document.getElementById('subjectTargetHours').value)
            });
            this.uiManager.renderSubjects();
            this.uiManager.updateSubjectDropdowns();
            closeSubjectModal();
        };
    }

    deleteSubject(id) {
        if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) return;
        this.subjectManager.deleteSubject(id);
        this.uiManager.renderSubjects();
        this.uiManager.updateSubjectDropdowns();
    }
}

// Initialize the app
const studyPlanner = new StudyPlanner();

// Global Navigation Functions
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
        setTimeout(() => studyPlanner.uiManager.renderProgressCharts(), 100);
    }
}

// Modal Functions
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

function openSubjectModal() {
    document.getElementById('subjectModalTitle').textContent = 'Add New Subject';
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectModal').style.display = 'block';
    
    document.getElementById('subjectForm').onsubmit = (e) => {
        e.preventDefault();
        studyPlanner.subjectManager.addSubject({
            name: document.getElementById('subjectName').value.trim(),
            code: document.getElementById('subjectCode').value.trim(),
            priority: document.getElementById('subjectPriority').value,
            color: document.getElementById('subjectColor').value,
            description: document.getElementById('subjectDescription').value.trim(),
            targetHours: parseInt(document.getElementById('subjectTargetHours').value)
        });
        studyPlanner.uiManager.renderSubjects();
        studyPlanner.uiManager.updateSubjectDropdowns();
        closeSubjectModal();
    };
}

function closeSubjectModal() {
    document.getElementById('subjectModal').style.display = 'none';
}

// Task Functions
function completeTask(taskId) {
    studyPlanner.taskManager.completeTask(taskId);
    studyPlanner.uiManager.updateStats();
    studyPlanner.uiManager.renderDashboard();
    studyPlanner.uiManager.renderTasks();
}

function editTask(taskId) {
    const task = studyPlanner.taskManager.getTask(taskId);
    if (!task) return;

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
        studyPlanner.taskManager.updateTask(taskId, {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            subject: document.getElementById('taskSubject').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            estimatedTime: document.getElementById('taskEstimatedTime').value
        });
        studyPlanner.uiManager.updateStats();
        studyPlanner.uiManager.renderDashboard();
        studyPlanner.uiManager.renderTasks();
        closeTaskModal();
        document.getElementById('taskForm').onsubmit = null;
    };
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    studyPlanner.taskManager.deleteTask(taskId);
    studyPlanner.uiManager.updateStats();
    studyPlanner.uiManager.renderDashboard();
    studyPlanner.uiManager.renderTasks();
}

function filterTasks() {
    studyPlanner.uiManager.renderTasks();
}

// Schedule Functions
function editSchedule(scheduleId) {
    const schedule = studyPlanner.scheduleManager.getSchedule(scheduleId);
    if (!schedule) return;

    document.getElementById('scheduleTitle').value = schedule.title;
    document.getElementById('scheduleDate').value = schedule.date;
    document.getElementById('scheduleSubject').value = schedule.subject;
    document.getElementById('scheduleStartTime').value = schedule.startTime;
    document.getElementById('scheduleEndTime').value = schedule.endTime;
    document.getElementById('scheduleNotes').value = schedule.notes || '';
    
    document.getElementById('scheduleModal').classList.add('active');
}

function previousWeek() {
    studyPlanner.uiManager.currentWeek.setDate(studyPlanner.uiManager.currentWeek.getDate() - 7);
    studyPlanner.uiManager.renderWeeklyCalendar();
}

function nextWeek() {
    studyPlanner.uiManager.currentWeek.setDate(studyPlanner.uiManager.currentWeek.getDate() + 7);
    studyPlanner.uiManager.renderWeeklyCalendar();
}

// Timer Functions
function startTimer() {
    studyPlanner.timerManager.start();
}

function pauseTimer() {
    studyPlanner.timerManager.pause();
}

function resetTimer() {
    studyPlanner.timerManager.reset();
    studyPlanner.uiManager.updateTimerDisplay();
}

// Settings Functions
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    studyPlanner.settingsManager.changeTheme(theme);
}

function changeAccentColor() {
    const color = document.getElementById('accentColor').value;
    studyPlanner.settingsManager.changeAccentColor(color);
}

function toggleNotifications() {
    const enabled = document.getElementById('enableNotifications').checked;
    studyPlanner.settingsManager.toggleNotifications(enabled);
}

// Data Management Functions
function exportData() {
    studyPlanner.dataManager.exportData();
}

function importData(fileInput) {
    studyPlanner.dataManager.importData(fileInput, () => location.reload());
}

function resetAllData() {
    studyPlanner.dataManager.resetAllData();
}
