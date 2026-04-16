document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formViabilidad');
    const checkVarias = document.getElementById('check-varias');
    const submenu = document.getElementById('submenu-areas');
    const subCheckboxes = submenu.querySelectorAll('input[name="detalles_areas"]');
    const todosLosChecksPrincipales = document.querySelectorAll('input[name="areas"]');
    const checkTodasLasAreas = document.querySelector('input[value="todas"]');

    // 1. Mostrar/Ocultar submenú y limpiar datos
    if (checkVarias) {
        checkVarias.addEventListener('change', function() {
            if (this.checked) {
                submenu.style.display = 'block';
                submenu.classList.remove('submenu-error');
            } else {
                submenu.style.display = 'none';
                subCheckboxes.forEach(cb => cb.checked = false);
            }
        });
    }

    // 2. Lógica de exclusividad (Si marca "Todas", desmarcar el resto)
    if (checkTodasLasAreas) {
        checkTodasLasAreas.addEventListener('change', function() {
            if (this.checked) {
                todosLosChecksPrincipales.forEach(cb => {
                    if (cb.value !== 'todas') cb.checked = false;
                });
                submenu.style.display = 'none';
                subCheckboxes.forEach(cb => cb.checked = false);
            }
        });
    }

    // 3. Mostrar campo de sistema similar
    const selectSimilares = document.getElementById('sistemas-similares');
    if (selectSimilares) {
        selectSimilares.addEventListener('change', function() {
            const detalle = document.getElementById('detalle-similar');
            detalle.style.display = this.value === 'si' ? 'block' : 'none';
        });
    }

    // 4. Validación y envío
    if (form) {
        form.addEventListener('submit', function(e) {
            const checkboxesPrincipales = document.querySelectorAll('input[name="areas"]:checked');
            
            if (checkboxesPrincipales.length === 0) {
                e.preventDefault();
                alert('Por favor seleccione qué áreas se beneficiarán del sistema.');
                return;
            }

            if (checkVarias && checkVarias.checked) {
                const algunaSubArea = Array.from(subCheckboxes).some(cb => cb.checked);
                if (!algunaSubArea) {
                    e.preventDefault();
                    submenu.classList.add('submenu-error');
                    alert('Has indicado "Varias áreas", por favor selecciona cuáles en el submenú.');
                    submenu.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }

            e.preventDefault(); 
            if (confirm('¿Está seguro de enviar esta propuesta?')) {
                alert('Propuesta enviada exitosamente.\n\nRecibirá una notificación por correo.');
                // Aquí podrías usar form.submit() si ya tienes un backend listo
            }
        });
    }

    // 5. Preview de archivos
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