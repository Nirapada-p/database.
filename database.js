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
  // สร้างตารางเมนูอาหาร 
  db.run(`
    CREATE TABLE IF NOT EXISTS "menu" (
      menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_th TEXT NOT NULL,
      category_id INTEGER,
      price DECIMAL(10,2) NOT NULL,
      image TEXT,
      description TEXT,
      status TEXT CHECK(status IN ('available', 'unavailable')),
      FOREIGN KEY (category_id) REFERENCES category(category_id)
    )
  `);
  //ตารางหมวดหมู่อาหาร
  db.run(`
    CREATE TABLE IF NOT EXISTS "category" (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_th TEXT NOT NULL
    )
  `);
  //ตารางออเดอร์
  db.run(`
    CREATE TABLE IF NOT EXISTS "orders" (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'served', 'cancelled')),
      total_price DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ตารางรายละเอียดออเดอร์
  db.run(`
    CREATE TABLE IF NOT EXISTS "order_details" (
      order_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      menu_id INTEGER,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      note TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
    )
  `);
  

   // ตารางสต็อกวัตถุดิบ
  db.run(`
    CREATE TABLE IF NOT EXISTS "inventory" (
      inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      price_per_unit REAL
    )
  `);

   // ตารางพนักงาน
 // ตารางพนักงาน
db.run(`
  CREATE TABLE IF NOT EXISTS "employees" (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    salary DECIMAL(10,2),
    work_schedule TEXT,
    role TEXT NOT NULL,  -- เพิ่ม role เพื่อป้องกันข้อผิดพลาด
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ตาราง User
db.run(`
  CREATE TABLE IF NOT EXISTS "users" (  
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE,  
    password TEXT NOT NULL,
    role TEXT NOT NULL  -- ตรวจสอบค่า role
  )
`);


  // ตารางการชำระเงิน
  db.run(`
    CREATE TABLE IF NOT EXISTS "payments" (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      payment_method TEXT CHECK(payment_method IN ('cash', 'QR Code')),
      amount DECIMAL(10,2) NOT NULL,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ตารางโต๊ะอาหาร
  db.run(`CREATE TABLE IF NOT EXISTS "tables" (
    table_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT CHECK(status IN ('available', 'occupied', 'reserved')),
    capacity INTEGER NOT NULL
  )`);




  
  // เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง
  let stmt1 = db.prepare(`
    INSERT INTO "menu" (name_th, category_id, price, image, description, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  

  // เพิ่มส่วนประกอบเมนูอาหาร
  stmt1.run(
    'ซูชิโทบิโกะ', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1. เอโร่ ไข่ปลาสีส้มแช่แข็ง\n
      2. ข้าวญี่ปุ่น 300 กรัม\n
      3. เกลือ 1 ช้อนชา\n
      4. น้ำส้มสายชูปรุงข้าว 2 ช้อนโต๊ะ\n
      5. สาหร่ายแผ่นใหญ่ ตามชอบ\n
      6. ซอสพริก 200 กรัม\n
      7. มายองเนส 200 กรัม\n
      8. ปาปริก้า ตามชอบ\n
      9. ต้นหอมซอย`, 
    'available'
  );

  stmt1.run(
    'ซูชิมาได', 
    1, 
    25.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.เนื้อปลามาได แล่เป็นชิ้นสำหรับซูชิ\n
      2.ข้าวซูช 30 กรัม\n
      3.วาซาบิ\n
      4.ซอสโชยุ (สำหรับจิ้ม)\n
      5.ขิงดอง (กินเคียง)\n`, 
    'available'
  );

  stmt1.run(
    'ซูชิอามะเอบิ', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.กุ้งหวาน 1 ตัว\n
      2.ข้าวซูชิ 30 กรัม\n
      3.น้ำส้มสายชูข้าว ½ ช้อนชา (ผสมในข้าวซูชิ)\n
      4.น้ำตาล ¼ ช้อนชา\n
      5.เกลือ หยิบมือ\n
      6.วาซาบิ ปลายช้อน\n
      7.โชยุ สำหรับจิ้ม\n
      8.ขิงดอง สำหรับทานเคียง`, 
    'available'
  );

  stmt1.run(
    'ซูชิอุนิ', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.อุนิ (ไข่หอยเม่นสด) 10 กรัม
      2.ข้าวซูชิ 30 กรัม
      3.น้ำส้มสายชูข้าว ½ ช้อนชา
      4.น้ำตาล ¼ ช้อนชา 
      5.เกลือ หยิบมือ
      6.สาหร่ายโนริ ขนาด 3x10 ซม.
      7.วาซาบิ เล็กน้อย
      8.โชยุ สำหรับจิ้ม
      9.ขิงดอง `, 
    'available'
  );

  stmt1.run(
    'ซูชิอิคุระ', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      ไข่ปลาแซลมอน (Ikura) 15 กรัม 
      1.ข้าวซูชิ 30 กรัม
      2.น้ำส้มสายชูข้าว ½ ช้อนชา
      3.น้ำตาล ¼ ช้อนชา
      4.เกลือ หยิบมือ
      5.สาหร่ายโนริ ขนาด 3x10 ซม. 
      6.วาซาบิ เล็กน้อย 
      7.โชยุ สำหรับจิ้ม
      8.ขิงดอง `, 
    'available'
  );

  stmt1.run(
    'ซูชิ แซลม่อน', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      แซลมอนสด 15 กรัม 
      1.ข้าวซูชิ 30 กรัม
      2.น้ำส้มสายชูข้าว ½ ช้อนชา 
      3.น้ำตาล ¼ ช้อนชา
      4.เกลือ หยิบมือ 
      5.วาซาบิ เล็กน้อย 
      6.โชยุ สำหรับจิ้ม
      7.ขิงดอง`, 
    'available'
  );

  stmt1.run(
    'ซูชิ ไข่หวาน', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      ไข่หวาน (ทามาโกะยากิ) 15 กรัม 
      1.ข้าวซูชิ 30 กรัม
      2.น้ำส้มสายชูข้าว ½ ช้อนชา 
      3.น้ำตาล ¼ ช้อนชา 
      4.เกลือ หยิบมือ
      5.สาหร่ายโนริ ขนาด 1x10 ซม. 
      6.โชยุ สำหรับจิ้ม
      7.ขิงดอง `, 
    'available'
  );

  stmt1.run(
    'ซูชิ ชุดแซลม่อนซาซิ', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      *มากิซูชิ 3 คำ
      1.ข้าวซูชิ 90 กรัม
      2.น้ำส้มสายชูข้าว 1 ช้อนโต๊ะ 
      3.น้ำตาล ½ ช้อนชา 
      4.เกลือ ¼ ช้อนชา 
      5.สาหร่ายโนริ ½ แผ่น
      -ไส้ซูชิ (เลือกตามต้องการ)
      อะโวคาโด 7 กรัม (หั่นเป็นแท่ง)
      แตงกวา 7 กรัม (หั่นเป็นแท่ง)
      ปูอัด 15 กรัม (หั่นครึ่งตามยาว)
      6.วาซาบิ
      7.โชยุ 1 ช้อนโต๊ะ 
      8.ขิงดอง  7 กรัม

      *แคลิฟอร์เนียโรล 3 คำ
      1.ข้าวซูชิ 90 กรัม
      2.น้ำส้มสายชูข้าฟว ½ ช้อนโต๊ะ 
      3.น้ำตาล ¼ ช้อนชา 
      4.เกลือ ¼ ช้อนชา 
      5.สาหร่ายโนริ 1 แผ่น 
      -ไส้ซูชิ
      ปูอัด (Surimi) 30 กรัม 
      อะโวคาโด 15 กรัม 
      แตงกวา 15 กรัม 
      6.งาขาวคั่ว 1 ช้อนชา 
      7.มายองเนส 1 ช้อนชา 
      8.โชยุ 1-2 ช้อนโต๊ะ 
      9.วาซาบิ ตามชอบ
      10.ขิงดอง 10 กรัม  

      *แซลม่อน
      1.ข้าวซูชิ 90 กรัม
      2.น้ำส้มสายชูข้าว ½ ช้อนโต๊ะ 
      3.น้ำตาล ¼ ช้อนชา 
      4.เกลือ ¼ ช้อนชา
      5.สาหร่ายโนริ 1 แผ่น
       -ไส้ซูชิ
      6.แซลมอนสด 30 กรัม 
      7.ปูอัด (Surimi) 30 กรัม
      8.อะโวคาโด 15 กรัม 
      9.แตงกวา 15 กรัม 
      10.มายองเนส 1 ช้อนชา 
      11.งาขาวคั่ว 1 ช้อนชา 
      12.แซลมอนสด (ทาทับข้าว) 30 กรัม 
      13.โชยุ 1-2 ช้อนโต๊ะ 
      14.วาซาบิ 
      15.ขิงดอง 10 กรัม `, 
    'available'
  );

  stmt1.run(
    'ซูชิ ชุดเซตข้าวปั้น', 
    1, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
     *หน้ายำสาหร่าย 1 คำ 
      1.ข้าวปั้น  15 กรัม
      2.ยำสาหร่าย 15 กรัม 
      3.สาหร่ายแผ่น ขนาด 5x5 ซม.
    *หน้าปูอัด 1 คำ
      1.ข้าวสวย 15 กรัม
      2.ปูอัด 15 กรัม 
    *หน้าไข่หวาน 1 คำ
      1.ข้าวสวย  15กรัม
      2.ไข่หวาน  15 กรัม 
    *หน้ากุ้ง 1 คำ
      1.ข้าวสวย 15 กรัม
      2.กุ้ง 15 กรัม 
    *หน้าปลาแห้ง 1 คำ
      1.ข้าวสวย  15 กรัม
      2.ปลาแห้ง  5 กรัม 
    *หน้าไข่กุ้ง 1 คำ
      1.ข้าวสวย  15กรัม
      2.ไข่กุ้ง  5 กรัม`, 
    'available'
  );

  stmt1.run(
    'ราเมงไก่', 
    2, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.น้ำซุปไก่ 400 มล.
      2.มิโซะ 1.5 ช้อนโต๊ะ
      3.ซอสถั่วเหลือง 1 ช้อนโต๊ะ
      4.มิริน 1 ช้อนโต๊ะ
      5.น้ำตาล 1/2 ช้อนชา
      6.น้ำมันงา 1 ช้อนชา
      7.พริกไทย 
      8.เส้นราเมง 100 กรัม
      9.ไก่ต้ม 100 กรัม
      10.ไข่ต้ม 1 ฟอง
      11.ต้นหอมซอย 1 ช้อนโต๊ะ
      12.สาหร่ายโนริ 1 แผ่น
      13.งาขาวคั่ว `, 
    'available'
  );

  stmt1.run(
    'ราเมง มิโซะวากิว', 
    2, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.น้ำซุปไก่ 400 มล.
      2.มิโซะ 1.5 ช้อนโต๊ะ
      3.ซอสถั่วเหลือง 1 ช้อนโต๊ะ
      4.มิริน 1 ช้อนโต๊ะ
      5.น้ำตาล 1/2 ช้อนชา
      6.น้ำมันงา 1 ช้อนชา
      7.พริกไทย 
      8.เส้นราเมง 100 กรัม
      9.เนื้อวากิวสไลซ์ 100 กรัม
      10.ไข่ต้ม 1 ฟอง
      11.ต้นหอมซอย 1 ช้อนโต๊ะ
      12.งาขาวคั่ว `, 
    'available'
  );

  stmt1.run(
    'ราเมง ต้มยำกุ้ง', 
    2, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1น้ำซุปไก่ 400 มล.
      2.กุ้งสด 3 ตัว
      3.ตะไคร้หั่น 1 ต้น
      4.ข่าอ่อน 3-4 แว่น
      5.ใบมะกรูด 3 ใบ
      6.น้ำพริกเผา 1 ช้อนโต๊ะ
      7.น้ำปลา 1 ช้อนโต๊ะ
      8.น้ำมะนาว 1.5 ช้อนโต๊ะ
      9.พริกขี้หนูบุบ 3-5 เม็ด
      10.นมข้นจืด 3 ช้อนโต๊ะ
      11.เส้นราเมง 100 กรัม
      12.เห็ดฟาง 4-5 ดอก
      13.พริกป่น 
      14.น้ำมันพริกเผา 1 ช้อนชา`, 
    'available'
  );

  stmt1.run(
    'ราเมง โซยุน', 
    2, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.น้ำซุปไก่ 400 มล.
      2.ซอสโชยุ 2 ช้อนโต๊ะ
      3.มิริน 1 ช้อนโต๊ะ
      4.น้ำตาล 1/2 ช้อนชา
      5.กระเทียมสับ 1/2 ช้อนชา
      6.น้ำมันงา 1 ช้อนชา
      7.เส้นราเมง 100 กรัม
      8.หมูชาชู 2 ชิ้น
      9.ไข่ต้ม 1 ฟอง
      10.ต้นหอมซอย 1 ช้อนโต๊ะ
      11.งาขาวคั่ว 
      12.พริกไทย `, 
    'available'
  );

  stmt1.run(
    'ราเมง สึเคเมงจิ้มจุ่ม', 
    2, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.น้ำซุปไก่ 300 มล.
      2.ซอสโชยุ 2 ช้อนโต๊ะ
      3.มิริน 1 ช้อนโต๊ะ
      4.มิโซะ 1 ช้อนโต๊ะ
      5.น้ำตาล 1/2 ช้อนชา
      6.กระเทียมสับ 1/2 ช้อนชา
      7.น้ำมันงา 1 ช้อนชา
      8.เส้นราเมงเส้นหนา 150 กรัม
      9.ไข่ต้ม 1 ฟอง
      10.แครอทหั่นยาว 
      11.งาขาวคั่ว ตามชอบ`, 
    'available'
  );

  stmt1.run(
    'ดงบุริ คัตซึด้ง', 
    3, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ข้าวญี่ปุ่นหุงสุก 1 ถ้วย
      2.หมูทอดทงคัตสึ 1 ชิ้น
      3.ไข่ไก่ 2 ฟอง
      4.หัวหอมใหญ่ซอย 1/2 หัว
      5.น้ำซุปดาชิ 1/2 ถ้วย
      6.ซอสโชยุ 1 ช้อนโต๊ะ
      7.มิริน 1 ช้อนโต๊ะ
      8.น้ำตาล 1/2 ช้อนโต๊ะ
      9.ต้นหอมซอย 1 ช้อนโต๊ะ
      10.สาหร่ายโนริซอย`, 
    'available'
  );

  stmt1.run(
    'ดงบุริ เทนด้ง', 
    3, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ข้าวญี่ปุ่นหุงสุก 1 ถ้วย
      2.กุ้งเทมปุระ 2-3 ตัว
      3.แป้งเทมปุระ 1/2 ถ้วย
      4.น้ำเย็นจัด 1/2 ถ้วย
      5.น้ำมันพืชสำหรับทอด 
      6.ซอสเทนด้ง (เทนซึยุ) 1/4 ถ้วย
      7.ซอสโชยุ 1 ช้อนโต๊ะ
      8.มิริน 1 ช้อนโต๊ะ
      9.น้ำตาล 1 ช้อนชา
      10.ต้นหอมซอย 1 ช้อนโต๊ะ`, 
    'available'
  );

  stmt1.run(
    'ดงบุริ ไคเซ็นด้ง', 
    3, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ข้าวญี่ปุ่นหุงสุก 1 ถ้วย
      2.ปลาดิบรวม (แซลมอน, ทูน่า, ฮามาจิ ฯลฯ) 100 กรัม
      3.ไข่กุ้ง  1 ช้อนโต๊ะ
      4.ขิงดอง ตามชอบ
      5.ต้นหอมซอย 1 ช้อนโต๊ะ
      6.ซอสโชยุ 1-2 ช้อนโต๊ะ
      7.มิริน 1 ช้อนโต๊ะ
      8.น้ำส้มสายชูข้าว 1 ช้อนชา`, 
    'available'
  );

  stmt1.run(
    'ดงบุริ อุนาด้ง', 
    3, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ข้าวญี่ปุ่นหุงสุก 1 ถ้วย
      2.ปลาไหลย่าง (อุนางิ) 1 ชิ้น
      3.ซอสอุนางิ 2 ช้อนโต๊ะ
      4.ซอสโชยุ 1 ช้อนโต๊ะ
      5.มิริน 1 ช้อนโต๊ะ
      6.น้ำตาล 1 ช้อนชา
      7.ต้นหอมซอย 1 ช้อนโต๊ะ`, 
    'available'
  );

  stmt1.run(
    'ดงบุริ โฮยาโกะด้ง', 
    3, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ข้าวญี่ปุ่นหุงสุก 1 ถ้วย
      2.เนื้อไก่ (สะโพกหรืออก) หั่นชิ้นเล็ก 150 กรัม
      3.ไข่ไก่ 2 ฟอง
      4.หัวหอมใหญ่ 1/2 หัว
      5.น้ำซุปดาชิ 1/2 ถ้วย
      6.ซอสโชยุ 1 ช้อนโต๊ะ
      7.มิริน 1 ช้อนโต๊ะ
      8.น้ำตาล 1 ช้อนชา
      9.ต้นหอมซอย 1 ช้อนโต๊ะ`, 
    'available'
  );

  stmt1.run(
    'เอบิ เทมปุระ', 
    4, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.กุ้งสด (ขนาดกลางหรือใหญ่)6 ตัว
      2.แป้งเทมปุระ 1 ถ้วย
      3.น้ำเย็นจัด 3/4 ถ้วย
      4.ไข่ไก่ 1 ฟอง
      5.น้ำมันพืชสำหรับทอด(ประมาณ 1 ลิตร)`, 
    'available'
  );

  stmt1.run(
    'อิกะ เทมปุระ', 
    4, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ปลาหมึกสด 200 กรัม (หั่นเป็นวงหนา 0.5 ซม.)
      2.แป้งเทมปุระ 1 ถ้วย
      3.น้ำเย็นจัด 3/4 ถ้วย
      4.ไข่ไก่ 1 ฟอง
      5.น้ำมันพืชสำหรับทอด (ประมาณ 1 ลิตร)`, 
    'available'
  );

  stmt1.run(
    'ซากานะ เทมปุระ', 
    4, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.เนื้อปลากะพงหรือปลาอื่น ๆ 200 กรัม (หั่นชิ้นพอดีคำ)
      2.แป้งเทมปุระ 1 ถ้วย
      3.น้ำเย็นจัด 3/4 ถ้วย
      4.ไข่ไก่ 1 ฟอง
      5.น้ำมันพืชสำหรับทอด (ประมาณ 1 ลิตร)`, 
    'available'
  );

  stmt1.run(
    'ชิอิตาเกะ เทมปุระ', 
    4, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.เห็ดหอมสด (ทั้งดอก) 8 ดอก
      2.แป้งเทมปุระ 1 ถ้วย
      3.น้ำเย็นจัด 3/4 ถ้วย
      4.ไข่ไก่ 1 ฟอง
      5.น้ำมันพืชสำหรับทอด (ประมาณ 1 ลิตร)`, 
    'available'
  );

  stmt1.run(
    'คาโบฉะ เทมปุระ', 
    4, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ฟักทองญี่ปุ่น (Kabocha) 200 กรัม (หั่นบาง ๆ ประมาณ 2-3 มม.)
      2.แป้งเทมปุระ 1 ถ้วย
      3.น้ำเย็นจัด 3/4 ถ้วย
      4.ไข่ไก่ 1 ฟอง
      5.น้ำมันพืชสำหรับทอด (ประมาณ 1 ลิตร)`, 
    'available'
  );

  stmt1.run(
    'แกงกะหรี่ โอมุคาเร', 
    5, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ส่วนไข่เจียว (ออมไรซ์):
      2.ไข่ไก่ 3 ฟอง
      3.นมสด 2 ช้อนโต๊ะ
      4.เกลือ 1/4 ช้อนชา
      5.น้ำมันสำหรับทอด
      ส่วนแกงกะหรี่:(ใช้ส่วนผสมเหมือนกับแกงกะหรี่ในเมนู Katsu Curry)
      อื่น ๆ:
      1.ข้าวสวยญี่ปุ่น 2 ถ้วย`, 
    'available'
  );

  stmt1.run(
    'แกงกะหรี่ คัตสึคาเร', 
    5, 
    30.00, 
    'gaprao.jpg', 
    ` ส่วนหมูทอดทงคัตสึ:
      1.เนื้อหมูสันนอก (หั่นชิ้นหนา) 200 กรัม
      2.เกลือ 1/4 ช้อนชา
      3.พริกไทย 1/4 ช้อนชา
      4.แป้งสาลี 1/2 ถ้วย
      5.ไข่ไก่ 1 ฟอง (ตีพอแตก)
      6.เกล็ดขนมปัง 1 ถ้วย
      7.น้ำมันสำหรับทอด

      ส่วนแกงกะหรี่:
      1.หอมหัวใหญ่ 1 หัว (ซอยบาง)
      2.แครอท 1 หัว (หั่นท่อน)
      3.มันฝรั่ง 2 หัว (หั่นเต๋า)
      4.เนื้อไก่หรือหมู (ถ้ามี) 150 กรัม
      5.ผงแกงกะหรี่ญี่ปุ่น (สำเร็จรูป) 1 กล่อง (ประมาณ 100 กรัม)
      6.น้ำเปล่า 600 มล.
      7.น้ำมันพืช 1 ช้อนโต๊ะ
      8.ข้าวสวยญี่ปุ่น 2 ถ้วย`, 
    'available'
  );

  stmt1.run(
    'แกงกะหรี่ คาเระด้ง', 
    5, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ข้าวสวยญี่ปุ่น 2 ถ้วย
      2.แกงกะหรี่ (ส่วนผสมเหมือนในเมนู Katsu Curry)
      3.ไข่ไก่ 2 ฟอง (ตีพอแตก)
      4.ต้นหอมซอยสำหรับโรยหน้า 1 ช้อนโต๊ะ`, 
    'available'
  );

  stmt1.run(
    'แกงกะหรี่ คาเระอุด้ง', 
    5, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.ข้าวสวยญี่ปุ่น 2 ถ้วย
      2.แกงกะหรี่ (ส่วนผสมเหมือนในเมนู Katsu Curry)
      3.ไข่ไก่ 2 ฟอง (ตีพอแตก)
      4.ต้นหอมซอยสำหรับโรยหน้า 1 ช้อนโต๊ะ`, 
    'available'
  );

  stmt1.run(
    'แกงกะหรี่ คาเระโซบะ', 
    5, 
    30.00, 
    'gaprao.jpg', 
    ` วัตถุดิบ:
      1.เส้นอุด้ง 2 ก้อน
      2.แกงกะหรี่ (ใช้ส่วนผสมเหมือนในเมนู Katsu Curry)
      3.น้ำซุปดาชิ 500 มล.
      4.แป้งมัน 1 ช้อนโต๊ะ (ละลายน้ำ)
      5.ต้นหอมซอย 1 ช้อนโต๊ะ`, 
    'available'
  );



  // ปิดคำสั่ง
  stmt1.finalize();

 // เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง2
 let stmt2 = db.prepare(`
  INSERT INTO "category" (name_th)
  VALUES (?)
  `);
 //เพิ่มองค์ประกอบในตาราง
  stmt2.run('ซูชิ')
  stmt2.run('ราเมง')
  stmt2.run('ดงบุริ')
  stmt2.run('เทมปุระ')
  stmt2.run('แกงกะหรี่')
 //ปิดคำสั่ง
  stmt2.finalize();

 // เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง3
 let stmt3 = db.prepare(`
  INSERT INTO "orders" (order_id, table_id, status,total_price, created_at)
  VALUES (?, ?, ?, ?, ?)
  `);

 //เพิ่มองค์ประกอบในตาราง
  stmt3.run(null)
 //ปิดคำสั่ง
  stmt3.finalize();

// เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง4
let stmt4 = db.prepare(`
  INSERT INTO "order_details" (order_detail_id, order_id, menu_id, quantity, price, note)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// เพิ่มข้อมูลในตาราง "order_details" โดยกำหนด order_id และ menu_id ให้ถูกต้อง
stmt4.run(null, 1, 5, 3, 30, "เผ็ด");


  //ปิดคำสั่ง
  stmt4.finalize();

  // เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง5
 let stmt5 = db.prepare(`
  INSERT INTO "inventory" (inventory_id, name, unit, quantity, price_per_unit)
  VALUES (?, ?, ?, ?, ?)
  `);

  //เพิ่มองค์ประกอบในตาราง
  stmt5.run(null,"แซลม่อน","กรัม",4.0,50.00)

  //ปิดคำสั่ง
  stmt5.finalize();

// เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง6
 let stmt6 = db.prepare(`
  INSERT INTO "payments" (payment_id, order_id, payment_method, amount,payment_date)
  VALUES (?, ?, ?, ?, ?)
  `);

  //เพิ่มองค์ประกอบในตาราง
  stmt6.run(null,null,null,"350",null)
  //ปิดคำสั่ง
  stmt6.finalize();

 // เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง7
 let stmt7 = db.prepare(`
  INSERT INTO "employees" (employee_id, name, salary,work_schedule,role,created_at)
  VALUES (?, ?, ?, ?, ?, ?)
  `);

  //เพิ่มองค์ประกอบในตาราง
  stmt7.run(null,"น้องแป้งคนสวย",2000,null,"ชีเสิร์ฟ",null)
  //ปิดคำสั่ง
  stmt7.finalize();

  // เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง8
 let stmt8 = db.prepare(`
  INSERT INTO "tables" (table_id, status, capacity)
  VALUES (?, ?, ?)
  `);

  //เพิ่มองค์ประกอบในตาราง
  stmt8.run(null,null,4)
  //ปิดคำสั่ง
  stmt8.finalize();

// เตรียมคำสั่ง INSERT ให้ตรงกับโครงสร้างของตาราง9
 let stmt9 = db.prepare(`
  INSERT INTO "users" (user_id, username, password,role)
  VALUES (?, ?, ?,?)
  `);

  //เพิ่มองค์ประกอบในตาราง
  stmt9.run(null,"แป้ง","1234","admin")
  //ปิดคำสั่ง
  stmt9.finalize();



  
  // ดึงข้อมูลจากตารางและแสดงผล
  db.all('SELECT * FROM "menu" "category"; "orders";"order_details";"inventory";"employees";"payments" "users" ' , [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
    } else {
      console.log('Menu Data:');
      console.table(rows); // แสดงผลข้อมูลแบบตาราง
    }

    // ปิดการเชื่อมต่อฐานข้อมูลหลังจากดึงข้อมูลเสร็จ
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Closed the database connection.');
      }
    });
  });
});
