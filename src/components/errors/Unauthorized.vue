<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="text-center d-flex flex-column align-center justify-center" style="box-shadow: none !important;" width="100%">
      <v-card-title class="text-h3" style="color: red;">Bạn không có quyền truy cập trang này</v-card-title>
      <v-card-text>Vui lòng liên hệ với quản trị viên nếu bạn nghĩ đây là lỗi.</v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="goBack">Quay lại</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'UnauthorizedComponent',
  methods: {
    goBack() {
      this.$router.push({ name: 'Dasboard' }); // Điều hướng người dùng quay lại trang dashboard
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh; /* Đảm bảo chiều cao toàn màn hình */
}

/* Đảm bảo căn giữa nội dung card */
.v-card {
  height: auto; /* Điều chỉnh chiều cao của thẻ card */
  padding: 20px; /* Thêm khoảng cách padding để thẻ không quá sát */
}
</style>
