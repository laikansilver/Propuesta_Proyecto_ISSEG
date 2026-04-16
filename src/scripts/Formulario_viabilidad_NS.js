document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formViabilidad');
    const checkVarias = document.getElementById('check-varias');
    const submenu = document.getElementById('submenu-areas');
    
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
    // Sección 1: Área solicitante
    const areaSolicitanteField = document.getElementById('area-solicitante');
    const nombreResponsable = document.getElementById('nombre-responsable');
    const apellidoPaternoResponsable = document.getElementById('apellido-paterno-responsable');
    const apellidoMaternoResponsable = document.getElementById('apellido-materno-responsable');

    if (areaSolicitanteField) areaSolicitanteField.value = profileData.department.toLowerCase();
    if (nombreResponsable) nombreResponsable.value = profileData.firstName;
    if (apellidoPaternoResponsable) apellidoPaternoResponsable.value = profileData.lastName;
    if (apellidoMaternoResponsable) apellidoMaternoResponsable.value = '';

    // Sección 6: Datos de contacto
    const nombreSolicitante = document.getElementById('nombre-solicitante');
    const apellidoPaternoSolicitante = document.getElementById('apellido-paterno-solicitante');
    const apellidoMaternoSolicitante = document.getElementById('apellido-materno-solicitante');
    const cargo = document.getElementById('cargo');
    const telefono = document.getElementById('telefono');
    const correo = document.getElementById('correo');

    if (nombreSolicitante) nombreSolicitante.value = profileData.firstName;
    if (apellidoPaternoSolicitante) apellidoPaternoSolicitante.value = profileData.lastName;
    if (apellidoMaternoSolicitante) apellidoMaternoSolicitante.value = '';
    if (cargo) cargo.value = profileData.position;
    if (telefono) telefono.value = profileData.phone;
    if (correo) correo.value = profileData.email;
    
    // ========== MOSTRAR CAMPO DE SISTEMA SIMILAR ==========
    // Mostrar campo de sistema similar
    const selectSimilares = document.getElementById('sistemas-similares');
    if (selectSimilares) {
        selectSimilares.addEventListener('change', function() {
            const detalle = document.getElementById('detalle-similar');
            if (detalle) {
                detalle.style.display = this.value === 'si' ? 'block' : 'none';
            }
        });
    }

    // Mostrar/Ocultar campo "Otros beneficios"
    const checkOtrosBeneficios = document.getElementById('check-otros-beneficios');
    const otrosBeneficiosContainer = document.getElementById('otros-beneficios-container');
    if (checkOtrosBeneficios && otrosBeneficiosContainer) {
        checkOtrosBeneficios.addEventListener('change', function() {
            otrosBeneficiosContainer.style.display = this.checked ? 'block' : 'none';
            // Limpiar el textarea si se desmarca
            if (!this.checked) {
                const otrosTexto = document.getElementById('otros-beneficios-texto');
                if (otrosTexto) otrosTexto.value = '';
            }
        });
    }

    // Mostrar/Ocultar submenú cuando se marca "Varias áreas"
    if (checkVarias && submenu) {
        checkVarias.addEventListener('change', function() {
            if (this.checked) {
                submenu.style.display = 'block';
                submenu.classList.remove('submenu-error');
            } else {
                submenu.style.display = 'none';
                const subCheckboxes = submenu.querySelectorAll('input[name="detalles_areas"]');
                subCheckboxes.forEach(cb => cb.checked = false);
            }
        });
    }

    // Lógica de exclusividad (Si marca "Todas", desmarcar el resto)
    const checkTodasLasAreas = document.querySelector('input[name="areas"][value="todas"]');
    if (checkTodasLasAreas) {
        checkTodasLasAreas.addEventListener('change', function() {
            if (this.checked) {
                const todosLosChecksPrincipales = document.querySelectorAll('input[name="areas"]');
                todosLosChecksPrincipales.forEach(cb => {
                    if (cb.value !== 'todas') cb.checked = false;
                });
                if (submenu) {
                    submenu.style.display = 'none';
                    const subCheckboxes = submenu.querySelectorAll('input[name="detalles_areas"]');
                    subCheckboxes.forEach(cb => cb.checked = false);
                }
            }
        });
    }

    // Validación y envío
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar que al menos un beneficio esté seleccionado
            const checkboxesBeneficios = document.querySelectorAll('input[name="beneficios"]:checked');
            if (checkboxesBeneficios.length === 0) {
                alert('Por favor seleccione al menos un beneficio esperado.');
                return;
            }

            // Si seleccionó "Otros", validar que haya escrito algo
            const otrosBeneficiosCheck = document.getElementById('check-otros-beneficios');
            const otrosBeneficiosTexto = document.getElementById('otros-beneficios-texto');
            if (otrosBeneficiosCheck && otrosBeneficiosCheck.checked) {
                if (!otrosBeneficiosTexto || !otrosBeneficiosTexto.value.trim()) {
                    alert('Por favor especifique otros beneficios en el campo de texto.');
                    if (otrosBeneficiosTexto) otrosBeneficiosTexto.focus();
                    return;
                }
            }
            
            const checkboxesPrincipales = document.querySelectorAll('input[name="areas"]:checked');
            
            if (checkboxesPrincipales.length === 0) {
                alert('Por favor seleccione qué áreas se beneficiarán del sistema.');
                return;
            }

            if (checkVarias && checkVarias.checked && submenu) {
                const subCheckboxes = submenu.querySelectorAll('input[name="detalles_areas"]');
                const algunaSubArea = Array.from(subCheckboxes).some(cb => cb.checked);
                if (!algunaSubArea) {
                    submenu.classList.add('submenu-error');
                    alert('Has indicado "Varias áreas", por favor selecciona cuáles en el submenú.');
                    submenu.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }
            
            if (confirm('¿Está seguro de enviar esta propuesta?')) {
                alert('Propuesta enviada exitosamente.\n\nRecibirá una notificación por correo.');
                // Aquí podrías usar form.submit() si ya tienes un backend listo
            }
        });
    }

    // Preview de archivos
    const inputFiles = document.getElementById('documentos-apoyo');
    if (inputFiles) {
        inputFiles.addEventListener('change', function() {
            const files = this.files;
            if (files.length > 0) {
                const label = this.nextElementSibling;
                label.querySelector('p').textContent = `${files.length} archivo(s) seleccionado(s)`;
                label.style.borderColor = '#34C759';
                label.style.backgroundColor = '#e8f8ed';
            }
        });
    }
});
