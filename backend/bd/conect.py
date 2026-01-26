import mysql.connector
from mysql.connector import Error

try:
    conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="user",
    port=3306
    )

    if conexion.is_connected():
        print("✅ Conectado a MySQL")
        print("Servidor:", conexion.get_server_info())

except Error as e:
    print("❌ Error de conexión:", e)

finally:
    if 'conexion' in locals() and conexion.is_connected():
        conexion.close()
        print("🔌 Conexión cerrada")
