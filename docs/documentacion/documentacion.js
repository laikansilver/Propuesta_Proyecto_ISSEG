// ============================================
// Documentación - Repositorio de Documentos
// ============================================

const REQUESTS_STORAGE_KEY = 'developerRequests';

// Estado de la aplicación
let allDocuments = [];
let currentFilter = 'todos';
let currentSearchTerm = '';

// ============================================
// Inicialización
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserInfo();
    initializeEventListeners();
    setupNotifications();
    loadAndRenderDocuments();

    // Setup user dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (userProfileBtn && userDropdownMenu) {
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Cerrar notificaciones si están abiertas
            const notificationsPanel = document.getElementById('notificationsPanel');
            const notificationsBtn = document.getElementById('notificationsBtn');
            
            if (notificationsPanel) notificationsPanel.classList.remove('active');
            if (notificationsBtn) notificationsBtn.classList.remove('active');

            userProfileBtn.classList.toggle('active');
            userDropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!userProfileBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userProfileBtn.classList.remove('active');
                userDropdownMenu.classList.remove('show');
            }
        });
    }
});

// ============================================
// Autenticación
// ============================================
function checkAuthentication() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
}

function loadUserInfo() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        document.getElementById('userName').textContent = user.name || user.email;
        document.getElementById('userRole').textContent = getRoleDisplay(user.role);
    }
}

function getRoleDisplay(role) {
    const roles = {
        'developer': 'Desarrollador',
        'pm': 'Project Manager',
        'client': 'Cliente'
    };
    return roles[role] || role;
}

// ============================================
// Event Listeners
// ============================================
function initializeEventListeners() {
    // ----------------------------
    // 1. Sidebar Toggle
    // ----------------------------
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay'; // Standard class from home_developer.css
        document.body.appendChild(overlay);
    }
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
             sidebar.classList.remove('open');
             overlay.classList.remove('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // ----------------------------
    // 3. Logout (Using btnLogout)
    // ----------------------------
    const btnLogout = document.getElementById('btnLogout'); // Correct ID
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }

    // ----------------------------
    // 4. Search Input
    // ----------------------------
    const searchInput = document.getElementById('docSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase();
            filterAndRenderDocuments();
        });
    }

    // ----------------------------
    // 5. Filter Buttons
    // ----------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterAndRenderDocuments();
        });
    });

    // ----------------------------
    // 6. Modal Close
    // ----------------------------
    const modalClose = document.getElementById('modalClose');
    const documentModal = document.getElementById('documentModal');
    
    if (modalClose && documentModal) {
        modalClose.addEventListener('click', () => {
            documentModal.classList.remove('active');
        });
    }

    if (documentModal) {
        documentModal.addEventListener('click', (e) => {
            if (e.target === documentModal) {
                documentModal.classList.remove('active');
            }
        });
    }
}

// ============================================
// Notificaciones (Desde home_developer.js)
// ============================================
function setupNotifications() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const panel = document.getElementById('notificationsPanel');
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationBadge');
    const markAllReadBtn = document.getElementById('markAllRead');

    if (!notificationsBtn || !panel || !list || !badge || !markAllReadBtn) {
        return;
    }

    const notifications = [
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

    function getNotificationIcon(type) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        };
        return icons[type] || icons.info;
    }

    function renderNotifications() {
        const unreadCount = notifications.filter(n => !n.read).length;
        
        // Actualizar badge
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

        list.innerHTML = notifications.map(n => `
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

    function markAsRead(notifId) {
        const notification = notifications.find(n => n.id === notifId);
        if (notification) {
            notification.read = true;
            renderNotifications();
        }
    }

    notificationsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        panel.classList.toggle('active');

        // Cerrar menú de usuario si está abierto
        const userMenu = document.getElementById('userDropdownMenu');
        const userBtn = document.getElementById('userProfileBtn');
        if (userMenu) userMenu.classList.remove('show');
        if (userBtn) userBtn.classList.remove('active');
    });

    markAllReadBtn.addEventListener('click', function() {
        notifications.forEach(n => n.read = true);
        renderNotifications();
    });

    document.addEventListener('click', function(e) {
        if (!panel.contains(e.target) && !notificationsBtn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });

    renderNotifications();
}

// ============================================
// Carga de Documentos
// ============================================
function loadAndRenderDocuments() {
    allDocuments = generateDocumentsFromRequests();
    updateStatistics(allDocuments);
    updateFilterCounts(allDocuments);
    filterAndRenderDocuments();
}

function generateDocumentsFromRequests() {
    const requests = JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY)) || [];
    const documents = [];

    // Generar documentos de ejemplo para cada solicitud
    requests.forEach((request, index) => {
        // Cada solicitud puede tener múltiples documentos
        const numDocs = Math.floor(Math.random() * 3) + 1; // 1-3 documentos por solicitud
        
        for (let i = 0; i < numDocs; i++) {
            documents.push(generateDocument(request, i));
        }
    });

    return documents;
}

function generateDocument(request, docIndex) {
    const fileTypes = [
        { ext: 'pdf', name: 'Manual', size: 2457600, category: 'documentacion' },
        { ext: 'docx', name: 'Especificaciones', size: 1024000, category: 'documentacion' },
        { ext: 'xlsx', name: 'Datos', size: 512000, category: 'documentacion' },
        { ext: 'png', name: 'Diagrama', size: 819200, category: 'diagrama' },
        { ext: 'drawio', name: 'Flujo', size: 256000, category: 'diagrama' },
        { ext: 'pdf', name: 'Cuestionario_Satisfaccion', size: 156000, category: 'cuestionario' },
        { ext: 'docx', name: 'Cuestionario_Requisitos', size: 128000, category: 'cuestionario' },
        { ext: 'pdf', name: 'Análisis', size: 3145728, category: 'documentacion' },
        { ext: 'docx', name: 'Requerimientos', size: 768000, category: 'documentacion' },
        { ext: 'jpg', name: 'Mockup', size: 1536000, category: 'diagrama' },
        { ext: 'vsdx', name: 'Arquitectura', size: 2048000, category: 'diagrama' }
    ];

    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const uploadDate = new Date(request.date);
    uploadDate.setHours(uploadDate.getHours() + docIndex);

    return {
        id: `doc-${request.id}-${docIndex}`,
        requestId: request.id,
        requestType: request.type,
        requestDescription: request.description,
        area: request.area,
        solicitante: request.solicitante,
        fileName: `${fileType.name}_${request.area.replace(/\s+/g, '_')}_${docIndex + 1}.${fileType.ext}`,
        fileType: fileType.ext,
        fileSize: fileType.size + Math.floor(Math.random() * 100000),
        fileCategory: fileType.category,
        uploadDate: uploadDate.toISOString(),
        uploadedBy: request.solicitante,
        status: request.status
    };
}

// ============================================
// Filtrado y Búsqueda
// ============================================
function filterAndRenderDocuments() {
    let filteredDocs = [...allDocuments];

    // Aplicar filtro por tipo
    if (currentFilter !== 'todos') {
        filteredDocs = filteredDocs.filter(doc => doc.requestType === currentFilter);
    }

    // Aplicar búsqueda
    if (currentSearchTerm) {
        filteredDocs = filteredDocs.filter(doc => {
            return (
                doc.fileName.toLowerCase().includes(currentSearchTerm) ||
                doc.area.toLowerCase().includes(currentSearchTerm) ||
                doc.requestId.toLowerCase().includes(currentSearchTerm) ||
                doc.requestDescription.toLowerCase().includes(currentSearchTerm)
            );
        });
    }

    renderDocumentsGrid(filteredDocs);
}

// ============================================
// Renderizado
// ============================================
function renderDocumentsGrid(documents) {
    const grid = document.getElementById('documentsGrid');
    const emptyState = document.getElementById('emptyState');

    if (documents.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = documents.map(doc => createDocumentCard(doc)).join('');

    // Agregar event listeners a las tarjetas
    documents.forEach(doc => {
        const card = document.getElementById(`card-${doc.id}`);
        if (card) {
            card.addEventListener('click', () => showDocumentModal(doc));
        }

        // Event listeners para los botones de acción (evitar propagación)
        const viewBtn = document.getElementById(`view-${doc.id}`);

        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                viewDocument(doc);
            });
        }
    });
}

function createDocumentCard(doc) {
    const fileTypeClass = doc.fileType.toLowerCase();
    const requestTypeLabel = getRequestTypeLabel(doc.requestType);
    const formattedDate = formatDate(doc.uploadDate);
    const formattedSize = formatFileSize(doc.fileSize);

    return `
        <div class="document-card" id="card-${doc.id}">
            <div class="document-header">
                <div class="file-type-icon ${fileTypeClass}">
                    ${doc.fileType}
                </div>
                <div class="document-info">
                    <div class="document-title" title="${doc.fileName}">${doc.fileName}</div>
                    <div class="document-meta">
                        <span>Solicitud: ${doc.requestId}</span>
                        <span>Área: ${doc.area}</span>
                    </div>
                </div>
            </div>
            <div class="document-tags">
                <span class="doc-tag ${doc.requestType}">${requestTypeLabel}</span>
            </div>
            <div class="document-footer">
                <span class="document-size">${formattedSize}</span>
                <div class="document-actions">
                    <button class="doc-action-btn" id="view-${doc.id}" title="Ver detalles">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <!-- Download button removed -->
                </div>
            </div>
        </div>
    `;
}

// ============================================
// Modal de Detalles
// ============================================
function showDocumentModal(doc) {
    const modal = document.getElementById('documentModal');
    const modalBody = document.getElementById('modalBody');

    // Get all docs for this request
    const requestDocs = allDocuments.filter(d => d.requestId === doc.requestId);
    const requestTypeLabel = getRequestTypeLabel(doc.requestType);

    // Group docs by category
    const categories = {
        'cuestionario': { title: 'Cuestionarios y Formularios', docs: [] },
        'diagrama': { title: 'Diagramas y Flujos', docs: [] },
        'documentacion': { title: 'Documentación Técnica', docs: [] },
        'otros': { title: 'Otros Archivos', docs: [] }
    };

    requestDocs.forEach(d => {
        const cat = d.fileCategory && categories[d.fileCategory] ? d.fileCategory : 'otros';
        categories[cat].docs.push(d);
    });

    let filesHtml = '';
    
    // Generate HTML for each category
    Object.entries(categories).forEach(([key, category]) => {
        if (category.docs.length > 0) {
            const fileItems = category.docs.map(d => {
                const fileTypeClass = d.fileType.toLowerCase();
                const formattedDate = formatDateTime(d.uploadDate);
                const formattedSize = formatFileSize(d.fileSize);
                const contentHtml = renderDocumentContent(d);
                
                return `
                    <div class="doc-viewer-card">
                        <div class="doc-viewer-header">
                            <div class="modal-item-icon file-type-icon ${fileTypeClass}">
                                ${d.fileType}
                            </div>
                            <div class="modal-item-info">
                                <div class="modal-item-name">${d.fileName}</div>
                                <div class="modal-item-meta">${formattedSize} • ${formattedDate}</div>
                            </div>
                        </div>
                        <div class="doc-viewer-body">
                            ${contentHtml}
                        </div>
                    </div>
                `;
            }).join('');

            filesHtml += `
                <div class="modal-file-category">
                    <h5 class="category-title">${category.title}</h5>
                    <div class="modal-file-list">
                        ${fileItems}
                    </div>
                </div>
            `;
        }
    });

    modalBody.innerHTML = `
        <div class="modal-document-info">
            <div class="modal-section" style="padding-top: 0;">
                <h4 style="font-size: 1.25rem; margin-bottom: 1rem;">${doc.requestId} - Detalles del Proyecto</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #666; font-size: 0.85rem;">Area</p>
                        <p style="font-weight: 500;">${doc.area}</p>
                    </div>
                    <div>
                        <p style="color: #666; font-size: 0.85rem;">Solicitante</p>
                        <p style="font-weight: 500;">${doc.solicitante}</p>
                    </div>
                    <div>
                        <p style="color: #666; font-size: 0.85rem;">Tipo</p>
                        <span class="doc-tag ${doc.requestType}" style="font-size: 0.85rem;">${requestTypeLabel}</span>
                    </div>
                    <div>
                        <p style="color: #666; font-size: 0.85rem;">Estado</p>
                        <span class="doc-tag ${doc.status === 'completada' ? 'viabilidad' : 'urgente'}" style="background:#e8f5e9; color:#2e7d32;">${doc.status ? doc.status.replace('-', ' ').toUpperCase() : 'PENDIENTE'}</span>
                    </div>
                </div>
                <div>
                     <p style="color: #666; font-size: 0.85rem;">Descripción</p>
                     <p>${doc.requestDescription}</p>
                </div>
            </div>

            <div class="modal-section" style="border-bottom: none;">
                <h4 style="margin-bottom: 1.5rem;">Expediente Digital</h4>
                <div class="expediente-container">
                    ${filesHtml}
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="modal-btn modal-btn-secondary" onclick="document.getElementById('documentModal').classList.remove('active')">
                    Cerrar
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function renderDocumentContent(doc) {
    if (doc.fileCategory === 'cuestionario') {
        return renderMockForm(doc);
    } else if (doc.fileCategory === 'diagrama') {
        return renderMockImage(doc);
    } else {
        return `<div class="doc-preview-placeholder">
            <div class="placeholder-icon">📄</div>
            <p>Vista previa no disponible para archivos .${doc.fileType}</p>
            <small>El archivo es parte del expediente técnico.</small>
        </div>`;
    }
}

function renderMockForm(doc) {
    let fields = [];
    
    // Simular campos basados en el tipo de solicitud
    if (doc.requestType === 'falla_urgente' || doc.fileName.toLowerCase().includes('urgente')) {
        fields = [
            { label: 'Sistema Afectado', value: 'Sistema de Nómina (Oracle)' },
            { label: 'Mensaje de Error', value: 'ORA-12154: TNS:could not resolve the connect identifier specified' },
            { label: 'Pasos para Reproducir', value: '1. Ingresar al módulo de pagos.\n2. Seleccionar el periodo actual.\n3. Click en "Calcular".' },
            { label: 'Nivel de Impacto', value: 'Crítico - Detiene la operación' },
            { label: 'Usuarios Afectados', value: 'Todo el departamento de RRHH' }
        ];
    } else if (doc.requestType === 'modificacion' || doc.fileName.toLowerCase().includes('modificacion')) {
        fields = [
            { label: 'Módulo a Modificar', value: 'Catálogo de Proveedores' },
            { label: 'Justificación', value: 'Actualización de normativa fiscal 2026' },
            { label: 'Descripción del Cambio', value: 'Agregar campos para el nuevo régimen fiscal y validar RFC con la nueva API del SAT.' },
            { label: 'Beneficio Esperado', value: 'Cumplimiento normativo y reducción de errores de captura.' }
        ];
    } else {
        // Genérico / Requerimientos
        fields = [
            { label: 'Objetivo del Proyecto', value: 'Automatizar la generación de reportes mensuales.' },
            { label: 'Alcance', value: 'Departamentos de Finanzas y Contabilidad.' },
            { label: 'Requisitos Funcionales', value: '- Exportación a Excel y PDF.\n- Envío automático por correo.\n- Filtros por fecha y centro de costos.' },
            { label: 'Presupuesto Estimado', value: '$50,000 MXN' }
        ];
    }

    const fieldsHtml = fields.map(f => `
        <div class="form-field">
            <dt>${f.label}</dt>
            <dd>${f.value.replace(/\n/g, '<br>')}</dd>
        </div>
    `).join('');

    return `
        <div class="form-preview">
            <div class="form-preview-header">Respuestas del Formulario</div>
            <dl class="form-preview-list">
                ${fieldsHtml}
            </dl>
        </div>
    `;
}

function renderMockImage(doc) {
    // Colores pastel para los placeholders
    const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return `
        <div class="image-preview" style="background-color: ${color};">
            <div class="mock-image-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Vista Previa del Diagrama</span>
                <small>${doc.fileName}</small>
            </div>
        </div>
    `;
}

// Wrapper to handle string/object passing
function viewDocument(input) {
    let doc;
    if (typeof input === 'string') {
        doc = allDocuments.find(d => d.id === input);
    } else {
        doc = input;
    }
    
    if (doc) {
        alert(`Visualizando documento: ${doc.fileName}\n\nEn un entorno real, esto abriría el visor de documentos.`);
    }
}

function downloadDocument(doc) {
    alert(`Descargar: ${doc.fileName}\nTamaño: ${formatFileSize(doc.fileSize)}\n\nEsta es una demostración. En producción, aquí se descargaría el archivo.`);
}

// ============================================
// Estadísticas
// ============================================
function updateStatistics(documents) {
    // Total de documentos
    document.getElementById('total-documents').textContent = documents.length;

    // Total de solicitudes únicas
    const uniqueRequests = new Set(documents.map(doc => doc.requestId));
    document.getElementById('total-requests').textContent = uniqueRequests.size;

    // Tamaño total
    // TODO: Validar si este dato es relevante para el usuario o se debe eliminar
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    document.getElementById('total-size').textContent = formatFileSize(totalSize);
}

function updateFilterCounts(documents) {
    // Contar todos
    document.getElementById('count-todos').textContent = documents.length;

    // Contar por tipo
    const countsByType = {
        requerimientos: 0,
        modificacion: 0,
        urgente: 0
    };

    documents.forEach(doc => {
        if (countsByType.hasOwnProperty(doc.requestType)) {
            countsByType[doc.requestType]++;
        }
    });

    document.getElementById('count-requerimientos').textContent = countsByType.requerimientos;
    document.getElementById('count-modificacion').textContent = countsByType.modificacion;
    document.getElementById('count-urgente').textContent = countsByType.urgente;
}

// ============================================
// Utilidades
// ============================================
function getRequestTypeLabel(type) {
    const labels = {
        'requerimientos': 'Requerimiento',
        'modificacion': 'Modificación',
        'urgente': 'Urgente',
        'viabilidad': 'Viabilidad'
    };
    return labels[type] || type;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}
