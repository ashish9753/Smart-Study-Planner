// Schedule Management Module
class ScheduleManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    get schedules() {
        return this.dataManager.schedules;
    }

    addSchedule(scheduleData) {
        const { title, date, subject, startTime, endTime, notes } = scheduleData;
        
        if (!title || !date || !startTime || !endTime) return null;

        const schedule = {
            id: Date.now(),
            title,
            date,
            subject,
            startTime,
            endTime,
            notes
        };

        this.schedules.push(schedule);
        this.dataManager.saveData();
        return schedule;
    }

    updateSchedule(scheduleId, updates) {
        const schedule = this.schedules.find(s => s.id === scheduleId);
        if (!schedule) return false;

        Object.assign(schedule, updates);
        this.dataManager.saveData();
        return true;
    }

    deleteSchedule(scheduleId) {
        const index = this.schedules.findIndex(s => s.id === scheduleId);
        if (index === -1) return false;

        this.schedules.splice(index, 1);
        this.dataManager.saveData();
        return true;
    }

    getSchedule(scheduleId) {
        return this.schedules.find(s => s.id === scheduleId);
    }

    getTodaySchedules() {
        const today = new Date().toISOString().split('T')[0];
        return this.schedules
            .filter(schedule => schedule.date === today)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    getSchedulesByDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.schedules
            .filter(schedule => schedule.date === dateString)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    checkScheduleConflict(newSchedule) {
        const newStart = new Date(`${newSchedule.date} ${newSchedule.startTime}`);
        const newEnd = new Date(`${newSchedule.date} ${newSchedule.endTime}`);

        return this.schedules.some(schedule => {
            if (schedule.id === newSchedule.id) return false;
            
            const existingStart = new Date(`${schedule.date} ${schedule.startTime}`);
            const existingEnd = new Date(`${schedule.date} ${schedule.endTime}`);

            return (newStart < existingEnd && newEnd > existingStart);
        });
    }
}
