<template>
    <div class="logo">
        <v-img :src="imgLogo" max-width="250"></v-img>
      </div>
    <v-list dense>
      <v-list-item-group>
        <router-link to="/dashboard-form/dashboard" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>
                
                <v-icon class="mr-5">mdi-view-dashboard</v-icon>
                Bảng điều khiển
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>

        <router-link to="/setting/profile" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>                
                <v-icon class="mr-5">mdi-account</v-icon>
                Hồ sơ cá nhân
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>

        <v-list-group value="Quản lý chung">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" class="nav-item">
              <v-list-item-content>
                <v-list-item-title>
                  <v-icon class="mr-5">mdi-view-list</v-icon>
                  Quản lý chung
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <router-link to="/dashboard-form/user" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>Nhân viên</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link to="/dashboard-form/team" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>Phòng ban</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link to="/dashboard-form/project" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>Dự án</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link v-if="hasAdminOrManagerPermission" to="/dashboard-form/delivery" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>Vận chuyển</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link to="/dashboard-form/delivery-task" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>Nhiệm vụ giao hàng</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link to="/dashboard-form/customer" class="nav-link">
          <v-list-item class="nav-item">
            <v-list-item-content>
              <v-list-item-title>Khách hàng</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        </v-list-group>
      </v-list-item-group>
    </v-list>
  </template>
  
  <script>
  import apiService from '@/services/apiService';
  export default {
    name: 'AppSidebar',
    data() {
      return {
        group: false,
      };
    },
    props: {
      imgLogo: {
        type: String,
        default: require('@/assets/logoprint.png'),
      },
    },
    computed: {
    hasAdminOrManagerPermission() {
      return apiService.checkAdminOrManagerPermission();
    },
  },
  };
  
  </script>
  
  <style scoped>
.nav-item {
  height: 56px !important;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
  transition: background-color 0.5s ease; /* Hiệu ứng mượt khi thay đổi màu */
}
.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Màu nền khi hover */
}
.v-list-item-title {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.mr-5 {
  margin-right: 16px;
}

.nav-link {
  text-decoration: none;
  color: inherit;
}
  .logo {
    display: flex;
    align-items: center;
    padding: 15px;
  }
  
  </style>
  