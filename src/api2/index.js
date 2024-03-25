import axios from 'axios';
const api2 = axios.create({
    baseURL: import.meta.env.MIX_WEBSOCKET_SERVER_BASE_URL
});

export default api2;
