const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
const PORT = 3000;
const IP_ADDRESS = '221.168.128.40';

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
  let conn;
  try {
    conn = await pool.getConnection();
    //중복가입 확인
    const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM (
                SELECT id FROM user
                UNION ALL
                SELECT id FROM driver
                UNION ALL
                SELECT id FROM nok
            ) AS combined
            WHERE id = ?`;
        const [result] = await conn.query(checkQuery, [id]);

        if (result.count > 0) {
            return res.status(409).json({ message: '이미 존재하는 ID입니다.' });
        }
    //버스기사 추가
    const query = `INSERT INTO driver (id, password, name, busnumber) VALUES (?, ?, ?, ?)`;
    await conn.query(query, [id, password, name, busnumber]);
    res.status(201).json({ message: '운전자 회원가입 성공' });
  } catch (error) {
    console.error('운전자 회원가입 오류:', error);
    res.status(500).json({ message: '운전자 회원가입 실패' });
  }
  finally{
    if (conn) conn.release();
  }
});

// 보호자 회원가입 (NOK 테이블)
app.post('/signup-nok', async (req, res) => {
  console.log('요청 데이터:', req.body);
  const { id, password, name, number, kin } = req.body;
  if (!id || !password || !name || !number || !kin) {
    return res.status(400).json({ message: '누락된 정보가 있습니다.' });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    //중복가입 확인
    const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM (
                SELECT id FROM user
                UNION ALL
                SELECT id FROM driver
                UNION ALL
                SELECT id FROM nok
            ) AS combined
            WHERE id = ?`;
        const [result] = await conn.query(checkQuery, [id]);

        if (result.count > 0) {
            return res.status(409).json({ message: '이미 존재하는 ID입니다.' });
        }

  //보호자 추가
    const query = `INSERT INTO nok (id, password, name, number, kin) VALUES (?, ?, ?, ?, ?)`;
    await conn.query(query, [id, password, name, number, kin]);
    res.status(201).json({ message: '보호자 회원가입 성공' });
  } catch (error) {
    console.error('보호자 회원가입 오류:', error);
    res.status(500).json({ message: '보호자 회원가입 실패' });
  }finally{
    if (conn) conn.release();
  }
});

app.post('/login', async (req, res) => {
  console.log('요청 데이터:', req.body);
  const { id, password } = req.body;

  if (!id || !password) {
      return res.status(400).json({ message: 'ID와 비밀번호를 입력해주세요.' });
  }

  let conn;
  try {
      conn = await pool.getConnection();

      //테이블에서 순차적으로 검색
      const tables = ['user', 'driver', 'nok'];
      for (const table of tables) {
          const query = `SELECT password FROM ${table} WHERE id = ?`;
          const [user] = await conn.query(query, [id]);

          if (user) {
              // 비밀번호 확인
              if (user.password === password) {
                  return res.status(200).json({ message: '로그인 성공', role: table });
              } else {
                  return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
              }
          }
      }

      // ID가 모든 테이블에서 존재하지 않을 경우
      return res.status(404).json({ message: '가입되지 않은 ID입니다.' });

  } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({ message: '서버 오류 발생' });
  } finally {
      if (conn) conn.release();
  }
});

// 서버 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://${IP_ADDRESS}:${PORT}에서 실행 중입니다.`);
});