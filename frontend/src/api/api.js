import axios from 'axios';

const API = axios.create({
    baseURL: "http://localhost:3000", // backend node.js
    withCredentials: true
});

export default API;