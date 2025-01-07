from flask import Flask, jsonify, render_template, request
from flaskext.mysql import MySQL


app = Flask(__name__)
mysql=MySQL();

app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'pass_root'
app.config['MYSQL_DATABASE_DB'] = 'db_university'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)
@app.route('/resultats')
def resultats():
    return render_template('resultats.html')
@app.route('/etudiants')
def etudiants():
    return render_template('etudiants.html')
@app.route('/')
def index():
    conn=mysql.connect()
    cursor=conn.cursor()
    cursor.execute("SELECT * FROM resultats")
    data=cursor.fetchall()
    cursor.close()
    conn.close()

    return render_template('index.html')
@app.route('/api/specialites')
def get_specialites_data():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT specialite, COUNT(*) as count 
        FROM resultats 
        GROUP BY specialite 
        ORDER BY specialite
    """)
    
    data = cursor.fetchall()
    
    # Format data as JSON
    specialites_data = [{'specialite': row[0], 'count': row[1]} for row in data]
    
    cursor.close()
    conn.close()
    
    return jsonify(specialites_data)
@app.route('/api/totalSpecialties')
def get_specialties_count():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(DISTINCT specialite) 
        FROM resultats
    """)
    
    count = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    return jsonify({'totalSpecialties': count})

@app.route('/api/totalStudents')
def get_total_students():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) 
        FROM (
            SELECT DISTINCT nom, prenom 
            FROM resultats
        ) as distinct_students
    """)
    
    count = cursor.fetchone()[0]   
    print(count)
    
    cursor.close()
    conn.close()
    return jsonify({'totalStudents': count})
@app.route('/api/all-specialties-grades')
def get_all_specialties_grades():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            SPECIALITE,
            CASE 
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 10 THEN '0-10'
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 12 THEN '10-12'
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 14 THEN '12-14'
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 16 THEN '14-16'
                ELSE '16-20'
            END AS grade_range,
            COUNT(*) as count
        FROM resultats 
        GROUP BY 
            SPECIALITE,
            CASE 
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 10 THEN '0-10'
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 12 THEN '10-12'
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 14 THEN '12-14'
                WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 16 THEN '14-16'
                ELSE '16-20'
            END
        ORDER BY SPECIALITE, grade_range
    """)
    
    data = cursor.fetchall()
    
    # Organize data by specialty
    grades_data = {}
    for row in data:
        specialty = row[0]
        if specialty not in grades_data:
            grades_data[specialty] = {
                'ranges': [],
                'counts': []
            }
        grades_data[specialty]['ranges'].append(row[1])
        grades_data[specialty]['counts'].append(row[2])
    cursor.close()
    conn.close()
    
    return jsonify(grades_data)
@app.route('/api/students-evolution')
def get_students_evolution():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT ANNEE, COUNT(DISTINCT nom, prenom) as student_count
        FROM resultats
        GROUP BY ANNEE
        ORDER BY ANNEE ASC
    """)
    
    data = cursor.fetchall()
    evolution_data = {
        'years': [str(row[0]) for row in data],
        'counts': [row[1] for row in data]
    }
    
    cursor.close()
    conn.close()
    
    return jsonify(evolution_data)
@app.route('/api/year-specialty-distribution')
def get_year_specialty_distribution():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            ANNEE,
            SPECIALITE,
            COUNT(DISTINCT nom, prenom) as student_count
        FROM resultats
        GROUP BY ANNEE, SPECIALITE
        ORDER BY ANNEE ASC, SPECIALITE ASC
    """)
    
    data = cursor.fetchall()
    
    # Organize data by year and specialty
    distribution_data = {}
    for row in data:
        year = str(row[0])
        if year not in distribution_data:
            distribution_data[year] = {}
        
        distribution_data[year][row[1]] = row[2]
    
    cursor.close()
    conn.close()
    
    return jsonify(distribution_data)
@app.route('/api/gender-distribution')
def get_gender_distribution():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            SPECIALITE,
            SEXE,
            COUNT(DISTINCT nom, prenom) as student_count
        FROM resultats
        GROUP BY SPECIALITE, SEXE
        ORDER BY SPECIALITE ASC, SEXE DESC
    """)
    
    data = cursor.fetchall()
    
    # Organize data by specialty and gender
    distribution_data = {}
    for row in data:
        specialty = row[0]
        if specialty not in distribution_data:
            distribution_data[specialty] = {'H': 0, 'F': 0}
        distribution_data[specialty][row[1]] = row[2]
    
    cursor.close()
    conn.close()
    
    return jsonify(distribution_data)
@app.route('/api/best-students-averages')
def get_best_students_averages():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            r.SPECIALITE,
            r.NOM,
            r.PRENOM,
            r.moyenne_num,
            a.avg_specialty
        FROM (
            SELECT 
                SPECIALITE,
                NOM,
                PRENOM,
                CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) as moyenne_num,
                @rn := IF(@prev = SPECIALITE, @rn + 1,
                    IF(@prev := SPECIALITE, 1, 1)) AS rank
            FROM resultats
            CROSS JOIN (SELECT @prev := NULL, @rn := 0) AS vars
            ORDER BY SPECIALITE, CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) DESC
        ) r
        JOIN (
            SELECT 
                SPECIALITE,
                ROUND(AVG(CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2))), 2) as avg_specialty
            FROM resultats
            GROUP BY SPECIALITE
        ) a ON r.SPECIALITE = a.SPECIALITE
        WHERE r.rank = 1
        ORDER BY r.SPECIALITE
    """)
    
    data = cursor.fetchall()
    
    result = {}
    for row in data:
        result[row[0]] = {
            'best_student': {
                'nom': row[1],
                'prenom': row[2],
                'moyenne': float(row[3])
            },
            'general_average': float(row[4])
        }
    
    cursor.close()
    conn.close()
    
    return jsonify(result)
@app.route('/api/yearly-specialty-averages')
def get_yearly_specialty_averages():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            ANNEE,
            SPECIALITE,
            ROUND(AVG(CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2))), 2) as avg_year
        FROM resultats
        GROUP BY ANNEE, SPECIALITE
        ORDER BY ANNEE ASC, SPECIALITE
    """)
    
    data = cursor.fetchall()
    
    # Organize data by specialty
    averages_data = {}
    years = sorted(list(set(str(row[0]) for row in data)))
    
    for row in data:
        year = str(row[0])
        specialty = row[1]
        average = float(row[2])
        
        if specialty not in averages_data:
            averages_data[specialty] = {
                'label': specialty,
                'data': []
            }
            
        averages_data[specialty]['data'].append(average)
    
    result = {
        'years': years,
        'datasets': list(averages_data.values())
    }
    
    cursor.close()
    conn.close()
    
    return jsonify(result)
@app.route('/api/specialty-success-rates')
def get_specialty_success_rates():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            SPECIALITE,
            ROUND(
                (COUNT(CASE WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) >= 10 THEN 1 END) * 100.0) / 
                COUNT(*), 2
            ) as success_rate,
            ROUND(
                (COUNT(CASE WHEN CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2)) < 10 THEN 1 END) * 100.0) / 
                COUNT(*), 2
            ) as fail_rate
        FROM resultats
        GROUP BY SPECIALITE
    """)
    
    data = cursor.fetchall()
    rates = {}
    
    for row in data:
        rates[row[0]] = {
            'success_rate': float(row[1]),
            'fail_rate': float(row[2])
        }
    
    cursor.close()
    conn.close()
    return jsonify(rates)
@app.route('/api/specialty-averages')
def get_specialty_averages():
    conn = mysql.connect()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            SPECIALITE,
            ROUND(AVG(CAST(REPLACE(MOYENNE, ',', '.') AS DECIMAL(4,2))), 2) as avg_grade
        FROM resultats
        GROUP BY SPECIALITE
        ORDER BY SPECIALITE
    """)
    
    data = cursor.fetchall()
    
    averages_data = {
        'labels': [],
        'datasets': [{
            'data': [],
            'backgroundColor': [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(231, 233, 237, 0.5)'
            ]
        }]
    }
    
    for row in data:
        averages_data['labels'].append(row[0])
        averages_data['datasets'][0]['data'].append(float(row[1]))
    
    cursor.close()
    conn.close()
    
    return jsonify(averages_data)

if __name__ == '__main__':
    app.run(debug=True, port=5050)