// ==========================================
// DOCUMENTACIÓN - JAVASCRIPT
// ==========================================

// Variables del DOM
let menuToggle, sidebar, overlay, logoutBtn;
let notificationsToggle, notificationsPanel;
let docNavBtns, docSections;
let docSearch;
let expandBtns, faqQuestions, copyBtns;

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadUserInfo();
    highlightSearchResults();
});

// Inicializar elementos del DOM
function initializeElements() {
    // Header elements
    menuToggle = document.getElementById('menuToggle');
    sidebar = document.getElementById('sidebar');
    overlay = document.getElementById('overlay');
    logoutBtn = document.getElementById('logoutBtn');
    notificationsToggle = document.getElementById('notificationsToggle');
    notificationsPanel = document.getElementById('notificationsPanel');
    
    // Documentation elements
    docNavBtns = document.querySelectorAll('.doc-nav-btn');
    docSections = document.querySelectorAll('.doc-section');
    docSearch = document.getElementById('docSearch');
    expandBtns = document.querySelectorAll('.btn-expand');
    faqQuestions = document.querySelectorAll('.faq-question');
    copyBtns = document.querySelectorAll('.btn-copy');
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Overlay click
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Notifications toggle
    if (notificationsToggle) {
        notificationsToggle.addEventListener('click', toggleNotifications);
    }
    
    // Close notifications when clicking outside
    document.addEventListener('click', function(e) {
        if (notificationsPanel && 
            !notificationsPanel.contains(e.target) && 
            !notificationsToggle.contains(e.target)) {
            notificationsPanel.classList.remove('show');
        }
    });
    
    // Documentation navigation
    docNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            switchDocSection(section);
        });
    });
    
    // Search functionality
    if (docSearch) {
        docSearch.addEventListener('input', handleSearch);
    }
    
    // Expand buttons for guide cards
    expandBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const contentId = this.dataset.content;
            toggleCardContent(contentId, this);
        });
    });
    
    // FAQ accordion
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFaqItem(this.parentElement);
        });
    });
    
    // Copy code buttons
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const codeId = this.dataset.copy;
            copyCodeToClipboard(codeId, this);
        });
    });
}

// ==========================================
// SIDEBAR & NAVIGATION
// ==========================================
function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function toggleNotifications() {
    notificationsPanel.classList.toggle('show');
}

// ==========================================
// AUTHENTICATION
// ==========================================
function loadUserInfo() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const userData = JSON.parse(currentUser);
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if (userName && userData.name) {
        userName.textContent = userData.name;
    }
    
    if (userRole && userData.role) {
        userRole.textContent = getRoleDisplayName(userData.role);
    }
}

function getRoleDisplayName(role) {
    const roleNames = {
        'developer': 'Desarrollador',
        'pm': 'Project Manager',
        'cliente': 'Cliente'
    };
    return roleNames[role] || role;
}

function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// ==========================================
// DOCUMENTATION SECTIONS
// ==========================================
function switchDocSection(sectionName) {
    // Remove active class from all buttons
    docNavBtns.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Hide all sections
    docSections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const activeSection = document.getElementById(`section-${sectionName}`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        clearSearchHighlights();
        return;
    }
    
    searchInDocumentation(searchTerm);
}

function searchInDocumentation(term) {
    let foundResults = false;
    
    docSections.forEach(section => {
        const sectionText = section.textContent.toLowerCase();
        
        if (sectionText.includes(term)) {
            // Highlight matching text
            highlightText(section, term);
            foundResults = true;
        }
    });
    
    if (!foundResults) {
        showNoResultsMessage();
    }
}

function highlightText(element, term) {
    // Simple highlight implementation
    // In production, use a proper highlighting library
    const textNodes = getTextNodes(element);
    
    textNodes.forEach(node => {
        const text = node.textContent.toLowerCase();
        if (text.includes(term)) {
            const parent = node.parentNode;
            const html = node.textContent.replace(
                new RegExp(term, 'gi'),
                match => `<mark>${match}</mark>`
            );
            
            const span = document.createElement('span');
            span.innerHTML = html;
            parent.replaceChild(span, node);
        }
    });
}

function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
            textNodes.push(node);
        }
    }
    
    return textNodes;
}

function clearSearchHighlights() {
    const marks = document.querySelectorAll('.doc-content mark');
    marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
    });
}

function highlightSearchResults() {
    // Check if there's a search term in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm && docSearch) {
        docSearch.value = searchTerm;
        handleSearch({ target: { value: searchTerm } });
    }
}

function showNoResultsMessage() {
    // Could implement a "no results" message
    console.log('No search results found');
}

// ==========================================
// EXPAND/COLLAPSE CARDS
// ==========================================
function toggleCardContent(contentId, button) {
    const content = document.getElementById(contentId);
    
    if (!content) return;
    
    const isExpanded = content.classList.contains('show');
    
    if (isExpanded) {
        content.classList.remove('show');
        button.classList.remove('active');
    } else {
        content.classList.add('show');
        button.classList.add('active');
    }
}

// ==========================================
// FAQ ACCORDION
// ==========================================
function toggleFaqItem(faqItem) {
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// ==========================================
// COPY CODE FUNCTIONALITY
// ==========================================
function copyCodeToClipboard(codeId, button) {
    const codeElement = document.getElementById(codeId);
    
    if (!codeElement) {
        console.error('Code element not found:', codeId);
        return;
    }
    
    const code = codeElement.textContent;
    
    // Use Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
            .then(() => {
                showCopySuccess(button);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                fallbackCopyToClipboard(code, button);
            });
    } else {
        fallbackCopyToClipboard(code, button);
    }
}

function fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(button);
    } catch (err) {
        console.error('Failed to copy:', err);
        showCopyError(button);
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Copiado';
    button.style.background = '#00b894';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

function showCopyError(button) {
    const originalText = button.textContent;
    button.textContent = '✗ Error';
    button.style.background = '#d63031';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Print documentation
function printDocumentation() {
    window.print();
}

// Export as PDF (requires additional library)
function exportToPDF() {
    // Would require html2pdf.js or similar library
    console.log('PDF export functionality');
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (docSearch) {
            docSearch.focus();
        }
    }
    
    // Escape to close search/sidebar
    if (e.key === 'Escape') {
        if (sidebar && sidebar.classList.contains('active')) {
            closeSidebar();
        }
        if (docSearch && document.activeElement === docSearch) {
            docSearch.blur();
            clearSearchHighlights();
            docSearch.value = '';
        }
    }
});

// ==========================================
// WINDOW RESIZE HANDLER
// ==========================================
window.addEventListener('resize', function() {
    // Close sidebar on desktop
    if (window.innerWidth > 768) {
        closeSidebar();
    }
});

console.log('✅ Documentación cargada correctamente');
