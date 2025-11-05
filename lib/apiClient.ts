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

// Request interceptor - Tự động thêm access token vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    // Lấy access token từ localStorage
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      // Thêm token vào header Authorization
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi 401 (Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Có thể implement refresh token logic ở đây
      // const refreshToken = localStorage.getItem('refreshToken');
      // if (refreshToken) {
      //   try {
      //     const response = await axios.post('/api/auth/refresh', { refreshToken });
      //     localStorage.setItem('accessToken', response.data.accessToken);
      //     originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
      //     return apiClient(originalRequest);
      //   } catch (err) {
      //     // Refresh token failed, redirect to login
      //     localStorage.clear();
      //     window.location.href = '/';
      //   }
      // }
      
      // Clear tokens và redirect về trang login
      localStorage.clear();
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;