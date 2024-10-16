<template>
  <v-app>
    <v-container
      fluid
      class="d-flex flex-column justify-center auth-background"
      style="min-height: 100vh;"
    >
      <!-- Logo container -->
      <div class="logo-container mb-5" style="text-align: center;">
        <v-img src="@/assets/logoprint.png" alt="Logo" max-height="150px" contain />
      </div>

      <!-- Form đăng nhập container -->
      <div class="form-container mx-auto">
        <router-view></router-view>
      </div>

      <!-- Footer links -->
      <v-row class="mt-auto mb-5" style="text-align: center; color: white;">
        <v-col>
          <a href="#" class="footer-link">Hỗ trợ</a> |
          <a href="#" class="footer-link">Liên hệ</a> |
          <a href="#" class="footer-link">Điều khoản</a>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'AuthForm',
};
</script>

<style scoped>
.auth-background {
  height: 100vh;
  background: linear-gradient(135deg, rgba(255, 236, 210, 0.8) 0%, rgba(252, 182, 159, 0.9) 50%, rgba(245, 212, 226, 0.8) 100%);
}

.form-container {
  background-color: white;
  width: 40%;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.footer-link {
  color: white;
  text-decoration: none;
  margin: 0 10px;
}

.footer-link:hover {
  text-decoration: underline;
}

.logo-container {
  text-align: center;
  width: 100%;
}
</style>
