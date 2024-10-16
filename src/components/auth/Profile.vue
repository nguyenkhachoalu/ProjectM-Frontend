<template>
  <v-container class="d-flex justify-center align-center" fill-height style="color: white;">
    <v-row v-if="userProfile"> <!-- Kiểm tra userProfile đã có dữ liệu chưa -->
      <!-- Cột trái -->
      <v-col cols="4" class="d-flex flex-column align-center justify-center">
        <!-- Họ và Tên -->
        <div class="info-box">
          <span>{{ userProfile.fullName }}</span> <!-- Hiển thị tên -->
        </div>
        <!-- Email -->
        <div class="info-box">
          <span>{{ userProfile.email }}</span> <!-- Hiển thị email -->
        </div>
        <!-- Nút Sửa thông tin -->
        <v-btn color="primary" variant="outlined" class="mt-4">Sửa thông tin</v-btn>
      </v-col>

      <!-- Cột giữa (Avatar) -->
      <v-col cols="4" class="d-flex justify-center align-center" style="align-self: center;">
        <v-avatar size="300">
          <img :src="userProfile.avatar" class="avatar-image" alt="Avatar" /> <!-- Hiển thị avatar -->
        </v-avatar>
      </v-col>

      <!-- Cột phải -->
      <v-col cols="4" class="d-flex flex-column align-center justify-center">
        <!-- Số điện thoại -->
        <div class="info-box">
          <span>{{ userProfile.phoneNumber }}</span> <!-- Hiển thị số điện thoại -->
        </div>
        <!-- Ngày sinh -->
        <div class="info-box">
          <span>{{ userProfile.dateOfBirth }}</span> <!-- Hiển thị ngày sinh -->
        </div>
        <!-- Nút Đổi mật khẩu -->
        <v-btn color="secondary" variant="outlined" class="mt-4" @click="openDialog">Đổi mật khẩu</v-btn>
      </v-col>
    </v-row>

    <!-- Hiển thị thông báo nếu dữ liệu userProfile chưa sẵn sàng -->
    <v-row v-else>
      <v-col class="d-flex justify-center align-center">
        <span>Đang tải dữ liệu...</span>
      </v-col>
    </v-row>
    <ChangePasswordDialog v-model="changePasswordDialog" />
  </v-container>
</template>

<script>
import apiService from '@/services/apiService'; // Import apiService
import ChangePasswordDialog from '@/components/setting/ChangePasswordDialog.vue';

export default {
  name: 'ProfileComponent',
  components: {
    ChangePasswordDialog,
  },
  data() {
    return {
      userProfile: null, // Dữ liệu người dùng sẽ được lấy từ API
      changePasswordDialog: false, // Điều khiển hiển thị dialog
    };
  },
  methods: {
    // Hàm lấy thông tin hồ sơ từ API
    fetchUserProfile() {
      apiService.getUserProfile()
        .then(profile => {
          this.userProfile = profile; // Lưu thông tin người dùng vào biến userProfile
        })
        .catch(error => {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
        });
    },
    // Mở dialog đổi mật khẩu
    openDialog() {
      this.changePasswordDialog = true;
    },
  },
  mounted() {
    this.fetchUserProfile(); // Gọi API để lấy thông tin hồ sơ khi component được mount
  },
};
</script>

<style scoped>
.v-avatar {
  border: 3px solid #FFD700;
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Đảm bảo ảnh hiển thị đúng tỷ lệ mà không bị méo */
}
.v-btn {
  width: 100%;
  height: 60px;
}
.info-box {
  width: 100%;
  height: 60px;
  border: 1px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
