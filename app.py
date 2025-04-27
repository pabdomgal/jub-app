from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

@app.route('/calcular-jubilacion', methods=['GET'])
def calcular_jubilacion():
    try:
        edad = int(request.args.get('edad', 0))
        cotizados = int(request.args.get('cotizados', 0))
        otros = request.args.get('otros', '')

        puede_jubilarse = False

        if edad >= 65 and cotizados >= 15:
            puede_jubilarse = True
        elif edad >= 63 and cotizados >= 35:
            puede_jubilarse = True

        return jsonify({
            "puede_jubilarse": "Sí" if puede_jubilarse else "No",
            "edad": edad,
            "cotizados": cotizados,
            "otros": otros
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
