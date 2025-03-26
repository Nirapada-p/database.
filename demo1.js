const sqlite3 = require('sqlite3').verbose();

// สร้างการเชื่อมต่อกับฐานข้อมูล (หากไม่มีจะสร้างใหม่)
let db = new sqlite3.Database('test.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// ใช้ serialize() เพื่อให้คำสั่ง SQL รันตามลำดับ
db.serialize(() => {
  // สร้างตาราง test1
  db.run(`
    CREATE TABLE IF NOT EXISTS "test1" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL
    )
  `);

  // สร้างตาราง test2
  db.run(`
    CREATE TABLE IF NOT EXISTS "test2" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      phone TEXT NOT NULL
    )
  `);

  // เตรียมคำสั่ง INSERT เพื่อเพิ่มข้อมูลใน test1
  let stmt1 = db.prepare(`
    INSERT INTO "test1" (name, age) VALUES (?, ?)
  `);

  // เพิ่มข้อมูลใน test1
  stmt1.run('Alice', 30);
  stmt1.run('Bob', 25);
  stmt1.run('Charlie', 35);

  // ปิดการเตรียมคำสั่งสำหรับ test1
  stmt1.finalize();

  // เตรียมคำสั่ง INSERT เพื่อเพิ่มข้อมูลใน test2
  let stmt2 = db.prepare(`
    INSERT INTO "test2" (email, phone) VALUES (?, ?)
  `);

  // เพิ่มข้อมูลใน test2
  stmt2.run('alice@example.com', '123-456-7890');
  stmt2.run('bob@example.com', '234-567-8901');
  stmt2.run('charlie@example.com', '345-678-9012');

  // ปิดการเตรียมคำสั่งสำหรับ test2
  stmt2.finalize();
});

// ปิดการเชื่อมต่อกับฐานข้อมูลเมื่อเสร็จ
db.close((err) => {
  if (err) {
    console.error('Error closing the database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
