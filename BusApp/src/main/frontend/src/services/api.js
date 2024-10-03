import axios from 'axios';

const api = axios.create({
    baseURL: 'http://10.181.29.130:8080/api', // 서버의 실제 IP로 수정합니다.
});

export default api;
