// ===== Joke App Class =====
class JokeApp {
    constructor() {
        this.currentJoke = null;
        this.jokes = [];
        this.favorites = [];
        this.storageKey = 'jokeHistory';
        this.favoritesKey = 'favoriteJokes';
        this.apiUrl = 'https://official-joke-api.appspot.com';
        
        // DOM Elements
        this.jokeText = document.getElementById('jokeText');
        this.jokeType = document.getElementById('jokeType');
        this.getJokeBtn = document.getElementById('getJokeBtn');
        this.likeBtn = document.getElementById('likeBtn');
        this.jokesList = document.getElementById('jokesList');
        this.favoritesList = document.getElementById('favoritesList');
        this.favoritesEmpty = document.getElementById('favoritesEmpty');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        this.init();
    }
    
    // ===== Initialization =====
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.renderJokesList();
    }
    
    // ===== Setup Event Listeners =====
    setupEventListeners() {
        this.getJokeBtn.addEventListener('click', () => this.fetchJoke());
        this.likeBtn.addEventListener('click', () => this.addToFavorites());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }
    
    // ===== Fetch Joke from API =====
    async fetchJoke() {
        try {
            this.getJokeBtn.disabled = true;
            this.getJokeBtn.textContent = 'Loading...';
            
            const response = await fetch(`${this.apiUrl}/random_joke`);
            if (!response.ok) throw new Error('Failed to fetch joke');
            
            const data = await response.json();
            this.currentJoke = data;
            
            this.displayJoke(data);
            this.addToHistory(data);
            
        } catch (error) {
            console.error('Error fetching joke:', error);
            this.jokeText.textContent = 'Failed to load joke. Please try again!';
        } finally {
            this.getJokeBtn.disabled = false;
            this.getJokeBtn.textContent = 'Get Random Joke';
        }
    }
    
    // ===== Display Joke =====
    displayJoke(joke) {
        const content = joke.type === 'knock-knock' 
            ? `${joke.setup}\n...${joke.delivery}` 
            : `${joke.setup}\n${joke.delivery}`;
        
        this.jokeText.textContent = content;
        this.jokeType.textContent = `Type: ${joke.type || 'general'}`;
        
        this.updateLikeButton();
    }
    
    // ===== Add to History =====
    addToHistory(joke) {
        const isDuplicate = this.jokes.some(j => j.id === joke.id);
        if (!isDuplicate) {
            this.jokes.unshift(joke);
            if (this.jokes.length > 50) this.jokes.pop();
            this.saveToLocalStorage();
            this.renderJokesList();
        }
    }
    
    // ===== Add to Favorites =====
    addToFavorites() {
        if (!this.currentJoke) {
            alert('No joke to like!');
            return;
        }
        
        const isFavorited = this.favorites.some(j => j.id === this.currentJoke.id);
        
        if (!isFavorited) {
            this.favorites.unshift(this.currentJoke);
            this.likeBtn.classList.add('liked');
        } else {
            this.favorites = this.favorites.filter(j => j.id !== this.currentJoke.id);
            this.likeBtn.classList.remove('liked');
        }
        
        this.saveToLocalStorage();
        this.renderFavoritesList();
    }
    
    // ===== Update Like Button =====
    updateLikeButton() {
        const isFavorited = this.favorites.some(j => j.id === this.currentJoke.id);
        if (isFavorited) {
            this.likeBtn.classList.add('liked');
        } else {
            this.likeBtn.classList.remove('liked');
        }
    }
    
    // ===== Render Jokes List =====
    renderJokesList() {
        this.jokesList.innerHTML = '';
        
        this.jokes.forEach(joke => {
            const li = document.createElement('li');
            li.className = 'joke-item';
            li.innerHTML = `
                <p class="joke-content">${this.escapeHtml(joke.setup)}</p>
                <p class="joke-content joke-answer">${this.escapeHtml(joke.delivery)}</p>
                <span class="joke-type-small">${joke.type || 'general'}</span>
            `;
            li.addEventListener('click', () => this.displayJoke(joke));
            this.jokesList.appendChild(li);
        });
    }
    
    // ===== Render Favorites List =====
    renderFavoritesList() {
        this.favoritesList.innerHTML = '';
        
        if (this.favorites.length === 0) {
            this.favoritesEmpty.style.display = 'block';
            return;
        }
        
        this.favoritesEmpty.style.display = 'none';
        
        this.favorites.forEach(joke => {
            const li = document.createElement('li');
            li.className = 'joke-item';
            li.innerHTML = `
                <p class="joke-content">${this.escapeHtml(joke.setup)}</p>
                <p class="joke-content joke-answer">${this.escapeHtml(joke.delivery)}</p>
                <button class="remove-btn" data-id="${joke.id}">Remove</button>
            `;
            li.querySelector('.remove-btn').addEventListener('click', () => {
                this.favorites = this.favorites.filter(j => j.id !== joke.id);
                this.saveToLocalStorage();
                this.renderFavoritesList();
                this.updateLikeButton();
            });
            li.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-btn')) {
                    this.displayJoke(joke);
                }
            });
            this.favoritesList.appendChild(li);
        });
    }
    
    // ===== Switch Tab =====
    switchTab(tabName) {
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}List`).classList.add('active');
        
        if (tabName === 'favorites') {
            this.renderFavoritesList();
        }
    }
    
    // ===== Clear History =====
    clearHistory() {
        if (confirm('Clear all jokes from history?')) {
            this.jokes = [];
            this.saveToLocalStorage();
            this.renderJokesList();
        }
    }
    
    // ===== Escape HTML =====
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // ===== Local Storage =====
    saveToLocalStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.jokes));
        localStorage.setItem(this.favoritesKey, JSON.stringify(this.favorites));
    }
    
    loadFromLocalStorage() {
        const jokesData = localStorage.getItem(this.storageKey);
        const favoritesData = localStorage.getItem(this.favoritesKey);
        
        if (jokesData) {
            try {
                this.jokes = JSON.parse(jokesData);
            } catch (e) {
                console.error('Error loading jokes:', e);
                this.jokes = [];
            }
        }
        
        if (favoritesData) {
            try {
                this.favorites = JSON.parse(favoritesData);
            } catch (e) {
                console.error('Error loading favorites:', e);
                this.favorites = [];
            }
        }
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new JokeApp();
});