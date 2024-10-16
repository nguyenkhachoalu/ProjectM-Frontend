<template>
  <v-app class="ContainerSetting">
    <!-- Sidebar -->
    <v-navigation-drawer
      app
      permanent
      width="260"
      class="sidebar-background"
    >
      <AppSidebar />
    </v-navigation-drawer>
    
    <!-- Main Content -->
    <v-main>
      <div class="content-wrapper">
        <!-- Các nội dung khác của dashboard sẽ nằm trong đây -->
        <router-view></router-view>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import AppSidebar from '@/components/shared/Sidebar.vue'; 
export default {
  name: 'SettingForm',
  components: {
    AppSidebar, 
  },
  data: () => ({}),
}
</script>

<style scoped>
/* Sidebar styling */
.sidebar-background {
  background-image: url('@/assets/backgroundSiderbar1.png');
  background-size: cover; 
  background-position: center;
}

/* Background for main container */
.ContainerSetting {
  background-image: url('@/assets/BackGT1.png');
  background-size: cover;
  background-position: center;
}

/* Wrapper for the main content, center it */
.content-wrapper {
  display: flex;
  justify-content: center; /* Căn giữa theo chiều ngang */
  align-items: center; /* Căn giữa theo chiều dọc */
  min-height: 100vh; /* Đảm bảo chiều cao tối thiểu bằng chiều cao màn hình */
}
</style>
