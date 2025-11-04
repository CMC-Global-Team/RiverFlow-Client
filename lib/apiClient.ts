import axios from 'axios';

//Tạo một "instance" của axios
const apiClient = axios.create({
  //Lấy URL gốc từ file .env.local
  baseURL: process.env.NEXT_PUBLIC_API_URL, 

  //Cài đặt header mặc định
  headers: {
    'Content-Type': 'application/json',
  },
});



export default apiClient;