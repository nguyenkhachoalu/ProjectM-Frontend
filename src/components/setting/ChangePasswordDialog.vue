<template>
    <v-dialog v-model="dialog" max-width="500">
        <v-card>
            <v-card-title>
                <span class="headline">Đổi Mật Khẩu</span>
            </v-card-title>
            <v-card-text>
                <v-form ref="changePasswordForm" v-model="validForm">
                    <v-text-field v-model="oldPassword" label="Mật khẩu cũ" :rules="oldPasswordRules" type="password" @click="resetFieldError()"
                        variant="outlined" required></v-text-field>

                    <v-text-field v-model="newPassword" label="Mật khẩu mới" :rules="newPasswordRules" type="password"
                        variant="outlined" required></v-text-field>

                    <v-text-field v-model="confirmPassword" label="Xác nhận mật khẩu mới" :rules="confirmPasswordRules"
                        variant="outlined" type="password" required></v-text-field>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDialog">Hủy</v-btn>
                <v-btn color="blue darken-1" text :disabled="!validForm" @click="submitChangePassword">Đổi mật
                    khẩu</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import apiService from '@/services/apiService';

export default {
    data() {
        return {
            dialog: false,
            validForm: false,

            oldPassword: '',
            newPassword: '',
            confirmPassword: '',

            errorMessage: '', // Biến chứa thông báo lỗi từ server
        };
    },
    computed: {
        // Chỉ có một thông báo duy nhất cho oldPassword
        oldPasswordRules() {
            return [
                v => !!v || 'Mật khẩu cũ không được để trống',
                () => this.errorMessage === '' || 'Mật khẩu không chính xác', // Hiển thị thông báo khi có lỗi từ server
            ];
        },
        newPasswordRules() {
            return [
                v => !!v || 'Mật khẩu mới không được để trống',
                v => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
            ];
        },
        confirmPasswordRules() {
            return [
                v => !!v || 'Xác nhận mật khẩu không được để trống',
                v => v === this.newPassword || 'Mật khẩu xác nhận không khớp',
            ];
        },
    },
    methods: {
        resetFieldError() {
                this.errorMessage = ''; // Reset lỗi cho trường hiện tại khi người dùng nhập lại
                this.$refs.changePasswordForm.validate(); // Kiểm tra lại form sau khi sửa
        },
        closeDialog() {
            this.$refs.changePasswordForm.resetValidation();
            this.dialog = false;

            // Reset lại toàn bộ trường
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.errorMessage = ''; // Reset thông báo lỗi chung
        },
        // Gửi yêu cầu đổi mật khẩu
        submitChangePassword() {
            if (this.$refs.changePasswordForm.validate()) {
                const request = {
                    oldPassword: this.oldPassword,
                    newPassword: this.newPassword,
                    confirmPassword: this.confirmPassword,
                };

                apiService
                    .changePassword(request)
                    .then((response) => {
                        if (response.message === 'Mật khẩu thay đổi thành công') {
                            this.$toast.success('Đổi mật khẩu thành công');
                            this.closeDialog();
                        } else {
                            // Nếu lỗi, gán thông báo lỗi và cập nhật rule cho oldPassword
                            this.errorMessage = 'Mật khẩu không chính xác';
                            this.$refs.changePasswordForm.validate(); // Cập nhật lại form ngay sau khi nhận được lỗi
                        }
                    })
                    .catch((error) => {
                        // Xử lý lỗi từ server
                        this.errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
                        this.$refs.changePasswordForm.validate(); // Cập nhật lại form ngay sau khi nhận được lỗi
                    });
            }
        },
    },
};
</script>

<style scoped>
.headline {
    font-weight: bold;
}
</style>
