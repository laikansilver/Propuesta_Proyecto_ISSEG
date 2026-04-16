document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión activa
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Si no hay sesión, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    // Parsear información del usuario
    const userData = JSON.parse(currentUser);
    
    // Verificar que el usuario tenga rol de cliente/user
    if (userData.role !== 'user') {
        // Si no es usuario cliente, redirigir según su rol
        if (userData.role === 'developer') {
            window.location.href = 'home_developer.html';
        } else if (userData.role === 'product_manager') {
            window.location.href = 'home_pm.html';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }

    // Mostrar información del usuario
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        // Extraer el nombre del correo (antes del @)
        const emailName = userData.username.split('@')[0];
        const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        userNameElement.textContent = displayName;
    }

    // ========== SIDEBAR MENU ==========
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    
    // Crear overlay para el sidebar
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    // Abrir sidebar
    menuToggle.addEventListener('click', function() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    });
    
    // Cerrar sidebar con botón X
    sidebarClose.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
    
    // Cerrar sidebar al hacer click en overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    // ========== NOTIFICATIONS ==========
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');
    const notificationsList = document.getElementById('notificationsList');
    const notificationBadge = document.getElementById('notificationBadge');
    const markAllReadBtn = document.getElementById('markAllRead');
    
    // Notificaciones de ejemplo
    const mockNotifications = [
        {
            id: 1,
            type: 'success',
            title: 'Solicitud Aprobada',
            message: 'Tu solicitud REQ-2026-003 ha sido aprobada por el Product Manager',
            time: 'Hace 5 minutos',
            read: false
        },
        {
            id: 2,
            type: 'info',
            title: 'En Desarrollo',
            message: 'Tu solicitud de modificación está siendo desarrollada',
            time: 'Hace 1 hora',
            read: false
        },
        {
            id: 3,
            type: 'warning',
            title: 'Información Adicional',
            message: 'El desarrollador solicita más detalles sobre tu requerimiento',
            time: 'Hace 2 horas',
            read: false
        },
        {
            id: 4,
            type: 'success',
            title: 'Solicitud Completada',
            message: 'Tu solicitud REQ-2026-001 ha sido completada exitosamente',
            time: 'Ayer',
            read: true
        }
    ];
    
    // Renderizar notificaciones
    function renderNotifications() {
        const unreadCount = mockNotifications.filter(n => !n.read).length;
        
        // Actualizar badge
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
        
        // Renderizar lista
        notificationsList.innerHTML = mockNotifications.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div class="notification-icon ${n.type}">
                    ${getNotificationIcon(n.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-message">${n.message}</div>
                    <div class="notification-time">${n.time}</div>
                </div>
            </div>
        `).join('');
        
        // Agregar eventos de click a notificaciones
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const notifId = parseInt(this.dataset.id);
                markAsRead(notifId);
            });
        });
    }
    
    function getNotificationIcon(type) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        };
        return icons[type] || icons.info;
    }
    
    function markAsRead(notifId) {
        const notification = mockNotifications.find(n => n.id === notifId);
        if (notification) {
            notification.read = true;
            renderNotifications();
        }
    }
    
    // Toggle panel de notificaciones
    notificationsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationsPanel.classList.toggle('active');
    });
    
    // Marcar todas como leídas
    markAllReadBtn.addEventListener('click', function() {
        mockNotifications.forEach(n => n.read = true);
        renderNotifications();
    });
    
    // Cerrar panel al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!notificationsPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
            notificationsPanel.classList.remove('active');
        }
    });
    
    // Renderizar notificaciones iniciales
    renderNotifications();

    // Manejar dropdown de perfil de usuario
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (userProfileBtn && userDropdownMenu) {
        // Toggle dropdown cuando se hace clic en el botón
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userProfileBtn.classList.toggle('active');
            userDropdownMenu.classList.toggle('show');
        });
        
        // Cerrar dropdown cuando se hace clic fuera de él
        document.addEventListener('click', function(e) {
            if (!userProfileBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userProfileBtn.classList.remove('active');
                userDropdownMenu.classList.remove('show');
            }
        });
        
        // Cerrar dropdown cuando se hace clic en un item (excepto logout que tiene su propia lógica)
        const dropdownItems = userDropdownMenu.querySelectorAll('.dropdown-item:not(.logout-item)');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                userProfileBtn.classList.remove('active');
                userDropdownMenu.classList.remove('show');
            });
        });
    }

    // Manejar cierre de sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            // Confirmar cierre de sesión
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                // Limpiar sesión
                sessionStorage.removeItem('currentUser');
                
                // Opcionalmente, limpiar también localStorage si existe
                // localStorage.removeItem('rememberedUser');
                
                // Redirigir al login
                window.location.href = 'login.html';
            }
        });
    }

    // Cargar estadísticas del usuario (simuladas para demo)
    loadUserStats();

    // Configurar el toggle del asistente de decisión
    setupDecisionAssistant();

    // Verificar y configurar acceso al formulario de requerimientos
    checkRequerimientosAccess();
});

function checkRequerimientosAccess() {
    // Verificar si el usuario tiene una solicitud de sistema nuevo aprobada
    const hasApprovedRequest = localStorage.getItem('sistema_nuevo_aprobado') === 'true';
    
    const requerimientosCard = document.getElementById('requerimientosCard');
    const btnRequerimientos = document.getElementById('btnRequerimientos');
    const lockedMessage = document.getElementById('lockedMessage');

    if (hasApprovedRequest) {
        // Desbloquear: Usuario tiene solicitud aprobada
        if (requerimientosCard) {
            requerimientosCard.classList.remove('locked');
        }
        
        if (lockedMessage) {
            lockedMessage.classList.add('hidden');
        }
        
        if (btnRequerimientos) {
            btnRequerimientos.classList.remove('btn-locked');
            btnRequerimientos.classList.add('unlocked');
            btnRequerimientos.style.pointerEvents = 'auto';
            btnRequerimientos.innerHTML = `
                <span>Iniciar Solicitud</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            `;
        }
    } else {
        // Bloquear: Usuario no tiene solicitud aprobada
        if (requerimientosCard) {
            requerimientosCard.classList.add('locked');
        }
        
        if (lockedMessage) {
            lockedMessage.classList.remove('hidden');
        }
        
        if (btnRequerimientos) {
            btnRequerimientos.classList.add('btn-locked');
            btnRequerimientos.classList.remove('unlocked');
            btnRequerimientos.style.pointerEvents = 'none';
            
            // Agregar evento para mostrar mensaje si intentan hacer click
            btnRequerimientos.addEventListener('click', function(e) {
                e.preventDefault();
                alert('⚠️ Acceso Denegado\n\nEste formulario solo está disponible después de que tu solicitud de Sistema Nuevo sea aprobada por el área de Sistemas.\n\nPrimero debes:\n1. Llenar el formulario de "Nuevo Sistema"\n2. Esperar la aprobación\n3. Luego podrás documentar los requerimientos técnicos');
            });
        }
    }
}

function setupDecisionAssistant() {
    const assistantToggle = document.getElementById('assistantToggle');
    const assistantContent = document.getElementById('assistantContent');
    const toggleIcon = assistantToggle.querySelector('.toggle-icon');

    if (assistantToggle && assistantContent) {
        assistantToggle.addEventListener('click', function() {
            assistantContent.classList.toggle('expanded');
            toggleIcon.classList.toggle('rotated');
        });
    }
}

function loadUserStats() {
    // En una aplicación real, esto haría una llamada al backend
    // Por ahora, usamos datos simulados almacenados en localStorage
    
    const stats = {
        total: parseInt(localStorage.getItem('user_total_solicitudes') || '0'),
        aprobadas: parseInt(localStorage.getItem('user_solicitudes_aprobadas') || '0'),
        enProceso: parseInt(localStorage.getItem('user_solicitudes_proceso') || '0'),
        urgentes: parseInt(localStorage.getItem('user_solicitudes_urgentes') || '0')
    };

    // Actualizar los valores en las tarjetas de estadísticas
    const statCards = document.querySelectorAll('.stat-value');
    if (statCards.length >= 4) {
        statCards[0].textContent = stats.total;
        statCards[1].textContent = stats.aprobadas;
        statCards[2].textContent = stats.enProceso;
        statCards[3].textContent = stats.urgentes;
    }

    // Animar los números
    animateStats();
}

function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 20;
        const duration = 1000;
        const stepTime = duration / 20;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, stepTime);
    });
}

// Función para actualizar estadísticas cuando se envía un formulario
function incrementStat(statType) {
    let currentValue = parseInt(localStorage.getItem(statType) || '0');
    currentValue++;
    localStorage.setItem(statType, currentValue.toString());
    
    // También incrementar el total
    if (statType !== 'user_total_solicitudes') {
        let totalValue = parseInt(localStorage.getItem('user_total_solicitudes') || '0');
        totalValue++;
        localStorage.setItem('user_total_solicitudes', totalValue.toString());
    }
}

// Exportar función para uso en otros scripts
window.incrementUserStat = function(type) {
    const statMap = {
        'nueva': 'user_solicitudes_proceso',
        'modificacion': 'user_solicitudes_proceso',
        'requerimientos': 'user_solicitudes_proceso',
        'urgente': 'user_solicitudes_urgentes'
    };
    
    if (statMap[type]) {
        incrementStat(statMap[type]);
        incrementStat('user_total_solicitudes');
    }
};
