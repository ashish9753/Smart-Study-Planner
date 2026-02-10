// Settings Management Module
class SettingsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    get settings() {
        return this.dataManager.settings;
    }

    initialize() {
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

    changeTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme();
        this.dataManager.saveData();
    }

    changeAccentColor(color) {
        this.settings.accentColor = color;
        this.applyTheme();
        this.dataManager.saveData();
    }

    toggleNotifications(enabled) {
        this.settings.enableNotifications = enabled;
        this.dataManager.saveData();
    }

    updateAlertTime(minutes) {
        this.settings.alertTime = minutes;
        this.dataManager.saveData();
    }

    updateDefaultStudyTime(minutes) {
        this.settings.defaultStudyTime = minutes;
        this.dataManager.saveData();
    }

    updateWeekStart(day) {
        this.settings.weekStart = day;
        this.dataManager.saveData();
    }
}
