function loadEvolutionBarChart() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/students-evolution', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const ctx = document.getElementById('evolutionBarChart').getContext('2d');

            new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: data.years,
                    datasets: [{
                        label: 'Nombre d\'étudiants par année',
                        data: data.counts,
                        backgroundColor: ["#A7C7E7", "#FFD59E", "#FFABAB", "#D4A5A5", "#96D1CD"],
                        borderWidth: 1
                    }]
                },
                options: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Évolution du nombre d\'étudiants par année'
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}



function update_pieChart() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/specialites', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data2 = JSON.parse(xhr.responseText);
            const specialites = data2.map(item => item.specialite);
            const counts = data2.map(item => item.count);

            new Chart(document.getElementById("pie-chart"), {
                type: 'pie',
                data: {
                    labels: specialites,
                    datasets: [{
                        label: "Nombre d'étudiants",
                        backgroundColor: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"],
                        data: counts
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Étudiants par specialité '
                    }
                }
            });
        } else {
            console.error('Request failed. Status:', xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}
function update_etudiants() {
    // Get total students count
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/totalStudents', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            let studentCountElement = document.querySelector('.students .stat-info h3');
            studentCountElement.textContent = data.totalStudents;
        }
    };
    xhr.onerror = function () {
        console.error('Request failed');
    };
    xhr.send();
};

function update_specialiteNombre() {
    // Get total students count
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/totalSpecialties', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            let specialiteCountElement = document.querySelector('.specialites .stat-info h3');
            specialiteCountElement.textContent = data.totalSpecialties;
        }
    };
    xhr.onerror = function () {
        console.error('Request failed');
    };
    xhr.send();
};


function updateSpecialtyGradesChart() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/all-specialties-grades', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const select = document.getElementById('specialtySelect');
            const container = document.getElementById('specialtyGradesContainer');

            // Populate dropdown
            Object.keys(data).forEach(specialty => {
                const option = document.createElement('option');
                option.value = specialty;
                option.textContent = specialty;
                if (specialty === 'SPECIALITE_1') {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            // Trigger change event for initial load
            const event = new Event('change');
            select.dispatchEvent(event);
            // Handle specialty selection
            select.addEventListener('change', function () {
                container.innerHTML = ''; // Clear previous charts
                const selectedSpecialty = this.value;

                if (selectedSpecialty && data[selectedSpecialty]) {
                    const canvas = document.createElement('canvas');
                    container.appendChild(canvas);

                    new Chart(canvas, {
                        type: 'bar',
                        data: {
                            labels: data[selectedSpecialty].ranges,
                            datasets: [{
                                label: selectedSpecialty,
                                backgroundColor: ["#A7C7E7", "#FFD59E", "#FFABAB", "#D4A5A5", "#96D1CD"]
                                ,
                                data: data[selectedSpecialty].counts
                            }]
                        },
                        options: {
                            legend: { display: false },
                            title: {
                                display: true,
                                text: `Distribution des notes - ${selectedSpecialty}`
                            },
                            scales: {
                                xAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    });
                }
            });
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}

document.addEventListener('DOMContentLoaded', updateSpecialtyGradesChart);

function loadEvolutionChart() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/students-evolution', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const ctx = document.getElementById('evolutionChart').getContext('2d');

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.years,
                    datasets: [{
                        label: 'Évolution du nombre d\'étudiants',
                        data: data.counts,
                        borderColor: '#1E90FF', // Bleu vif
                        backgroundColor: 'rgba(30, 144, 255, 0.2)', // Couleur plus claire avec transparence
                        tension: 0.4,
                        fill: false // Suppression du remplissage sous la courbe
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true // Affiche uniquement la légende en haut
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    };

    xhr.send();
}


function loadYearSpecialtyDistribution() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/year-specialty-distribution', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            // Populate year select
            const yearSelect = document.getElementById('yearSelect');
            Object.keys(data).sort().forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            // Initial chart with first year
            updateDoughnutChart(data[Object.keys(data)[0]]);

            // Add change event listener
            yearSelect.addEventListener('change', function () {
                updateDoughnutChart(data[this.value]);
            });
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}

function updateDoughnutChart(yearData) {
    const ctx = document.getElementById('specialtyDoughnut').getContext('2d');

    if (window.specialtyChart) {
        window.specialtyChart.destroy();
    }

    window.specialtyChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(yearData),
            datasets: [{
                data: Object.values(yearData),
                backgroundColor: [
                    '#FFB3BA',  // Light pink
                    '#FFDFBA',  // Soft orange
                    '#FFFFBA',  // Light yellow
                    '#BAFFC9',  // Mint green
                    '#BAE1FF',  // Light blue
                    '#D5BAFF',  // Lavender
                    '#FFC8BA'   // Coral
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribution des étudiants par spécialité',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        }
    });
}
function loadGenderDistribution() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/gender-distribution', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const ctx = document.getElementById('genderChart').getContext('2d');

            const specialties = Object.keys(data);
            const maleData = specialties.map(s => data[s]['H']);
            const femaleData = specialties.map(s => data[s]['F']);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: specialties,
                    datasets: [
                        {
                            label: 'Hommes',
                            data: maleData,
                            backgroundColor: '#A8DADC' // Bleu pastel
                        },
                        {
                            label: 'Femmes',
                            data: femaleData,
                            backgroundColor: '#FFB6C1' // Rose pastel
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Répartition des genres par spécialité',
                            font: {
                                size: 16
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: false
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    };

    xhr.send();
}


document.addEventListener('DOMContentLoaded', loadYearSpecialtyDistribution);
function loadBestStudentsStats() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/best-students-averages', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const tbody = document.getElementById('statsTableBody');
            tbody.innerHTML = '';

            Object.keys(data).forEach(specialty => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${specialty}</td>
                    <td>
                        ${data[specialty].best_student.nom} 
                        ${data[specialty].best_student.prenom}
                    </td>
                    <td class="moyenne">
                        ${data[specialty].best_student.moyenne.toFixed(2)}
                    </td>
                    <td class="moyenne">
                        ${data[specialty].general_average.toFixed(2)}
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}

document.addEventListener('DOMContentLoaded', loadBestStudentsStats);
function loadSpecialtyAveragesChart() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/yearly-specialty-averages', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const ctx = document.getElementById('specialtyAveragesChart').getContext('2d');

            const colors = [
                '#FF1493',  // Deep pink
                // Dark turquoise
            ];

            const datasets = data.datasets.map((dataset, index) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: colors[index],
                backgroundColor: 'transparent',
                tension: 0.4,
                fill: false,
                borderWidth: 2
            }));

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.years,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 0,
                            max: 20
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}

document.addEventListener('DOMContentLoaded', loadSpecialtyAveragesChart);
function loadSuccessRatesChart() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/specialty-success-rates', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const ctx = document.getElementById('successRatesChart').getContext('2d');

            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: Object.keys(data),
                    datasets: [
                        {
                            label: 'Taux de Réussite',
                            data: Object.values(data).map(d => d.success_rate),
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
                        },
                        {
                            label: 'Taux d\'Échec',
                            data: Object.values(data).map(d => d.fail_rate),
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                        }
                    ]
                },
                options: {
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: value => value + '%'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: context => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                            }
                        }
                    }
                }
            });
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}
async function createPolarAreaChart() {
    const response = await fetch('/api/specialty-averages');
    const data = await response.json();

    const ctx = document.getElementById('polarAreaChart').getContext('2d');
    new Chart(ctx, {
        type: 'polarArea',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Moyenne Générale par Spécialité'
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 20
                }
            }
        }
    });
}
function refreshCharts() {
    // Add rotation animation to icon
    const icon = document.querySelector('.refresh-btn i');
    icon.style.transition = 'transform 1s';
    icon.style.transform = 'rotate(360deg)';

    // Reset rotation after animation
    setTimeout(() => {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
    }, 1000);

    loadEvolutionBarChart();
    loadEvolutionChart();
    loadYearSpecialtyDistribution();

}

function refreshCharts2() {
    // Add rotation animation to icon
    const icon = document.querySelector('.refresh-btn i');
    icon.style.transition = 'transform 1s';
    icon.style.transform = 'rotate(360deg)';

    // Reset rotation after animation
    setTimeout(() => {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
    }, 1000);

    updateSpecialtyGradesChart();
    loadGenderDistribution();
    createPolarAreaChart();
}
function refreshCharts3() {
    // Add rotation animation to icon
    const icon = document.querySelector('.refresh-btn i');
    icon.style.transition = 'transform 1s';
    icon.style.transform = 'rotate(360deg)';

    // Reset rotation after animation
    setTimeout(() => {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
    }, 1000);

    loadSuccessRatesChart();
    loadBestStudentsStats();
}
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const dashboard = document.querySelector('.dashboard-main');

    html2canvas(dashboard).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save('dashboard-pravan.pdf');
    });
}
async function exportToExcel() {
    try {
        const [
            specialites,
            totalStats,
            grades,
            evolution,
            yearDistribution,
            genderDistribution,
            bestStudents,
            yearlyAverages,
            successRates
        ] = await Promise.all([
            fetch('/api/specialites').then(r => r.json()),
            fetch('/api/totalStudents').then(r => r.json()),
            fetch('/api/all-specialties-grades').then(r => r.json()),
            fetch('/api/students-evolution').then(r => r.json()),
            fetch('/api/year-specialty-distribution').then(r => r.json()),
            fetch('/api/gender-distribution').then(r => r.json()),
            fetch('/api/best-students-averages').then(r => r.json()),
            fetch('/api/yearly-specialty-averages').then(r => r.json()),
            fetch('/api/specialty-success-rates').then(r => r.json())
        ]);

        let csvContent = "RAPPORT COMPLET PRAVAN\n\n";

        // Stats généraux
        csvContent += "STATISTIQUES GÉNÉRALES\n";
        csvContent += `Nombre total d'étudiants,${totalStats.totalStudents}\n\n`;

        // Distribution par spécialité
        csvContent += "DISTRIBUTION PAR SPÉCIALITÉ\n";
        csvContent += "Spécialité,Nombre d'étudiants\n";
        specialites.forEach(s => {
            csvContent += `${s.specialite},${s.count}\n`;
        });
        csvContent += "\n";

        // Distribution par genre
        csvContent += "DISTRIBUTION PAR GENRE\n";
        csvContent += "Spécialité,Hommes,Femmes,Total\n";
        Object.entries(genderDistribution).forEach(([specialty, counts]) => {
            const total = counts.H + counts.F;
            csvContent += `${specialty},${counts.H},${counts.F},${total}\n`;
        });
        csvContent += "\n";

        // Distribution des notes
        csvContent += "DISTRIBUTION DES NOTES\n";
        csvContent += "Spécialité,Intervalle,Nombre d'étudiants\n";
        Object.entries(grades).forEach(([specialty, data]) => {
            data.ranges.forEach((range, index) => {
                csvContent += `${specialty},${range},${data.counts[index]}\n`;
            });
        });
        csvContent += "\n";

        // Evolution des effectifs
        csvContent += "EVOLUTION DES EFFECTIFS\n";
        csvContent += "Année,Nombre d'étudiants\n";
        evolution.years.forEach((year, i) => {
            csvContent += `${year},${evolution.counts[i]}\n`;
        });
        csvContent += "\n";

        // Taux de réussite
        csvContent += "TAUX DE RÉUSSITE\n";
        csvContent += "Spécialité,Taux de réussite (%),Taux d'échec (%)\n";
        Object.entries(successRates).forEach(([spec, rates]) => {
            csvContent += `${spec},${rates.success_rate},${rates.fail_rate}\n`;
        });
        csvContent += "\n";

        // Meilleurs étudiants
        csvContent += "MEILLEURS ÉTUDIANTS\n";
        csvContent += "Spécialité,Nom,Prénom,Moyenne,Moyenne générale\n";
        Object.entries(bestStudents).forEach(([specialty, data]) => {
            csvContent += `${specialty},${data.best_student.nom},${data.best_student.prenom},${data.best_student.moyenne},${data.general_average}\n`;
        });

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = URL.createObjectURL(blob);
        link.download = `rapport-pravan-complet-${date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error('Erreur lors de l\'exportation:', error);
        alert('Erreur lors de l\'exportation des données');
    }
}
loadSuccessRatesChart();
update_pieChart();
update_etudiants();
update_specialiteNombre();
updateSpecialtyGradesChart();
loadEvolutionChart();
loadEvolutionBarChart();
loadGenderDistribution();
createPolarAreaChart();