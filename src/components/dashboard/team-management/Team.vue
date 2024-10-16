<template>
    <v-container>
        <v-card>
            <!-- Tiêu đề bảng -->
            <v-card-title class="d-flex justify-space-between">
                <h3>Danh sách phòng ban</h3>
                <v-btn color="#66BB6A" @click="showDialog = true" class="ml-2" variant="outlined"
                    prepend-icon="mdi-plus">
                    Tạo Phòng ban
                </v-btn>
            </v-card-title>

            <create-team-dialog v-model="showDialog" :leaders="leaders" @team-created="handleTeamCreated" />
            <update-manager-dialog v-model="showUpdateDialog" :team-id="selectedTeamId" :team-name="selectedTeamName"
                :current-leader-id="selectedTeamLeaderId" :leaders="leaders"
                @update-team-leader="handleTeamLeaderUpdated" />
            <update-team-dialog v-model="showUpdateTeamDialog" :team-id="selectedTeamId" :team-name="selectedTeamName"
                :current-description="selectedTeamDescription" :current-leader-id="selectedTeamLeaderId"
                :leaders="leaders" @refresh-teams="fetchTeams" />
            <!-- Confirm Delete Dialog -->
            <v-dialog v-model="showDeleteDialog" persistent max-width="400px">
                <v-card>
                    <v-card-title class="text-h5">Xác nhận</v-card-title>
                    <v-card-text>Bạn chắc chắn muốn xóa team này?</v-card-text>
                    <v-card-actions class="d-flex justify-space-between">
                        <v-btn text @click="closeDeleteDialog">Không</v-btn>
                        <v-btn color="primary" @click="deleteTeam">Có</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Alert khi xóa thành công -->
            <v-snackbar v-model="showSnackbar" timeout="1000" color="success">
                Xóa team thành công!
            </v-snackbar>
            <!-- Bảng hiển thị dữ liệu -->
            <v-data-table-virtual :headers="headers" :items="teams" :items-per-page="pageSize">
                <!-- Định dạng các cột trong bảng -->
                <template v-slot:[`item.managerId`]="{ item }">
                    <v-chip>{{ getManagerName(item.managerId) }}</v-chip>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn v-if="hasAdminPermission" color="#F44336" class="" prepend-icon="mdi-account-convert" variant="outlined"
                        @click="openUpdateLeaderDialog(item.id, item.name, item.managerId)">
                        Thay trưởng phòng
                    </v-btn>
                    <v-btn color="primary"
                        @click="openUpdateTeamDialog(item.id, item.name, item.description, item.managerId)"
                        class="mr-2 ml-2" variant="outlined" prepend-icon="mdi-pencil">
                        Sửa
                    </v-btn>

                    <v-btn color="#F44336" class="" prepend-icon="mdi-delete-outline" variant="outlined"
                        @click="openDeleteDialog(item.id)">
                        Xóa
                    </v-btn>
                </template>
            </v-data-table-virtual>

            <!-- Phân trang -->
            <v-pagination v-model="pageNumber" :length="totalPages" @click="fetchTeams"></v-pagination>
        </v-card>
    </v-container>
</template>

<script>
import apiService from '@/services/apiService'; // Import cấu hình axios và hàm getTeams
import CreateTeamDialog from '@/components/dashboard/team-management/CreateTeamDialog.vue';
import UpdateManagerDialog from './UpdateManagerDialog.vue';
import UpdateTeamDialog from './UpdateTeamDialog.vue';
export default {
    name: 'TeamManagement', // Tên của component này
    components: {
        CreateTeamDialog,  // Đăng ký component CreateTeamDialog ở đây
        UpdateManagerDialog,
        UpdateTeamDialog,
    },
    data() {
        return {
            teams: [], // Danh sách team sẽ được lưu ở đây
            leaders: [], // Lưu thông tin về leaders
            totalPages: 0, // Tổng số trang
            totalItems: 0, // Tổng số team
            pageNumber: 1, // Trang hiện tại
            pageSize: 10, // Số lượng team mỗi trang
            headers: [
                { title: 'Phòng ban', value: 'name' },
                { title: 'Mô tả', value: 'description' },
                { title: 'Số thành viên', value: 'numberOfMember' },
                { title: 'ID Quản lý', value: 'managerId' },
                { title: 'Hành động', value: 'actions', sortable: false },
            ],
            showDialog: false,
            showUpdateDialog: false,
            showUpdateTeamDialog: false,
            showDeleteDialog: false,
            selectedTeamId: null,
            selectedTeamName: '',
            selectedTeamDescription: '',
            selectedTeamLeaderId: null,
        };
    },
    computed: {
    hasAdminPermission() {
      return apiService.checkAdminPermission();
    },
  },
    methods: {
        // Lấy dữ liệu nhóm
        fetchTeams() {
            apiService
                .getTeams(this.pageNumber, this.pageSize)
                .then((teamResponse) => {
                    // Sử dụng TeamResponse để lưu dữ liệu
                    this.teams = teamResponse.items; // Lưu danh sách team
                    this.totalPages = teamResponse.totalPages; // Lưu số lượng trang
                    this.totalItems = teamResponse.totalItems; // Lưu tổng số team
                })
                .catch((error) => {
                    console.error('Có lỗi xảy ra:', error);
                });
        },
        // Lấy dữ liệu leaders
        fetchLeaders() {
            apiService.GetUsersWithRoleManagers().then((response) => {
                this.leaders = response.data; // Lưu thông tin leaders
            });
        },
        getManagerName(managerId) {
            const leader = this.leaders.find(leader => leader.id === managerId);
            return leader ? leader.fullName : 'N/A';
        },
        openUpdateLeaderDialog(teamId, teamName, currentLeaderId) {
            this.selectedTeamId = teamId;
            this.selectedTeamName = teamName;
            this.selectedTeamLeaderId = currentLeaderId;
            this.showUpdateDialog = true;
        },
        openUpdateTeamDialog(teamId, teamName, description, currentLeaderId) {
            this.selectedTeamId = teamId;
            this.selectedTeamName = teamName;
            this.selectedTeamDescription = description;
            this.selectedTeamLeaderId = currentLeaderId;
            this.showUpdateTeamDialog = true;
        },

        handleTeamLeaderUpdated(teamId, newLeaderId) {
            apiService.updateTeamManager(teamId, newLeaderId)
                .then((response) => {
                    this.fetchTeams(); // Refresh team list
                    console.log(response.message);
                })
                .catch(error => console.error(error));
        },
        // Hàm điều hướng đến trang chi tiết nhóm
        openDeleteDialog(teamId) {
            this.selectedTeamId = teamId;
            this.showDeleteDialog = true;
        },
        closeDeleteDialog() {
            this.showDeleteDialog = false;
        },
        deleteTeam() {
            apiService
                .deleteTeam(this.selectedTeamId)
                .then(() => {
                    this.showSnackbar = true; // Hiển thị alert thành công
                    this.fetchTeams(); // Refresh lại danh sách team
                })
                .catch((error) => {
                    console.error('Lỗi khi xóa:', error);
                })
                .finally(() => {
                    this.closeDeleteDialog();
                });
        },
        handleTeamCreated(newTeam) {
            this.showDialog = false;  // Đóng dialog
            this.fetchTeams();  // Cập nhật danh sách team
            console.log('Team mới:', newTeam);
        },
    },
    mounted() {
        this.fetchTeams(); // Lấy danh sách team khi component được mount
        this.fetchLeaders(); // Gọi API lấy leaders khi component mount
    },
};
</script>

<style scoped>
.elevation-1 {
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>