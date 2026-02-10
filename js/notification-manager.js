// Notification Management Module
class NotificationManager {
    constructor(dataManager, taskManager) {
        this.dataManager = dataManager;
        this.taskManager = taskManager;
    }

    requestPermission() {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    showNotification(title, body = '') {
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
        } else {
            alert(`${title}\n${body}`);
        }
    }

    checkDeadlineAlerts() {
        if (!this.dataManager.settings.enableNotifications) return;

        const now = new Date();
        const alertTime = this.dataManager.settings.alertTime * 60 * 1000;

        this.taskManager.tasks.forEach(task => {
            if (task.status === 'completed') return;
            
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();

            if (timeDiff > 0 && timeDiff <= alertTime) {
                this.showNotification(
                    `Task Due Soon: ${task.title}`,
                    `Due on ${dueDate.toLocaleDateString()}`
                );
            }
        });
    }

    checkDailyStreak() {
        const lastStudyDate = localStorage.getItem('lastStudyDate');
        const today = new Date().toDateString();
        
        if (lastStudyDate !== today && this.dataManager.pomodoroCount > 0) {
            this.dataManager.studyStreak++;
            this.dataManager.saveStudyStreak();
            localStorage.setItem('lastStudyDate', today);
        }
    }
}
