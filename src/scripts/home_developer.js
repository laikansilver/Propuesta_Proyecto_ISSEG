document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión activa
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const userData = JSON.parse(currentUser);
    
    // Verificar que el usuario tenga rol de desarrollador
    if (userData.role !== 'developer') {
        if (userData.role === 'user') {
            window.location.href = 'home_cliente.html';
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
    
    // Notificaciones de ejemplo para desarrolladores
    const mockNotifications = [
        {
            id: 1,
            type: 'warning',
            title: 'Nueva Solicitud Urgente',
            message: 'Se ha asignado una falla urgente en el sistema de nómina',
            time: 'Hace 10 minutos',
            read: false
        },
        {
            id: 2,
            type: 'info',
            title: 'Solicitud Aprobada',
            message: 'REQ-2026-007 ha sido aprobada y asignada a tu equipo',
            time: 'Hace 30 minutos',
            read: false
        },
        {
            id: 3,
            type: 'success',
            title: 'Código Revisado',
            message: 'Tu pull request para REQ-2026-002 ha sido aprobado',
            time: 'Hace 1 hora',
            read: false
        },
        {
            id: 4,
            type: 'info',
            title: 'Comentario Nuevo',
            message: 'El cliente agregó comentarios en REQ-2026-005',
            time: 'Hace 2 horas',
            read: false
        },
        {
            id: 5,
            type: 'danger',
            title: 'Error en Producción',
            message: 'Se detectó un error crítico en el módulo de reportes',
            time: 'Hace 3 horas',
            read: false
        },
        {
            id: 6,
            type: 'success',
            title: 'Deploy Exitoso',
            message: 'La versión 2.3.1 se desplegó correctamente',
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
        
        // Cerrar menú de usuario si está abierto
        const userMenu = document.getElementById('userDropdownMenu');
        const userBtn = document.getElementById('userProfileBtn');
        if (userMenu) userMenu.classList.remove('show');
        if (userBtn) userBtn.classList.remove('active');
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
            
            // Cerrar notificaciones si están abiertas
            if (notificationsPanel) notificationsPanel.classList.remove('active');
            if (notificationsBtn) notificationsBtn.classList.remove('active');
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
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }

    // Cargar datos iniciales
    loadMyTasks();
    loadRecentActivity();
    updatePersonalStats();
    updateGlobalStats();
});

// ========== DATOS DE EJEMPLO ==========
const mockTasks = [
    {
        id: 'REQ-2026-001',
        title: 'Sistema de nómina caído',
        description: 'No permite procesar pagos',
        priority: 'alta',
        status: 'todo',
        deadline: '2026-03-10',
        estimatedHours: 4,
        type: 'falla_urgente',
        assignedTo: 'developer'
    },
    {
        id: 'REQ-2026-002',
        title: 'Campo CURP en formulario',
        description: 'Agregar campo de CURP en formulario de empleados',
        priority: 'media',
        status: 'in_progress',
        deadline: '2026-03-15',
        estimatedHours: 8,
        hoursSpent: 4,
        type: 'modificacion',
        assignedTo: 'developer'
    },
    {
        id: 'REQ-2026-005',
        title: 'Documentación portal afiliados',
        description: 'Documentación técnica para portal de afiliados',
        priority: 'media',
        status: 'in_progress',
        deadline: '2026-03-12',
        estimatedHours: 6,
        hoursSpent: 3,
        type: 'requerimientos',
        assignedTo: 'developer'
    },
    {
        id: 'REQ-2026-008',
        title: 'Firma electrónica en docs',
        description: 'Agregar firma electrónica en documentos jurídicos',
        priority: 'alta',
        status: 'blocked',
        deadline: '2026-03-13',
        estimatedHours: 12,
        hoursSpent: 6,
        blockReason: 'Esperando aprobación de seguridad',
        type: 'modificacion',
        assignedTo: 'developer'
    },
    {
        id: 'REQ-2026-010',
        title: 'Integración pasarela de pagos',
        description: 'Integración con pasarela de pagos en línea',
        priority: 'alta',
        status: 'testing',
        deadline: '2026-03-11',
        estimatedHours: 16,
        hoursSpent: 15,
        type: 'modificacion',
        assignedTo: 'developer'
    }
];

const mockActivities = [
    {
        id: 1,
        type: 'comment',
        user: 'PM García',
        message: 'Comentó en REQ-2026-002',
        content: '¿Cuándo estará lista la validación del CURP?',
        time: 'Hace 15 min',
        icon: 'message'
    },
    {
        id: 2,
        type: 'update',
        user: 'Sistema',
        message: 'REQ-2026-010 movida a Testing',
        time: 'Hace 1 hora',
        icon: 'activity'
    },
    {
        id: 3,
        type: 'assignment',
        user: 'PM García',
        message: 'Te asignó REQ-2026-001',
        time: 'Hace 2 horas',
        icon: 'user'
    },
    {
        id: 4,
        type: 'deadline',
        user: 'Sistema',
        message: 'REQ-2026-010 vence mañana',
        time: 'Hace 3 horas',
        icon: 'clock'
    },
    {
        id: 5,
        type: 'approval',
        user: 'QA Team',
        message: 'Aprobó las pruebas de REQ-2025-098',
        time: 'Hace 5 horas',
        icon: 'check'
    }
];

// ========== KANBAN BOARD ==========
function loadMyTasks() {
    const todoTasks = mockTasks.filter(t => t.status === 'todo');
    const inProgressTasks = mockTasks.filter(t => t.status === 'in_progress');
    const blockedTasks = mockTasks.filter(t => t.status === 'blocked');
    const testingTasks = mockTasks.filter(t => t.status === 'testing');

    renderKanbanColumn('todoTasks', todoTasks, 'todoCount');
    renderKanbanColumn('inProgressTasks', inProgressTasks, 'inProgressCount');
    renderKanbanColumn('blockedTasks', blockedTasks, 'blockedCount');
    renderKanbanColumn('testingTasks', testingTasks, 'testingCount');
}

function renderKanbanColumn(columnId, tasks, countId) {
    const column = document.getElementById(columnId);
    const count = document.getElementById(countId);
    
    if (!column || !count) return;
    
    count.textContent = tasks.length;
    
    if (tasks.length === 0) {
        column.innerHTML = '<div class="kanban-empty">No hay tareas</div>';
        return;
    }
    
    column.innerHTML = tasks.map(task => {
        const daysLeft = getDaysUntilDeadline(task.deadline);
        const isOverdue = daysLeft < 0;
        const isUrgent = daysLeft <= 1 && daysLeft >= 0;
        
        return `
            <div class="kanban-task ${task.priority}" onclick="viewTask('${task.id}')">
                <div class="task-header">
                    <span class="task-id">${task.id}</span>
                    <span class="task-priority priority-${task.priority}"></span>
                </div>
                <h4 class="task-title">${task.title}</h4>
                <p class="task-description">${task.description}</p>
                
                ${task.blockReason ? `
                    <div class="task-blocked">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                        </svg>
                        ${task.blockReason}
                    </div>
                ` : ''}
                
                <div class="task-footer">
                    <div class="task-deadline ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>${isOverdue ? 'Vencida' : daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `${daysLeft} días`}</span>
                    </div>
                    
                    ${task.hoursSpent ? `
                        <div class="task-hours">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                            <span>${task.hoursSpent}/${task.estimatedHours}h</span>
                        </div>
                    ` : `
                        <div class="task-estimate">
                            ~${task.estimatedHours}h
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function getDaysUntilDeadline(deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// ========== ACTIVITY FEED ==========
function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = mockActivities.map(activity => {
        const iconSvg = getActivityIcon(activity.icon);
        return `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${iconSvg}
                </div>
                <div class="activity-content">
                    <p class="activity-user">${activity.user}</p>
                    <p class="activity-message">${activity.message}</p>
                    ${activity.content ? `<p class="activity-detail">"${activity.content}"</p>` : ''}
                    <p class="activity-time">${activity.time}</p>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityIcon(iconType) {
    const icons = {
        'message': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    };
    return icons[iconType] || icons.activity;
}

// ========== PERSONAL STATS ==========
function updatePersonalStats() {
    const completed = 12;
    const inProgress = mockTasks.filter(t => t.status === 'in_progress').length;
    const avgTime = 5.2;
    const successRate = 94;
    
    const personalCompleted = document.getElementById('personalCompleted');
    const personalInProgress = document.getElementById('personalInProgress');
    const personalAvgTime = document.getElementById('personalAvgTime');
    const personalSuccessRate = document.getElementById('personalSuccessRate');
    
    if (personalCompleted) personalCompleted.textContent = completed;
    if (personalInProgress) personalInProgress.textContent = inProgress;
    if (personalAvgTime) personalAvgTime.textContent = avgTime.toFixed(1);
    if (personalSuccessRate) personalSuccessRate.textContent = `${successRate}%`;
}

// ========== GLOBAL STATS ==========
function updateGlobalStats() {
    // Simular estadísticas globales del área
    const stats = {
        pendientes: 8,
        enDesarrollo: 5,
        completadas: 12,
        urgentes: 2
    };

    const statPendientes = document.getElementById('statPendientes');
    const statEnDesarrollo = document.getElementById('statEnDesarrollo');
    const statCompletadas = document.getElementById('statCompletadas');
    const statUrgentes = document.getElementById('statUrgentes');

    if (statPendientes) statPendientes.textContent = stats.pendientes;
    if (statEnDesarrollo) statEnDesarrollo.textContent = stats.enDesarrollo;
    if (statCompletadas) statCompletadas.textContent = stats.completadas;
    if (statUrgentes) statUrgentes.textContent = stats.urgentes;
}

// ========== ACTIONS ==========
window.viewTask = function(taskId) {
    window.location.href = `mis_tareas.html?id=${encodeURIComponent(taskId)}&mode=view`;
};

window.reportIssue = function() {
    alert('Funcionalidad de reporte de problemas - Por implementar');
    // Aquí podrías abrir un modal o redirigir a un formulario
};

window.openExternalTool = function(tool) {
    const tools = {
        'git': 'https://github.com/ISSEG/proyecto',
        'api': 'https://api-testing.isseg.gob.mx',
        'db': 'https://db-admin.isseg.gob.mx',
        'logs': 'https://logs.isseg.gob.mx',
        'ci': 'https://ci.isseg.gob.mx'
    };
    
    if (tools[tool]) {
        if (confirm(`¿Deseas abrir ${tool.toUpperCase()} en una nueva ventana?\n\nEsta es una URL de ejemplo: ${tools[tool]}`)) {
            window.open(tools[tool], '_blank');
        }
    } else {
        alert('Herramienta no configurada');
    }
};
