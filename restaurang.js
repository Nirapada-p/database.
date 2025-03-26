const sqlite3 = require('sqlite3').verbose();

// สร้างการเชื่อมต่อกับฐานข้อมูล (หากไม่มีจะสร้างใหม่)
let db = new sqlite3.Database('example.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// ใช้ serialize() เพื่อให้คำสั่ง SQL รันตามลำดับ
db.serialize(() => {
  // สร้างตาราง (หากยังไม่มี)
  db.run(`
    CREATE TABLE IF NOT EXISTS "Manu Management" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL
    )
  `);

  // เตรียมคำสั่ง INSERT
  let stmt = db.prepare('INSERT INTO "Manu Management" (name, age) VALUES (?, ?)');

  // เพิ่มข้อมูล
  stmt.run('John Doe', 30);
  stmt.run('Jane Smith', 25);

  // ปิดคำสั่ง
  stmt.finalize();

  // ดึงข้อมูลและแสดงผล
  db.all('SELECT * FROM "Manu Management"', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
    } else {
      console.log('Data from "Manu Management":');
      rows.forEach((row) => {
        console.log(`${row.id}: ${row.name}, ${row.age}`);
      });
    }
  });
});

// ปิดการเชื่อมต่อ
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Closed the database connection.');
  }
});
