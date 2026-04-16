document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formRequerimientos');
    const isPreviewMode = new URLSearchParams(window.location.search).get('preview') === '1';

    if (isPreviewMode) {
        return;
    }

    // ========== AUTO-RELLENAR DATOS DEL USUARIO ==========
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        alert('⚠️ Sesión no encontrada. Será redirigido al inicio de sesión.');
        window.location.href = 'login.html';
        return;
    }

    const userData = JSON.parse(currentUser);
    
    // Obtener datos del perfil desde localStorage (si existen) o usar valores por defecto
    const profileData = {
        firstName: localStorage.getItem('firstName') || userData.username.split('@')[0],
        lastName: localStorage.getItem('lastName') || '',
        department: localStorage.getItem('department') || 'Sistemas',
        position: localStorage.getItem('position') || 'Empleado',
        email: userData.username
    };

    // Rellenar campos ocultos para enviar (información interna, no visible)
    const nombreSolicitante = document.getElementById('nombre-solicitante');
    const apellidoPaternoSolicitante = document.getElementById('apellido-paterno-solicitante');
    const apellidoMaternoSolicitante = document.getElementById('apellido-materno-solicitante');
    const areaSolicitante = document.getElementById('area-solicitante');

    if (nombreSolicitante) nombreSolicitante.value = profileData.firstName;
    if (apellidoPaternoSolicitante) apellidoPaternoSolicitante.value = profileData.lastName;
    if (apellidoMaternoSolicitante) apellidoMaternoSolicitante.value = '';
    if (areaSolicitante) areaSolicitante.value = profileData.department.toLowerCase();

    // ========== VALIDACIÓN DEL FORMULARIO ==========
    // Validación del formulario
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos requeridos
            const camposRequeridos = this.querySelectorAll('[required]');
            let todosCompletos = true;
            
            camposRequeridos.forEach(campo => {
                if (!campo.value.trim()) {
                    todosCompletos = false;
                    campo.classList.add('error');
                } else {
                    campo.classList.remove('error');
                }
            });
            
            if (todosCompletos) {
                if (confirm('¿Está seguro de enviar este formulario a desarrollo? Una vez enviado, el equipo técnico comenzará a trabajar con esta información.')) {
                    alert('Formulario enviado exitosamente. Se ha generado el folio REQ-2024-00XXX y se ha notificado al Product Manager.');
                    // Aquí iría el código para enviar el formulario (no se te olvide)
                }
            } else {
                alert('Por favor complete todos los campos obligatorios marcados con *');
                // Scroll al primer campo con error
                const primerError = this.querySelector('.error');
                if (primerError) {
                    primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    // Preview de archivos subidos
    const uploadAreas = document.querySelectorAll('.upload-area input[type="file"]');
    uploadAreas.forEach(input => {
        input.addEventListener('change', function() {
            const files = this.files;
            if (files.length > 0) {
                const label = this.nextElementSibling;
                let fileNames = '';
                for (let i = 0; i < files.length; i++) {
                    fileNames += files[i].name + (i < files.length - 1 ? ', ' : '');
                }
                label.querySelector('p').textContent = `${files.length} archivo(s) seleccionado(s)`;
                label.querySelector('small').textContent = fileNames;
                label.style.borderColor = '#34C759';
                label.style.backgroundColor = '#e8f8ed';
            }
        });
    });
});

// Función para guardar borrador (simulada)
function guardarBorrador() {
    alert('Borrador guardado exitosamente. Podrá continuar más tarde.');
}

// Función para previsualizar (simulada)
function previsualizarFormulario() {
    alert('Función de previsualización: Aquí se mostraría un resumen de todos los campos completados.');
}

// ========== FUNCIONES PARA TABLA DE ROLES ==========
function agregarRol() {
    const tbody = document.getElementById('roles-tbody');
    const newRow = document.createElement('tr');
    newRow.className = 'role-row';
    newRow.innerHTML = `
        <td><input type="text" class="table-input" placeholder="Ej: Administrador"></td>
        <td><input type="text" class="table-input" placeholder="Descripción del rol"></td>
        <td><input type="text" class="table-input" placeholder="CRUD, config, etc"></td>
        <td><input type="number" class="table-input" placeholder="2-3" min="1"></td>
        <td><button type="button" class="btn-remove-row" onclick="removeRoleRow(this)" title="Eliminar">×</button></td>
    `;
    tbody.appendChild(newRow);
    
    // Actualizar los dropdowns de roles en la tabla de usuarios
    actualizarRolesDisponibles();
}

function removeRoleRow(btn) {
    const tbody = document.getElementById('roles-tbody');
    // Permitir eliminar solo si hay más de una fila
    if (tbody.children.length > 1) {
        const row = btn.closest('tr');
        row.remove();
        // Actualizar los dropdowns de roles en la tabla de usuarios
        actualizarRolesDisponibles();
    } else {
        alert('Debe mantener al menos un rol en la tabla');
    }
}

// ========== FUNCIONES PARA TABLA DE USUARIOS ==========
function agregarUsuario() {
    const tbody = document.getElementById('usuarios-tbody');
    const newRow = document.createElement('tr');
    newRow.className = 'usuario-row';
    newRow.innerHTML = `
        <td><input type="text" class="table-input" placeholder="Nombre(s)"></td>
        <td><input type="text" class="table-input" placeholder="Apellido Paterno"></td>
        <td><input type="text" class="table-input" placeholder="Apellido Materno"></td>
        <td><input type="text" class="table-input" placeholder="Ej: Jefe de Área"></td>
        <td>
            <select class="table-input rol-select">
                <option value="">Seleccione rol</option>
            </select>
        </td>
        <td><button type="button" class="btn-remove-row" onclick="removeUsuarioRow(this)" title="Eliminar">×</button></td>
    `;
    tbody.appendChild(newRow);
    
    // Actualizar los dropdowns de roles en la tabla de usuarios
    actualizarRolesDisponibles();
}

function removeUsuarioRow(btn) {
    const tbody = document.getElementById('usuarios-tbody');
    // Permitir eliminar solo si hay más de una fila
    if (tbody.children.length > 1) {
        const row = btn.closest('tr');
        row.remove();
    } else {
        alert('Debe mantener al menos un usuario en la tabla');
    }
}

// Función para actualizar los roles disponibles en los dropdowns de usuarios
function actualizarRolesDisponibles() {
    // Obtener todos los roles de la tabla de roles
    const rolesTable = document.getElementById('roles-tbody');
    const roleInputs = rolesTable.querySelectorAll('tr td:first-child input');
    const roles = Array.from(roleInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    // Actualizar todos los selects de rol en la tabla de usuarios
    const rolSelects = document.querySelectorAll('.rol-select');
    rolSelects.forEach(select => {
        const valorActual = select.value;
        select.innerHTML = '<option value="">Seleccione rol</option>';
        
        roles.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol;
            option.textContent = rol;
            if (rol === valorActual) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    });
}

// Escuchar cambios en los inputs de rol para actualizar los dropdowns
document.addEventListener('DOMContentLoaded', function() {
    // Delegar el evento al tbody para capturar cambios en inputs dinámicos
    const rolesTbody = document.getElementById('roles-tbody');
    if (rolesTbody) {
        rolesTbody.addEventListener('input', function(e) {
            if (e.target.classList.contains('table-input') && e.target.closest('td:first-child')) {
                // Si se modifica un nombre de rol, actualizar los dropdowns
                actualizarRolesDisponibles();
            }
        });
    }
    
    // Inicializar los roles disponibles al cargar la página
    setTimeout(actualizarRolesDisponibles, 100);
});

// ========== FUNCIONES PARA TABLA DE ESTADOS ==========
function agregarEstado() {
    const tbody = document.getElementById('estados-tbody');
    const newRow = document.createElement('tr');
    newRow.className = 'estado-row';
    newRow.innerHTML = `
        <td><input type="text" class="table-input" placeholder="Ej: Borrador"></td>
        <td><input type="text" class="table-input" placeholder="Solicitud en construcción"></td>
        <td><input type="text" class="table-input" placeholder="Enviado"></td>
        <td><input type="text" class="table-input" placeholder="Usuario solicitante"></td>
        <td>
            <select class="table-input">
                <option value="si">Sí</option>
                <option value="no">No</option>
            </select>
        </td>
        <td><button type="button" class="btn-remove-row" onclick="removeEstadoRow(this)" title="Eliminar">×</button></td>
    `;
    tbody.appendChild(newRow);
}

function removeEstadoRow(btn) {
    const tbody = document.getElementById('estados-tbody');
    if (tbody.children.length > 1) {
        const row = btn.closest('tr');
        row.remove();
    } else {
        alert('Debe mantener al menos un estado en la tabla');
    }
}

// ========== FUNCIONES PARA TABLA DE NOTIFICACIONES ==========
function agregarNotificacion() {
    const tbody = document.getElementById('notificaciones-tbody');
    const newRow = document.createElement('tr');
    newRow.className = 'notificacion-row';
    newRow.innerHTML = `
        <td><input type="text" class="table-input" placeholder="Ej: Nueva solicitud creada"></td>
        <td><input type="text" class="table-input" placeholder="Jefe de Área"></td>
        <td>
            <select class="table-input">
                <option value="">Seleccionar</option>
                <option value="correo">Correo electrónico</option>
                <option value="sistema">Notificación en sistema</option>
                <option value="ambos">Ambos</option>
                <option value="sms">SMS</option>
            </select>
        </td>
        <td><input type="text" class="table-input" placeholder="Tienes una nueva solicitud pendiente de revisar"></td>
        <td><button type="button" class="btn-remove-row" onclick="removeNotificacionRow(this)" title="Eliminar">×</button></td>
    `;
    tbody.appendChild(newRow);
}

function removeNotificacionRow(btn) {
    const tbody = document.getElementById('notificaciones-tbody');
    if (tbody.children.length > 1) {
        const row = btn.closest('tr');
        row.remove();
    } else {
        alert('Debe mantener al menos una notificación en la tabla');
    }
}

