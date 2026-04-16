document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión activa
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const userData = JSON.parse(currentUser);
    
    // Verificar que el usuario tenga rol de cliente/user
    if (userData.role !== 'user') {
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
        const emailName = userData.username.split('@')[0];
        const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        userNameElement.textContent = displayName;
    }

    // ========== SIDEBAR MENU ==========
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    });
    
    sidebarClose.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
    
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
        }
    ];
    
    function renderNotifications() {
        const unreadCount = mockNotifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
        
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
    
    // User Dropdown Elements
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    notificationsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationsPanel.classList.toggle('active');
        if (userDropdownMenu && userDropdownMenu.classList.contains('show')) {
            userDropdownMenu.classList.remove('show');
            userProfileBtn.classList.remove('active');
        }
    });

    if (userProfileBtn && userDropdownMenu) {
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
            userProfileBtn.classList.toggle('active');
            if (notificationsPanel && notificationsPanel.classList.contains('active')) {
                notificationsPanel.classList.remove('active');
            }
        });
    }
    
    markAllReadBtn.addEventListener('click', function() {
        mockNotifications.forEach(n => n.read = true);
        renderNotifications();
    });
    
    document.addEventListener('click', function(e) {
        if (!notificationsPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
            notificationsPanel.classList.remove('active');
        }
        if (userDropdownMenu && userProfileBtn && !userDropdownMenu.contains(e.target) && !userProfileBtn.contains(e.target)) {
            userDropdownMenu.classList.remove('show');
            userProfileBtn.classList.remove('active');
        }
    });
    
    renderNotifications();

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

    // ========== REQUESTS DATA ==========
    const mockRequests = [
        {
            id: 'REQ-2026-001',
            type: 'urgente',
            status: 'completada',
            description: 'Sistema de nómina caído, necesita solución inmediata',
            date: '2026-02-20',
            assignedTo: 'Carlos Ruiz',
            priority: 'Alta'
        },
        {
            id: 'REQ-2026-003',
            type: 'nuevo_sistema',
            status: 'aprobada',
            description: 'Sistema de control de gastos y presupuestos para el departamento',
            date: '2026-02-24',
            assignedTo: 'En asignación',
            priority: 'Media'
        },
        {
            id: 'REQ-2026-005',
            type: 'modificacion',
            status: 'en_desarrollo',
            description: 'Agregar campo de CURP en formulario de registro de empleados',
            date: '2026-02-23',
            assignedTo: 'Laura Martínez',
            priority: 'Media'
        },
        {
            id: 'REQ-2026-008',
            type: 'requerimientos',
            status: 'pendiente',
            description: 'Documentación técnica para portal de afiliados',
            date: '2026-02-25',
            assignedTo: 'Pendiente de asignación',
            priority: 'Baja'
        },
        {
            id: 'REQ-2026-012',
            type: 'modificacion',
            status: 'rechazada',
            description: 'Cambio en colores del tema de la aplicación',
            date: '2026-02-18',
            assignedTo: 'N/A',
            priority: 'Baja'
        }
    ];

    let filteredRequests = [...mockRequests];

    // ========== RENDER REQUESTS ==========
    function renderRequests(requests) {
        const requestsGrid = document.getElementById('requestsGrid');
        const emptyState = document.getElementById('emptyState');

        if (requests.length === 0) {
            requestsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        requestsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        requestsGrid.innerHTML = requests.map(req => `
            <div class="request-card ${req.type}">
                <div class="request-header">
                    <div class="request-id">${req.id}</div>
                    <span class="request-badge badge-${req.status}">${getStatusLabel(req.status)}</span>
                </div>
                <div class="request-type">
                    ${getTypeIcon(req.type)}
                    ${getTypeLabel(req.type)}
                </div>
                <div class="request-description">${req.description}</div>
                <div class="request-meta">
                    <div class="request-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <strong>Fecha:</strong> ${formatDate(req.date)}
                    </div>
                    <div class="request-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <strong>Asignado:</strong> ${req.assignedTo}
                    </div>
                    <div class="request-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <strong>Prioridad:</strong> ${req.priority}
                    </div>
                </div>
                <div class="request-actions">
                    <button class="btn-action btn-view" onclick="viewRequest('${req.id}')">Ver Detalles</button>
                    ${(req.status === 'pendiente' && (req.type === 'urgente' || req.type === 'modificacion')) ? '<button class="btn-action btn-cancel" onclick="requestCancellation(\'' + req.id + '\')">Solicitar Cancelación</button>' : ''}
                </div>
            </div>
        `).join('');
    }

    function getTypeIcon(type) {
        const icons = {
            urgente: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
            modificacion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
            nuevo_sistema: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
            requerimientos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
        };
        return icons[type] || '';
    }

    function getTypeLabel(type) {
        const labels = {
            urgente: 'Falla Urgente',
            modificacion: 'Modificación',
            nuevo_sistema: 'Nuevo Sistema',
            requerimientos: 'Requerimientos Técnicos'
        };
        return labels[type] || type;
    }

    function getStatusLabel(status) {
        const labels = {
            pendiente: 'Pendiente',
            aprobada: 'Aprobada',
            en_desarrollo: 'En Desarrollo',
            completada: 'Completada',
            rechazada: 'Rechazada'
        };
        return labels[status] || status;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-MX', options);
    }

    // ========== FILTERS ==========
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    const filterSearch = document.getElementById('filterSearch');

    function applyFilters() {
        filteredRequests = mockRequests.filter(req => {
            const statusMatch = filterStatus.value === 'all' || req.status === filterStatus.value;
            const typeMatch = filterType.value === 'all' || req.type === filterType.value;
            const searchMatch = filterSearch.value === '' || 
                req.id.toLowerCase().includes(filterSearch.value.toLowerCase()) ||
                req.description.toLowerCase().includes(filterSearch.value.toLowerCase());
            
            return statusMatch && typeMatch && searchMatch;
        });

        renderRequests(filteredRequests);
    }

    filterStatus.addEventListener('change', applyFilters);
    filterType.addEventListener('change', applyFilters);
    filterSearch.addEventListener('input', applyFilters);

    // ========== ACTIONS ==========
    window.viewRequest = function(id) {
        const request = mockRequests.find(r => r.id === id);
        if (request) {
            showRequestModal(request);
        }
    };

    function showRequestModal(request) {
        const modal = document.getElementById('modalDetalles');
        const modalBody = document.getElementById('modalBody');
        
        // Construir el contenido del modal
        modalBody.innerHTML = `
            <div class="detail-section">
                <div class="detail-header">
                    <div class="detail-id">${request.id}</div>
                    <span class="detail-badge badge-${request.status}">${getStatusLabel(request.status)}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-grid">
                    <div class="detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${getTypeIconPath(request.type)}
                        </svg>
                        <div class="detail-content">
                            <div class="detail-label">Tipo de Solicitud</div>
                            <div class="detail-value">${getTypeLabel(request.type)}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <div class="detail-content">
                            <div class="detail-label">Fecha de Creación</div>
                            <div class="detail-value">${formatDate(request.date)}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <div class="detail-content">
                            <div class="detail-label">Asignado a</div>
                            <div class="detail-value">${request.assignedTo}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div class="detail-content">
                            <div class="detail-label">Prioridad</div>
                            <div class="detail-value">${request.priority}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <div class="detail-content">
                        <div class="detail-label">Descripción</div>
                        <div class="detail-description">
                            <div class="detail-value">${request.description}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Mostrar el modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.closeModal = function() {
        const modal = document.getElementById('modalDetalles');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Cerrar modal al hacer click fuera
    document.getElementById('modalDetalles').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    function getTypeIconPath(type) {
        const icons = {
            urgente: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
            modificacion: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
            nuevo_sistema: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
            requerimientos: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>'
        };
        return icons[type] || icons.requerimientos;
    }

    window.requestCancellation = function(id) {
        const request = mockRequests.find(r => r.id === id);
        if (!request) return;

        const typeLabel = getTypeLabel(request.type);
        const message = `¿Deseas solicitar la cancelación de esta ${typeLabel.toLowerCase()}?\n\n` +
                       `ID: ${request.id}\n` +
                       `Descripción: ${request.description}\n\n` +
                       `Se notificará al área de Sistemas para su revisión.`;

        if (confirm(message)) {
            // En producción, esto enviaría una notificación al PM/Sistemas
            alert('✅ Solicitud de cancelación enviada\n\nEl área de Sistemas revisará tu petición y te notificará la decisión.');
            
            // Por ahora simulamos que se marca como rechazada
            // En producción, cambiaría a un estado como 'cancelacion_solicitada'
            request.status = 'rechazada';
            applyFilters();
        }
    };

    // Renderizar solicitudes iniciales
    renderRequests(filteredRequests);
});
