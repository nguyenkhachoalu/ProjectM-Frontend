<template>
  <v-container fluid>
    <!-- Form quên mật khẩu -->
    <v-card class="pa-5" width="100%" style="box-shadow: none !important;">
      <v-card-title class="text-h5" style="text-align: center;">Quên mật khẩu</v-card-title>
      <v-card-text>
        <v-form ref="forgotPasswordForm" v-model="valid">
          <!-- Tên đăng nhập -->
          <v-text-field
            label="Tên đăng nhập"
            v-model="username"
            :rules="usernameRules"
            :error-messages="usernameError"
            variant="outlined"
            prepend-icon="mdi-account"
            dense
            required
            @input="resetError('usernameError')" 
          ></v-text-field>

          <!-- Nút gửi yêu cầu lấy lại mật khẩu -->
          <v-btn color="black" :disabled="!valid" @click="handleForgotPassword" style="margin-bottom: 20px;">
            Lấy lại mật khẩu
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Dialog nhập mã xác nhận và mật khẩu mới -->
    <v-dialog v-model="dialog" max-width="600px" style="text-align: center;">  <!-- Tăng kích thước dialog -->
      <v-card>
        <div class="step-dots" style="margin-top: 10px;">
          <v-btn v-for="(step, index) in steps" :key="index" :color="index <= currentStep ? '#ff7828' : '#e0e0e0'"
            class="dot" :disabled="index > currentStep" @click="goToStep(index)">
          </v-btn>
        </div>

        <v-card-title class="text-h5">
          {{ currentStep === 0 ? 'Nhập mã xác nhận' : 'Đặt lại mật khẩu' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="resetForm" v-model="valid">
            <!-- Bước 1: Nhập mã xác nhận -->
            <v-otp-input
              v-if="currentStep === 0"
              label="Mã xác nhận"
              length="5"
              v-model="confirmCode"
              :rules="confirmCodeRules"
              variant="outlined"
              dense
              required
              @input="resetError('confirmCodeError')" 
            ></v-otp-input>

            <!-- Bước 2: Nhập mật khẩu mới -->
            <v-text-field
              v-if="currentStep === 1"
              label="Mật khẩu mới"
              v-model="newPassword"
              :rules="passwordRules"
              variant="outlined"
              dense
              type="password"
              required
              @input="resetError('passwordError')" 
            ></v-text-field>

            <v-text-field
              v-if="currentStep === 1"
              label="Xác nhận mật khẩu"
              v-model="confirmPassword"
              :rules="confirmPasswordRules"
              variant="outlined"
              dense
              type="password"
              required
              @input="resetError('confirmPasswordError')" 
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn style="background-color: #ff7828;" :disabled="!valid" @click="handleNext">
            {{ currentStep === 0 ? 'Xác nhận mã' : 'Đặt lại mật khẩu' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import apiService from "@/services/apiService";
import { ResetPasswordRequest } from '@/models/requests/request_reset_password';

export default {
  name: 'ForgotPassword',
  
  data() {
    return {
      valid: false,
      username: '',
      confirmCode: '',
      newPassword: '',
      confirmPassword: '',
      dialog: false,
      currentStep: 0,  // Bắt đầu từ bước 0 (nhập mã xác nhận)
      steps: ['Nhập mã', 'Đặt lại mật khẩu'],
      completedSteps: [false, false],  // Để kiểm tra bước nào đã hoàn thành

      // Các biến để chứa lỗi từ API
      usernameError: '',
  
      passwordError: '',
      confirmPasswordError: '',

      usernameRules: [
        v => !!v || 'Tên đăng nhập không được để trống',
      ],
      confirmCodeRules: [
        v => !!v || 'Mã xác nhận không được để trống',
      ],
      passwordRules: [
        v => !!v || 'Mật khẩu không được để trống',
        v => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
      ],
      confirmPasswordRules: [
        v => !!v || 'Xác nhận mật khẩu không được để trống',
        v => v === this.newPassword || 'Mật khẩu không khớp',
      ]
    };
  },

  methods: {
    // Gửi yêu cầu lấy lại mật khẩu (bước nhập tên đăng nhập)
    async handleForgotPassword() {
      if (this.$refs.forgotPasswordForm.validate()) {
        try {
          console.log("Sending forgot password request...");
          const response = await apiService.forgotPassword(this.username);
          console.log("API Response:", response);

          if (response === "Tài khoản không tồn tại trong hệ thống") {
            this.usernameError = response;  // Hiển thị lỗi
          } else if (response === "Hệ thống đã gửi mã xác minh tới email của bạn, thời hạn 3 phút") {
            this.dialog = true;
            this.currentStep = 0;  // Bắt đầu từ bước nhập mã xác nhận
          }
        } catch (error) {
          console.error("Error during forgot password:", error);
        }
      }
    },

    // Xử lý logic các bước nhập mã xác nhận và đặt lại mật khẩu
    async handleNext() {
      if (this.$refs.resetForm && this.$refs.resetForm.validate()) {  // Kiểm tra form tồn tại trước khi validate
        try {
          if (this.currentStep === 0) {
            // Khi nhập mã xác nhận xong, chuyển sang bước 1 (đặt lại mật khẩu)
            this.completedSteps[0] = true;
            this.currentStep = 1;

          } else if (this.currentStep === 1) {
            // Khi đặt lại mật khẩu, tạo request từ các trường
            const resetRequest = new ResetPasswordRequest(this.confirmCode, this.newPassword, this.confirmPassword);

            // Gọi API để đặt lại mật khẩu
            const response = await apiService.confirmForgotPassword(resetRequest);
            const validMessage = response.data;
            console.log(validMessage);
            
            // Xử lý phản hồi từ API
            if (validMessage === "Đã đổi mật khẩu thành công") {
              alert('Đặt lại mật khẩu thành công!');
              this.dialog = false;
              this.$router.push({ name: 'LoginComponent' });
            } else if (validMessage === "Mã xác nhận không hợp lệ" || validMessage === "Mã đã được sử dụng" || validMessage === "Mã xác nhận đã hết hạn") {
              this.currentStep = 0;  // Quay lại bước nhập mã
              alert(validMessage);
            } else {
              alert('Có lỗi xảy ra. Vui lòng thử lại sau!');
            }
          }
        } catch (error) {
          console.error("Error during confirm/reset password:", error);
        }
      }
    },

    // Reset thông báo lỗi khi người dùng nhập lại giá trị
    resetError(field) {
      this[field] = '';  // Xóa lỗi của trường
      if (this.$refs.resetForm) {
        this.$refs.resetForm.validate();  // Kiểm tra lại form nếu tồn tại
      }
    },

    // Điều hướng giữa các bước nhập mã và đặt lại mật khẩu
    goToStep(index) {
      if (this.completedSteps[index - 1] || index === 0) {
        this.currentStep = index;
      }
    }
  }
};
</script>

<style scoped>
.step-dots {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.dot {
  height: 5px;
  border-radius: 10%;
  margin: 0 5px;
}

.v-btn {
  background-color: #f44336;
  color: white;
}

.v-btn .v-icon {
  font-size: 2.5rem;
}
</style>
