// Task Management Module
class TaskManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    get tasks() {
        return this.dataManager.tasks;
    }

    addQuickTask(title, subject, priority) {
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
        this.dataManager.saveData();
        return task;
    }

    addTask(taskData) {
        const { title, description, subject, priority, dueDate, estimatedTime } = taskData;
        
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
        this.dataManager.saveData();
        return task;
    }

    updateTask(taskId, updates) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;

        Object.assign(task, updates);
        this.dataManager.saveData();
        return true;
    }

    completeTask(taskId) {
        return this.updateTask(taskId, { status: 'completed' });
    }

    deleteTask(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index === -1) return false;

        this.tasks.splice(index, 1);
        this.dataManager.saveData();
        return true;
    }

    getTask(taskId) {
        return this.tasks.find(t => t.id === taskId);
    }

    getFilteredTasks(filters = {}) {
        let filtered = [...this.tasks];

        if (filters.subject && filters.subject !== 'all') {
            filtered = filtered.filter(task => task.subject === filters.subject);
        }

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }

        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }

        return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    getUpcomingTasks(limit = 5) {
        return this.tasks
            .filter(task => task.status === 'pending')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, limit);
    }

    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.status === 'completed').length;
        const pending = this.tasks.filter(task => task.status === 'pending').length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        return { total, completed, pending, percentage };
    }

    getSubjectTaskCount(subjectName) {
        return this.tasks.filter(task => task.subject === subjectName).length;
    }
}
