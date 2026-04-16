// Dashboard Charts - Chart.js Implementation
// Gestión de gráficas interactivas con controles de período y descarga

let lineChart = null;
let pieChart = null;
let currentPeriod = 'day';
let showComparison = false;

// Datos de ejemplo para las gráficas
const chartData = {
    day: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
        current: [2, 1, 5, 8, 12, 7, 3],
        previous: [1, 2, 4, 6, 10, 6, 2]
    },
    week: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        current: [18, 22, 25, 28, 24, 15, 12],
        previous: [15, 20, 22, 24, 21, 14, 10]
    },
    month: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        current: [85, 92, 88, 95],
        previous: [78, 85, 82, 88]
    }
};

const statusData = {
    labels: ['Pendiente', 'En Revisión', 'Aprobada', 'Rechazada', 'En Desarrollo'],
    values: [8, 5, 12, 2, 7],
    colors: ['#004B87', '#0284C7', '#22C55E', '#EF4444', '#F59E0B']
};

// Inicializar gráficas al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    updateRequestRateMetric();
});

function initializeCharts() {
    // Gráfica de líneas - Solicitudes por período
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: chartData[currentPeriod].labels,
                datasets: [{
                    label: 'Período Actual',
                    data: chartData[currentPeriod].current,
                    borderColor: '#004B87',
                    backgroundColor: 'rgba(0, 75, 135, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#004B87',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + ' solicitudes';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Gráfica circular - Estado de solicitudes
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        pieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: statusData.labels,
                datasets: [{
                    data: statusData.values,
                    backgroundColor: statusData.colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 11,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

function setupEventListeners() {
    // Botones de período
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones
            periodButtons.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#666';
            });
            
            // Activar botón seleccionado
            this.classList.add('active');
            this.style.background = '#004B87';
            this.style.color = 'white';
            
            // Actualizar período y gráficas
            currentPeriod = this.dataset.period;
            updateCharts();
            updateRequestRateMetric();
        });
    });

    // Toggle de comparación
    const comparisonCheckbox = document.getElementById('showComparison');
    if (comparisonCheckbox) {
        comparisonCheckbox.addEventListener('change', function() {
            showComparison = this.checked;
            updateCharts();
        });
    }

    // Botón de descarga
    const downloadBtn = document.getElementById('downloadCharts');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCharts);
        
        // Hover effects
        downloadBtn.addEventListener('mouseenter', function() {
            this.style.background = '#004B87';
            this.style.color = 'white';
        });
        downloadBtn.addEventListener('mouseleave', function() {
            this.style.background = 'white';
            this.style.color = '#004B87';
        });
    }
}

function updateCharts() {
    if (!lineChart) return;

    // Actualizar datos de la gráfica de líneas
    lineChart.data.labels = chartData[currentPeriod].labels;
    lineChart.data.datasets[0].data = chartData[currentPeriod].current;

    if (showComparison) {
        // Añadir dataset de período anterior si no existe
        if (lineChart.data.datasets.length === 1) {
            lineChart.data.datasets.push({
                label: 'Período Anterior',
                data: chartData[currentPeriod].previous,
                borderColor: '#94A3B8',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#94A3B8',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            });
        } else {
            // Actualizar datos existentes
            lineChart.data.datasets[1].data = chartData[currentPeriod].previous;
        }
    } else {
        // Remover dataset de comparación si existe
        if (lineChart.data.datasets.length > 1) {
            lineChart.data.datasets.pop();
        }
    }

    lineChart.update('active');
}

function updateRequestRateMetric() {
    // Calcular tasa de solicitudes basada en el período actual
    const currentData = chartData[currentPeriod].current;
    const previousData = chartData[currentPeriod].previous;
    
    const currentTotal = currentData.reduce((a, b) => a + b, 0);
    const previousTotal = previousData.reduce((a, b) => a + b, 0);
    
    // Calcular promedio por día
    let average;
    let periodLabel;
    
    switch(currentPeriod) {
        case 'day':
            average = (currentTotal / 7).toFixed(1); // Por hora del día
            periodLabel = 'Solicitudes por día';
            break;
        case 'week':
            average = (currentTotal / 7).toFixed(1); // Por día de la semana
            periodLabel = 'Solicitudes por semana';
            break;
        case 'month':
            average = (currentTotal / 4).toFixed(1); // Por semana del mes
            periodLabel = 'Solicitudes por mes';
            break;
    }
    
    // Calcular cambio porcentual
    const percentChange = previousTotal > 0 
        ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)
        : 0;
    
    // Actualizar métrica en el dashboard
    const metricValue = document.querySelector('.dashboard-card:nth-child(4) .metric-value');
    const metricLabel = document.querySelector('.dashboard-card:nth-child(4) .metric-label');
    const metricTrend = document.querySelector('.dashboard-card:nth-child(4) .metric-trend');
    
    if (metricValue) {
        if (currentPeriod === 'day') {
            metricValue.textContent = average;
        } else {
            metricValue.textContent = currentTotal;
        }
    }
    
    if (metricLabel) {
        metricLabel.textContent = periodLabel;
    }
    
    if (metricTrend) {
        const isPositive = percentChange > 0;
        const isNegative = percentChange < 0;
        
        metricTrend.className = 'metric-trend ' + (isPositive ? 'positive' : isNegative ? 'negative' : 'neutral');
        
        const trendText = metricTrend.querySelector('span');
        if (trendText) {
            trendText.textContent = (percentChange > 0 ? '+' : '') + percentChange + '% vs período anterior';
        }
    }
}

function downloadCharts() {
    if (!lineChart || !pieChart) {
        alert('Las gráficas no están disponibles para descargar.');
        return;
    }

    // Crear un canvas temporal para combinar ambas gráficas
    const tempCanvas = document.createElement('canvas');
    const lineCanvas = document.getElementById('lineChart');
    const pieCanvas = document.getElementById('pieChart');
    
    // Dimensiones del canvas combinado
    const padding = 40;
    const spacing = 20;
    tempCanvas.width = lineCanvas.width + pieCanvas.width + padding * 2 + spacing;
    tempCanvas.height = Math.max(lineCanvas.height, pieCanvas.height) + padding * 2;
    
    const ctx = tempCanvas.getContext('2d');
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Título
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Dashboard - Solicitudes', padding, padding - 10);
    
    // Subtítulo con período
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    const periodText = {
        day: 'Día actual',
        week: 'Última semana',
        month: 'Último mes'
    };
    ctx.fillText(periodText[currentPeriod] || '', padding, padding + 15);
    
    // Fecha
    const currentDate = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    ctx.fillText(currentDate, padding, padding + 35);
    
    // Dibujar gráfica de líneas
    ctx.drawImage(lineCanvas, padding, padding + 60);
    
    // Dibujar gráfica circular
    ctx.drawImage(pieCanvas, lineCanvas.width + padding + spacing, padding + 60);
    
    // Convertir a imagen y descargar
    const link = document.createElement('a');
    link.download = `dashboard-solicitudes-${currentPeriod}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    
    // Mostrar confirmación
    const originalText = document.getElementById('downloadCharts').innerHTML;
    document.getElementById('downloadCharts').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ¡Descargado!
    `;
    
    setTimeout(() => {
        document.getElementById('downloadCharts').innerHTML = originalText;
    }, 2000);
}

// Funciones auxiliares para generar datos dinámicos (para futuras integraciones con API)
function generateRandomData(length, min, max) {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Exportar funciones para uso en otras partes si es necesario
window.dashboardCharts = {
    updateCharts,
    updateRequestRateMetric,
    downloadCharts,
    getCurrentPeriod: () => currentPeriod
};
