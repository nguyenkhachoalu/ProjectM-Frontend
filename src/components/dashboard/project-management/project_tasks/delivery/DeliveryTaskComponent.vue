<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <h3>Danh sách đơn hàng</h3>
        <v-select v-model="selectedStatus" :items="statuses" max-width="300px" label="Trạng thái đơn hàng"
          variant="outlined" @update:modelValue="fetchDeliveries"></v-select>
      </v-card-title>

      <!-- Bảng hiển thị dữ liệu -->
      <v-data-table-virtual :headers="headers" :items="deliveries" :items-per-page="pageSize">
        <template v-slot:[`item.deliveryStatus`]="{ item }">
          <v-chip>{{ getDeliveryStatus(item.deliveryStatus) }}</v-chip> <!-- Gọi hàm getDeliveryStatus -->
        </template>
        <template v-slot:[`item.estimateDeliveryTime`]="{ item }">
          <v-chip>{{ formatDateTime(item.estimateDeliveryTime) }}</v-chip> 
        </template>
        <template v-slot:[`item.actualDeliveryTime`]="{ item }">
          <v-chip>{{ formatDateTime(item.actualDeliveryTime) }}</v-chip> 
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <!-- Nút Sửa trạng thái đơn hàng -->
          <v-btn color="primary" @click="openStatusDialog(item.id)">
            Sửa trạng thái
          </v-btn>
          <!-- Nút Xác nhận giao hàng thành công -->
          <v-btn color="primary" @click="confirmSuccessfulDelivery(item.id)">
            Giao hàng thành công
          </v-btn>
        </template>
      </v-data-table-virtual>

      <!-- Dialog thao tác đơn hàng -->
      <v-dialog v-model="showDialog" max-width="600px">
        <v-btn color="primary" @click="goToDeliveryDetails">
          Xem chi tiết đơn hàng
        </v-btn>
        <br>
        <v-btn color="primary">Sửa</v-btn>
        <br>
        <v-btn color="primary">Xóa</v-btn>
      </v-dialog>

      <!-- Phân trang -->
      <v-pagination v-model="pageNumber" :length="totalPages" @input="fetchDeliveries"></v-pagination>
    </v-card>
    <v-dialog v-model="showStatusDialog" max-width="600px">
      <v-card>
        <v-card-title>Thay đổi trạng thái đơn hàng</v-card-title>
        <v-card-text>
          <v-radio-group v-model="newStatus" label="Chọn trạng thái">
            <v-radio v-for="status in updateStatuses" :key="status.value" :label="status.title" :value="status.value" />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updateDeliveryStatus(selectedDeliveryId, newStatus)">
            Cập nhật
          </v-btn>
          <v-btn color="secondary" @click="showStatusDialog = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Dialog thao tác đơn hàng -->
  </v-container>
</template>

<script>
import apiService from '@/services/apiService'; // API Service
export default {
  name: 'DeliveryTaskComponent',
  data() {
    return {
      deliveries: [],
      totalPages: 0,
      totalItems: 0,
      newStatus: 0,
      pageNumber: 1,
      pageSize: 10,
      showStatusDialog: false,
      showDialog: false, // Điều khiển mở/đóng dialog
      selectedDeliveryId: null, // Lưu trữ id đơn hàng được chọn
      selectedStatus: null, // Lưu trạng thái được chọn để lọc
      statuses: [
        { title: 'Đơn hàng đang được xử lý', value: 0 },
        { title: 'Đơn hàng đã được gửi đi', value: 1 },
        { title: 'Đơn hàng đã được giao', value: 2 },
        { title: 'Đơn hàng đã bị hủy', value: 3 },
        { title: 'Đơn hàng đã bị trả lại', value: 4 },
        { title: 'Tất cả đơn hàng', value: null },
      ],
      updateStatuses: [
        { title: 'Đơn hàng đang được xử lý', value: 0 },
        { title: 'Đơn hàng đã được gửi đi', value: 1 },
        { title: 'Đơn hàng đã được giao', value: 2 },
        { title: 'Đơn hàng đã bị hủy', value: 3 },
        { title: 'Đơn hàng đã bị trả lại', value: 4 },
      ],
      headers: [
        { title: 'Tên đơn hàng', value: 'projectName' },
        { title: 'Khác hàng', value: 'customeName' },
        { title: 'Phương thức vận chuyển', value: 'shippingMethodName' },
        { title: 'Địa chỉ', value: 'deliveryAddress' },
        { title: 'Ngày tạo đơn', value: 'estimateDeliveryTime' },
        { title: 'Ngày giao dự kiến', value: 'actualDeliveryTime' },
        { title: 'Trạng thái', value: 'deliveryStatus' },

        { title: 'Hành động', value: 'actions', sortable: false },
      ],
    };
  },
  methods: {
    // Gọi API để lấy danh sách đơn hàng
    fetchDeliveries() {
      apiService.getDeliveriesByDeliverId(this.selectedStatus, this.pageNumber, this.pageSize)
        .then((response) => {
          console.log(response.items)
          this.deliveries = response.items;
          this.totalPages = response.totalPages;
          this.totalItems = response.totalItems;
        })
        .catch((error) => {
          console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        });
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    // Cập nhật trạng thái đơn hàng
    // Mở dialog thay đổi trạng thái
    openStatusDialog(id) {
      this.selectedDeliveryId = id;
      this.showStatusDialog = true;
    },

    // Cập nhật trạng thái đơn hàng
    updateDeliveryStatus(id, status) {
      apiService.updateDeliveryStatus(id, status)
        .then(() => {
          alert('Cập nhật trạng thái thành công');
          this.fetchDeliveries();
          this.showStatusDialog = false;
        })
        .catch((error) => {
          console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        });
    },

    // Xác nhận giao hàng thành công
    confirmSuccessfulDelivery(id) {
      apiService.confirmSuccessfulDelivery(id)
        .then((response) => {
          console.log(response);
          alert(response.message);
          
          this.fetchDeliveries(); // Tải lại danh sách đơn hàng
        })
        .catch((error) => {
          console.error('Lỗi khi xác nhận giao hàng thành công:', error);
        });
    },

    getDeliveryStatus(status) {
      switch (status) {
        case 0:
          return 'Đơn hàng đang được xử lý';
        case 1:
          return 'Đơn hàng đã được gửi đi';
        case 2:
          return 'Đơn hàng đã được giao';
        case 3:
          return 'Đơn hàng đã bị hủy';
        case 4:
          return 'Đơn hàng đã bị trả lại';
        default:
          return 'Không xác định';
      }
    },
    openBtnDialog(id) {
      this.selectedDeliveryId = id;
      this.showDialog = true;
    },
    goToDeliveryDetails() {
      // Điều hướng đến chi tiết đơn hàng
      this.$router.push({ name: 'DeliveryDetails', params: { id: this.selectedDeliveryId } });
    }
  },
  mounted() {
    this.fetchDeliveries(); // Gọi API khi component được mount
  },
};
</script>

<style scoped>
.status-select {
  max-width: 300px;
  /* Giới hạn chiều rộng của v-select */
}
</style>