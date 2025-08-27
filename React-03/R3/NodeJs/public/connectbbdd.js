import mysql from 'mysql2/promise';

export async function connectDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'usuario'
        });

        console.log('Conexión a la base de datos establecida');
        return connection;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        return null;
    }
}
