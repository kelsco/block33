import express from "express";
import pg from "pg";

const app = express();
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory');
const port = process.env.PORT || 3000;


app.use(express.json());
// app.use(require('morgan')('dev'));

app.get('/api/departments', async (req, res, next) => {
    try{
        const SQL = `
        SELECT * FROM departments;
        `;
        
        const response = await client.query(SQL);
        res.send(response.rows);

    } catch (ex) {
        next(ex)
    }
})
app.get('/api/employees', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM employees;
        `;
        const response = await client.query(SQL)
        res.send(response.rows)

    }
    catch(ex) {
        next(ex)
    }
})

// app.post('/api/departments', async (req, res, next) => {
//     try{
//         const SQL =`
      
//         `;
//         const response = await client.query(SQL, [req.body.name, req.body.department_id]);
//         res.send(resonse.rows)
//     }catch(ex) {
//         next(ex)
//     }
// })

app.post('/api/employees', async (req, res, next) => {
    try{
        const SQL =`  
        INSERT INTO employees(name, department_id)
        VALUES ($1, $2)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.department_id]);
        res.send(response.rows[0])
    }catch(ex) {
        next(ex)
    }
})

app.put('/api/employees/:id', async (req, res, next) => {
    try{
        const SQL = `
        UPDATE employees
        SET name=$1, department_id=$2, updated_at= now()
        WHERE id=$3
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.department_id, req.params.id]);
        res.send(response.rows[0]);
    } catch(ex) {
        next(ex);
    }
})
 app.delete(`/api/employees/:id`, async ( req, res, next) => {
    try{
        const SQL =`
        DELETE FROM employees WHERE id=$1;
        `;
        await client.query(SQL, [req.params.id])
        res.sendStatus(204);
    } catch(ex) {
        next(ex)
    }
 })


async function init(){
    await client.connect();
    console.log("connected to client");
    let SQL = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL
        );
        CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        created_at timestamp default now(),
        updated_at timestamp default now(),
        department_id INTEGER REFERENCES departments(id) NOT NULL
        );
    `;
    await client.query(SQL);
    console.log("tables created");
    SQL = `
        INSERT INTO departments(name) VALUES('WIENER DOG DEPO');
        INSERT INTO departments(name) VALUES('HOT DOG HOTEL');
        INSERT INTO departments(name) VALUES('WIENIE MOTEL');
        INSERT INTO departments(name) VALUES('HUNGRY HUNGRY HIPPO DEPO');
        INSERT INTO employees(name, department_id) VALUES('Lil Leland', (SELECT id FROM departments where name='HOT DOG HOTEL'));
        INSERT INTO employees(name, department_id) VALUES('Hal Gal', (SELECT id FROM departments where name='WIENER DOG DEPO'));
        INSERT INTO employees(name, department_id) VALUES('E Girl', (SELECT id FROM departments where name='WIENIE MOTEL'));
        `;
        await client.query(SQL);
        console.log("data seeded");
        app.listen(port, () => console.log(`listening on port ${port}`));

};

init()