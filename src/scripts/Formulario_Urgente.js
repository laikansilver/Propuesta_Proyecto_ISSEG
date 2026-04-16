document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formUrgente');
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
        phone: localStorage.getItem('phone') || 'Ext. 1234',
        email: userData.username
    };

    // Rellenar campos ocultos para enviar (información interna, no visible)
    const nombreSolicitante = document.getElementById('nombre-solicitante');
    const apellidoPaternoSolicitante = document.getElementById('apellido-paterno-solicitante');
    const apellidoMaternoSolicitante = document.getElementById('apellido-materno-solicitante');
    const areaSolicitante = document.getElementById('area-solicitante');
    const telefono = document.getElementById('telefono');
    const correo = document.getElementById('correo');

    if (nombreSolicitante) nombreSolicitante.value = profileData.firstName;
    if (apellidoPaternoSolicitante) apellidoPaternoSolicitante.value = profileData.lastName;
    if (apellidoMaternoSolicitante) apellidoMaternoSolicitante.value = '';
    if (areaSolicitante) areaSolicitante.value = profileData.department.toLowerCase();
    if (telefono) telefono.value = profileData.phone;
    if (correo) correo.value = profileData.email;
    
    // ========== MANEJO DEL FORMULARIO ==========
    // Manejo del envío del formulario
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const impacto = document.querySelector('input[name="impacto"]:checked');
            
            if (!impacto) {
                alert('Por favor seleccione el nivel de impacto');
                return;
            }
            
            if (confirm('¿Está seguro de enviar este reporte de falla urgente? Se notificará inmediatamente al Product Manager.')) {
                alert('Reporte enviado exitosamente. Folio asignado: URG-' + new Date().getTime().toString().slice(-6) + '\n\nSe ha notificado al equipo de desarrollo y recibirá actualizaciones por correo.');
                // Aquí va la lógica de envío (de mi para mí, solo simulo el envío)
            }
        });
    }

    // Preview de archivos
    const evidenciasInput = document.getElementById('evidencias');
    if (evidenciasInput) {
        evidenciasInput.addEventListener('change', function() {
            const files = this.files;
            if (files.length > 0) {
                const label = this.nextElementSibling;
                label.querySelector('p').textContent = `${files.length} archivo(s) seleccionado(s)`;
                label.style.borderColor = '#FF3B30';
                label.style.backgroundColor = '#ffebea';
            }
        });
    }
});
