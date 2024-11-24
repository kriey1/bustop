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
  port: 3306,
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

//운전자 회원가입 (dirver 테이블)
app.post('/signup-driver', async (req, res) => {
  console.log('요청 데이터:', req.body);
  const { id, password, name, busnumber } = req.body;
  if (!id || !password || !name || !busnumber) {
    return res.status(400).json({ message: '누락된 정보가 있습니다.' });
  }
  try {
    const conn = await pool.getConnection();
    //중복 가입 확인
    const checkQuery = `SELECT COUNT(*) AS count FROM driver WHERE id = ?`;
    const [result] = await conn.query(checkQuery, [id]);

    if (result.count > 0) {
      conn.release();
      return res.status(400).json({ message: '이미 존재하는 ID입니다.' });
    }
    const query = `INSERT INTO driver (id, password, name, busnumber) VALUES (?, ?, ?, ?)`;
    await conn.query(query, [id, password, name, busnumber]);
    conn.release();
    res.status(200).json({ message: '운전자 회원가입 성공' });
  } catch (error) {
    console.error('운전자 회원가입 오류:', error);
    res.status(500).json({ message: '운전자 회원가입 실패' });
  }
});

// 보호자 회원가입 (NOK 테이블)
app.post('/signup-nok', async (req, res) => {
  console.log('요청 데이터:', req.body);
  const { id, password, name, number, kin } = req.body;
  if (!id || !password || !name || !number || !kin) {
    return res.status(400).json({ message: '누락된 정보가 있습니다.' });
  }
  try {
    const conn = await pool.getConnection();
    //중복가입 확인
    const checkQuery = `SELECT COUNT(*) AS count FROM nok WHERE id = ?`;
    const [result] = await conn.query(checkQuery, [id]);

    if (result.count > 0) {
      conn.release();
      return res.status(400).json({ message: '이미 존재하는 ID입니다.' });
    }
    const query = `INSERT INTO nok (id, password, name, number, kin) VALUES (?, ?, ?, ?, ?)`;
    await conn.query(query, [id, password, name, number, kin]);
    conn.release();
    res.status(200).json({ message: '보호자 회원가입 성공' });
  } catch (error) {
    console.error('보호자 회원가입 오류:', error);
    res.status(500).json({ message: '보호자 회원가입 실패' });
  }
});


// 서버 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://${IP_ADDRESS}:${PORT}에서 실행 중입니다.`);
});