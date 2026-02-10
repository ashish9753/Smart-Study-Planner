// Subject Management Module
class SubjectManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    get subjects() {
        return this.dataManager.subjects;
    }

    addSubject(subjectData) {
        const { name, code, priority, color, description, targetHours } = subjectData;
        
        if (!name) return null;

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
        this.dataManager.saveData();
        return subject;
    }

    updateSubject(subjectId, updates) {
        const index = this.subjects.findIndex(s => s.id === subjectId);
        if (index === -1) return false;

        this.subjects[index] = {
            ...this.subjects[index],
            ...updates
        };

        this.dataManager.saveData();
        return true;
    }

    deleteSubject(subjectId) {
        const index = this.subjects.findIndex(s => s.id === subjectId);
        if (index === -1) return false;

        this.subjects.splice(index, 1);
        this.dataManager.saveData();
        return true;
    }

    getSubject(subjectId) {
        return this.subjects.find(s => s.id === subjectId);
    }

    getAllSubjects() {
        return this.subjects;
    }
}
