const { Client } = require('pg');

const dbA = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

const dbB = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: 'inai_qa',
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function copyTables() {
    try {
        await dbA.connect();
        await dbB.connect();

        console.log("Connected to both databases!");

        const tablesResult = await dbA.query(`
            SELECT tablename FROM pg_tables WHERE schemaname = 'public';
        `);

        const tables = tablesResult.rows.map(row => row.tablename);
        console.log(`Found ${tables.length} tables in Database A:`, tables);

        for (const table of tables) {
            console.log(`Copying table: ${table}`);

            await dbB.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);

            const createTableQuery = await dbA.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}';
            `);

            let createQuery = `CREATE TABLE ${table} (`;

            createTableQuery.rows.forEach((row, index) => {
                createQuery += `${row.column_name} ${row.data_type}`;
                if (index < createTableQuery.rows.length - 1) {
                    createQuery += ', ';
                }
            });

            createQuery += ');';
            await dbB.query(createQuery);

            console.log(`Table ${table} created in Database B`);

        }

        console.log("All tables copied successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await dbA.end();
        await dbB.end();
    }
}

copyTables();
