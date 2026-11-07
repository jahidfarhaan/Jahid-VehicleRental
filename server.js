// CRUD operations of vehicles and customers tables for rental_db
/*
1. Initialize PROJECT
> npm init -y

2. Install express and mysql8
> npm install express mysql8

3. EXECUTION:
> node server.js
Open in browser: http://localhost:3000/
*/

const express = require("express");
const mysql = require("mysql8");
const app = express();

app.use(express.json());
// Read HTML files from public folder
app.use(express.static("public"));

// Connection establishment with rental_db database
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "root",
    database: process.env.DB_NAME || "rental_db"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        console.log("Tip: Ensure MySQL is running and database.sql has been executed.");
        return;
    }
    console.log("Connected to MySQL (rental_db)");
});

// ==========================================
// VEHICLES ENDPOINTS
// ==========================================

// TO GET DETAILS OF ALL VEHICLES
app.get("/vehicles", (req, res) => {
    db.query(
        "SELECT * FROM vehicles ORDER BY vehicle_no ASC",
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json(result);
        }
    );
});

// TO GET THE DETAILS OF ONE VEHICLE
app.get("/vehicles/:id", (req, res) => {
    db.query(
        "SELECT * FROM vehicles WHERE vehicle_no=?",
        [req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json(result);
        }
    );
});

// TO INSERT VEHICLE DATA INTO vehicles TABLE
app.post("/vehicles", (req, res) => {
    const { vehicle_no, vehicle_category, model, rent_per_day, status } = req.body;
    db.query(
        "INSERT INTO vehicles(vehicle_no, vehicle_category, model, rent_per_day, status) VALUES(?,?,?,?,?)",
        [vehicle_no, vehicle_category, model, rent_per_day, status || "Available"],
        (err) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.send("Vehicle Inserted");
        }
    );
});

// TO UPDATE VEHICLE DETAILS
app.put("/vehicles/:id", (req, res) => {
    const { vehicle_category, model, rent_per_day, status } = req.body;
    db.query(
        "UPDATE vehicles SET vehicle_category=?, model=?, rent_per_day=?, status=? WHERE vehicle_no=?",
        [vehicle_category, model, rent_per_day, status, req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            if (result.affectedRows == 0) {
                res.status(404).send("Vehicle NOT found");
            } else {
                res.send("Vehicle Updated");
            }
        }
    );
});

// TO DELETE VEHICLE DETAILS
app.delete("/vehicles/:id", (req, res) => {
    db.query(
        "DELETE FROM vehicles WHERE vehicle_no=?",
        [req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            if (result.affectedRows == 0) {
                res.status(404).send("Vehicle NOT found to delete");
            } else {
                res.send("Vehicle Deleted");
            }
        }
    );
});

// ==========================================
// CUSTOMERS ENDPOINTS
// ==========================================

// TO GET DETAILS OF ALL CUSTOMERS
app.get("/customers", (req, res) => {
    db.query(
        "SELECT customer_id, customer_name, phone_no, rented_vehicle_no, DATE_FORMAT(rental_date, '%Y-%m-%d') AS rental_date FROM customers ORDER BY customer_id DESC",
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json(result);
        }
    );
});

// TO GET THE DETAILS OF ONE CUSTOMER
app.get("/customers/:id", (req, res) => {
    db.query(
        "SELECT customer_id, customer_name, phone_no, rented_vehicle_no, DATE_FORMAT(rental_date, '%Y-%m-%d') AS rental_date FROM customers WHERE customer_id=?",
        [req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json(result);
        }
    );
});

// TO INSERT CUSTOMER DATA INTO customers TABLE
app.post("/customers", (req, res) => {
    const { customer_name, phone_no, rented_vehicle_no, rental_date } = req.body;
    db.query(
        "INSERT INTO customers(customer_name, phone_no, rented_vehicle_no, rental_date) VALUES(?,?,?,?)",
        [customer_name, phone_no, rented_vehicle_no, rental_date],
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            // Mark the vehicle as Rented if rented_vehicle_no was provided
            if (rented_vehicle_no) {
                db.query("UPDATE vehicles SET status='Rented' WHERE vehicle_no=?", [rented_vehicle_no]);
            }
            res.send("Customer Inserted");
        }
    );
});

// TO UPDATE CUSTOMER DETAILS
app.put("/customers/:id", (req, res) => {
    const { customer_name, phone_no, rented_vehicle_no, rental_date } = req.body;
    db.query(
        "UPDATE customers SET customer_name=?, phone_no=?, rented_vehicle_no=?, rental_date=? WHERE customer_id=?",
        [customer_name, phone_no, rented_vehicle_no, rental_date, req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            if (result.affectedRows == 0) {
                res.status(404).send("Customer NOT found");
            } else {
                res.send("Customer Updated");
            }
        }
    );
});

// TO DELETE CUSTOMER DETAILS
app.delete("/customers/:id", (req, res) => {
    // Look up the rented vehicle number first to release it back to Available
    db.query(
        "SELECT rented_vehicle_no FROM customers WHERE customer_id=?",
        [req.params.id],
        (lookupErr, rows) => {
            const vno = rows && rows.length > 0 ? rows[0].rented_vehicle_no : null;

            db.query(
                "DELETE FROM customers WHERE customer_id=?",
                [req.params.id],
                (err, result) => {
                    if (err) {
                        res.status(500).send(err.message);
                        return;
                    }
                    if (result.affectedRows == 0) {
                        res.status(404).send("Customer NOT found to delete");
                    } else {
                        // Release vehicle status back to Available
                        if (vno) {
                            db.query("UPDATE vehicles SET status='Available' WHERE vehicle_no=?", [vno]);
                        }
                        res.send("Customer Deleted");
                    }
                }
            );
        }
    );
});

// Server to listen on port number 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
