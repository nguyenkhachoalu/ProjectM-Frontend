<template>
  <v-container fluid>
    <!-- Điều hướng bằng các nút -->
    <div class="step-dots">
      <v-btn v-for="(step, index) in steps" :key="index" :color="index === currentStep ? '#ff7828' : '#e0e0e0'"
        class="dot" :disabled="!completedSteps[index - 1] && index !== 0" @click="goToStep(index)"></v-btn>
    </div>

    <!-- Hiển thị form theo từng bước -->
    <v-card class="pa-5" style="box-shadow: none;">
      <v-card-title class="text-h5">{{ steps[currentStep].title }}</v-card-title>
      <v-card-text>
        <!-- Form cho từng bước -->
        <v-form v-model="valid" ref="form0" v-if="currentStep === 0" @keydown.enter.prevent="handleNext">
          <v-text-field v-model="username" label="Tên người dùng" :error-messages="usernameError" variant="outlined" :rules="usernameRules" outlined
            required @input="resetError('usernameError')"></v-text-field>
        </v-form>

        <v-form v-model="valid" ref="form1" v-if="currentStep === 1" @keydown.enter.prevent="handleNext">
          <v-text-field v-model="password" label="Mật khẩu" variant="outlined" :rules="passwordRules" type="password"
            outlined required @input="resetError('passwordError')"></v-text-field>
          <v-text-field v-model="confirmPassword" label="Xác nhận mật khẩu" variant="outlined"
            :rules="confirmPasswordRules" type="password" outlined required
            @input="resetError('confirmPasswordError')"></v-text-field>
        </v-form>

        <v-form v-model="valid" ref="form2" v-if="currentStep === 2" @keydown.enter.prevent="handleNext">
          <v-text-field v-model="fullName" label="Họ và Tên" :rules="[v => !!v || 'Họ và tên không được để trống']"
            variant="outlined" outlined required @input="resetError('fullNameError')"></v-text-field>
        </v-form>

        <v-form v-model="valid" ref="form3" v-if="currentStep === 3" @keydown.enter.prevent="handleNext">
          <v-date-input v-model="dateOfBirth" label="Ngày sinh" :rules="dateOfBirthRules" variant="outlined" required
            @input="resetError('dateOfBirthError')"></v-date-input>
        </v-form>

        <v-form v-model="valid" ref="form4" v-if="currentStep === 4" @keydown.enter.prevent="handleNext">
          <v-file-input v-model="avatar" label="File ảnh" accept="image/*" :rules="avatarRules" variant="outlined"
            outlined required @input="resetError('avatarError')"></v-file-input>
        </v-form>

        <v-form v-model="valid" ref="form5" v-if="currentStep === 5" @keydown.enter.prevent="handleNext">
          <v-text-field v-model="email" label="Email" :rules="emailRules" :error-messages="emailError" variant="outlined" outlined required
            @input="resetError('emailError')"></v-text-field>
        </v-form>

        <v-form v-model="valid" ref="form6" v-if="currentStep === 6" @keydown.enter.prevent="handleNext">
          <v-text-field v-model="phoneNumber" label="Số điện thoại" :rules="phoneNumberRules" :error-messages="phoneNumberError" variant="outlined"
            outlined required @input="resetError('phoneNumberError')"></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <!-- Nút mũi tên -->
        <v-btn style="background-color: #ff7828; color: white;" @click="handleNext" class="mx-auto" icon large
          :disabled="!valid">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Dialog mã xác nhận -->
    <v-dialog v-model="dialog" max-width="400px" style="text-align: center;">
      <v-card>
        <v-card-title class="text-h5">
          Mã Xác Nhận
        </v-card-title>

        <v-card-text>
          <!-- OTP Input -->
          <v-otp-input length="5" v-model="otpCode" :clear-input="true"></v-otp-input>

          <v-text v-if="otpErrorMessage" style="color: red;">{{ otpErrorMessage }}</v-text>

          <!-- Thông báo thành công -->

        </v-card-text>

        <v-card-actions>
          <!-- Nút xác nhận -->
          <v-btn style="background-color: #ff7828;" @click="confirmCode">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { RegisterRequest } from '@/models/requests/request_register';
import apiService from '@/services/apiService';

export default {
  name: 'RegisterForm',
  data() {
    return {
      currentStep: 0,
      valid: false,
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      dateOfBirth: null,
      avatar: null,
      email: '',
      phoneNumber: '',
      dialog: false,
      otpCode: '',

      // Biến để chứa thông báo lỗi và thành công cho OTP
      otpErrorMessage: '',       // Biến chứa thông báo lỗi
      // Các biến để chứa lỗi từ API
      usernameError: '',
      emailError: '',
      phoneNumberError: '',

      steps: [
        { title: 'Chọn tên người dùng' },
        { title: 'Tạo mật khẩu' },
        { title: 'Nhập Họ và Tên' },
        { title: 'Nhập Ngày sinh' },
        { title: 'Chọn File ảnh' },
        { title: 'Nhập Email của bạn' },
        { title: 'Nhập số điện thoại' }
      ],
      completedSteps: [false, false, false, false, false, false, false],
    };
  },

  computed: {
    usernameRules() {
      return [
        v => !!v || 'Tên người dùng không được để trống',
        v => v.length >= 6 || 'Tên người dùng phải có ít nhất 6 ký tự',
        v => /^[a-zA-Z0-9_]+$/.test(v) || 'Tên người dùng không chứa ký tự đặc biệt',
        () => this.usernameError || true,  // Hiển thị lỗi từ API
      ];
    },
    passwordRules() {
      return [
        v => !!v || 'Mật khẩu không được để trống',
        v => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
        v => /[A-Za-z]/.test(v) || 'Mật khẩu phải bao gồm ít nhất một chữ cái',
        v => /[0-9]/.test(v) || 'Mật khẩu phải bao gồm ít nhất một chữ số'
      ];
    },
    confirmPasswordRules() {
      return [
        v => !!v || 'Xác nhận mật khẩu không được để trống',
        v => v === this.password || 'Mật khẩu không khớp'
      ];
    },
    emailRules() {
      return [
        v => !!v || 'Email không được để trống',
        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
        () => this.emailError || true,  // Hiển thị lỗi từ API
      ];
    },
    phoneNumberRules() {
      return [
        v => !!v || 'Số điện thoại không được để trống',
        v => this.isValidPhoneNumber(v) || 'Số điện thoại không hợp lệ',
        () => this.phoneNumberError || true,  // Hiển thị lỗi từ API
      ];
    }
  },

  methods: {
    handleNext() {
  const currentForm = this.$refs['form' + this.currentStep];

  if (currentForm) {
    currentForm.validate();
  }

  if (this.valid) {
    this.completedSteps[this.currentStep] = true;
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.register();
    }
  } else {
    // Nếu form không hợp lệ, giữ lại step hiện tại và focus vào input có lỗi
    this.focusInvalidStep();
  }
},

    goToStep(index) {
      if (this.completedSteps[index - 1] || index === 0) {
        this.currentStep = index;
      }
    },

    focusInvalidStep() {
      for (let i = 0; i < this.steps.length; i++) {
        const formRef = this.$refs['form' + i];
        if (formRef && !formRef.validate()) {
          this.currentStep = i;  // Chuyển đến bước có form không hợp lệ
          break;
        }
      }
    },

    isValidPhoneNumber(phoneNumber) {
      const pattern = /^(\+?[0-9]{1,3})?([ .-]?[0-9]{3}){2}[ .-]?[0-9]{4}$/;
      return pattern.test(phoneNumber);
    },

    resetError(field) {
      this[field] = '';  // Reset lỗi của trường
      this.$refs['form' + this.currentStep].validate();  // Validate lại form hiện tại
    },

    async register() {
  try {
    const formattedDate = this.dateOfBirth ? new Date(this.dateOfBirth).toISOString().slice(0, 10) : null;

    const registerRequest = new RegisterRequest(
      this.username,
      this.password,
      this.fullName,
      formattedDate,
      this.avatar,
      this.email,
      this.phoneNumber
    );

    const response = await apiService.register(registerRequest);
    if (response.status === 200) {
      alert('Đăng ký thành công!');
      this.dialog = true;
    }
  } catch (error) {
    
    const errorMessage = error || 'Có lỗi xảy ra trong quá trình đăng ký';

    // Xử lý lỗi từ API
    if (errorMessage.toLowerCase().includes('tài khoản đã')) {
      this.usernameError = errorMessage;
      this.currentStep = 0;  // Chuyển đến form chứa trường bị lỗi
    } else if (errorMessage.toLowerCase().includes('Email này đã được sử dụng cho một tài khoản khác')) {
      this.emailError = errorMessage;
      this.currentStep = 5;  // Chuyển đến form chứa trường bị lỗi
      
    } else if (errorMessage.toLowerCase().includes('số điện thoại này')) {
      this.phoneNumberError = errorMessage;
      this.currentStep = 6;  // Chuyển đến form chứa trường bị lỗi
    }
    // Thay vì validate ngay lập tức, hiển thị lỗi và yêu cầu người dùng sửa lỗi
    this.$refs.form0 && this.$refs.form0.validate();
    this.$refs.form5 && this.$refs.form5.validate();
    this.$refs.form6 && this.$refs.form6.validate();
  }
},
    async confirmCode() {
      try {
        // Xóa thông báo lỗi và thành công trước đó
        this.otpErrorMessage = '';
        this.otpSuccessMessage = '';

        // Gọi API để xác nhận mã
        const response = await apiService.confirmRegisterAccount(this.otpCode);
        console.log('ase',response.data); // Kiểm tra dữ liệu trả về từ API
        const messagee = response.data;
        // Kiểm tra phản hồi và cập nhật thông báo tương ứng
        if (messagee.includes('Mã xác nhận không hợp lệ')) {
          this.otpErrorMessage = 'Mã xác nhận không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (messagee.includes('Mã đã được sử dụng')) {
          this.otpErrorMessage = 'Mã đã được sử dụng. Vui lòng sử dụng mã mới.';
        } else if (messagee.includes('Mã xác nhận đã hết hạn')) {
          this.otpErrorMessage = 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.';
        } else {
          // Nếu phản hồi thành công, hiển thị thông báo thành công và điều hướng đến trang đăng nhập
          this.otpSuccessMessage = 'Mã xác nhận hợp lệ! Đang chuyển đến trang đăng nhập...';

          // Sử dụng phương thức điều hướng đồng bộ
          this.$router.push({ name: 'LoginComponent' });
        }
      } catch (error) {
        this.otpErrorMessage = error.message || 'Có lỗi xảy ra khi xác nhận mã.';
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
