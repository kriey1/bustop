const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

// 유저 회원가입, PIN 번호
app.post('/signup-user', async (req, res) => {
    const { pin } = req.body;
  
    if (!pin || pin.length !== 6) {
      return res.status(400).send('Invalid PIN');
    }
    let conn;
    try{
    const query = 'INSERT INTO users (pin) VALUES (?)';
    await conn.query(query, [pin]);
    res.status(201).json({ message: '유저 회원가입 성공' });
  } catch (error) {
    console.error('유저 회원가입 오류:', error);
    res.status(500).json({ message: '유저 회원가입 실패' });
  }
  finally{
    if (conn) conn.release();
  }
  });


//운전자 회원가입 (dirver 테이블)
app.post('/signup-driver', async (req, res) => {
  console.log('요청 데이터:', req.body);
  const { id, password, name, cityCode, routeId, vehicleno } = req.body;
  if (!id || !password || !name || !cityCode || !routeId || !vehicleno) {
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
    const query = `INSERT INTO driver (id, password, name, cityCode, routeId, vehicleno) VALUES (?, ?, ?, ?, ?, ?)`;
    await conn.query(query, [id, password, name, cityCode, routeId, vehicleno]);
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
  const { id, password, name, number, registration } = req.body;
  if (!id || !password || !name || !number || !registration) {
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
    const query = `INSERT INTO nok (id, password, name, number, registration) VALUES (?, ?, ?, ?, ?)`;
    await conn.query(query, [id, password, name, number, registration]);
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
        const query = `SELECT * FROM ${table} WHERE id = ?`; // 전체 데이터 가져오기
        const [user] = await conn.query(query, [id]);

          if (user) {
              // 비밀번호 확인
              if (user.password === password) {
                  delete user.password;
                  console.log('반환된 유저 데이터:', user);
                  return res.status(200).json({ message: '로그인 성공', role: table, user });
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

// 실시간 GPS 데이터 저장소
const liveGPSData = {}; // { registration: { latitude, longitude, timestamp } }
// WebSocket 연결 처리
wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`WebSocket 연결 요청: ${clientIP}`);
  console.log('WebSocket 연결 성공');

  // 클라이언트로부터 메시지를 수신
  ws.on('message', (message) => {
    try {
        const data = JSON.parse(message);

        // GPS 데이터 업데이트
        if (data.type === 'gps-update') {
            const { registration, departure, destination, latitude, longitude } = data;

            if (!registration || !departure || !destination || !latitude || !longitude ) {
                throw new Error('GPS 데이터가 부족합니다.');
            }

            liveGPSData[registration] = {
                departure,
                destination,
                latitude,
                longitude,
                timestamp: new Date(),
            };
            console.log(`GPS 업데이트: ${registration} ->`, liveGPSData[registration]);
        }

        // GPS 데이터 요청
        if (data.type === 'gps-request') {
            const { registration } = data;

            if (!registration) {
                throw new Error('등록번호가 누락되었습니다.');
            }

            const gpsData = liveGPSData[registration];
            if (gpsData) {
                ws.send(
                    JSON.stringify({
                        type: 'gps-response',
                        registration,
                        ...gpsData,
                    })
                );
            } else {
                ws.send(
                    JSON.stringify({
                        type: 'error',
                        message: 'GPS 데이터가 없습니다.',
                    })
                );
            }
        }
    } catch (error) {
        console.error('WebSocket 메시지 처리 오류:', error.message);
        ws.send(
            JSON.stringify({
                type: 'error',
                message: error.message || '잘못된 요청입니다.',
            })
        );
    }
});

ws.on('close', () => {
    console.log('WebSocket 연결 종료');
});

ws.on('error', (error) => {
    console.error('WebSocket 서버 오류:', error);
});
});


//버스 하차 요청
wss.on('connection', (ws) => {
  console.log('WebSocket 연결 성공');

  ws.on('message', (message) => {
      console.log('메시지 수신 원본:', message); // 원본 메시지 디버깅

      try {
          const data = JSON.parse(message);
          console.log('파싱된 메시지:', data);

          if (data.type === 'activate-bell') {
              console.log('하차벨 활성화 요청 수신:', data);

              // 특정 클라이언트로 메시지 브로드캐스트
              wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                      client.send(JSON.stringify(data));
                      console.log('클라이언트로 메시지 전송:', data);
                  }
              });
          }
      } catch (error) {
          console.error('WebSocket 메시지 처리 오류:', error.message);
      }
  });

  ws.on('close', () => {
      console.log('WebSocket 연결 종료');
  });

  ws.on('error', (error) => {
      console.error('WebSocket 에러:', error);
  });
});

// 도시 목록
app.get('/cities', async (req, res) => {
  let connection;
  try {
      connection = await pool.getConnection();
      // SQL 쿼리 실행
      const rows = await connection.query('SELECT cityCode, cityName FROM cities');
      res.json(rows); // 결과 반환
  } catch (error) {
      console.error('도시 데이터 조회 오류:', error);
      res.status(500).send('서버 오류');
  } finally {
      if (connection) connection.end(); // 연결 해제
  }
});


server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP 및 WebSocket 서버가 http://${IP_ADDRESS}:${PORT}에서 실행 중입니다`);
});