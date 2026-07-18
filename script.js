// ===== DOM 元素引用 =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectsGrid = document.getElementById('projectsGrid');

let projectsData = [];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEventListeners();
});

// ===== 事件监听器设置 =====
function setupEventListeners() {
    // 汉堡菜单
    hamburger.addEventListener('click', toggleMenu);
    
    // 导航链接
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
    
    // 过滤按钮
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            filterButtonsLogic(e);
        });
    });
}

// ===== 菜单切换 =====
function toggleMenu() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMenu() {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// ===== 加载项目数据 =====
function loadProjects() {
    fetch('projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load projects');
            }
            return response.json();
        })
        .then(data => {
            projectsData = data;
            displayProjects(projectsData);
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            // 如果加载失败，显示错误信息
            projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">无法加载项目数据</p>';
        });
}

// ===== 显示项目 =====
function displayProjects(projects) {
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
    
    // 添加进入动画
    const cards = projectsGrid.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        }, index * 100);
    });
}

// ===== 创建项目卡片 =====
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = `project-card`;
    card.dataset.category = project.category;
    
    const tagsHTML = project.tags
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
    
    card.innerHTML = `
        <div class="project-image">${project.image}</div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <span class="project-category">${getCategoryLabel(project.category)}</span>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${tagsHTML}
            </div>
            <div class="project-links">
                <a href="${project.demoUrl}" class="project-link" target="_blank" rel="noopener noreferrer">
                    查看演示
                </a>
                <a href="${project.githubUrl}" class="project-link" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// ===== 获取分类标签 =====
function getCategoryLabel(category) {
    const categoryMap = {
        'web': 'Web 应用',
        'mobile': '移动应用',
        'design': '设计'
    };
    return categoryMap[category] || category;
}

// ===== 过滤按钮逻辑 =====
function filterButtonsLogic(e) {
    // 移除其他按钮的 active 类
    filterButtons.forEach(btn => btn.classList.remove('active'));
    // 添加 active 类到点击的按钮
    e.target.classList.add('active');
    
    const filterValue = e.target.dataset.filter;
    filterProjects(filterValue);
}

// ===== 过滤项目 =====
function filterProjects(category) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        if (category === 'all') {
            card.classList.remove('hidden');
            card.style.animation = 'fadeInUp 0.3s ease';
        } else {
            if (card.dataset.category === category) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.3s ease';
            } else {
                card.classList.add('hidden');
            }
        }
    });
}

// ===== 平滑滚动（备用方案）=====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== 窗口调整事件 =====
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMenu();
    }
});

// ===== 添加进入观察器（Intersection Observer）=====
function setupIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, options);
    
    document.querySelectorAll('.project-card, .section-title').forEach(el => {
        observer.observe(el);
    });
}

// 页面加载完成后设置观察器
window.addEventListener('load', setupIntersectionObserver);