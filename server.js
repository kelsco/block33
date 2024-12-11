const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory');

const init = async () => {
    await client.connect();
    let SQL = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) not null
        )
        CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) not null,
        created_at timestamp default now(),
        updated_at timestamp default now(),
        department_id INTEGER REFERENCES departments(id) not null
        );
    `;

}