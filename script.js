const App = {
    currentView: 'habitSelection',
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
                this.habit = parsed.habit || null;
                this.startTime = parsed.startTime || null;
                this.relapses = parsed.relapses || [];
            } else {
                this.habit = null;
                this.startTime = null;
                this.relapses = [];
            }
        } catch (e) {
            this.habit = null;
            this.startTime = null;
            this.relapses = [];
        }

        if (this.habit && this.startTime) {
            this.currentView = 'timerView';
        }
    },

    saveData() {
        const data = {
            habit: this.habit,
            startTime: this.startTime,
            relapses: this.relapses
        };
        localStorage.setItem('soberStrongData', JSON.stringify(data));
    },

    bindEvents() {
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

        if (this.currentView === 'habitSelection') {
            document.getElementById('habitSelection').classList.remove('hidden');
        } else if (this.currentView === 'customHabitInput') {
            document.getElementById('customHabitInput').classList.remove('hidden');
            document.getElementById('customHabitName').focus();
        } else if (this.currentView === 'timerView') {
            document.getElementById('timerView').classList.remove('hidden');
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

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours % 24;
        document.getElementById('minutes').textContent = minutes % 60;
        document.getElementById('seconds').textContent = seconds % 60;
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
                    <span>${dateStr}</span>
                    <span>${timeStr}</span>
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
        this.habit = null;
        this.startTime = null;
        this.relapses = [];
        this.stopTimer();
        localStorage.removeItem('soberStrongData');
        document.getElementById('confirmModal').classList.add('hidden');
        this.currentView = 'habitSelection';
        this.showView();
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
