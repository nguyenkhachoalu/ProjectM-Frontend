<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer
      app
      permanent
      width="260"
      class="sidebar-background"
    >
      <AppSidebar />
    </v-navigation-drawer>

    <!-- Main content với TopNavbar -->
    <v-main>
      <TopNavbar />
      <!-- Các nội dung khác của dashboard sẽ nằm trong đây -->
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import TopNavbar from '@/components/shared/TopNavbar.vue';
import AppSidebar from '@/components/shared/Sidebar.vue';  // Import Sidebar

export default {
  name: 'DasboardForm',
  components: {
    TopNavbar,
    AppSidebar, 
  },
};
</script>
<style scoped>
.sidebar-background {
  background-image: url('@/assets/backgroundSiderbar1.png');
  background-size: cover; /* Đảm bảo ảnh nền phủ hết */
  background-position: center;
}
</style>