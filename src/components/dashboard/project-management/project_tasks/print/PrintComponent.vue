<template>
  <v-container fluid>
    <v-row>
      <!-- Phần bên trái hiển thị thông tin của Design -->
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="font-weight-bold text-center">
            Thiết kế
          </v-card-title>

          <v-card-subtitle>
            <v-row>
              <v-col cols="12">
                Người tạo : {{ designInfo.designerId }}
              </v-col>

              <v-col cols="12">
                Trạng thái: {{ getDesignStatus(designInfo.designStatus) }}
              </v-col>

              <v-col cols="12">
                Thời gian tải lên: {{ designInfo.designTime }}
              </v-col>
            </v-row>
          </v-card-subtitle>

          <v-card-actions>
            <v-btn text color="primary" @click="viewDesign">Xem Thiết Kế</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Phần bên phải hiển thị danh sách PrintJobs -->
      <v-col cols="12" md="8">
        <v-row>
          <v-col cols="12" v-for="printJob in printJobs" :key="printJob.id">
            <v-card outlined>
              <v-card-title>
                PrintJob {{ printJob.id }}
              </v-card-title>

              <v-card-subtitle>
                <v-row>
                  <v-col cols="12">
                    Trạng thái: {{ getPrintJobStatus(printJob.printJobStatus) }}
                  </v-col>
                </v-row>
              </v-card-subtitle>

              <v-card-actions>
                <v-btn text @click="viewPrintJobDetails(printJob.id, getPrintJobStatus(printJob.printJobStatus))">Chi
                  tiết bản in</v-btn>
                <v-btn color="primary" text @click="openStatusDialog(printJob.id)">Cập nhật trạng thái</v-btn>
                <!-- Nút mở dialog -->
                <v-btn v-if="printJob.printJobStatus !==2 && printJob.printJobStatus !==3" color="primary" text @click="openResourceDialog(printJob.id)">Thêm tài nguyên</v-btn>
                <!-- Nút thêm tài nguyên -->
              </v-card-actions>

              <!-- Hiển thị chi tiết Resource khi nút được nhấp -->
              <v-expand-transition>
                <div v-if="activePrintJobId === printJob.id">
                  <v-card-subtitle>
                    <v-row>
                      <v-col cols="6" v-for="resource in printJob.resourceDetails" :key="resource.propertyId">
                        <v-card outlined>
                          <v-card-title>{{ resource.propertyDetailName }}</v-card-title>
                          <v-card-subtitle>
                            <v-row>
                              <v-col cols="6">
                                Giá: {{ resource.price }}
                              </v-col>
                              <v-col cols="6">
                                Số lượng: {{ resource.quantity }}
                              </v-col>
                            </v-row>
                          </v-card-subtitle>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-subtitle>
                </div>
              </v-expand-transition>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <resource-dialog v-model="resourceDialog" :printJobId="selectedPrintJobId" @showSuccess="showSuccessToast"
      @update:dialog="resourceDialog = $event" />
    <v-dialog v-model="statusDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h5">Cập nhật trạng thái</v-card-title>

        <v-card-text>
          <v-radio-group v-model="newStatus" label="Chọn trạng thái"> <!-- Thêm label nếu cần -->
            <v-radio label="Chờ xử lý" :value="0"></v-radio>
            <v-radio label="Đang in" :value="1"></v-radio>
            <v-radio label="Hoàn thành" :value="2"></v-radio>
            <v-radio label="Bị hủy" :value="3"></v-radio>
            <v-radio label="Lỗi khi in" :value="4"></v-radio>
          </v-radio-group>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="confirmStatusUpdate">Xác nhận</v-btn>
          <v-btn text @click="closeStatusDialog">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbarSuccess" :timeout="3000" color="green" top right>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import apiService from '@/services/apiService';
import { ResponsePrint } from '@/models/responses/responsePrint';
import ResourceDialog from '@/components/dashboard/project-management/project_tasks/print/ResourceDialog.vue'; // Import ResourceDialog
export default {
  props: {
    designId: {
      type: Number,
      required: true,
    },
  },
  components: {
    ResourceDialog, // Đăng ký component ResourceDialog
  },
  data() {
    return {
      designInfo: {},  // Chứa thông tin thiết kế
      printJobs: [],  // Chứa danh sách các PrintJobs
      activePrintJobId: null,  // Chứa ID của PrintJob đang được hiển thị ResourceDetails
      resourceDialog: false,
      selectedPrintJobId: null, // Lưu PrintJobId được chọn
      snackbarMessage: '',
      statusDialog: false,
      newStatus: 0,
    };
  },
  methods: {
    // Lấy thông tin thiết kế từ API và dùng DesignResponse.fromApiResponse
    fetchDesignDetails() {
      apiService
        .getDesignById(this.designId)
        .then((response) => {

          this.designInfo = response;
          console.log(this.designInfo);
        })
        .catch((error) => {
          console.error('Lỗi khi lấy thông tin thiết kế:', error);
        });
    },

    // Lấy thông tin PrintJobs và ResourceDetails từ API
    fetchPrintJobs() {
      apiService
        .getResourcePrintJobByDesign(this.designId)
        .then((response) => {
          this.printJobs = response.map((job) => ResponsePrint.fromApiResponse(job));
        })
        .catch((error) => {
          console.error('Lỗi khi lấy PrintJob:', error);
        });
    },

    // Hiển thị/Ẩn chi tiết Resource khi nút được nhấp
    toggleResourceDetails(printJobId) {
      if (this.activePrintJobId === printJobId) {
        this.activePrintJobId = null;
      } else {
        this.activePrintJobId = printJobId;
      }
    },

    // Hàm mở bản thiết kế
    viewDesign() {
      console.log('Xem bản thiết kế');
    },
    showSuccessToast(message) {
      this.snackbarMessage = message;
      this.snackbarSuccess = true;
    },

    // Trả về trạng thái của thiết kế
    getDesignStatus(status) {
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
    confirmStatusUpdate() {
    // Kiểm tra nếu chưa chọn trạng thái
    if (this.newStatus === null) {
      this.snackbarMessage = "Vui lòng chọn trạng thái!";
      this.snackbarSuccess = true;
      return;
    }

    // Gọi API để cập nhật trạng thái PrintJob
    apiService.updatePrintJobStatus(this.selectedPrintJobId, this.newStatus)
      .then(response => {
        if (response.status === 200) {
          this.showSuccessToast("Cập nhật trạng thái thành công!");
          this.statusDialog = false; // Đóng dialog sau khi thành công
          this.fetchPrintJobs(); // Cập nhật danh sách PrintJobs
        } else {
          this.snackbarMessage = "Lỗi khi cập nhật trạng thái!";
          this.snackbarSuccess = true;
        }
      })
      .catch(error => {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        this.snackbarMessage = "Đã xảy ra lỗi!";
        this.snackbarSuccess = true;
      });
  },
    openResourceDialog(printJobId) {
      console.log("Selected printJobId:", printJobId);
      this.selectedPrintJobId = printJobId; // Gán printJobId được chọn
      console.log("selectedPrintJobId:", this.selectedPrintJobId);
      this.resourceDialog = true; // Mở dialog thêm tài nguyên
    },
    openStatusDialog(printJobId) {
      
      this.selectedPrintJobId = printJobId;
      this.newStatus = 0;  // Đặt lại giá trị trạng thái khi mở dialog
      this.statusDialog = true;  // Mở dialog
    },
    closeStatusDialog()
    {
      this.statusDialog = true;
    },
    // Trả về trạng thái của PrintJob
    getPrintJobStatus(status) {
      switch (status) {
        case 0:
          return 'Chờ xử lý';
        case 1:
          return 'Đang in';
        case 2:
          return 'Hoàn thành';
        case 3:
          return 'Bị hủy';
        case 4:
          return 'Lỗi khi in';
        default:
          return 'Không xác định';
      }
    },
    viewPrintJobDetails(printJobId, printJobStatus) {
      // Điều hướng tới DetailPrintJobComponent và truyền printJobId và status
      this.$router.push({ name: 'DetailPrintJob', params: { printJobId, printJobStatus } });
    },
  },
  mounted() {
    this.fetchDesignDetails();
    this.fetchPrintJobs();
  },
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
