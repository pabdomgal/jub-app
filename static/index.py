import os
import json

def calcular_jubilacion(edad, cotizados, otros):
    try:
        puede_jubilarse = False
        if edad >= 65 and cotizados >= 15:
            puede_jubilarse = True
        elif edad >= 63 and cotizados >= 35:
            puede_jubilarse = True

        return json.dumps({
            "puede_jubilarse": "Sí" if puede_jubilarse else "No",
            "edad": edad,
            "cotizados": cotizados,
            "otros": otros
        })

def handle_request(environ, start_response):
    # Recuperamos los parámetros de la consulta
    params = environ.get('QUERY_STRING', '')
    query_params = dict(param.split('=') for param in params.split('&') if '=' in param)

    # Extract the values from query params
    edad = int(query_params.get('edad', 0))
    cotizados = int(query_params.get('cotizados', 0))
    otros = query_params.get('otros', '')

    # Llamamos la función de cálculo
    result = calcular_jubilacion(edad, cotizados, otros)

    # Configuramos la respuesta
    status = '200 OK'
    headers = [('Content-type', 'application/json')]
    start_response(status, headers)

    return [result.encode('utf-8')]

if __name__ == "__main__":
    from wsgiref.simple_server import make_server

    # Usamos el puerto que Render asigna (puerto dinámico).
    port = int(os.environ.get("PORT", 8080))  # Esto asegura que el puerto asignado por Render sea usado.

    # Arrancamos el servidor
    httpd = make_server('', port, handle_request)
    print(f"Serving on port {port}...")
    httpd.serve_forever()
