<template>
  <v-container>
    <v-card>
      <!-- Tiêu đề bảng -->
      <v-card-title class="d-flex justify-space-between">
        <v-row>
          <v-col cols="6">
            <h3>Danh sách phòng ban</h3>
          </v-col>
          <v-col cols="6">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  label="Tìm kiếm tên phòng ban"
                  variant="outlined"
                  v-model="searchTeamName"
                  append-inner-icon="mdi-magnify"
                  @input="fetchTeams"
                ></v-text-field>
              </v-col>
              <v-col cols="6" class="d-flex justify-end">
                <v-btn
                  color="#66BB6A"
                  @click="showDialog = true"
                  class="ml-2"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                >
                  Tạo Phòng ban
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>

      <create-team-dialog
        v-model="showDialog"
        :leaders="leaders"
        @team-created="handleTeamCreated"
      />
      <update-manager-dialog
        v-model="showUpdateDialog"
        :team-id="selectedTeamId"
        :team-name="selectedTeamName"
        :current-leader-id="selectedTeamLeaderId"
        :leaders="leaders"
        @update-team-leader="handleTeamLeaderUpdated"
      />
      <update-team-dialog
        v-model="showUpdateTeamDialog"
        :team-id="selectedTeamId"
        :team-name="selectedTeamName"
        :current-description="selectedTeamDescription"
        :current-leader-id="selectedTeamLeaderId"
        :leaders="leaders"
        @refresh-teams="fetchTeams"
      />
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
      <v-data-table-virtual
        :headers="headers"
        :items="teams"
        :items-per-page="pageSize"
      >
        <!-- Định dạng các cột trong bảng -->
        <template v-slot:[`item.managerId`]="{ item }">
          <v-chip>{{ getManagerName(item.managerId) }}</v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            v-if="hasAdminPermission"
            color="#F44336"
            class=""
            prepend-icon="mdi-account-convert"
            variant="outlined"
            @click="openUpdateLeaderDialog(item.id, item.name, item.managerId)"
          >
            Thay trưởng phòng
          </v-btn>
          <v-btn
            color="primary"
            @click="
              openUpdateTeamDialog(
                item.id,
                item.name,
                item.description,
                item.managerId
              )
            "
            class="mr-2 ml-2"
            variant="outlined"
            prepend-icon="mdi-pencil"
          >
            Sửa
          </v-btn>

          <v-btn
            color="#F44336"
            class=""
            prepend-icon="mdi-delete-outline"
            variant="outlined"
            @click="openDeleteDialog(item.id)"
          >
            Xóa
          </v-btn>
        </template>
      </v-data-table-virtual>

      <!-- Phân trang -->
      <v-pagination
        v-model="pageNumber"
        :length="totalPages"
        @click="fetchTeams"
      ></v-pagination>
    </v-card>
  </v-container>
</template>

<script>
import apiService from '@/services/apiService'; // Import cấu hình axios và hàm getTeams
import CreateTeamDialog from '@/components/dashboard/team-management/CreateTeamDialog.vue';
import UpdateManagerDialog from './UpdateManagerDialog.vue';
import UpdateTeamDialog from './UpdateTeamDialog.vue';

export default {
  name: 'TeamManagement',
  components: {
    CreateTeamDialog,
    UpdateManagerDialog,
    UpdateTeamDialog,
  },
  data() {
    return {
      teams: [],
      leaders: [],
      totalPages: 0,
      totalItems: 0,
      pageNumber: 1,
      pageSize: 10,
      searchTeamName: '', // Thêm biến để lưu tên team muốn tìm kiếm
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
      showSnackbar: false,
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
      // Gọi API và gửi kèm tên team tìm kiếm (nếu có)
      apiService
        .getTeams(this.pageNumber, this.pageSize, this.searchTeamName)
        .then((teamResponse) => {
          this.teams = teamResponse.items;
          this.totalPages = teamResponse.totalPages;
          this.totalItems = teamResponse.totalItems;
        })
        .catch((error) => {
          console.error('Có lỗi xảy ra:', error);
        });
    },
    // Lấy dữ liệu leaders
    fetchLeaders() {
      apiService.GetUsersWithRoleManagers().then((response) => {
        this.leaders = response.data;
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
          this.fetchTeams();
          console.log(response.message);
        })
        .catch(error => console.error(error));
    },
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
          this.showSnackbar = true;
          this.fetchTeams();
        })
        .catch((error) => {
          console.error('Lỗi khi xóa:', error);
        })
        .finally(() => {
          this.closeDeleteDialog();
        });
    },
    handleTeamCreated() {
      this.showDialog = false;
      this.fetchTeams();
    },
  },
  mounted() {
    this.fetchTeams(); // Lấy danh sách team khi component được mount
    this.fetchLeaders(); // Lấy danh sách leaders khi component mount
  },
};
</script>

<style scoped>
.elevation-1 {
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>