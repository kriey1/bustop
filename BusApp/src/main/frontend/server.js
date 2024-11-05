const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
const PORT = 3000;
const IP_ADDRESS = '172.30.1.60';

app.use(cors());
app.use(express.json());

// DB연결
const pool = mariadb.createPool({
  host: '127.30.1.60', 
  user: 'root',     
  password: 'qwer1234', 
  database: 'busapp', 
  connectionLimit: 5,
});

// 목적지 검색
app.get('/search', async (req, res) => {
  const destination = req.query.destination;
  try {
    const conn = await pool.getConnection();
    const query = `SELECT * FROM busstop WHERE name LIKE ?`;
    const rows = await conn.query(query, [`%${destination}%`]);
    conn.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'DB 검색 오류 발생' });
  }
});

// 서버 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://${IP_ADDRESS}:${PORT}에서 실행 중입니다.`);
});