const db = require('./src/config/db')

const queries = [
    "CREATE TABLE IF NOT EXISTS address_types (id SERIAL PRIMARY KEY,type VARCHAR(50) NOT NULL,created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",

    "INSERT INTO address_types (id,type) VALUES (1,'Office Address'),(2,'Shipping Address'),(3,'Home Address');",

]

async function executeQueries() {
    try {
        for (const query of queries) {
            await db.query(query); // Execute each query
            // console.log("Query executed successfully:", query);
        }
        console.log("All queries executed successfully.");
    } catch (error) {
        // console.error("Error executing query:", error);
    } finally {
        await db.close()
    }
}

executeQueries()