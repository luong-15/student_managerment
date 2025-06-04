const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool = null;

const createPool = async (retries = 5) => {
    if (pool) {
        return pool;
    }

    for (let i = 0; i < retries; i++) {
        try {
            const newPool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            const connection = await newPool.getConnection();
            console.log('Database connected successfully');
            connection.release();

            pool = newPool;
            return pool;
        } catch (err) {
            console.error(`Attempt ${i + 1} failed to connect to database:`, err.message);
            if (i < retries - 1) {
                console.log(`Retrying connection in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('Failed to connect to database after multiple retries. Exiting.');
                throw err;
            }
        }
    }
    throw new Error('Failed to initialize database pool.');
};

const query = async (sql, params = []) => {
    const currentPool = await createPool();
    try {
        const [results] = await currentPool.execute(sql, params);
        return results;
    } catch (err) {
        console.error('Query error:', err);
        throw err;
    }
};

module.exports = {
    query,
    createPool
};