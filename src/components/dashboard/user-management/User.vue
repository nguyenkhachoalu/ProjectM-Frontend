<template>
    <v-container>
        <v-card>
            <!-- Tiêu đề bảng -->
            <v-card-title><h3>Danh sách người dùng</h3></v-card-title>
            <change-department-dialog 
                v-model="showChangeDepartmentDialog" 
                :user-id="selectedUserId" 
                :user-name="selectedUserName" 
                :current-department-id="selectedUserDepartmentId" 
                :departments="departments"
                @update-user-department="handleUserDepartmentUpdated"
            />
            <!-- Bảng hiển thị dữ liệu -->
            <v-data-table-virtual :headers="headers" :items="users" :items-per-page="pageSize">
                <!-- Định dạng các cột trong bảng -->
                <template v-slot:[`item.teamId`]="{ item }">
                    <v-chip>{{ getDepartmentName(item.teamId) }}</v-chip>
                </template>
                
                <template v-slot:[`item.avatar`]="{ item }">
                    <v-avatar size="50">
                        <img :src="item.avatar" class="avatar-image" alt="Avatar">
                    </v-avatar>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn v-if="hasAdminPermission" color="primary" @click="openChangeDepartmentDialog(item.id, item.fullName, item.teamId)" prepend-icon="mdi-account-convert" variant="outlined" >Đổi phòng ban</v-btn>
                </template>
            </v-data-table-virtual>

            <!-- Phân trang -->
            <v-pagination v-model="pageNumber" :length="totalPages" @click="fetchUsers"></v-pagination>
        </v-card>
    </v-container>
</template>

<script>
import apiService from '@/services/apiService'; // Cấu hình sẵn axios
import ChangeDepartmentDialog from './ChangeDepartmentDialog.vue';
export default {
    name: 'UserManagement',
    components: {
        ChangeDepartmentDialog, // Đăng ký dialog
    },
    data() {
        return {
            users: [],
            departments: [], 
            totalPages: 0,
            totalItems: 0,
            pageNumber: 1,
            pageSize: 10,
            headers: [
                { title: 'Tên người dùng', value: 'userName' },
                { title: 'Họ và tên', value: 'fullName' },
                { title: 'Email', value: 'email' },
                { title: 'Số điện thoại', value: 'phoneNumber' },
                { title: 'Phòng ban', value: 'teamId' },
                { title: 'Avatar', value: 'avatar' },
                { title: 'Hành động', value: 'actions', sortable: false },
            ],
            showChangeDepartmentDialog: false,
            selectedUserId: null,
            selectedUserName: '',
            selectedUserDepartmentId: null,
        };
    },
    computed: {
    hasAdminPermission() {
      return apiService.checkAdminPermission();
    },
  },
    methods: {
        // Lấy dữ liệu người dùng
        fetchUsers() {
            apiService.getUsers(this.pageNumber, this.pageSize)
                .then((userResponse) => {
                    // Sử dụng UserResponse để lưu trữ dữ liệu
                    this.users = userResponse.items; // Dữ liệu người dùng
                    this.totalPages = userResponse.totalPages; // Số lượng trang
                    this.totalItems = userResponse.totalItems; // Tổng số người dùng
                })
                .catch((error) => {
                    console.error('Có lỗi xảy ra:', error);
                });
        },

        // Xem chi tiết người dùng
        viewUser(id) {
            this.$router.push(`/user-profile/${id}`);
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
            apiService.updateUserDepartment(userId, newDepartmentId)
                .then(() => {
                    this.fetchUsers(); // Cập nhật lại danh sách người dùng sau khi thay đổi
                    console.log('Cập nhật phòng ban thành công');
                })
                .catch((error) => {
                    console.error('Lỗi khi cập nhật phòng ban:', error);
                });
        },
        getDepartmentName(teamId) {
            const department = this.departments.find(dep => dep.id === teamId);
            return department ? department.name : 'N/A';
        }
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
  object-fit: cover; /* Đảm bảo ảnh lấp đầy không gian mà không bị biến dạng */
  width: 100%;
  height: 100%;
}
</style>