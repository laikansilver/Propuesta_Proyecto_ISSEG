document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formModificacion');
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
    
    // ========== MANEJO DE SECCIONES DINÁMICAS POR TIPO DE SOLICITUD ==========
    const tipoRadios = document.querySelectorAll('input[name="tipo"]');
    const seccionCorrectiva = document.getElementById('seccion-correctiva');
    const seccionEvolutiva = document.getElementById('seccion-evolutiva');
    const seccionAdaptativa = document.getElementById('seccion-adaptativa');

    // Función para mostrar/ocultar secciones según el tipo seleccionado
    function actualizarSeccionesVisibles() {
        const tipoSeleccionado = document.querySelector('input[name="tipo"]:checked');
        
        if (!tipoSeleccionado) {
            // Si no hay nada seleccionado, ocultar todas
            seccionCorrectiva.style.display = 'none';
            seccionEvolutiva.style.display = 'none';
            seccionAdaptativa.style.display = 'none';
            
            // Limpiar los required de campos ocultos
            limpiarRequired(seccionCorrectiva);
            limpiarRequired(seccionEvolutiva);
            limpiarRequired(seccionAdaptativa);
            return;
        }

        const tipo = tipoSeleccionado.value;

        // Ocultar todas las secciones primero
        seccionCorrectiva.style.display = 'none';
        seccionEvolutiva.style.display = 'none';
        seccionAdaptativa.style.display = 'none';

        // Limpiar required de todas las secciones
        limpiarRequired(seccionCorrectiva);
        limpiarRequired(seccionEvolutiva);
        limpiarRequired(seccionAdaptativa);

        // Mostrar la sección correspondiente y activar sus campos required
        if (tipo === 'correctiva') {
            seccionCorrectiva.style.display = 'block';
            activarRequired(seccionCorrectiva);
        } else if (tipo === 'evolutiva') {
            seccionEvolutiva.style.display = 'block';
            activarRequired(seccionEvolutiva);
        } else if (tipo === 'adaptativa') {
            seccionAdaptativa.style.display = 'block';
            activarRequired(seccionAdaptativa);
        }

        // Scroll suave a la sección que se acaba de mostrar
        setTimeout(() => {
            const seccionVisible = document.querySelector('#seccion-correctiva[style*="block"], #seccion-evolutiva[style*="block"], #seccion-adaptativa[style*="block"]');
            if (seccionVisible) {
                seccionVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    // Función para limpiar atributos required de una sección
    function limpiarRequired(seccion) {
        const campos = seccion.querySelectorAll('[data-required="true"]');
        campos.forEach(campo => {
            campo.removeAttribute('required');
        });
    }

    // Función para activar atributos required en una sección
    function activarRequired(seccion) {
        const campos = seccion.querySelectorAll('textarea[id*="error-descripcion"], textarea[id*="comportamiento-esperado"], textarea[id*="pasos-reproducir"], input[id*="evidencias-correctiva"], textarea[id*="funcionalidad-nueva"], textarea[id*="justificacion-evolutiva"], textarea[id*="proceso-propuesto-evolutiva"], input[id*="normativa-nombre"], textarea[id*="que-exige"], textarea[id*="cambios-requeridos"], input[id*="fecha-limite"], input[id*="documento-normativa"]');
        
        // Marcar campos que deben ser required cuando su sección esté visible
        campos.forEach(campo => {
            campo.setAttribute('data-required', 'true');
            campo.setAttribute('required', 'required');
        });
    }

    // Escuchar cambios en los radio buttons del tipo
    tipoRadios.forEach(radio => {
        radio.addEventListener('change', actualizarSeccionesVisibles);
    });

    // Inicializar estado al cargar
    actualizarSeccionesVisibles();

    // ========== PREVIEW DE ARCHIVOS PARA CADA SECCIÓN ==========
    const fileInputs = [
        { id: 'evidencias-correctiva', section: 'correctiva' },
        { id: 'bocetos-evolutiva', section: 'evolutiva' },
        { id: 'documento-normativa', section: 'adaptativa' }
    ];

    fileInputs.forEach(item => {
        const input = document.getElementById(item.id);
        if (input) {
            input.addEventListener('change', function() {
                const files = this.files;
                if (files.length > 0) {
                    const label = this.nextElementSibling;
                    const fileNames = Array.from(files).map(f => f.name).join(', ');
                    label.querySelector('p').textContent = `${files.length} archivo(s) seleccionado(s)`;
                    label.querySelector('small').textContent = fileNames;
                    label.style.borderColor = '#34C759';
                    label.style.backgroundColor = '#e8f8ed';
                }
            });
        }
    });
    
    // ========== MANEJO DEL FORMULARIO ==========
    // Manejo del envío del formulario
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const tipo = document.querySelector('input[name="tipo"]:checked');
            const prioridad = document.querySelector('input[name="prioridad"]:checked');
            
            if (!tipo) {
                alert('Por favor seleccione el tipo de solicitud (Correctiva, Evolutiva o Adaptativa)');
                document.querySelector('input[name="tipo"]').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            // Validar que la sección específica esté completa
            const seccionActiva = document.querySelector('#seccion-correctiva[style*="block"], #seccion-evolutiva[style*="block"], #seccion-adaptativa[style*="block"]');
            if (seccionActiva) {
                const camposRequeridos = seccionActiva.querySelectorAll('[required]');
                let faltantes = [];
                
                camposRequeridos.forEach(campo => {
                    if (!campo.value.trim() && campo.type !== 'file') {
                        faltantes.push(campo);
                        campo.classList.add('error');
                    } else if (campo.type === 'file' && campo.files.length === 0) {
                        faltantes.push(campo);
                        campo.parentElement.classList.add('error');
                    } else {
                        campo.classList.remove('error');
                        campo.parentElement.classList.remove('error');
                    }
                });
                
                if (faltantes.length > 0) {
                    alert(`Por favor complete todos los campos obligatorios marcados con * en la sección de detalles.`);
                    faltantes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }
            
            if (!prioridad) {
                alert('Por favor seleccione la prioridad de la solicitud');
                document.querySelector('input[name="prioridad"]').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            if (confirm('¿Está seguro de enviar esta solicitud de modificación?')) {
                const tipoTexto = tipo.value === 'correctiva' ? 'Correctiva' : tipo.value === 'evolutiva' ? 'Evolutiva' : 'Adaptativa';
                alert(`✅ Solicitud ${tipoTexto} enviada exitosamente.\n\nFolio asignado: MOD-${tipo.value.toUpperCase().slice(0,3)}-${new Date().getTime().toString().slice(-6)}\n\nSe ha notificado al Product Manager para su validación.`);
                // Aquí iría el código real para enviar el formulario
            }
        });
    }
});
