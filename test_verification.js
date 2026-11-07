// Automated Verification Script for Jahid Vehicle Rentals
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log("=================================================");
console.log(" RUNNING AUTOMATED VERIFICATION TEST SUITE");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
    totalTests++;
    if (condition) {
        console.log(`[PASS] ${testName}`);
        passedTests++;
    } else {
        console.error(`[FAIL] ${testName}`);
    }
}

// 1. File existence checks
const baseDir = __dirname;
assert(fs.existsSync(path.join(baseDir, 'database.sql')), "database.sql exists");
assert(fs.existsSync(path.join(baseDir, 'server.js')), "server.js exists");
assert(fs.existsSync(path.join(baseDir, 'package.json')), "package.json exists");
assert(fs.existsSync(path.join(baseDir, 'public', 'index.html')), "public/index.html exists");

// 2. Image Asset Verification
const imageFolder = path.join(baseDir, 'public', 'images');
const requiredImages = [
    'sports_car.jpg',
    'luxury_suv.jpg',
    'executive_sedan.jpg',
    'superbike.jpg',
    'cruiser_bike.jpg'
];

requiredImages.forEach(img => {
    const imgPath = path.join(imageFolder, img);
    const exists = fs.existsSync(imgPath);
    const size = exists ? fs.statSync(imgPath).size : 0;
    assert(exists && size > 50000, `Image asset ${img} exists and is valid (${(size / 1024).toFixed(1)} KB)`);
});

// 3. database.sql content validation
const sqlContent = fs.readFileSync(path.join(baseDir, 'database.sql'), 'utf-8');
assert(sqlContent.includes('CREATE DATABASE IF NOT EXISTS rental_db;'), "SQL initializes rental_db");
assert(sqlContent.includes('CREATE TABLE vehicles'), "SQL defines vehicles table");
assert(sqlContent.includes('vehicle_category VARCHAR(20) NOT NULL CHECK (vehicle_category IN (\'Car\', \'Motorbike\'))'), "SQL enforces Car/Motorbike check constraint");
assert(sqlContent.includes('PRIMARY KEY'), "SQL specifies PRIMARY KEY constraints");
assert(sqlContent.includes('CREATE TABLE customers'), "SQL defines customers table");
assert(/FOREIGN\s+KEY\s*\(\s*rented_vehicle_no\s*\)\s*REFERENCES\s+vehicles\s*\(\s*vehicle_no\s*\)/i.test(sqlContent), "SQL establishes FOREIGN KEY relationship");
assert(sqlContent.includes('INSERT INTO vehicles'), "SQL seeds vehicles data");
assert(sqlContent.includes('INSERT INTO customers'), "SQL seeds customers data");

// 4. server.js teacher syntax alignment check
const serverCode = fs.readFileSync(path.join(baseDir, 'server.js'), 'utf-8');
assert(serverCode.includes('require("express")'), "server.js requires express");
assert(serverCode.includes('require("mysql8")'), "server.js requires mysql8");
assert(serverCode.includes('app.use(express.static("public"))'), "server.js serves static public folder");
assert(serverCode.includes('app.get("/vehicles"'), "server.js defines GET /vehicles");
assert(serverCode.includes('app.get("/vehicles/:id"'), "server.js defines GET /vehicles/:id");
assert(serverCode.includes('app.post("/vehicles"'), "server.js defines POST /vehicles");
assert(serverCode.includes('app.put("/vehicles/:id"'), "server.js defines PUT /vehicles/:id");
assert(serverCode.includes('app.delete("/vehicles/:id"'), "server.js defines DELETE /vehicles/:id");
assert(serverCode.includes('app.get("/customers"'), "server.js defines GET /customers");
assert(serverCode.includes('app.get("/customers/:id"'), "server.js defines GET /customers/:id");
assert(serverCode.includes('app.post("/customers"'), "server.js defines POST /customers");
assert(serverCode.includes('app.put("/customers/:id"'), "server.js defines PUT /customers/:id");
assert(serverCode.includes('app.delete("/customers/:id"'), "server.js defines DELETE /customers/:id");
assert(serverCode.includes('db.connect'), "server.js connects via db.connect callback");

// 5. public/index.html UI & Form Mapping Validation
const htmlContent = fs.readFileSync(path.join(baseDir, 'public', 'index.html'), 'utf-8');
assert(htmlContent.includes('Jahid Vehicle Rentals'), "Header features bold title 'Jahid Vehicle Rentals'");
assert(htmlContent.includes('Fleet Inventory Management Zone'), "Zone 1 exists");
assert(htmlContent.includes('Customer Rental Logs Zone'), "Zone 2 exists");

// Panel A Form bindings
assert(htmlContent.includes('id="formAddVehicle"'), "Panel A form exists");
assert(htmlContent.includes('id="v_vehicle_no"'), "Panel A maps v_vehicle_no");
assert(htmlContent.includes('id="v_vehicle_category"'), "Panel A maps v_vehicle_category");
assert(htmlContent.includes('id="v_model"'), "Panel A maps v_model");
assert(htmlContent.includes('id="v_rent_per_day"'), "Panel A maps v_rent_per_day");

// Panel B Form bindings
assert(htmlContent.includes('id="formAddCustomer"'), "Panel B form exists");
assert(htmlContent.includes('id="c_customer_name"'), "Panel B maps c_customer_name");
assert(htmlContent.includes('id="c_phone_no"'), "Panel B maps c_phone_no");
assert(htmlContent.includes('id="c_rented_vehicle_no"'), "Panel B maps c_rented_vehicle_no");
assert(htmlContent.includes('id="c_rental_date"'), "Panel B maps c_rental_date");

// Edit & Delete Action Triggers
assert(htmlContent.includes('openEditVehicleModal'), "Vehicle PUT trigger exists");
assert(htmlContent.includes('handleDeleteVehicle'), "Vehicle DELETE trigger exists");
assert(htmlContent.includes('openEditCustomerModal'), "Customer PUT trigger exists");
assert(htmlContent.includes('handleDeleteCustomer'), "Customer DELETE trigger exists");

// Image Asset Mapping bindings
assert(htmlContent.includes('images/sports_car.jpg'), "Image mapping references sports_car.jpg");
assert(htmlContent.includes('images/luxury_suv.jpg'), "Image mapping references luxury_suv.jpg");
assert(htmlContent.includes('images/executive_sedan.jpg'), "Image mapping references executive_sedan.jpg");
assert(htmlContent.includes('images/superbike.jpg'), "Image mapping references superbike.jpg");
assert(htmlContent.includes('images/cruiser_bike.jpg'), "Image mapping references cruiser_bike.jpg");

console.log(`\n=================================================`);
console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log(`=================================================`);

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
