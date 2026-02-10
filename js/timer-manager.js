// Timer Management Module (Pomodoro)
class TimerManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.timerState = {
            time: 25 * 60,
            isRunning: false,
            mode: 'focus',
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15
        };
        this.timerInterval = null;
    }

    start() {
        if (!this.timerState.isRunning) {
            this.timerState.isRunning = true;
            this.timerInterval = setInterval(() => {
                if (this.timerState.time > 0) {
                    this.timerState.time--;
                } else {
                    this.completeSession();
                }
            }, 1000);
        }
    }

    pause() {
        this.timerState.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    reset() {
        this.pause();
        this.timerState.time = this.timerState.focusTime * 60;
        this.timerState.mode = 'focus';
    }

    completeSession() {
        this.pause();
        
        if (this.timerState.mode === 'focus') {
            this.dataManager.pomodoroCount++;
            this.dataManager.savePomodoroCount();
            
            const isLongBreak = this.dataManager.pomodoroCount % 4 === 0;
            this.timerState.mode = isLongBreak ? 'longBreak' : 'shortBreak';
            this.timerState.time = isLongBreak ? this.timerState.longBreak * 60 : this.timerState.shortBreak * 60;
        } else {
            this.timerState.mode = 'focus';
            this.timerState.time = this.timerState.focusTime * 60;
        }
    }

    setFocusTime(minutes) {
        this.timerState.focusTime = minutes;
        if (this.timerState.mode === 'focus' && !this.timerState.isRunning) {
            this.timerState.time = minutes * 60;
        }
    }

    setShortBreak(minutes) {
        this.timerState.shortBreak = minutes;
    }

    setLongBreak(minutes) {
        this.timerState.longBreak = minutes;
    }

    getTimeDisplay() {
        const minutes = Math.floor(this.timerState.time / 60);
        const seconds = this.timerState.time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getModeDisplay() {
        return this.timerState.mode === 'focus' ? 'Focus Time' :
               this.timerState.mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    }

    getProgress() {
        const totalTime = this.timerState.mode === 'focus' ? this.timerState.focusTime * 60 :
                         this.timerState.mode === 'shortBreak' ? this.timerState.shortBreak * 60 :
                         this.timerState.longBreak * 60;
        
        return (totalTime - this.timerState.time) / totalTime;
    }

    getTodayStudyTime() {
        const studiedMinutes = this.dataManager.pomodoroCount * 25;
        const hours = Math.floor(studiedMinutes / 60);
        const minutes = studiedMinutes % 60;
        return { hours, minutes };
    }
}
