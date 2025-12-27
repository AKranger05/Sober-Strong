const App = {
    currentView: 'nameInput',
    timerInterval: null,
    startTime: null,

    init() {
        this.loadData();
        this.bindEvents();
        this.showView();
    },

    loadData() {
        try {
            const data = localStorage.getItem('soberStrongData');
            if (data) {
                const parsed = JSON.parse(data);
                this.userName = parsed.userName || null;
                this.habit = parsed.habit || null;
                this.startTime = parsed.startTime || null;
                this.relapses = parsed.relapses || [];
            } else {
                this.userName = null;
                this.habit = null;
                this.startTime = null;
                this.relapses = [];
            }
        } catch (e) {
            this.userName = null;
            this.habit = null;
            this.startTime = null;
            this.relapses = [];
        }

        if (this.userName && this.habit && this.startTime) {
            this.currentView = 'timerView';
        } else if (this.userName && !this.habit) {
            this.currentView = 'habitSelection';
        } else {
            this.currentView = 'nameInput';
        }
    },

    saveData() {
        const data = {
            userName: this.userName,
            habit: this.habit,
            startTime: this.startTime,
            relapses: this.relapses
        };
        localStorage.setItem('soberStrongData', JSON.stringify(data));
    },

    bindEvents() {
        document.getElementById('saveUserName').addEventListener('click', () => {
            const name = document.getElementById('userName').value.trim();
            if (name) {
                this.userName = name;
                this.currentView = 'habitSelection';
                this.saveData();
                this.showView();
            }
        });

        document.getElementById('userName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('saveUserName').click();
            }
        });

        document.querySelectorAll('.habit-card:not(.custom)').forEach(card => {
            card.addEventListener('click', () => this.selectHabit(card.dataset.habit));
        });

        document.getElementById('customHabitBtn').addEventListener('click', () => {
            this.currentView = 'customHabitInput';
            this.showView();
        });

        document.getElementById('saveCustomHabit').addEventListener('click', () => {
            const name = document.getElementById('customHabitName').value.trim();
            if (name) {
                this.selectHabit(name);
            }
        });

        document.getElementById('cancelCustomHabit').addEventListener('click', () => {
            document.getElementById('customHabitName').value = '';
            this.currentView = 'habitSelection';
            this.showView();
        });

        document.getElementById('customHabitName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('saveCustomHabit').click();
            }
        });

        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('menuModal').classList.remove('hidden');
        });

        document.getElementById('closeMenuBtn').addEventListener('click', () => {
            document.getElementById('menuModal').classList.add('hidden');
        });

        document.getElementById('changeHabitBtn').addEventListener('click', () => {
            document.getElementById('menuModal').classList.add('hidden');
            this.habit = null;
            this.startTime = null;
            this.stopTimer();
            this.currentView = 'habitSelection';
            this.saveData();
            this.showView();
        });

        document.getElementById('resetDataBtn').addEventListener('click', () => {
            document.getElementById('menuModal').classList.add('hidden');
            document.getElementById('confirmModal').classList.remove('hidden');
        });

        document.getElementById('confirmResetBtn').addEventListener('click', () => {
            this.resetAllData();
        });

        document.getElementById('cancelResetBtn').addEventListener('click', () => {
            document.getElementById('confirmModal').classList.add('hidden');
        });

        document.getElementById('relapseBtn').addEventListener('click', () => {
            this.openRelapseLog();
        });

        document.getElementById('backFromRelapse').addEventListener('click', () => {
            this.currentView = 'timerView';
            this.showView();
        });

        document.getElementById('submitRelapse').addEventListener('click', () => {
            this.submitRelapse();
        });

        document.getElementById('viewHistoryBtn').addEventListener('click', () => {
            this.currentView = 'historyView';
            this.showView();
        });

        document.getElementById('backFromHistory').addEventListener('click', () => {
            this.currentView = 'timerView';
            this.showView();
        });
    },

    selectHabit(name) {
        this.habit = name;
        this.startTime = Date.now();
        this.currentView = 'timerView';
        this.saveData();
        document.getElementById('customHabitName').value = '';
        this.showView();
        this.startTimer();
    },

    showView() {
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

        if (this.currentView === 'nameInput') {
            document.getElementById('nameInput').classList.remove('hidden');
            document.getElementById('userName').focus();
        } else if (this.currentView === 'habitSelection') {
            document.getElementById('habitSelection').classList.remove('hidden');
            document.getElementById('greetingName').textContent = this.userName;
        } else if (this.currentView === 'customHabitInput') {
            document.getElementById('customHabitInput').classList.remove('hidden');
            document.getElementById('customHabitName').focus();
        } else if (this.currentView === 'timerView') {
            document.getElementById('timerView').classList.remove('hidden');
            document.getElementById('headerName').textContent = this.userName;
            document.getElementById('timerUserName').textContent = this.userName;
            document.getElementById('currentHabit').textContent = this.habit;
            this.startTimer();
        } else if (this.currentView === 'relapseLog') {
            document.getElementById('relapseLog').classList.remove('hidden');
        } else if (this.currentView === 'historyView') {
            document.getElementById('historyView').classList.remove('hidden');
            this.renderHistory();
        }
    },

    startTimer() {
        this.stopTimer();
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    updateTimerDisplay() {
        if (!this.startTime) return;

        const elapsed = Date.now() - this.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const displaySeconds = seconds % 60;
        const displayMinutes = minutes % 60;
        const displayHours = hours % 24;

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = displayHours;
        document.getElementById('minutes').textContent = displayMinutes;
        document.getElementById('seconds').textContent = displaySeconds;

        const secondsProgress = (displaySeconds / 60) * 100;
        const minutesProgress = (displayMinutes / 60) * 100;
        const hoursProgress = (displayHours / 24) * 100;
        const daysProgress = Math.min((days / 30) * 100, 100);

        document.querySelector('.seconds-bar').style.setProperty('--width', `${secondsProgress}%`);
        document.querySelector('.minutes-bar').style.setProperty('--width', `${minutesProgress}%`);
        document.querySelector('.hours-bar').style.setProperty('--width', `${hoursProgress}%`);
        document.querySelector('.days-bar').style.setProperty('--width', `${daysProgress}%`);

        const secondsBar = document.querySelector('.seconds-bar::before');
        if (secondsBar) {
            document.querySelector('.seconds-bar').style.setProperty('--seconds-width', `${secondsProgress}%`);
        }

        document.documentElement.style.setProperty('--seconds-progress', `${secondsProgress}%`);
        document.documentElement.style.setProperty('--minutes-progress', `${minutesProgress}%`);
        document.documentElement.style.setProperty('--hours-progress', `${hoursProgress}%`);
        document.documentElement.style.setProperty('--days-progress', `${daysProgress}%`);

        const style = document.createElement('style');
        style.textContent = `
            .seconds-bar::before { width: ${secondsProgress}% !important; }
            .minutes-bar::before { width: ${minutesProgress}% !important; }
            .hours-bar::before { width: ${hoursProgress}% !important; }
            .days-bar::before { width: ${daysProgress}% !important; }
        `;
        
        const existingStyle = document.getElementById('dynamic-bar-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        style.id = 'dynamic-bar-styles';
        document.head.appendChild(style);

        const milestoneIcon = document.getElementById('milestoneIcon');
        const milestoneText = document.getElementById('milestoneText');

        milestoneIcon.classList.remove('white', 'silver', 'gold');

        if (days >= 30) {
            milestoneIcon.classList.add('gold');
            milestoneIcon.textContent = days;
            milestoneText.textContent = 'Gold - 30+ Days!';
        } else if (days >= 7) {
            milestoneIcon.classList.add('silver');
            milestoneIcon.textContent = days;
            milestoneText.textContent = 'Silver - 7+ Days!';
        } else {
            milestoneIcon.classList.add('white');
            milestoneIcon.textContent = days;
            milestoneText.textContent = 'Daily Progress';
        }
    },

    openRelapseLog() {
        this.currentView = 'relapseLog';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('relapseDateTime').textContent = `${dateStr} at ${timeStr}`;
        document.getElementById('reflectionText').value = '';
        this.showView();
    },

    submitRelapse() {
        const reflection = document.getElementById('reflectionText').value.trim();
        
        const relapse = {
            timestamp: Date.now(),
            reflection: reflection
        };

        this.relapses.unshift(relapse);
        this.startTime = Date.now();
        this.saveData();
        
        this.currentView = 'timerView';
        this.showView();
    },

    renderHistory() {
        const list = document.getElementById('historyList');
        const empty = document.getElementById('emptyHistory');

        list.innerHTML = '';

        if (this.relapses.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');

        this.relapses.forEach(relapse => {
            const item = document.createElement('div');
            item.className = 'history-item';

            const date = new Date(relapse.timestamp);
            const dateStr = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            const timeStr = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            item.innerHTML = `
                <div class="history-header">
                    <span>📅 ${dateStr}</span>
                    <span>🕐 ${timeStr}</span>
                </div>
                <div class="history-reflection">${this.escapeHtml(relapse.reflection) || '<em>No reflection added</em>'}</div>
            `;

            list.appendChild(item);
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    resetAllData() {
        this.userName = null;
        this.habit = null;
        this.startTime = null;
        this.relapses = [];
        this.stopTimer();
        localStorage.removeItem('soberStrongData');
        document.getElementById('confirmModal').classList.add('hidden');
        this.currentView = 'nameInput';
        this.showView();
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
