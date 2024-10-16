import UserResponse from '@/models/responses/userResponse';
import TeamResponse from '@/models/responses/teamResponse';
import ProjectResponse from '@/models/responses/projectResponse';
import ProfileResponse from '@/models/responses/profileReponse';
import DesignResponse from '@/models/responses/designResponse';
import { ResponsePrint } from '@/models/responses/responsePrint';
import apiClient from './axios'; // Import cấu hình apiClient
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';


// Cấu hình interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default {
  checkAdminPermission() {
    const token = Cookies.get('accessToken');
    if (!token) {
      return false; // Nếu token không tồn tại, trả về false
    }

    try {
      const decodedToken = jwtDecode(token);
      // Kiểm tra quyền Admin trong token
      return decodedToken.Permission.includes('Admin');
    } catch (error) {
      console.error('Token không hợp lệ hoặc không thể giải mã:', error);
      return false;
    }
  },
   checkAdminOrManagerPermission() {
    const token = Cookies.get('accessToken');
    if (!token) {
      return false; // Nếu không có token, trả về false
    }

    try {
      const decodedToken = jwtDecode(token);
      // Kiểm tra quyền Admin hoặc Manager trong token
      return decodedToken.Permission.includes('Admin') || decodedToken.Permission.includes('Manager');
    } catch (error) {
      console.error('Token không hợp lệ hoặc không thể giải mã:', error);
      return false;
    }
},

  // Hàm đăng nhập
  login(credentials) {
    return apiClient
      .post('/Auth/Login', {
        userName: credentials.userName,
        password: credentials.password,
      })
      .then((response) => {
        if (response.data.status === 200) {
          const accessToken = response.data.data.accessToken;
          const refreshToken = response.data.data.refreshToken;

          // Lưu token vào cookies
          Cookies.set('accessToken', accessToken, { expires: 1 }); // Access token hết hạn sau 1 ngày
          Cookies.set('refreshToken', refreshToken, { expires: 7 }); // Refresh token hết hạn sau 7 ngày

          return response.data; // Trả về dữ liệu khi đăng nhập thành công
        } else {
          return Promise.reject(new Error(response.data.message));
        }
      })
      .catch((error) => {
        const apiError = error.message || 'Có lỗi xảy ra trong quá trình đăng nhập';
        return Promise.reject(apiError);
      });
  },


  // Hàm đăng ký mới
  register(registerRequest) {
    const formData = registerRequest.toFormData(); // Chuyển dữ liệu thành FormData

    return apiClient
      .post('/Auth/Register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        if (response.data.status === 200) {
          return response.data;
        } else {
          console.log(response.data.message);
          return Promise.reject(new Error(response.data.message));

        }
      })
      .catch((error) => {
        const apiError = error.message || 'Có lỗi xảy ra trong quá trình đăng ký';
        console.error('Error during registration:', apiError);
        return Promise.reject(apiError);
      });
  },
  // Hàm xác nhận tài khoản với mã OTP
  confirmRegisterAccount(otpCode) {
    return apiClient
      .post(`/Auth/ConfirmRegisterAccount?confirmCode=${otpCode}`)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw error || 'Error occurred while confirming account';
      });
  },
  // Hàm logout
  logout() {
    // Lấy refreshToken từ cookie
    const refreshToken = Cookies.get('refreshToken');

    // Kiểm tra xem refreshToken có tồn tại không
    if (!refreshToken) {
      console.error('Refresh token không tồn tại!');
      return;
    }

    // Gửi yêu cầu logout tới API
    return apiClient
      .post(`/Auth/Logout`, null, {
        params: { token: refreshToken } // Gửi refreshToken qua tham số token
      })
      .then((response) => {
        if (response.status === 200) {
          // Xóa accessToken và refreshToken khỏi cookie sau khi logout thành công
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          console.log('Đăng xuất thành công:', response.data.message);
          return response.data;
        } else {
          console.error('Đăng xuất không thành công:', response.data.message);
          return Promise.reject('Đăng xuất không thành công');
        }
      })
      .catch((error) => {
        console.error('Có lỗi xảy ra khi đăng xuất:', error.message);
        return Promise.reject(error);
      });
  },
  forgotPassword(username) {
    return apiClient.post(`/Auth/ForgotPassword?userName=${username}`)
      .then((response) => response.data)
      .catch((error) => {
        throw error.response?.data || 'Error during forgot password';
      });
  },
  changePassword(changePasswordRequest) {
    return apiClient
      .put('/Auth/ChangePassword', changePasswordRequest)
      .then(response => response.data)
      .catch((error) => {
        console.error('Lỗi khi đổi mật khẩu:', error);
        throw error;
      });
  },
  // Hàm xác nhận mã và đặt lại mật khẩu
  confirmForgotPassword(resetPasswordRequest) {
    return apiClient.put(
      `/Auth/ConfirmForgotPassword?confirmCode=${resetPasswordRequest.confirmCode}`, resetPasswordRequest.toJson())
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch((error) => {
        throw error || 'Error during confirm forgot password';
      });
  },
  // hàm lấy ra danh sách user
  getUsers(pageNumber, pageSize) {
    return apiClient
      .get('/User/GetAllUsers', {
        params: {
          pageNumber: pageNumber,
          pageSize: pageSize,
        },
      })
      .then((response) => {
        return new UserResponse(response.data); // Trả về đối tượng UserResponse
      })
      .catch((error) => {
        console.error('Có lỗi khi lấy danh sách người dùng:', error);
        throw error;
      });
  },

  //hàm lấy ra danh sách team
  getTeams(pageNumber, pageSize) {
    return apiClient
      .get('/Team/GetAllTeams', {
        params: {
          pageNumber: pageNumber,
          pageSize: pageSize,
        },
      })
      .then((response) => {
        return new TeamResponse(response.data); // Trả về đối tượng TeamResponse
      })
      .catch((error) => {
        console.error('Có lỗi khi lấy danh sách team:', error);
        throw error;
      });
  },
  getProjects(pageNumber, pageSize) {
    return apiClient
      .get('/Project/GetAllProject', {
        params: {
          pageNumber: pageNumber,
          pageSize: pageSize,
        },
      })
      .then((response) => {
        return new ProjectResponse(response.data); // Sử dụng ProjectResponse để chuẩn hóa dữ liệu trả về
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách dự án:', error);
        throw error;
      });
  },
  // Lấy danh sách user có role Leader
  GetUsersWithRoleManagers() {
    return apiClient
      .get('/User/GetUsersWithRoleManagers')
      .then((response) => {
        return response.data; // Dữ liệu UserResponse
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách leaders:', error);
        throw error;
      });
  },
  //lấy ra danh sách team chỉ tên và id
  getDepartments() {
    return apiClient
      .get('/Team/getDepartments')
      .then((response) => {
        return response.data;
      }).catch((error) => {
        console.error('Lỗi khi lấy danh sách Team:', error);
        throw error;
      });
  },
  //tên và id customer
  getCustomers() {
    return apiClient.get('/Project/GetAllIdNameCustomer')
      .then(response => response)
      .catch(error => {
        console.error('Lỗi khi lấy danh sách khách hàng:', error);
        throw error;
      });
  },
  getUserProfile() {
    return apiClient
      .get('/User/GetProfileById') // Không cần truyền id, API tự xử lý
      .then(response => {
        if (response.data.status === 200) {
          return new ProfileResponse(response.data.data); // Trả về đối tượng ProfileResponse
        } else {
          return response.data.message;
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        throw error;
      });
  },
  getDesignsByProject(projectId, deStatus = null) {
    const params = { projectId };
    if (deStatus !== null) {
      params.deStatus = deStatus;
    }

    return apiClient
      .get('/Design/GetDesignByProjectAsyc', { params })
      .then((response) => DesignResponse.fromApiResponse(response.data.data))
      .catch((error) => {
        console.error('Error fetching designs:', error);
        throw error;
      });
  },
  getDesignById(designId) {
    return apiClient.get(`/Design/GetDesignById/design/${designId}`)
      .then((response) => new DesignResponse(response.data.data))
      .catch((error) => {
        console.error('Error fetching designs:', error);
        throw error;
      });
  },

  // API để lấy PrintJobs liên quan tới một designId
  getResourcePrintJobByDesign(designId) {
    return apiClient.get(`/PrintJob/GetResourcePrintJobByDesign?designId=${designId}`)
      .then((response) => {
        // Chuyển đổi từ phản hồi API thành các đối tượng ResponsePrint
        return response.data.data.map((printJob) => ResponsePrint.fromApiResponse(printJob));
      })
      .catch((error) => {
        console.error('Error fetching print jobs:', error);
        throw error;
      });
  },
  getAllResources() {
    return apiClient.get('/Resources/GetAllResource');
  },
  getResourcePropertiesByResourceId(resourceId) {
    return apiClient.get(`/ResourceProperty/GetResourcePropertyByResourceId?resourceId=${resourceId}`);
  },
  getResourceDetailByPrintJob(printJobId) {
    return apiClient.get(`/PrintJob/GetResourceDetailByPrintJob?printJobId=${printJobId}`)
      .then(response => response.data)
      .catch(error => {
        console.error("Error fetching resource details for PrintJob:", error);
        throw error;
      });
  },
  getDeliveries(dStatus, pageNumber, pageSize) {
    const params = { pageNumber, pageSize };
    if (dStatus !== null) {
      params.dStatus = dStatus;
    }

    return apiClient
      .get('/Delivery/GetDeliveryByStatus', { params })
      .then((response) => response.data)
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        throw error;
      });
  },
  getDeliveriesByDeliverId(dStatus, pageNumber, pageSize) {
    const params = { pageNumber, pageSize };
    if (dStatus !== null) {
      params.dStatus = dStatus;
    }

    return apiClient
      .get('/Delivery/GetDeliveryByShipperIdStatus', { params })
      .then((response) => response.data)
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        throw error;
      });
  },
  getShipperIdByDeliveryAddress(deliveryAddress) {
    return apiClient
      .get('/Delivery/GetShipperIdByDeliveryAddress', {
        params: { deliveryAddress: deliveryAddress }
      })
      .then(response => response.data)
      .catch(error => {
        console.error("Lỗi khi lấy mã shipper theo địa chỉ:", error);
        throw error;
      });
  },
  getAllShippingMethods() {
    return apiClient
      .get('/Delivery/GetAllShippingMethod')
      .then(response => response.data)
      .catch(error => {
        console.error("Lỗi khi lấy danh sách phương thức giao hàng:", error);
        throw error;
      });
  },
  getEmployeesInDeliveryTeam() {
    return apiClient
      .get('/Delivery/GetEmployeesInDeliveryTeam')
      .then(response => response.data)
      .catch(error => {
        console.error("Lỗi khi lấy danh sách nhân viên phòng giao hàng:", error);
        throw error;
      });
  },
  getCustomerAddressByProjectId(projectId) {
    return apiClient.get(`/Delivery/GetAddressCustomerByProjectId`, {
      params: {
        projectId: projectId
      }
    });
  },
  getNotificationsByUserId() {
    return apiClient.get(`/User/GetNotificationByUserId`)
      .then(response => response)
      .catch(error => {
        console.error('Lỗi khi lấy danh sách thông báo:', error);
        throw error;
      });
  },
  getAllCustomers() {
    return apiClient.get('/Customer/GetAllCustomer');
  },

  // Create a new customer
  createCustomer(data) {
    return apiClient.post('/Customer/CreateCustomer', data);
  },
  // Tạo team mới
  createTeam(teamRequest) {
    return apiClient
      .post('/Team/CreateTeam', teamRequest.toJson())
      .then((response) => {
        return response.data; // Trả về dữ liệu response của team tạo mới
      })
      .catch((error) => {
        console.error('Lỗi khi tạo team:', error);
        throw error;
      });
  },
  createResourceForPrintJob(formData) {
    return apiClient.post('/PrintJob/CreateResourceForPrintJobs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  //tạo project mới
  createProject(projectData) {
    const formData = new FormData();
    formData.append('ProjectName', projectData.projectName);
    formData.append('RequestDescriptionFromCustomer', projectData.requestDescriptionFromCustomer);
    formData.append('StartDate', projectData.startDate);
    formData.append('Image', projectData.image);
    formData.append('ExpectedEndDate', projectData.expectedEndDate);
    formData.append('CustomerId', projectData.customerId);

    return apiClient
      .post('/Project/CreateProject', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Lỗi khi tạo dự án:', error);
        throw error;
      });
  },

  createDelivery(data) {
    return apiClient.post('/Delivery/CreateDelivery', data);
  },
  getCompletedProjectsNotInDelivery() {
    return apiClient.get('/Delivery/GetCompletedProjectsNotInDelivery');
  },

  uploadDesignFile(projectId, file) {
    // Tạo đối tượng FormData để chứa dữ liệu
    const formData = new FormData();
    formData.append('ProjectId', projectId);
    formData.append('FilePath', file); // file được chọn bởi người dùng

    // Gửi request bằng apiClient với formData
    return apiClient
      .post('/Design/UploadFileDesig', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Lỗi khi gửi thiết kế', error);
        throw error;
      });
  },
  approveDesign(data) {
    return apiClient.put('/Design/ApprovedDesign', data)
      .then(response => response.data)
      .catch(error => {
        console.error("Lỗi khi gọi API cập nhật trạng thái:", error);
        throw error;
      });
  },


  // Hàm cập nhật trạng thái isSeen của thông báo
  updateIsSeenNotification(notificationId) {
    return apiClient.put(`/User/UpdateIsSeenNotification?id=${notificationId}`)
      .then(response => response)
      .catch(error => {
        console.error('Lỗi khi cập nhật trạng thái thông báo:', error);
        throw error;
      });
  },
  updateDeliveryStatus(deliveryId, dStatus) {
    return apiClient.put(`/Delivery/UpdateDeliveryStatusById`, null, {
      params: { id: deliveryId, dStatus },
    });
  },
  confirmSuccessfulDelivery(deliveryId) {
    return apiClient.put(`/Delivery/ConfirmSuccessfulDelivery`, null, {
      params: { id: deliveryId },
    });
  },
  // cập nhật trưởng phòng
  updateTeamManager(teamId, userId) {
    return apiClient
      .put(`/Team/UpdateTeamManager/update_leader/${teamId}?userId=${userId}`)
      .then((response) => {
        return response.data;
      }).
      catch((error) => {
        console.error('Có lỗi khi cập nhật trưởng phòng:', error);
        throw error;
      });
  },
  // cập nhật phòng ban
  updateTeam(teamId, teamData) {
    return apiClient.put(`/Team/UpdateTeam/${teamId}`, teamData)
      .then((response) => {
        return response.data; // Trả về dữ liệu từ API
      })
      .catch((error) => {
        console.error('Error updating team:', error);
        throw error;
      });
  },
  //đổi phòng ban cho nhân viên
  updateUserDepartment(userId, teamId) {
    return apiClient
      .put(`/Team/UpdateTeamUser/update_team/${userId}?teamId=${teamId}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Lỗi khi cập nhật phòng ban:', error);
        throw error;
      });
  },
  updateResourceDetail(resourceId, payload) {
    return apiClient.put(`/PrintJob/UpdateResourcePropertyDetail?id=${resourceId}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => response.data)
      .catch(error => {
        console.error("Error updating resource:", error);
        throw error;
      });
  },

  updatePrintJobStatus(printJobId, newStatus) {
    return apiClient.put(`/PrintJob/UpdatePrintJobStatus?printJobId=${printJobId}&newStatus=${newStatus}`);
  },

  //xóa team
  deleteTeam(teamId) {
    return apiClient.delete(`/Team/DeleteTeam/${teamId}`);
  },

  deleteResourceDetailById(resourceId) {
    return apiClient.delete(`/PrintJob/DeleteResourcePropertyDetail?id=${resourceId}`)
      .then(response => response.data)
      .catch(error => {
        console.error("Error deleting resource:", error);
        throw error;
      });
  },

};
