import axios from 'axios';
import { refreshAccessToken } from '@/services/auth/refresh-token.service';
import { setCookie, deleteCookie } from './cookies';

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

// Response interceptor - Xử lý lỗi 401 (Unauthorized) và refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý lỗi 403 - Token hết hạn hoặc không hợp lệ, tự động logout
    // Không redirect nếu đang ở trang verify-email (vì đây là public endpoint)
    if (error.response?.status === 403) {
      // Clear tất cả dữ liệu authentication
      localStorage.clear();
      deleteCookie('accessToken');
      
      // Redirect về trang login (trừ khi đang ở trang verify-email)
      if (typeof window !== 'undefined' && 
          window.location.pathname !== '/' && 
          !window.location.pathname.includes('/verify-email')) {
        window.location.href = '/';
      }
      
      return Promise.reject(error);
    }
    
    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Gọi API refresh token
          const response = await refreshAccessToken(refreshToken);
          
          // Lưu token mới
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          // Lưu vào cookie cho middleware
          setCookie('accessToken', response.accessToken, 7);
          
          // Cập nhật header cho request ban đầu
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          
          // Process các request đang đợi
          processQueue(null, response.accessToken);
          
          isRefreshing = false;
          
          // Retry request ban đầu
          return apiClient(originalRequest);
        } catch (err) {
          // Refresh token failed, clear storage và redirect
          processQueue(err, null);
          isRefreshing = false;
          
          localStorage.clear();
          deleteCookie('accessToken');
          
          // Chỉ redirect nếu không phải đang ở trang login hoặc verify-email
          if (typeof window !== 'undefined' && 
              window.location.pathname !== '/' && 
              !window.location.pathname.includes('/verify-email')) {
            window.location.href = '/';
          }
          
          return Promise.reject(err);
        }
      } else {
        // Không có refresh token, clear và redirect
        isRefreshing = false;
        localStorage.clear();
        deleteCookie('accessToken');
        
        if (typeof window !== 'undefined' && 
            window.location.pathname !== '/' && 
            !window.location.pathname.includes('/verify-email')) {
          window.location.href = '/';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;