<template>
  <v-dialog v-model="localDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">Cập nhật quyền hạn cho {{ userName }}</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <!-- Hiển thị danh sách quyền với checkbox -->
          <div v-if="allRoles.length > 0">
            <v-checkbox
              v-for="role in allRoles"
              :key="role.id"
              v-model="selectedRoles"
              :label="role.roleName"
              :value="role.roleCode"
            />
          </div>
          <div v-else>
            <span>Không có quyền nào được tìm thấy.</span>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="blue darken-1" text @click="closeDialog">Hủy</v-btn>
        <v-btn color="blue darken-1" text @click="updateUserRoles">Cập nhật</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Dialog thông báo lỗi -->
    <v-dialog v-model="errorDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5 text-center">Lỗi khi thao tác</v-card-title>
        <v-card-text class="text-center">
          <v-row align="center" justify="center">
            <v-icon color="red" class="mr-2">mdi-alert-outline</v-icon>
            <span class="red--text">{{ errorMessage }}</span>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="red" @click="closeErrorDialog">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  props: {
    showDialog: Boolean,
    userId: Number,
    userName: String,
  },
  data() {
    return {
      localDialog: this.showDialog,
      allRoles: [],
      selectedRoles: [],
      errorDialog: false,
      errorMessage: '',
    };
  },
  watch: {
    showDialog(val) {
      this.localDialog = val;
      if (val) {
        this.fetchUserRoles(); // Khi mở dialog, gọi API lấy role của user
      }
    },
  },
  methods: {
    fetchAllRoles() {
      apiService.getAllRoles()
        .then((response) => {
          this.allRoles = response.data.data;
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh sách role:", error);
        });
    },
    fetchUserRoles() {
      apiService.getRolesOfUser(this.userId)
        .then((response) => {
          this.selectedRoles = response.data.data.map(role => role.roleCode);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy quyền của người dùng:", error);
        });
    },
    updateUserRoles() {
      apiService.updateRoleOfUser(this.userId, this.selectedRoles)
        .then((response) => {
          if (response.data.status === 200) {
            this.$emit("update-roles"); // Emit sự kiện cập nhật thành công
            this.closeDialog();
          } else {
            this.showErrorDialog(response.data.message); // Hiển thị dialog lỗi
          }
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật quyền:", error);
          this.showErrorDialog("Đã xảy ra lỗi khi cập nhật quyền.");
        });
    },
    showErrorDialog(message) {
      this.errorMessage = message;
      this.errorDialog = true;
    },
    closeErrorDialog() {
      this.errorDialog = false;
    },
    closeDialog() {
      this.$emit("close");
      this.localDialog = false;
    },
  },
  mounted() {
    this.fetchAllRoles(); // Lấy tất cả vai trò khi component được mount
  },
};
</script>
