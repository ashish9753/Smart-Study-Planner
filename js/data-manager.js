// Data Management Module
class DataManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        this.subjects = JSON.parse(localStorage.getItem('subjects')) || this.getDefaultSubjects();
        this.settings = JSON.parse(localStorage.getItem('settings')) || this.getDefaultSettings();
        this.pomodoroCount = parseInt(localStorage.getItem('pomodoroCount')) || 0;
        this.studyStreak = parseInt(localStorage.getItem('studyStreak')) || 0;
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

    saveData() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
        localStorage.setItem('subjects', JSON.stringify(this.subjects));
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    savePomodoroCount() {
        localStorage.setItem('pomodoroCount', this.pomodoroCount);
    }

    saveStudyStreak() {
        localStorage.setItem('studyStreak', this.studyStreak);
    }

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

    importData(fileInput, callback) {
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

                    this.savePomodoroCount();
                    this.saveStudyStreak();
                    this.saveData();
                    
                    alert('Data imported successfully!');
                    if (callback) callback();
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
}
