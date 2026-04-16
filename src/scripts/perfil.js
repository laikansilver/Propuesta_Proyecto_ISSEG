document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión activa
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const userData = JSON.parse(currentUser);
    
    // ========== SIDEBAR MENU ==========
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    
    // Crear overlay si no existe (y evitar duplicados)
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
    }
    
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    
    if (overlay && sidebar) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // ========== PERFIL DATA ==========
    // Datos de perfil de ejemplo (en producción vendrían del servidor)
    let profileData = {};

    if (userData.role === 'product_manager') {
        profileData = {
            firstName: 'Roberto',
            lastName: 'Sánchez (PM)',
            email: userData.username,
            phone: '(473) 555-9876',
            extension: '5678',
            employeeId: 'EMP-PM-001',
            department: getDepartmentByRole(userData.role),
            position: getPositionByRole(userData.role)
        };
    } else if (userData.role === 'developer') {
        profileData = {
            firstName: 'Laura',
            lastName: 'Martínez (Dev)',
            email: userData.username,
            phone: '(473) 555-1122',
            extension: '9988',
            employeeId: 'EMP-DEV-042',
            department: getDepartmentByRole(userData.role),
            position: getPositionByRole(userData.role)
        };
    } else {
        // Usuario (Cliente) por defecto
        profileData = {
            firstName: 'Juan Carlos',
            lastName: 'García Hernández',
            email: userData.username,
            phone: '(473) 123-4567',
            extension: '1234',
            employeeId: 'EMP-2024-0123',
            department: getDepartmentByRole(userData.role),
            position: getPositionByRole(userData.role)
        };
    }

    // Cargar datos en el perfil al inicio
    loadProfileData(profileData);

    // Manejar función de regresar
    window.goBack = function() {
        if (userData.role === 'user') {
            window.location.href = 'home_cliente.html';
        } else if (userData.role === 'developer') {
            window.location.href = 'home_developer.html';
        } else if (userData.role === 'product_manager') {
            window.location.href = 'home_pm.html';
        } else {
            window.location.href = 'login.html';
        }
    };

    // Manejar cierre de sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }

    // ========== NOTIFICATIONS ==========
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');
    const notificationsList = document.getElementById('notificationsList');
    const notificationBadge = document.getElementById('notificationBadge');
    const markAllReadBtn = document.getElementById('markAllRead');
    
    // ========== USER DROPDOWN (MENU PERFIL) ==========
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    // Inicializar notificaciones mock
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
        if (!notificationBadge) return; // Si no hay badge (estamos en otra página), salir
        
        const unreadCount = mockNotifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
        
        if (notificationsList) {
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
    
    if (notificationsBtn && notificationsPanel) {
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationsPanel.classList.toggle('active');
            if (userDropdownMenu && userDropdownMenu.classList.contains('show')) {
                userDropdownMenu.classList.remove('show');
                userProfileBtn.classList.remove('active');
            }
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            mockNotifications.forEach(n => n.read = true);
            renderNotifications();
        });
    }
    
    renderNotifications();

    // ========== LOGICA DEL DROPDOWN (MENU) ==========
    if (userProfileBtn && userDropdownMenu) {
        userProfileBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir comportamiento default del enlace
            e.stopPropagation(); // Evitar cerrar inmediatamente
            
            // Toggle de clases
            userDropdownMenu.classList.toggle('show');
            userProfileBtn.classList.toggle('active');
            
            // Cerrar notificaciones si están abiertas
            if (notificationsPanel && notificationsPanel.classList.contains('active')) {
                notificationsPanel.classList.remove('active');
            }
        });
    }

    // Cerrar dropdown al hacer click fuera en cualquier parte del documento
    document.addEventListener('click', function(e) {
        // Cerrar menú de usuario
        if (userDropdownMenu && userDropdownMenu.classList.contains('show')) {
            if (!userProfileBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
                userProfileBtn.classList.remove('active');
            }
        }
        
        // Cerrar panel de notificaciones
        if (notificationsPanel && notificationsPanel.classList.contains('active')) {
            if (!notificationsBtn.contains(e.target) && !notificationsPanel.contains(e.target)) {
                notificationsPanel.classList.remove('active');
            }
        }
    });

    // ========== EDICIÓN DE PERFIL ==========
    const btnEdit = document.getElementById('btnEdit');
    const btnCancel = document.getElementById('btnCancel');
    const profileForm = document.getElementById('profileForm');

    if (btnEdit) {
        btnEdit.addEventListener('click', function() {
            enableEditing();
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', function() {
            disableEditing();
            loadProfileData(profileData); // Restaurar datos originales
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile(profileData); // Pasar datos actuales para actualizar
        });
    }

    // ========== PREFERENCIAS ==========
    const emailNotifications = document.getElementById('emailNotifications');
    const pushNotifications = document.getElementById('pushNotifications');
    const darkMode = document.getElementById('darkMode');

    if (emailNotifications) {
        emailNotifications.addEventListener('change', function() {
            savePreference('emailNotifications', this.checked);
        });
    }

    if (pushNotifications) {
        pushNotifications.addEventListener('change', function() {
            savePreference('pushNotifications', this.checked);
        });
    }

    if (darkMode) {
        darkMode.addEventListener('change', function() {
            savePreference('darkMode', this.checked);
            if (this.checked) {
                alert('💡 El modo oscuro se implementará en una futura actualización');
            }
        });
    }
}); // FIN DOMContentLoaded

// ==========================================
// FUNCIONES GLOBALES Y HELPERS
// ==========================================

function loadProfileData(data) {
    // Header
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = `${data.firstName} ${data.lastName}`;
    
    const userRoleEl = document.querySelector('.user-role');
    if (userRoleEl) userRoleEl.textContent = data.position;
    
    // Profile summary
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = `${data.firstName} ${data.lastName}`;
    
    const profileEmailEl = document.getElementById('profileEmail');
    if (profileEmailEl) profileEmailEl.textContent = data.email;
    
    const profilePositionEl = document.getElementById('profilePosition');
    if (profilePositionEl) profilePositionEl.textContent = `${data.position} - ${data.department}`;
    
    // Form fields
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setVal('firstName', data.firstName);
    setVal('lastName', data.lastName);
    setVal('email', data.email);
    setVal('phone', data.phone);
    setVal('extension', data.extension);
    setVal('employeeId', data.employeeId);
    setVal('department', data.department);
    setVal('position', data.position);
}

function enableEditing() {
    const inputs = document.querySelectorAll('.profile-form input:not(#email):not(#employeeId)');
    inputs.forEach(input => {
        input.disabled = false;
        input.style.background = 'white';
    });
    
    const formActions = document.querySelector('.form-actions');
    if (formActions) formActions.style.display = 'flex';
    
    const btnEdit = document.getElementById('btnEdit');
    if (btnEdit) btnEdit.style.display = 'none';
}

function disableEditing() {
    const inputs = document.querySelectorAll('.profile-form input');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.background = '';
    });
    
    const formActions = document.querySelector('.form-actions');
    if (formActions) formActions.style.display = 'none';
    
    const btnEdit = document.getElementById('btnEdit');
    if (btnEdit) btnEdit.style.display = 'flex';
}

function saveProfile(currentData) {
    // Obtener datos del formulario
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };

    const formData = {
        firstName: getVal('firstName'),
        lastName: getVal('lastName'),
        email: getVal('email'),
        phone: getVal('phone'),
        extension: getVal('extension'),
        employeeId: getVal('employeeId'),
        department: getVal('department'),
        position: getVal('position')
    };
    
    // En producción, aquí se enviaría al servidor
    console.log('Guardando perfil:', formData);
    
    // Actualizar perfil summary en la UI inmediatamente
    const setContent = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    
    setContent('profileName', `${formData.firstName} ${formData.lastName}`);
    setContent('profilePosition', `${formData.position} - ${formData.department}`);
    setContent('userName', `${formData.firstName} ${formData.lastName}`);
    
    const userRoleEl = document.querySelector('.user-role');
    if (userRoleEl) userRoleEl.textContent = formData.position;
    
    // Deshabilitar edición
    disableEditing();
    
    alert('✅ Perfil actualizado correctamente');
}

function savePreference(key, value) {
    localStorage.setItem(key, value);
    console.log(`Preferencia guardada: ${key} = ${value}`);
}

function getDepartmentByRole(role) {
    const departments = {
        'user': 'Área Solicitante',
        'developer': 'Área de Sistemas',
        'product_manager': 'Dirección de Proyectos'
    };
    return departments[role] || 'No especificado';
}

function getPositionByRole(role) {
    const positions = {
        'user': 'Solicitante',
        'developer': 'Desarrollador',
        'product_manager': 'Gerente de Proyectos'
    };
    return positions[role] || 'No especificado';
}

// ========== OTRAS FUNCIONES (Ej. Cambio de password) ==========
window.changePassword = function() {
    const newPassword = prompt('Ingresa tu nueva contraseña:');
    if (newPassword) {
        const confirmPassword = prompt('Confirma tu nueva contraseña:');
        if (newPassword === confirmPassword) {
            alert('✅ Contraseña actualizada correctamente');
        } else {
            alert('❌ Las contraseñas no coinciden');
        }
    }
};

window.viewSessions = function() {
    alert('Sesiones Activas:\n\n1. Navegador actual (Windows 11)\n   Última actividad: Ahora\n   IP: 192.168.1.100');
};