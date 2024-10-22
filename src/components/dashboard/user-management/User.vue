<template>
  <v-container>
    <v-card>
      <!-- Tiêu đề bảng -->
      <v-card-title>
        <v-row>
          <v-col cols="9">
            <h3>Danh sách người dùng</h3>
          </v-col>
          <v-col cols="3">
            <!-- Ô tìm kiếm -->
            <v-text-field
              label="Tìm kiếm"
              variant="outlined"
              append-inner-icon="mdi-magnify"
              v-model="searchUserName"
              @input="fetchUsers"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- Bảng hiển thị dữ liệu -->
      <v-data-table-virtual
        :headers="headers"
        :items="users"
        :items-per-page="pageSize"
      >
        <!-- Các slot hiển thị dữ liệu -->
        <template v-slot:[`item.teamId`]="{ item }">
          <v-chip>{{ getDepartmentName(item.teamId) }}</v-chip>
        </template>

        <template v-slot:[`item.avatar`]="{ item }">
          <v-avatar size="50">
            <img :src="item.avatar" class="avatar-image" alt="Avatar" />
          </v-avatar>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            v-if="hasAdminPermission"
            color="primary"
            @click="openChangeDepartmentDialog(item.id, item.fullName, item.teamId)"
            prepend-icon="mdi-account-convert"
            variant="outlined"
            >Đổi phòng ban</v-btn
          >
          <v-btn
            v-if="hasAdminPermission"
            color="secondary"
            @click="openRoleDialog(item.id, item.fullName)"
            prepend-icon="mdi-account-convert"
            variant="outlined"
            >Quyền hạn</v-btn
          >
        </template>
      </v-data-table-virtual>

      <v-pagination
        v-model="pageNumber"
        :length="totalPages"
        @click="fetchUsers"
      ></v-pagination>
    </v-card>

    <change-department-dialog
      v-model="showChangeDepartmentDialog"
      :user-id="selectedUserId"
      :user-name="selectedUserName"
      :current-department-id="selectedUserDepartmentId"
      :departments="departments"
      @update-user-department="handleUserDepartmentUpdated"
    />
    
    <!-- Dialog hiển thị quyền hạn -->
    <role-of-user-dialog
      :show-dialog="showRoleDialog"
      :user-id="selectedUserId"
      :user-name="selectedUserName"
      @close="closeRoleDialog"
      @update-roles="handleRoleUpdateSuccess"
    />

    <!-- Snackbar thông báo thành công -->
    <v-snackbar style="text-align: center;" v-model="snackbarVisible" :timeout="3000" color="green" top right>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import apiService from "@/services/apiService";
import ChangeDepartmentDialog from "./ChangeDepartmentDialog.vue";
import RoleOfUserDialog from "./RolesOfUserDialog.vue";

export default {
  name: "UserManagement",
  components: {
    ChangeDepartmentDialog,
    RoleOfUserDialog,
  },
  data() {
    return {
      users: [],
      departments: [],
      totalPages: 0,
      totalItems: 0,
      pageNumber: 1,
      pageSize: 10,
      searchUserName: "",
      headers: [
        { title: "Tên người dùng", value: "userName" },
        { title: "Họ và tên", value: "fullName" },
        { title: "Email", value: "email" },
        { title: "Số điện thoại", value: "phoneNumber" },
        { title: "Phòng ban", value: "teamId" },
        { title: "Avatar", value: "avatar" },
        { title: "Hành động", value: "actions", sortable: false },
      ],
      showChangeDepartmentDialog: false,
      selectedUserId: null,
      selectedUserName: "",
      selectedUserDepartmentId: null,
      showRoleDialog: false,
      snackbarVisible: false,
      snackbarMessage: "",
    };
  },
  computed: {
    hasAdminPermission() {
      return apiService.checkAdminPermission();
    },
  },
  methods: {
    fetchUsers() {
      apiService
        .getUsers(this.pageNumber, this.pageSize, this.searchUserName)
        .then((userResponse) => {
          this.users = userResponse.items;
          this.totalPages = userResponse.totalPages;
          this.totalItems = userResponse.totalItems;
        })
        .catch((error) => {
          console.error("Có lỗi xảy ra:", error);
        });
    },
    openRoleDialog(userId, userName) {
      this.selectedUserId = userId;
      this.selectedUserName = userName;
      this.showRoleDialog = true;
    },
    closeRoleDialog() {
      this.showRoleDialog = false;
    },
    handleRoleUpdateSuccess() {
      this.snackbarMessage = "Thay đổi quyền hạn thành công!";
      this.snackbarVisible = true;
      this.fetchUsers(); // Tải lại danh sách người dùng
    },
    fetchDepartments() {
      apiService.getDepartments().then((response) => {
        this.departments = response.data;
      });
    },
    openChangeDepartmentDialog(userId, userName, teamId) {
      this.selectedUserId = userId;
      this.selectedUserName = userName;
      this.selectedUserDepartmentId = teamId;
      this.showChangeDepartmentDialog = true;
    },
    handleUserDepartmentUpdated(userId, newDepartmentId) {
      apiService
        .updateUserDepartment(userId, newDepartmentId)
        .then(() => {
          this.snackbarMessage = "Cập nhật phòng ban thành công!";
          this.snackbarVisible = true;
          this.fetchUsers();
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật phòng ban:", error);
        });
    },
    getDepartmentName(teamId) {
      const department = this.departments.find((dep) => dep.id === teamId);
      return department ? department.name : "N/A";
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchDepartments();
  },
};
</script>

<style scoped>
.elevation-1 {
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}
.avatar-image {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
