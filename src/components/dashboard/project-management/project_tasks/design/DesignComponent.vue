<template>
  <v-container fluid class="pa-5">
    <!-- Nút Upload File Design -->
    <v-col cols="12" class="text-right">
      <v-btn color="secondary" @click="openUploadDialog">Gửi thiết kế</v-btn>
    </v-col>

    <!-- Khu vực Design -->
    <v-row>
      <v-col cols="12" md="4" v-for="design in designs" :key="design.id">
        <v-card outlined>
          <v-card-title class="font-weight-bold text-center">
            <v-btn text @click="goToDesign(design.filePath)" class="mx-auto">
              Xem Thiết Kế
            </v-btn>
          </v-card-title>
          <v-card-subtitle>
            <v-row>
              <v-col cols="12" md="6">
                Trạng thái: <span class="font-weight-bold">{{ getDesignStatus(design.designStatus) }}</span>
              </v-col>
              <v-col cols="12" md="6">
                Thời gian tải lên: 
                <span class="font-weight-bold">{{ formatDate(design.designTime) }}</span>
              </v-col>
            </v-row>
          </v-card-subtitle>

          <v-card-actions>
            <v-btn text color="primary" @click="openStatusDialog(design)">Phê duyệt</v-btn>
            <v-btn v-if="design.designStatus === 2" text color="primary" @click="goToPrint(design.id)">In</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog cho chọn phê duyệt hoặc từ chối thiết kế -->
    <v-dialog v-model="statusDialog" max-width="400">
      <v-card>
        <v-card-title>Cập nhật trạng thái</v-card-title>
        <v-card-text>
          <v-row>
            <v-radio-group v-model="selectedStatus">
              <v-radio label="Phê duyệt" :value="2"></v-radio>
              <v-radio label="Từ chối" :value="1"></v-radio>
            </v-radio-group>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="submitUpdateStatus">Xác nhận</v-btn>
          <v-btn text @click="statusDialog = false">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog cho Upload File Design -->
    <v-dialog v-model="uploadDialog" max-width="600">
      <v-card>
        <v-card-title>Upload Design</v-card-title>
        <v-card-text>
          <v-file-input label="Chọn file" v-model="file"></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="uploadFile">Gửi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog thông báo lỗi -->
    <v-dialog v-model="errorDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h5 text-center">Lỗi khi tải tệp</v-card-title>
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

    <v-snackbar v-model="showSuccessToast" :timeout="3000" color="green" top right>
      {{ successMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import apiService from "@/services/apiService"; // Import apiService để gọi API

export default {
  props: {
    projectId: {
      type: String,
      required: true, // projectId được truyền từ ProjectProcessingComponent
    },
  },
  data() {
    return {
      dialog: false,
      uploadDialog: false,
      errorDialog: false, // Dialog để hiển thị lỗi
      errorMessage: "",   // Thông báo lỗi
      successMessage: "",
      showSuccessToast: false,
      file: null,
      designs: [], // Danh sách thiết kế lấy từ API
      statusDialog: false, // Dialog cập nhật trạng thái
      selectedStatus: null, // Lưu trạng thái được chọn (phê duyệt hoặc từ chối)
      selectedDesign: null, // Lưu thông tin thiết kế đang chọn để cập nhật
    };
  },
  methods: {
    goToDesign(filePath) {
      // Điều hướng đến file thiết kế
      window.open(filePath, '_blank');
    },
    goToPrint(designId) {
      this.$router.push({ name: 'Print', params: { designId: designId } });
    },
    openStatusDialog(design) {
      this.selectedDesign = design;
      this.statusDialog = true;
    },
    submitUpdateStatus() {
      if (!this.selectedStatus) {
        this.errorMessage = "Vui lòng chọn trạng thái!";
        this.openErrorDialog();
        return;
      }

      const payload = {
        designId: this.selectedDesign.id,
        designStatus: this.selectedStatus,
        link: this.selectedDesign.filePath,
      };

      apiService
        .approveDesign(payload)
        .then((response) => {
          this.successMessage = response.message;
          this.showSuccessToast = true;
          this.statusDialog = false;
          this.fetchDesigns(); // Refresh lại danh sách thiết kế
        })
        .catch((error) => {
          this.errorMessage = error;
          this.openErrorDialog();
        });
    },
    uploadFile() {
      if (!this.file) {
        this.errorMessage = "Vui lòng chọn file trước khi gửi!";
        this.openErrorDialog();
        return;
      }

      // Gọi hàm uploadDesignFile từ apiService
      apiService
        .uploadDesignFile(this.projectId, this.file)
        .then((response) => {
          if (response.status == 201) {
            this.successMessage = "Tệp đã được tải lên thành công!";
            this.showSuccessToast = true;
            this.uploadDialog = false;
          } else {
            // Hiển thị dialog lỗi
            this.errorMessage = response.message;
            this.openErrorDialog();
          }
        })
        .catch((error) => {
          console.error("Lỗi khi tải tệp:", error);
          this.errorMessage = "Có lỗi xảy ra khi tải lên!";
          this.openErrorDialog();
        });
    },
    openUploadDialog()
    {
      this.uploadDialog = true;

    },
    openErrorDialog() {
      this.errorDialog = true; // Mở dialog lỗi
    },
    closeErrorDialog() {
      this.errorDialog = false; // Đóng dialog lỗi
    },
    getDesignStatus(status) {
      // Trả về trạng thái dựa trên giá trị designStatus
      switch (status) {
        case 0:
          return 'Chờ kiểm duyệt';
        case 1:
          return 'Từ chối';
        case 2:
          return 'Đã phê duyệt';
        default:
          return 'Không xác định';
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN'); // Định dạng thành Giờ:Phút:Giây - Ngày/Tháng/Năm
    },
    fetchDesigns(deStatus = null) {
      // Gọi API lấy danh sách thiết kế theo projectId và deStatus
      apiService.getDesignsByProject(this.projectId, deStatus)
        .then(response => {
          this.designs = response;
        })
        .catch(error => {
          console.error("Lỗi khi lấy danh sách thiết kế:", error);
          this.errorMessage = "Có lỗi xảy ra khi lấy danh sách thiết kế!";
          this.openErrorDialog();
        });
    }
  },
  mounted() {
    // Khi component được mount, gọi API lấy danh sách thiết kế
    this.fetchDesigns();
  }
};
</script>

<style scoped>
  .v-card {
    background-color: #f5f5f5;
  }
  .v-btn {
    margin-right: 10px;
  }
  .red--text {
    font-size: 16px;
    font-weight: bold;
  }
</style>
