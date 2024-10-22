<template>
  <v-container class="d-flex justify-center align-center" fill-height style="color: white;">
    <v-row v-if="userProfile">
      <v-col cols="4" class="d-flex flex-column align-center justify-center">
        <div class="info-box">
          <span>{{ userProfile.fullName }}</span>
        </div>
        <div class="info-box">
          <span>{{ userProfile.email }}</span>
        </div>
        <!-- Nút Sửa thông tin -->
        <v-btn color="primary" variant="outlined" class="mt-4" @click="openEditDialog">Sửa thông tin</v-btn>
      </v-col>

      <v-col cols="4" class="d-flex justify-center align-center" style="align-self: center;">
        <v-avatar size="300">
          <img :src="userProfile.avatar" class="avatar-image" alt="Avatar" />
        </v-avatar>
      </v-col>

      <v-col cols="4" class="d-flex flex-column align-center justify-center">
        <div class="info-box">
          <span>{{ userProfile.phoneNumber }}</span>
        </div>
        <div class="info-box">
          <span>{{ userProfile.dateOfBirth }}</span>
        </div>
        <v-btn color="secondary" variant="outlined" class="mt-4" @click="openDialog">Đổi mật khẩu</v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col class="d-flex justify-center align-center">
        <span>Đang tải dữ liệu...</span>
      </v-col>
    </v-row>

    <!-- Dialog sửa thông tin cá nhân -->
    <v-dialog v-model="editProfileDialog" max-width="600px">
      <v-card>
        <v-card-title>Sửa thông tin cá nhân</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="editProfile.fullName" label="Họ và Tên"></v-text-field>
            <v-text-field v-model="editProfile.email" label="Email"></v-text-field>
            <v-text-field v-model="editProfile.phoneNumber" label="Số điện thoại"></v-text-field>
            <v-file-input v-model="editProfile.avatar" label="Avatar" accept="image/*"></v-file-input>
            <v-date-input v-model="editProfile.dateOfBirth" label="Ngày sinh" variant="outlined"></v-date-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeEditDialog">Hủy</v-btn>
          <v-btn color="blue darken-1" text @click="submitEditProfile">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ChangePasswordDialog v-model="changePasswordDialog" />
    <v-snackbar style="text-align: center;" v-model="snackbarSuccess" :timeout="3000" color="green" top right>
    {{ snackbarMessage }}
  </v-snackbar>
  </v-container>
</template>

<script>
import apiService from '@/services/apiService';
import ChangePasswordDialog from '@/components/setting/ChangePasswordDialog.vue';
export default {
  name: 'ProfileComponent',
  components: {
    ChangePasswordDialog,
  },
  data() {
    return {
      userProfile: null,
      changePasswordDialog: false,
      editProfileDialog: false, // Điều khiển hiển thị dialog sửa thông tin
      snackbarSuccess: false,
      snackbarMessage:'',
      editProfile: {
        fullName: '',
        email: '',
        phoneNumber: '',
        avatar: null,
        dateOfBirth: null,
      },
    };
  },
  methods: {
    fetchUserProfile() {
    apiService.getUserProfile()
      .then(profile => {
        this.userProfile = profile;
        this.editProfile.fullName = profile.fullName;
        this.editProfile.email = profile.email;
        this.editProfile.phoneNumber = profile.phoneNumber;
        this.editProfile.avatar = profile.avatar;
        
        // Chuyển đổi chuỗi ngày thành đối tượng Date nếu cần thiết
        this.editProfile.dateOfBirth = this.convertToDate(profile.dateOfBirth);
      })
      .catch(error => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      });
  },
  convertToDate(value) {
    // Nếu giá trị là một chuỗi, chuyển đổi thành đối tượng Date
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;  // Trả về giá trị nếu đã là đối tượng Date
  },
    openDialog() {
      this.changePasswordDialog = true;
    },
    openEditDialog() {
      this.editProfileDialog = true;
    },
    closeEditDialog() {
      this.editProfileDialog = false;
    },
    submitEditProfile() {
    const formData = new FormData();
    formData.append('FullName', this.editProfile.fullName);
    formData.append('Email', this.editProfile.email);
    formData.append('PhoneNumber', this.editProfile.phoneNumber);
    
    if (this.editProfile.avatar instanceof File) {
      formData.append('Avatar', this.editProfile.avatar);
    }
    
    // Chuyển đổi Date thành chuỗi định dạng yyyy-MM-dd trước khi gửi đi
    const formattedDate = this.editProfile.dateOfBirth ? 
                          new Date(this.editProfile.dateOfBirth).toISOString().slice(0, 10) : '';
    formData.append('DateOfBirth', formattedDate);

    apiService.updateUserProfile(formData)
      .then((response) => {
        this.fetchUserProfile(); // Cập nhật thông tin mới
        this.closeEditDialog();
        this.snackbarMessage = response.message;
        this.snackbarSuccess = true;
      })
      .catch(error => {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      });
  }
  },
  mounted() {
    this.fetchUserProfile();
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
  object-fit: cover;
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
