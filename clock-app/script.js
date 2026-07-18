// ===== Digital Clock App Class =====
class DigitalClockApp {
    constructor() {
        this.timeFormat = '24'; // '24' or '12'
        this.updateSpeed = 1000;
        this.updateInterval = null;
        this.customTimezones = [];
        this.storageKey = 'customTimezones';
        
        // Default timezones
        this.defaultTimezones = [
            'UTC',
            'America/New_York',
            'Europe/London',
            'Europe/Paris',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Australia/Sydney',
            'Asia/Dubai'
        ];
        
        // DOM Elements
        this.timeFormatSelect = document.getElementById('timeFormat');
        this.clockSpeedSelect = document.getElementById('clockSpeed');
        this.addTimezoneBtn = document.getElementById('addTimezoneBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.customTimezonesContainer = document.getElementById('customTimezones');
        this.clockCards = document.querySelectorAll('.clock-card');
        
        this.init();
    }
    
    // ===== Initialization =====
    init() {
        this.loadCustomTimezones();
        this.setupEventListeners();
        this.startClock();
    }
    
    // ===== Setup Event Listeners =====
    setupEventListeners() {
        this.timeFormatSelect.addEventListener('change', (e) => {
            this.timeFormat = e.target.value;
            this.updateAllClocks();
        });
        
        this.clockSpeedSelect.addEventListener('change', (e) => {
            this.updateSpeed = parseInt(e.target.value);
            this.restartClock();
        });
        
        this.addTimezoneBtn.addEventListener('click', () => this.showAddTimezoneDialog());
        this.resetBtn.addEventListener('click', () => this.resetCustomTimezones());
    }
    
    // ===== Start Clock =====
    startClock() {
        this.updateAllClocks();
        clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => this.updateAllClocks(), this.updateSpeed);
    }
    
    // ===== Restart Clock =====
    restartClock() {
        clearInterval(this.updateInterval);
        this.startClock();
    }
    
    // ===== Update All Clocks =====
    updateAllClocks() {
        // Update default clocks
        this.clockCards.forEach(card => {
            const timezone = card.dataset.timezone;
            const time = this.getTimeInTimezone(timezone);
            const timeDisplay = card.querySelector('.digital-time');
            timeDisplay.textContent = time;
        });
        
        // Update custom timezone clocks
        const customCards = this.customTimezonesContainer.querySelectorAll('.custom-clock-card');
        customCards.forEach(card => {
            const timezone = card.dataset.timezone;
            const time = this.getTimeInTimezone(timezone);
            const timeDisplay = card.querySelector('.digital-time');
            timeDisplay.textContent = time;
        });
    }
    
    // ===== Get Time in Timezone =====
    getTimeInTimezone(timezone) {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: this.timeFormat === '12' ? '2-digit' : '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: this.timeFormat === '12'
            });
            
            const time = formatter.format(new Date());
            return time;
        } catch (error) {
            return 'Invalid TZ';
        }
    }
    
    // ===== Show Add Timezone Dialog =====
    showAddTimezoneDialog() {
        const timezone = prompt('Enter timezone (e.g., Asia/Bangkok, America/Los_Angeles):');
        if (timezone && timezone.trim()) {
            const trimmedTz = timezone.trim();
            // Validate timezone
            if (this.isValidTimezone(trimmedTz)) {
                if (!this.customTimezones.includes(trimmedTz)) {
                    this.customTimezones.push(trimmedTz);
                    this.saveCustomTimezones();
                    this.renderCustomTimezones();
                    this.updateAllClocks();
                } else {
                    alert('Timezone already added!');
                }
            } else {
                alert('Invalid timezone! Please use format like: Asia/Bangkok, Europe/Berlin');
            }
        }
    }
    
    // ===== Validate Timezone =====
    isValidTimezone(timezone) {
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone });
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // ===== Render Custom Timezones =====
    renderCustomTimezones() {
        this.customTimezonesContainer.innerHTML = '';
        
        if (this.customTimezones.length === 0) return;
        
        this.customTimezones.forEach((timezone, index) => {
            const card = document.createElement('div');
            card.className = 'custom-clock-card';
            card.dataset.timezone = timezone;
            
            const time = this.getTimeInTimezone(timezone);
            
            card.innerHTML = `
                <div class="clock-header">
                    <h3>${timezone}</h3>
                </div>
                <div class="clock-display">
                    <div class="digital-time">${time}</div>
                </div>
                <button class="remove-tz-btn" data-index="${index}">✕ Remove</button>
            `;
            
            card.querySelector('.remove-tz-btn').addEventListener('click', () => {
                this.customTimezones.splice(index, 1);
                this.saveCustomTimezones();
                this.renderCustomTimezones();
            });
            
            this.customTimezonesContainer.appendChild(card);
        });
    }
    
    // ===== Reset Custom Timezones =====
    resetCustomTimezones() {
        if (confirm('Remove all custom timezones?')) {
            this.customTimezones = [];
            this.saveCustomTimezones();
            this.renderCustomTimezones();
        }
    }
    
    // ===== Local Storage =====
    saveCustomTimezones() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.customTimezones));
    }
    
    loadCustomTimezones() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            try {
                this.customTimezones = JSON.parse(data);
                this.renderCustomTimezones();
            } catch (e) {
                console.error('Error loading custom timezones:', e);
                this.customTimezones = [];
            }
        }
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new DigitalClockApp();
});