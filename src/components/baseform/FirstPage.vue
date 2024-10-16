<template>
  <v-app>
    <v-container fluid class="d-flex flex-column align-center justify-center" :class="{ hidden: isHidden }"
      style="background-color: black; height: 100vh; color: white;">
      <transition name="fadeOutMoveDown">
      <div class="d-flex flex-column align-center content" v-if="!isHidden">
        <p style="font-size: 100px;" >Xin Chào!</p>
        <br>
        <p>Bạn đang truy cập vào trang quản lý in Print Management</p>
        <br>
        <v-btn append-icon="mdi-arrow-right" variant="outlined" @click="startTransition"> Truy cập ngay!</v-btn>
      </div>
    </transition>
      <!-- Dialog đăng nhập và đăng ký -->
      <v-dialog v-model="dialog" persistent max-width="500" >
        <v-card style="border:1px solid white; background-color: black; color: white; text-align: center;" >
          <v-card-title class="text-h5">Lựa chọn</v-card-title>
          <v-card-text>Bạn muốn đăng nhập hay đăng ký?</v-card-text>
          <v-card-actions class="d-flex justify-space-between">
            <!-- Nút Đăng nhập -->
            <v-btn style="border:1px solid white; background-color: black;" @click="navigateToLogin">Đăng nhập</v-btn>

            <!-- Ảnh Logo giữa -->
            <v-img src="@/assets/logoprint.png" alt="Logo" contain max-width="150" />

            <!-- Nút Đăng ký -->
            <v-btn style="border:1px solid white; background-color: black;" @click="navigateToRegister">Đăng ký</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>

export default {
  name: 'FirstPage',

  data: () => ({
    isHidden: false, // Điều khiển việc ẩn/hiện nội dung
    dialog: false,   // Điều khiển hiển thị dialog
  }),
  methods: {
    startTransition() {
      // Bắt đầu animation cho các thẻ trôi xuống
      this.isHidden = true;

      // Sau khi animation kết thúc, hiện dialog
      setTimeout(() => {
        this.dialog = true;
      }, 1000); // Thời gian delay cho việc ẩn các thẻ (1000ms)
    },
    navigateToLogin() {
      // Điều hướng đến trang Login (là con của AuthForm)
      this.$router.push({ name: "Login" });
    },
    navigateToRegister() {
      // Điều hướng đến trang Register (là con của AuthForm)
      this.$router.push({ name: "Register" });
    }
  }
}
</script>
<style scoped>
@keyframes fadeOutMoveDown {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(200px);
  }
}
.hidden .content {
  animation: fadeOutMoveDown 1s forwards; /* Kích hoạt animation */
}

/* Animation xuất hiện của dialog */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active ở một số phiên bản cũ */ {
  opacity: 0;
}
</style>