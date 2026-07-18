// ===== Todo App Class =====
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todoList';
        
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        
        this.init();
    }
    
    // ===== Initialization =====
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.render();
    }
    
    // ===== Setup Event Listeners =====
    setupEventListeners() {
        // Add todo
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Filter todos
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
        
        // Clear actions
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
    }
    
    // ===== Add Todo =====
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            alert('Please enter a task');
            return;
        }
        
        if (text.length > 100) {
            alert('Task is too long (max 100 characters)');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: 'medium',
            createdAt: new Date().toLocaleString()
        };
        
        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
    }
    
    // ===== Toggle Todo Completion =====
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }
    
    // ===== Delete Todo =====
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.render();
    }
    
    // ===== Clear Completed =====
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('No completed tasks to clear');
            return;
        }
        
        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }
    
    // ===== Clear All =====
    clearAll() {
        if (this.todos.length === 0) {
            alert('No tasks to clear');
            return;
        }
        
        if (confirm('Delete all tasks? This cannot be undone.')) {
            this.todos = [];
            this.saveToLocalStorage();
            this.render();
        }
    }
    
    // ===== Get Filtered Todos =====
    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'all':
            default:
                return this.todos;
        }
    }
    
    // ===== Render =====
    render() {
        this.updateStats();
        this.renderTodoList();
    }
    
    // ===== Update Statistics =====
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    }
    
    // ===== Render Todo List =====
    renderTodoList() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
            return;
        }
        
        this.emptyState.classList.add('hidden');
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="priority-badge ${todo.priority}">${todo.priority}</span>
                <button class="delete-btn" data-id="${todo.id}">🗑️</button>
            `;
            
            // Checkbox event
            li.querySelector('.checkbox').addEventListener('change', () => {
                this.toggleTodo(todo.id);
            });
            
            // Delete button event
            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteTodo(todo.id);
            });
            
            this.todoList.appendChild(li);
        });
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
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }
    
    loadFromLocalStorage() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            try {
                this.todos = JSON.parse(data);
            } catch (e) {
                console.error('Error loading todos:', e);
                this.todos = [];
            }
        }
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});