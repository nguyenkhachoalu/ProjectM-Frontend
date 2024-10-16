import axios from 'axios';
import Cookies from 'js-cookie'; // Import thư viện js-cookie
import router from '../routers/index'; // Import router để điều hướng khi token hết hạn
// Tạo một instance của axios với các cấu hình cơ bản
const apiClient = axios.create({
  baseURL: 'https://localhost:44377/api', // Base URL của API
  withCredentials: true, // Gửi cookie cùng với request
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken'); // Lấy token từ cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Thêm token vào header Authorization
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor để kiểm tra lỗi 401 và làm mới token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu có lỗi 401 và request chưa được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken'); // Lấy refresh token từ cookie
        const response = await apiClient.post('/Auth/RefreshToken', {
          accessToken: Cookies.get('accessToken'), // Lấy access token từ cookie
          refreshToken: refreshToken,
        });

        if (response.status === 200) {
          Cookies.set('accessToken', response.data.data.accessToken, { expires: 1 }); // Lưu access token vào cookie
          Cookies.set('refreshToken', response.data.data.refreshToken, { expires: 7 }); // Lưu refresh token vào cookie
          originalRequest.headers['Authorization'] = 'Bearer ' + response.data.data.accessToken;

          // Thực hiện lại request với token mới
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Unable to refresh token', refreshError);
        // Xử lý khi refresh token không hợp lệ, ví dụ chuyển hướng đến trang đăng nhập
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        router.push('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
