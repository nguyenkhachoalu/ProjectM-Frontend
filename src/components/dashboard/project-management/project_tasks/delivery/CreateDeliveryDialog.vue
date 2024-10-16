<template>
  <!-- Dialog tạo đơn hàng -->
  <v-dialog v-model="localShow" max-width="600px">
    <v-card>
      <v-card-title>
        <h3>Tạo Đơn Hàng</h3>
      </v-card-title>
      <v-card-text>
        <!-- Select chọn dự án -->
        <v-select
          v-model="selectedProjectId"
          :items="projects || []"
          label="Dự án"
          item-title="projectName"
          item-value="id"
          @update:modelValue="handleProjectChange"
          outlined
          dense
        ></v-select>

        <!-- Select chọn phương thức vận chuyển -->
        <v-select
          v-model="selectedShippingMethodId"
          :items="shippingMethods || []"
          label="Phương thức vận chuyển"
          item-title="shippingMethodName"
          item-value="id"
          outlined
          dense
        ></v-select>

        <!-- Select chọn người giao hàng -->
        <v-select
          v-model="selectedDeliverId"
          :items="deliverers || []"
          label="Người giao hàng"
          item-title="fullName"
          item-value="id"
          outlined
          dense
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="createDelivery">Tạo Đơn Hàng</v-btn>
        <v-btn color="secondary" @click="closeDialog">Hủy</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog thông báo lỗi -->
  <v-dialog v-model="errorDialog" persistent max-width="400">
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

  <!-- Snackbar thông báo thành công -->
  <v-snackbar v-model="snackbarSuccess" :timeout="3000" color="green" top right>
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script>
import apiService from '@/services/apiService';

export default {
  name: 'CreateDeliveryDialog',
  props: {
    show: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      localShow: this.show,
      projects: [], // Danh sách các dự án chưa có trong đơn hàng
      shippingMethods: [], // Danh sách phương thức giao hàng
      deliverers: [], // Danh sách người giao hàng
      selectedProjectId: null,
      selectedShippingMethodId: null,
      selectedDeliverId: null,
      customerAddress: null, // Địa chỉ của khách hàng
      errorDialog: false, // Trạng thái của Dialog thông báo lỗi
      errorMessage: '', // Thông báo lỗi
      snackbarSuccess: false, // Trạng thái của Snackbar
      snackbarMessage: '', // Thông báo thành công
    };
  },
  watch: {
    show(val) {
      this.localShow = val;
    },
    localShow(val) {
      this.$emit('update:show', val);
    }
  },
  methods: {
    fetchCompletedProjects() {
      apiService.getCompletedProjectsNotInDelivery()
        .then(response => {
          this.projects = Array.isArray(response.data.data) ? response.data.data : []; // Đảm bảo luôn là mảng
        })
        .catch(error => {
          console.error("Lỗi khi lấy danh sách dự án:", error);
        });
    },
    handleProjectChange(projectId) {
      console.log("All projects:", this.projects);
      if (!projectId) {
        console.error("Không có projectId để xử lý.");
        return;
      }

      // Khi chọn dự án, lấy địa chỉ khách hàng và shipper gần nhất
      this.fetchCustomerAddressByProjectId(projectId)  // Đảm bảo truyền projectId đúng
        .then((address) => {
          this.customerAddress = address;
          return this.fetchShipperIdByAddress(this.customerAddress);
        })
        .then((shipperId) => {
          if (shipperId) {
            this.selectedDeliverId = shipperId; // Chọn shipper mặc định nếu có
          }
        })
        .catch(error => {
          console.error("Lỗi khi xử lý thay đổi dự án:", error);
        });
    },
    fetchCustomerAddressByProjectId(projectId) {
      return apiService.getCustomerAddressByProjectId(projectId)
        .then(response => {
          return response.data.data || ''; // Trả về địa chỉ, đảm bảo giá trị là chuỗi
        })
        .catch(error => {
          console.error("Lỗi khi lấy địa chỉ khách hàng:", error);
          throw error;
        });
    },
    fetchShipperIdByAddress(address) {
      return apiService.getShipperIdByDeliveryAddress(address)
        .then(response => {
          return response || null; // Trả về shipperId hoặc null nếu không có
        })
        .catch(error => {
          console.error("Lỗi khi lấy shipper theo địa chỉ:", error);
          throw error;
        });
    },
    fetchEmployeesInDeliveryTeam() {
      apiService.getEmployeesInDeliveryTeam()
        .then(response => {
          this.deliverers = Array.isArray(response.data) ? response.data : []; // Đảm bảo luôn là mảng
        })
        .catch(error => {
          console.error("Lỗi khi lấy danh sách nhân viên phòng giao hàng:", error);
        });
    },
    fetchShippingMethods() {
      apiService.getAllShippingMethods()
        .then(response => {
          this.shippingMethods = Array.isArray(response.data) ? response.data : []; // Đảm bảo luôn là mảng
        })
        .catch(error => {
          console.error("Lỗi khi lấy danh sách phương thức giao hàng:", error);
        });
    },
    createDelivery() {
      if (!this.selectedProjectId || !this.selectedShippingMethodId || !this.selectedDeliverId) {
        this.showErrorDialog('Vui lòng chọn đầy đủ thông tin');
        return;
      }

      const requestData = {
        shippingMethodId: this.selectedShippingMethodId,
        deliverId: this.selectedDeliverId,
        projectId: this.selectedProjectId,
      };

      apiService.createDelivery(requestData)
        .then(response => {
          if (response.data.status === 201) {
            this.closeDialog();
            this.showSnackbar('Tạo đơn hàng thành công');
            this.$emit('deliveryCreated');
          } else {
            this.showErrorDialog(response.data.message);
          }
        })
        .catch(error => {
          console.error("Lỗi khi tạo đơn hàng:", error);
          this.showErrorDialog('Lỗi khi tạo đơn hàng');
        });
    },
    closeDialog() {
      this.localShow = false;
    },
    closeErrorDialog() {
      this.errorDialog = false;
    },
    showErrorDialog(message) {
      this.errorMessage = message;
      this.errorDialog = true;
    },
    showSnackbar(message) {
      this.snackbarMessage = message;
      this.snackbarSuccess = true;
    }
  },
  mounted() {
    this.fetchCompletedProjects();
    this.fetchShippingMethods();
    this.fetchEmployeesInDeliveryTeam();
  },
};
</script>

<style scoped>
.v-select {
  margin-bottom: 20px;
}
</style>
