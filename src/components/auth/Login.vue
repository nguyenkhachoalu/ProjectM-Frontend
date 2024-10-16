<template>
  <v-container fluid>
    <!-- Form đăng nhập -->
    <v-card class="pa-5" width="100%" style="box-shadow: none !important;">
      <v-card-title class="text-h5" style="text-align: center;">Đăng nhập</v-card-title>
      <v-card-text>
        <v-form ref="loginForm" v-model="valid">
          <!-- Tên đăng nhập -->
          <v-text-field 
            label="Tên đăng nhập" 
            v-model="username" 
            :rules="usernameRules"
            @input="resetUsernameError" 
            variant="outlined"
            prepend-icon="mdi-account" 
            dense 
            required
          ></v-text-field>

          <!-- Mật khẩu -->
          <v-text-field 
            label="Mật khẩu" 
            v-model="password" 
            :rules="passwordRules"
            @input="resetPasswordError" 
            prepend-icon="mdi-lock"
            type="password" 
            variant="outlined" 
            dense 
            required
            
          ></v-text-field>

          <!-- Nút đăng nhập -->
          <v-btn color="black" :disabled="!valid" @click="handleLogin" style="margin-bottom: 20px;">
            Đăng nhập
          </v-btn>

          <!-- Nút quên mật khẩu -->
          <a color="black" @click="forgotPassword" style="display: block;">
            Bạn đã quên mật khẩu của mình?
          </a>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { LoginRequest } from '@/models/requests/request_login';
import apiService from '@/services/apiService';

export default {
  name: 'LoginComponent',

  data() {
    return {
      valid: false,
      username: '',
      password: '',
      usernameError: '', // Biến chứa lỗi cho tên đăng nhập từ API
      passwordError: '', // Biến chứa lỗi cho mật khẩu từ API
    };
  },

  computed: {
    // Rules cho trường username
    usernameRules() {
      return [
        v => !!v || 'Tên đăng nhập không được để trống', // Kiểm tra không được để trống
        () => this.usernameError || true, // Hiển thị lỗi từ API nếu có
      ];
    },
    // Rules cho trường password
    passwordRules() {
      return [
        v => !!v || 'Mật khẩu không được để trống', // Kiểm tra không được để trống
        () => this.passwordError || true, // Hiển thị lỗi từ API nếu có
      ];
    }
  },

  methods: {
    // Reset lỗi username khi người dùng thay đổi giá trị
    resetUsernameError() {
      this.usernameError = '';
      this.$refs.loginForm.validate(); // Gọi lại validate để cập nhật trạng thái form
    },
    
    // Reset lỗi password khi người dùng thay đổi giá trị
    resetPasswordError() {
      this.passwordError = '';
      this.$refs.loginForm.validate(); // Gọi lại validate để cập nhật trạng thái form
    },

    async handleLogin() {
      // Reset lại thông báo lỗi từ API
      this.usernameError = '';
      this.passwordError = '';

      if (this.$refs.loginForm.validate()) {
        const loginRequest = new LoginRequest(this.username, this.password);

        try {
          const response = await apiService.login(loginRequest);
          if (response.status === 200) {
            this.$router.push({ name: 'Dasboard' });
          }
        } catch (error) {
          console.error('API Error Response:', error);
          
          // Gán lỗi từ API vào biến để hiển thị dưới input
          const errorMessage = error || 'Có lỗi xảy ra trong quá trình đăng nhập';
          
          if (errorMessage.toLowerCase().includes('tài khoản')) {
            this.usernameError = errorMessage;
          } else if (errorMessage.toLowerCase().includes('mật khẩu')) {
            this.passwordError = errorMessage;
          }
          // Re-validate form để hiển thị lỗi
          this.$refs.loginForm.validate();
        }
      }
    },

    forgotPassword() {
      // Điều hướng đến trang quên mật khẩu
      this.$router.push({ name: 'ForgotPassword' });
    }
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 15px;
}

.v-btn {
  font-weight: bold;
}
</style>
