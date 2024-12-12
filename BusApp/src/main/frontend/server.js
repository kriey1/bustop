const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Map(); // vehicleno와 WebSocket 객체 매핑
let getOnList = []; //승차 요청 상태

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
app.post("/compare-city", async (req, res) => {
  const { city_do, gu_gun } = req.body;

  // 받은 데이터 로그
  console.log("받은 주소:", { city_do, gu_gun });

  // 데이터 유효성 검사
  if (!city_do || !gu_gun) {
    return res.status(400).json({ error: "도시 정보가 제공되지 않았습니다." });
  }

  let conn;
  try {
    // MariaDB 연결 가져오기
    conn = await pool.getConnection();

    // gu_gun 대조
    const guGunQuery = "SELECT cityCode FROM cities WHERE cityName = ?";
    const guGunResult = await conn.query(guGunQuery, [gu_gun]);

    if (guGunResult.length > 0) {
      // gu_gun 매칭
      const cityCode = guGunResult[0].cityCode;
      console.log(`gu_gun '${gu_gun}'과 일치하는 데이터 발견: cityCode=${cityCode}`);
      return res.json({
        gu_gun_match: true,
        city_do_match: false,
        cityCode,
        message: `${gu_gun}와 일치하는 데이터가 있습니다.`,
      });
    }

    // gu_gun이 없으면 city_do 대조
    const cityDoQuery = "SELECT cityCode FROM cities WHERE cityName = ?";
    const cityDoResult = await conn.query(cityDoQuery, [city_do]);

    if (cityDoResult.length > 0) {
      // city_do 매칭
      const cityCode = cityDoResult[0].cityCode;
      console.log(`city_do '${city_do}'과 일치하는 데이터 발견: cityCode=${cityCode}`);
      return res.json({
        gu_gun_match: false,
        city_do_match: true,
        cityCode,
        message: `${city_do}와 일치하는 데이터가 있습니다.`,
      });
    }

    // 일치하지 않는 경우
    console.log(`요청 데이터와 DB가 일치하지 않음: city_do='${city_do}', gu_gun='${gu_gun}'`);
    return res.json({
      gu_gun_match: false,
      city_do_match: false,
      cityCode: null,
      message: "일치하는 데이터가 없습니다.",
    });
  } catch (error) {
    console.error("MariaDB 요청 처리 중 오류 발생:", error);
    return res.status(500).json({ error: "서버 오류 발생" });
  } finally {
    // MariaDB 연결 해제
    if (conn) conn.release();
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
      conn = await pool.getConnection();
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
  const { id, password, name, number, pin } = req.body;
  if (!id || !password || !name || !number || !pin) {
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
    const query = `INSERT INTO nok (id, password, name, number, pin) VALUES (?, ?, ?, ?, ?)`;
    await conn.query(query, [id, password, name, number, pin]);
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
const liveGPSData = {}; // { pin: { latitude, longitude, timestamp } }
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
            const { pin, departure, destination, latitude, longitude } = data;

            if (!pin || !departure || !destination || !latitude || !longitude ) {
                throw new Error('GPS 데이터가 부족합니다.');
            }

            liveGPSData[pin] = {
                departure,
                destination,
                latitude,
                longitude,
                timestamp: new Date(),
            };
            console.log(`GPS 업데이트: ${pin} ->`, liveGPSData[pin]);
        }

        // GPS 데이터 요청
        if (data.type === 'gps-request') {
            const { pin } = data;

            if (!pin) {
                throw new Error('등록번호가 누락되었습니다.');
            }

            const gpsData = liveGPSData[pin];
            if (gpsData) {
                ws.send(
                    JSON.stringify({
                        type: 'gps-response',
                        pin,
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


//버스 승하차 요청
wss.on('connection', (ws) => {
  console.log('WebSocket 연결 성공');

  ws.on('message', (message) => {
      console.log('메시지 수신 원본:', message); // 원본 메시지 디버깅

      try {
          const data = JSON.parse(message);
          console.log('파싱된 메시지:', data);

          switch (data.type) {
            // 1. 클라이언트 등록 처리
            case 'register': {
                const { vehicleno } = data;
                if (vehicleno) {
                    clients.set(vehicleno, ws); // vehicleno와 WebSocket 객체 매핑
                    console.log(`등록된 차량 번호: ${vehicleno}`);
                }
                break;
            }
            // 2. 승차 요청 처리
            case 'activate-getOn-bell': {
              console.log('승차 요청 수신:', data);

              const { vehicleno } = data;
              const targetClient = clients.get(vehicleno);

              if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                  targetClient.send(JSON.stringify({
                      type: 'activate-getOn-bell',
                      firstNode: data.firstNode,
                  }));
                  console.log(`승차 요청 전송: ${data.firstNode} -> ${vehicleno}`);
              } else {
                  console.warn(`대상 차량(${vehicleno})을 찾을 수 없습니다.`);
              }
              break;
            }

            // 3. 하차 요청 처리
            case 'activate-getOff-bell': {
                console.log('하차 요청 수신:', data);

                const { vehicleno, targetNode } = data;
                const targetClient = clients.get(vehicleno);

                if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                    targetClient.send(JSON.stringify({
                        type: 'activate-getOff-bell',
                        targetNode,
                    }));
                    console.log(`하차 요청 전송: ${targetNode} -> ${vehicleno}`);
                } else {
                    console.warn(`대상 차량(${vehicleno})을 찾을 수 없습니다.`);
                }
                break;
            }

            // 특정 요청 제거
            case 'clear-specific-getOn-bell': {
              console.log('특정 승차 요청 제거 요청 수신:', data.firstNode);

              getOnList = getOnList.filter((node) => node !== data.firstNode);

              const { vehicleno } = data;
              const targetClient = clients.get(vehicleno);

              if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                  targetClient.send(JSON.stringify({
                      type: 'update-getOnList',
                      getOnList,
                  }));
                  console.log(`수정된 승차 요청 목록 전송: ${getOnList} -> ${vehicleno}`);
              }
              break;
            }
            default:
            console.warn('알 수 없는 메시지 타입:', data.type);
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