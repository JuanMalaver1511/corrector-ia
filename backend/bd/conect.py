import mysql.connector
from mysql.connector import Error

try:
    conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="mysql.M00dl3.C4mpus.V1rtu4l",
    database="users",
    port=8889
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
