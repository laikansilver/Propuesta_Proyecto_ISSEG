document.addEventListener('DOMContentLoaded', function() {

    // Verificar si hay sesión activa
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    let userData;
    try {
        userData = JSON.parse(currentUser);
    } catch (error) {
        console.error('Sesion invalida en currentUser:', error);
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar que el usuario tenga rol de product_manager
    if (userData.role !== 'product_manager') {
        if (userData.role === 'user') {
            window.location.href = 'home_cliente.html';
        } else if (userData.role === 'developer') {
            window.location.href = 'home_developer.html';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }

    // Mostrar información del usuario
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const rawIdentifier = userData.username || userData.email || userData.name || 'pm';
        const emailName = String(rawIdentifier).split('@')[0];
        const displayName = emailName === 'pm'
            ? 'Product Manager'
            : emailName.charAt(0).toUpperCase() + emailName.slice(1);
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
    
    // Referencias del menu de perfil para poder cerrar paneles entre si.
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    // ========== NOTIFICATIONS ==========
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');
    const notificationsList = document.getElementById('notificationsList');
    const notificationBadge = document.getElementById('notificationBadge');
    const markAllReadBtn = document.getElementById('markAllRead');

    // Cierra todos los paneles flotantes para que solo se vea uno a la vez.
    function closeFloatingPanels(options = {}) {
        const keepSidebar = options.keepSidebar === true;
        const keepNotifications = options.keepNotifications === true;
        const keepUserMenu = options.keepUserMenu === true;

        if (!keepSidebar && sidebar) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }

        if (!keepNotifications && notificationsPanel) {
            notificationsPanel.classList.remove('active');
        }

        if (!keepUserMenu && userProfileBtn && userDropdownMenu) {
            userProfileBtn.classList.remove('active');
            userDropdownMenu.classList.remove('show');
        }
    }
    
    // Abrir sidebar
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            closeFloatingPanels({ keepSidebar: true });
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
    }
    
    // Cerrar sidebar con botón X
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    
    // Cerrar sidebar al hacer click en overlay
    overlay.addEventListener('click', function() {
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        overlay.classList.remove('active');
    });
    
    // Notificaciones de ejemplo para Product Manager
    const mockNotifications = [
        {
            id: 1,
            type: 'warning',
            title: 'Solicitud Pendiente',
            message: 'REQ-2026-003 esperando tu aprobación desde hace 2 días',
            time: 'Hace 5 minutos',
            read: false
        },
        {
            id: 2,
            type: 'info',
            title: 'Nueva Solicitud',
            message: 'Solicitud de nuevo sistema recibida del área de Finanzas',
            time: 'Hace 20 minutos',
            read: false
        },
        {
            id: 3,
            type: 'warning',
            title: 'Presupuesto Excedido',
            message: 'El proyecto REQ-2026-015 está 15% sobre presupuesto',
            time: 'Hace 1 hora',
            read: false
        },
        {
            id: 4,
            type: 'info',
            title: 'Consulta de Cliente',
            message: 'Ana García pregunta sobre el estado de su solicitud',
            time: 'Hace 2 horas',
            read: false
        },
        {
            id: 5,
            type: 'success',
            title: 'Proyecto Completado',
            message: 'REQ-2026-001 fue completado y entregado al cliente',
            time: 'Hace 3 horas',
            read: false
        },
        {
            id: 6,
            type: 'danger',
            title: 'Retraso en Proyecto',
            message: 'REQ-2026-010 tiene retraso de 3 días sobre lo planificado',
            time: 'Hace 4 horas',
            read: false
        },
        {
            id: 7,
            type: 'success',
            title: 'Solicitud Aprobada',
            message: 'REQ-2026-008 fue aprobada y asignada al equipo de desarrollo',
            time: 'Ayer',
            read: true
        }
    ];
    
    // Renderizar notificaciones
    function renderNotifications() {
        if (!notificationsList || !notificationBadge) {
            return;
        }

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
    if (notificationsBtn && notificationsPanel) {
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            if (!notificationsPanel.classList.contains('active')) {
                closeFloatingPanels({ keepNotifications: true });
            }

            notificationsPanel.classList.toggle('active');
        });
    }
    
    // Marcar todas como leídas
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            mockNotifications.forEach(n => n.read = true);
            renderNotifications();
        });
    }
    
    // Cerrar panel al hacer click fuera
    document.addEventListener('click', function(e) {
        if (notificationsPanel && notificationsBtn) {
            if (!notificationsPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
                notificationsPanel.classList.remove('active');
            }
        }
    });
    
    // Renderizar notificaciones iniciales
    renderNotifications();

    // Manejar dropdown de perfil de usuario
    if (userProfileBtn && userDropdownMenu) {
        // Toggle dropdown cuando se hace clic en el botón
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            if (!userDropdownMenu.classList.contains('show')) {
                closeFloatingPanels({ keepUserMenu: true });
            }

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
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }

    // Cargar datos de solicitudes
    loadRequests();
    
    // Configurar filtros
    setupFilters();
});

// Datos de ejemplo de solicitudes
const mockRequests = [
    {
        id: 'REQ-2026-001',
        type: 'falla_urgente',
        solicitante: 'Ana García',
        area: 'Prestaciones',
        description: 'Sistema de nómina caído, no permite procesar pagos',
        priority: 'alta',
        status: 'aprobada',
        date: '2026-02-26'
    },
    {
        id: 'REQ-2026-002',
        type: 'modificacion',
        solicitante: 'Carlos Ruiz',
        area: 'RH',
        description: 'Agregar campo de CURP en formulario de empleados',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-25'
    },
    {
        id: 'REQ-2026-003',
        type: 'nuevo_sistema',
        solicitante: 'María López',
        area: 'Finanzas',
        description: 'Sistema de control de gastos y presupuestos',
        priority: 'media',
        status: 'pendiente_revision',
        date: '2026-02-24'
    },
    {
        id: 'REQ-2026-004',
        type: 'falla_urgente',
        solicitante: 'Pedro Sánchez',
        area: 'Cobranza',
        description: 'Error en cálculo de intereses moratorios',
        priority: 'alta',
        status: 'aprobada',
        date: '2026-02-26'
    },
    {
        id: 'REQ-2026-005',
        type: 'requerimientos',
        solicitante: 'Laura Martínez',
        area: 'Sistemas',
        description: 'Documentación técnica para portal de afiliados',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-23'
    },
    {
        id: 'REQ-2026-006',
        type: 'modificacion',
        solicitante: 'José Hernández',
        area: 'Prestaciones',
        description: 'Optimizar tiempos de respuesta en consultas',
        priority: 'baja',
        status: 'pendiente_revision',
        date: '2026-02-22'
    },
    {
        id: 'REQ-2026-007',
        type: 'nuevo_sistema',
        solicitante: 'Diana Torres',
        area: 'RH',
        description: 'Portal de capacitación en línea para empleados',
        priority: 'media',
        status: 'pendiente_revision',
        date: '2026-02-21'
    },
    {
        id: 'REQ-2026-008',
        type: 'modificacion',
        solicitante: 'Roberto Flores',
        area: 'Jurídico',
        description: 'Agregar firma electrónica en documentos',
        priority: 'alta',
        status: 'aprobada',
        date: '2026-02-20'
    },
    {
        id: 'REQ-2026-009',
        type: 'modificacion',
        solicitante: 'Sandra Jiménez',
        area: 'Finanzas',
        description: 'Reporte de conciliaciones bancarias automático',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-15'
    },
    {
        id: 'REQ-2026-010',
        type: 'modificacion',
        solicitante: 'Miguel Ángel Ramos',
        area: 'Cobranza',
        description: 'Integración con pasarela de pagos en línea',
        priority: 'alta',
        status: 'en_desarrollo',
        date: '2026-02-18'
    },
    {
        id: 'REQ-2026-011',
        type: 'nuevo_sistema',
        solicitante: 'Fernando Guzmán',
        area: 'TI',
        description: 'Sistema de help desk para soporte técnico',
        priority: 'media',
        status: 'pendiente_revision',
        date: '2026-02-19'
    },
    {
        id: 'REQ-2026-012',
        type: 'modificacion',
        solicitante: 'Patricia Morales',
        area: 'Prestaciones',
        description: 'Actualizar catálogo de servicios médicos',
        priority: 'baja',
        status: 'rechazada',
        date: '2026-02-17'
    },
    {
        id: 'REQ-2026-013',
        type: 'requerimientos',
        solicitante: 'Ricardo Vega',
        area: 'Sistemas',
        description: 'Especificaciones para módulo de reportes',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-16'
    },
    {
        id: 'REQ-2026-014',
        type: 'modificacion',
        solicitante: 'Claudia Ramírez',
        area: 'RH',
        description: 'Añadir módulo de evaluaciones de desempeño',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-14'
    },
    {
        id: 'REQ-2026-015',
        type: 'nuevo_sistema',
        solicitante: 'Alberto Castro',
        area: 'Finanzas',
        description: 'Dashboard ejecutivo de indicadores financieros',
        priority: 'alta',
        status: 'pendiente_revision',
        date: '2026-02-13'
    },
    {
        id: 'REQ-2026-016',
        type: 'modificacion',
        solicitante: 'Mónica Herrera',
        area: 'Jurídico',
        description: 'Implementar notificaciones por SMS',
        priority: 'baja',
        status: 'rechazada',
        date: '2026-02-12'
    },
    {
        id: 'REQ-2026-017',
        type: 'falla_urgente',
        solicitante: 'Luis Medina',
        area: 'Cobranza',
        description: 'Falla en la generación de recibos de pago',
        priority: 'alta',
        status: 'aprobada',
        date: '2026-02-11'
    },
    {
        id: 'REQ-2026-018',
        type: 'modificacion',
        solicitante: 'Beatriz Ortiz',
        area: 'Prestaciones',
        description: 'Mejorar búsqueda de beneficiarios',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-10'
    },
    {
        id: 'REQ-2026-019',
        type: 'nuevo_sistema',
        solicitante: 'Javier Salazar',
        area: 'TI',
        description: 'Plataforma de gestión documental',
        priority: 'media',
        status: 'pendiente_revision',
        date: '2026-02-09'
    },
    {
        id: 'REQ-2026-020',
        type: 'modificacion',
        solicitante: 'Gabriela León',
        area: 'RH',
        description: 'Integrar sistema de asistencia biométrica',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-08'
    },
    {
        id: 'REQ-2026-021',
        type: 'requerimientos',
        solicitante: 'Andrés Navarro',
        area: 'Sistemas',
        description: 'Análisis de requerimientos para app móvil',
        priority: 'alta',
        status: 'aprobada',
        date: '2026-02-07'
    },
    {
        id: 'REQ-2026-022',
        type: 'modificacion',
        solicitante: 'Elena Vargas',
        area: 'Finanzas',
        description: 'Automatizar proceso de facturación',
        priority: 'alta',
        status: 'en_desarrollo',
        date: '2026-02-06'
    },
    {
        id: 'REQ-2026-023',
        type: 'nuevo_sistema',
        solicitante: 'Omar Reyes',
        area: 'Cobranza',
        description: 'Portal de autogestión para deudores',
        priority: 'baja',
        status: 'rechazada',
        date: '2026-02-05'
    },
    {
        id: 'REQ-2026-024',
        type: 'modificacion',
        solicitante: 'Silvia Rojas',
        area: 'Prestaciones',
        description: 'Añadir validación de documentos digitales',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-04'
    },
    {
        id: 'REQ-2026-025',
        type: 'falla_urgente',
        solicitante: 'Hugo Mendoza',
        area: 'TI',
        description: 'Servidor de correo electrónico intermitente',
        priority: 'alta',
        status: 'aprobada',
        date: '2026-02-03'
    },
    {
        id: 'REQ-2026-026',
        type: 'modificacion',
        solicitante: 'Verónica Peña',
        area: 'RH',
        description: 'Exportar reportes a Excel con formato',
        priority: 'baja',
        status: 'aprobada',
        date: '2026-02-02'
    },
    {
        id: 'REQ-2026-027',
        type: 'modificacion',
        solicitante: 'Raúl Domínguez',
        area: 'Jurídico',
        description: 'Historial de cambios en expedientes',
        priority: 'media',
        status: 'aprobada',
        date: '2026-02-01'
    }
];

let currentRequests = [...mockRequests];

function loadRequests() {
    renderRequests(currentRequests);
    updateStats();
}

function renderRequests(requests) {
    const tbody = document.getElementById('requestsTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.querySelector('.requests-table-container');
    
    if (requests.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';
    
    tbody.innerHTML = requests.map(req => `
        <tr>
            <td><span class="request-id">${req.id}</span></td>
            <td><span class="request-type ${req.type}">${getTypeLabel(req.type)}</span></td>
            <td>${req.solicitante}</td>
            <td>${req.area}</td>
            <td><span class="request-description" title="${req.description}">${req.description}</span></td>
            <td>
                <span class="request-priority">
                    <span class="priority-dot ${req.priority}"></span>
                    ${getPriorityLabel(req.priority)}
                </span>
            </td>
            <td><span class="request-status ${req.status}">${getStatusLabel(req.status)}</span></td>
            <td>${formatDate(req.date)}</td>
            <td>
                <div class="action-buttons">
                    ${getActionButtons(req)}
                </div>
            </td>
        </tr>
    `).join('');
}

function getActionButtons(req) {
    if (req.status === 'pendiente_revision') {
        return `
            <button class="btn-action btn-approve" onclick="approveRequest('${req.id}')">Aprobar</button>
            <button class="btn-action btn-reject" onclick="rejectRequest('${req.id}')">Rechazar</button>
            <button class="btn-action btn-view" onclick="viewRequest('${req.id}')">Ver</button>
        `;
    } else {
        return `<button class="btn-action btn-view" onclick="viewRequest('${req.id}')">Ver Detalles</button>`;
    }
}

function getTypeLabel(type) {
    const labels = {
        'nuevo_sistema': 'Nuevo Sistema',
        'modificacion': 'Modificación',
        'requerimientos': 'Requerimientos',
        'falla_urgente': 'Falla Urgente'
    };
    return labels[type] || type;
}

function getStatusLabel(status) {
    const labels = {
        'pendiente_revision': 'Pendiente de Revisión',
        'aprobada': 'Aprobada',
        'rechazada': 'Rechazada',
        'en_desarrollo': 'En Desarrollo'
    };
    return labels[status] || status;
}

function getPriorityLabel(priority) {
    const labels = {
        'alta': 'Alta',
        'media': 'Media',
        'baja': 'Baja'
    };
    return labels[priority] || priority;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-MX', options);
}

function updateStats() {
    const stats = {
        pendientes: mockRequests.filter(r => r.status === 'pendiente_revision').length,
        aprobadas: mockRequests.filter(r => r.status === 'aprobada').length,
        rechazadas: mockRequests.filter(r => r.status === 'rechazada').length,
        totales: mockRequests.length
    };
    
    document.getElementById('statPendientes').textContent = stats.pendientes;
    document.getElementById('statAprobadas').textContent = stats.aprobadas;
    document.getElementById('statRechazadas').textContent = stats.rechazadas;
    document.getElementById('statTotales').textContent = stats.totales;
}

function setupFilters() {
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    
    filterStatus.addEventListener('change', applyFilters);
    filterType.addEventListener('change', applyFilters);
}

function applyFilters() {
    const filterStatus = document.getElementById('filterStatus').value;
    const filterType = document.getElementById('filterType').value;
    
    let filtered = [...mockRequests];
    
    if (filterStatus !== 'all') {
        filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    if (filterType !== 'all') {
        filtered = filtered.filter(r => r.type === filterType);
    }
    
    currentRequests = filtered;
    renderRequests(currentRequests);
}

// Funciones de filtrado rápido
window.filterRequests = function(statusOrType) {
    // Detectar si es un estado o un tipo
    const statusValues = ['pendiente_revision', 'aprobada', 'rechazada', 'en_desarrollo'];
    
    if (statusValues.includes(statusOrType)) {
        document.getElementById('filterStatus').value = statusOrType;
        document.getElementById('filterType').value = 'all';
    } else {
        document.getElementById('filterType').value = statusOrType;
        document.getElementById('filterStatus').value = 'all';
    }
    
    applyFilters();
};

window.showAllRequests = function() {
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterType').value = 'all';
    applyFilters();
};

// Funciones de acción sobre solicitudes
window.viewRequest = function(id) {
    const request = mockRequests.find(r => r.id === id);
    if (request) {
        alert(
            `Detalles de Solicitud\n\n` +
            `ID: ${request.id}\n` +
            `Tipo: ${getTypeLabel(request.type)}\n` +
            `Solicitante: ${request.solicitante}\n` +
            `Area: ${request.area}\n` +
            `Descripcion: ${request.description}\n` +
            `Prioridad: ${getPriorityLabel(request.priority)}\n` +
            `Estado: ${getStatusLabel(request.status)}\n` +
            `Fecha: ${formatDate(request.date)}`
        );
    }
};

window.approveRequest = function(id) {
    const request = mockRequests.find(r => r.id === id);
    if (request) {
        if (confirm(`¿Aprobar la solicitud ${id}?\n\n${request.description}`)) {
            request.status = 'aprobada';
            
            // Si es un nuevo sistema, activar el flag para habilitar Requerimientos
            if (request.type === 'nuevo_sistema') {
                localStorage.setItem('sistema_nuevo_aprobado', 'true');
                alert('Solicitud aprobada\n\nSe ha habilitado el formulario de Requerimientos Tecnicos para el solicitante.');
            } else {
                alert('Solicitud aprobada correctamente');
            }
            
            renderRequests(currentRequests);
            updateStats();
        }
    }
};

window.rejectRequest = function(id) {
    const request = mockRequests.find(r => r.id === id);
    if (request) {
        const motivo = prompt(`Motivo del rechazo de la solicitud ${id}:`);
        if (motivo) {
            request.status = 'rechazada';
            alert(`Solicitud rechazada\n\nMotivo: ${motivo}`);
            renderRequests(currentRequests);
            updateStats();
        }
    }
};


