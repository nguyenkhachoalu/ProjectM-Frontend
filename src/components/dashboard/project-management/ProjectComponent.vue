<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <v-row>
          <v-col cols="6">
            <h3>Danh sách dự án</h3>
          </v-col>
          <v-col cols="6">
            <v-row>
              <v-col cols="4">
                <v-text-field
                  label="Tìm kiếm dự án"
                  variant="outlined"
                  v-model="searchProjectName"
                  append-inner-icon="mdi-magnify"
                  @input="fetchProjects"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  label="Lọc theo trạng thái"
                  variant="outlined"
                  @update:modelValue="fetchProjects"
                  class="ml-2"
                ></v-select>
              </v-col>
              <v-col cols="4" class="d-flex justify-end">
                <v-btn
                  color="#66BB6A"
                  class="ml-2"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  @click="showCreateProjectDialog = true"
                >
                  Tạo dự án
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>

      <create-project-dialog
        v-model="showCreateProjectDialog"
        @project-created="fetchProjects"
      ></create-project-dialog>

      <!-- Bảng hiển thị dữ liệu -->
      <v-data-table-virtual
        :headers="headers"
        :items="projects"
        :items-per-page="pageSize"
      >
        <template v-slot:[`item.customerId`]="{ item }">
          <v-chip>{{ getCustomerName(item.customerId) }}</v-chip>
        </template>
        <template v-slot:[`item.projectStatus`]="{ item }">
          <v-chip>{{ getProjectStatus(item.projectStatus) }}</v-chip>
        </template>
        <template v-slot:[`item.image`]="{ item }">
          <v-img
            :src="item.image"
            class="project-image"
            alt="Project Image"
            @click="openImage(item.image)"
          />
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            color="primary"
            @click="
              openBtnDialog(
                item.id,
                item.projectName,
                item.image,
                item.projectStatus,
                item.expectedEndDate
              )
            "
          >
            Thao Tác
          </v-btn>
        </template>
      </v-data-table-virtual>

      <!-- Dialog điều khiển tác vụ dự án -->
      <v-dialog v-model="showDialog" max-width="600px">
        <v-btn color="primary" @click="goToProjectProcessing()"
          >Quản lý tác vụ</v-btn
        >
        <br />
        <v-btn color="primary">Sửa</v-btn>
        <br />
        <v-btn color="primary">Xóa</v-btn>
      </v-dialog>

      <!-- Phân trang -->
      <v-pagination
        v-model="pageNumber"
        :length="totalPages"
        @input="fetchProjects"
      ></v-pagination>
    </v-card>

    <!-- Dialog hiển thị hình ảnh -->
    <v-dialog v-model="showImageDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5">Hình ảnh dự án</v-card-title>
        <v-card-text>
          <v-img :src="selectedImage" alt="Project Image" max-height="500px" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeImageDialog">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import apiService from "@/services/apiService"; // API Service
import CreateProjectDialog from "./CreateProjectDialog.vue";

export default {
  name: "ProjectComponent",
  components: {
    CreateProjectDialog,
  },
  data() {
    return {
      projects: [],
      customers: [], // Chứa danh sách khách hàng
      totalPages: 0,
      totalItems: 0,
      pageNumber: 1,
      pageSize: 10,
      searchProjectName: "", // Tìm kiếm theo tên dự án
      selectedStatus: null, // Lọc theo trạng thái
      statusOptions: [
        { value: null, title: "Tất cả" },
        { value: 0, title: "Đang thiết kế" },
        { value: 1, title: "Đang chuẩn bị tài nguyên" },
        { value: 2, title: "Đang in" },
        { value: 3, title: "Đã hoàn thành" },
      ],
      showImageDialog: false,
      showCreateProjectDialog: false,
      selectedImage: "",
      showDialog: false,
      selectedProjectId: null,
      headers: [
        { title: "Tên dự án", value: "projectName" },
        { title: "Mô tả yêu cầu", value: "requestDescriptionFromCustomer" },
        { title: "Ngày bắt đầu", value: "startDate" },
        { title: "Ngày dự kiến kết thúc", value: "expectedEndDate" },
        { title: "Khách hàng", value: "customerId" },
        { title: "Trạng thái", value: "projectStatus" },
        { title: "Hình ảnh", value: "image" },
        { title: "Hành động", value: "actions", sortable: false },
      ],
    };
  },
  methods: {
    fetchProjects() {
      // Sửa lại API để gửi kèm tên dự án và trạng thái (nếu có)
      apiService
        .getProjects(
          this.pageNumber,
          this.pageSize,
          this.searchProjectName,
          this.selectedStatus
        )
        .then((projectResponse) => {
          this.projects = projectResponse.items;
          this.totalPages = projectResponse.totalPages;
          this.totalItems = projectResponse.totalItems;
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh sách dự án:", error);
        });
    },
    fetchCustomers() {
      apiService
        .getCustomers()
        .then((response) => {
          this.customers = response.data;
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh sách khách hàng:", error);
        });
    },
    getCustomerName(customerId) {
      const customer = this.customers.find((c) => c.id === customerId);
      return customer ? customer.fullName : "Không xác định";
    },
    getProjectStatus(status) {
      switch (status) {
        case 0:
          return "Đang thiết kế";
        case 1:
          return "Đang chuẩn bị tài nguyên";
        case 2:
          return "Đang in";
        case 3:
          return "Đã hoàn thành";
        default:
          return "Không xác định";
      }
    },
    openImage(imageUrl) {
      this.selectedImage = imageUrl;
      this.showImageDialog = true;
    },
    closeImageDialog() {
      this.showImageDialog = false;
    },
    openBtnDialog(id, name, image, status, endDate) {
      this.selectedProjectId = id;
      this.selectedProjectName = name;
      this.selectedProjectImage = image;
      this.selectedProjectStatus = this.getProjectStatus(status);
      this.selectedProjectEndDate = endDate;
      this.showDialog = true;
    },
    goToProjectProcessing() {
      this.$router.push({
        name: "ProjectProcessing",
        params: {
          projectId: this.selectedProjectId,
          projectImage: this.selectedProjectImage,
          projectName: this.selectedProjectName,
          projectStatus: this.selectedProjectStatus,
          projectExpectedEndDate: this.selectedProjectEndDate,
        },
      });
    },
  },
  mounted() {
    this.fetchProjects();
    this.fetchCustomers();
  },
};
</script>

<style scoped>
.project-image {
  object-fit: cover;
  cursor: pointer;
  width: 100px;
  height: 100px;
}
</style>
