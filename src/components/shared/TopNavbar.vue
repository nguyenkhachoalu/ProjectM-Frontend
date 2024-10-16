<template>
  <v-app-bar app color="transparent" elevation="0">
    <v-toolbar-title>{{ $route.name }}</v-toolbar-title>

    <!-- Nút thông báo -->
    <v-menu v-model="showNotificationMenu" :nudge-right="16" offset-y activator="#notification-activator"
      max-width="400" min-width="300">
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon  id="notification-activator" v-bind="attrs" v-on="on">
          <v-badge :content="unreadNotificationsCount" color="red" overlap>
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <!-- Danh sách thông báo -->
      <v-list>
        <v-list-item v-for="(notification, index) in notifications" :key="notification.id"
          @click="handleNotificationClick(notification, index)">
          <v-list-item-content>
            <v-list-item-title>{{ notification.context }}</v-list-item-title>
            <v-list-item-subtitle>{{ formatTime(notification.createTime) }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content>
            <v-icon small color="red">{{ !notification.isSeen ? 'mdi-alert' : '' }}</v-icon>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="notifications.length === 0">
          <v-list-item-title>Không có thông báo</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Avatar kèm menu -->
    <v-menu offset-y :nudge-width="5" :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon elevation="0">
          <v-avatar size="40">
            <img class="avatar-image" :src="userProfile.avatar" alt="User Avatar" />
          </v-avatar>
        </v-btn>
      </template>

      <v-card min-width="300">
        <!-- Phần hiển thị avatar và tên người dùng -->
        <v-list>
          <v-list-item :prepend-avatar="userProfile.avatar" :title="userProfile.fullName"
            subtitle="User of Application">
            <template v-slot:append>
              <v-btn icon="mdi-heart" variant="text"></v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <!-- Các nút Profile và Logout -->
        <v-list>
          <v-list-item @click="goToProfile">
            <v-list-item-title><v-icon>mdi-account</v-icon>Hồ sơ</v-list-item-title>
          </v-list-item>

          <v-list-item @click="logout">
            <v-list-item-title><v-icon>mdi-logout</v-icon>Đăng xuất</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script>
import apiService from '@/services/apiService'; // Import apiService

export default {
  name: 'TopNavbar',
  data() {
    return {
      userProfile: {
        fullName: '',
        avatar: ''
      }, // Dữ liệu người dùng
      notifications: [], // Danh sách thông báo
      showNotificationMenu: false, // Trạng thái của menu thông báo
    };
  },
  computed: {
    unreadNotificationsCount() {
      // Đếm số thông báo chưa đọc (isSeen === false)
      return this.notifications.filter(notification => !notification.isSeen).length;
    },
  },
  methods: {
    goToProfile() {
      this.$router.push({ name: 'Profile' });
    },
    logout() {
      apiService.logout()
        .then(() => {
          this.$router.push({ name: 'Login' });
        })
        .catch((error) => {
          console.error('Lỗi khi đăng xuất:', error);
        });
    },
    // Đánh dấu thông báo là đã đọc
    handleNotificationClick(notification, index) {
      if (!notification.isSeen) {
        apiService.updateIsSeenNotification(notification.id) // Gọi API để đánh dấu thông báo đã đọc
          .then(() => {
            this.notifications[index].isSeen = true; // Cập nhật trạng thái thông báo thành đã đọc
            if (notification.link) {
              window.location.href = notification.link; // Chuyển hướng tới link của thông báo
            }
          })
          .catch(error => {
            console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
          });
      } else {
        if (notification.link) {
          window.location.href = notification.link; // Chuyển hướng tới link của thông báo nếu đã đọc
        }
      }
    },
    // Hàm lấy thông báo từ API
    fetchNotifications() {
      apiService.getNotificationsByUserId()
        .then(response => {
          console.log("Response data: ", response.data);  // Kiểm tra dữ liệu thô từ API
          if (response.data.status === 200) {
            this.notifications = response.data.data || [];
            console.log("Notifications:", this.notifications); // Kiểm tra danh sách thông báo
          }
        })
        .catch(error => {
          console.error('Lỗi khi lấy thông báo:', error);
        });
    },
    // Hàm lấy thông tin hồ sơ từ API
    fetchUserProfile() {
      apiService.getUserProfile()
        .then(profile => {
          this.userProfile = profile; // Lưu thông tin người dùng vào biến userProfile
        })
        .catch(error => {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
        });
    },
    formatTime(time) {
      const date = new Date(time);
      return date.toLocaleString();
    },
  },
  mounted() {
    this.fetchUserProfile(); // Lấy thông tin hồ sơ khi component được mount
    this.fetchNotifications(); // Lấy danh sách thông báo khi component được mount
  },
};
</script>

<style scoped>
/* Đảm bảo ảnh avatar hiển thị đầy đủ */
.avatar-image {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.v-menu__content {
  right: 0 !important;
  /* Canh giữa nút chuông */
}
</style>
