<template>
  <v-dialog v-model="localDialog" max-width="1000px">
    <v-card>
      <v-card-title class="text-h5">Danh sách tài nguyên</v-card-title>

      <v-card-text>
        <!-- Hiển thị alert khi có lỗi -->
        <v-alert
          v-if="errorMessage"
          type="error"
          dismissible
          @input="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-expansion-panels v-model="activePanels" multiple variant="popout" style="border: none !important; box-shadow: none !important">
          <!-- Hiển thị danh sách resource -->
          <v-expansion-panel
            v-for="resource in resources"
            :key="resource.id"
            :value="resource.id"
            @click="toggleResourceDetails(resource)"
          >
            <v-expansion-panel-title>
              <v-list-item-content>
                <v-list-item-title>{{ resource.resourceName }}</v-list-item-title>
                <v-list-item-subtitle>
                  Số lượng có sẵn: {{ resource.availableQuantity }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <!-- Hiển thị danh sách ResourceProperty -->
              <v-list-item v-for="property in resourceProperties[resource.id]" :key="property.id">
                <v-row>
                  <v-col cols="3">
                    <v-list-item-title>{{ property.resourcePropertyName }}</v-list-item-title>
                    <v-list-item-subtitle>Số lượng: {{ property.quantity }}</v-list-item-subtitle>
                  </v-col>
                  <v-col cols="3">
                    <v-number-input
                      :min="0"
                      label="Giá"
                      v-model="property.price"
                      variant="outlined"
                      control-variant="split"
                    ></v-number-input>
                  </v-col>
                  <v-col cols="3">
                    <v-number-input
                      :min="0"
                      label="Số lượng"
                      v-model="property.selectedQuantity"
                      variant="outlined"
                      control-variant="split"
                    ></v-number-input>
                  </v-col>
                  <v-col cols="3">
                    <v-file-input
                      v-model="property.imageFile"
                      label="Chọn ảnh"
                      accept="image/*"
                      outlined
                    ></v-file-input>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="closeDialog">Đóng</v-btn>
        <v-btn color="primary" @click="addResources">Thêm tài nguyên</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiService from "@/services/apiService";
import { ResponseResourceProperty } from "@/models/responses/resourcePropertyResponse";
import { VNumberInput } from 'vuetify/labs/VNumberInput';

export default {
  components: {
    VNumberInput,
  },
  props: {
    dialog: Boolean,
    printJobId: {
      type: Number,
      required: true, // Đảm bảo printJobId được yêu cầu
    }
  },
  data() {
    return {
      resources: [], // Chứa danh sách tài nguyên
      resourceProperties: {}, // Chứa danh sách các ResourceProperty theo resourceId
      activePanels: [], // Mảng chứa các resource id của panels đang mở
      localDialog: this.dialog, // Tạo một biến cục bộ để lưu trữ trạng thái của dialog
      errorMessage: '', // Biến chứa thông báo lỗi
    };
  },
  watch: {
    dialog(val) {
      this.localDialog = val; // Đồng bộ hóa prop với biến cục bộ khi prop thay đổi
    },
  },
  methods: {
    fetchResources() {
      apiService
        .getAllResources() // Gọi API để lấy danh sách tài nguyên
        .then((response) => {
          this.resources = response.data.data.map((resource) => ({
            ...resource,
          }));
        })
        .catch((error) => {
          console.error("Lỗi khi lấy tài nguyên:", error);
        });
    },

    fetchResourceProperties(resourceId) {
      apiService
        .getResourcePropertiesByResourceId(resourceId)
        .then((response) => {
          if (response.data && response.data.data) {
            this.resourceProperties = {
              ...this.resourceProperties,
              [resourceId]: response.data.data.map((property) => ({
                ...ResponseResourceProperty.fromApiResponse(property),
                price: 0,
                selectedQuantity: 0,
                imageFile: null,
              })),
            };
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy chi tiết tài nguyên:", error);
        });
    },

    toggleResourceDetails(resource) {
      if (!this.activePanels.includes(resource.id)) {
        this.fetchResourceProperties(resource.id);
      }
    },

    addResources() {
      const formData = new FormData();

      // Gán PrintJobId vào form
      formData.append("PrintJobId", this.printJobId);

      const resourceDetails = [];

      // Lặp qua các ResourceProperties và kiểm tra các trường đã nhập đầy đủ chưa
      for (const resourceId in this.resourceProperties) {
        const properties = this.resourceProperties[resourceId];
        properties.forEach((property) => {
          if (property.selectedQuantity > 0 && property.price > 0 && property.imageFile) {
            resourceDetails.push({
              propertyId: property.id,
              propertyDetailName: property.resourcePropertyName,
              image: property.imageFile, // Đưa ảnh vào đây
              price: property.price,
              quantity: property.selectedQuantity,
            });
          }
        });
      }

      // Thêm danh sách resource vào formData
      resourceDetails.forEach((resourceDetail, index) => {
        formData.append(`ResourceDetails[${index}].propertyId`, resourceDetail.propertyId);
        formData.append(`ResourceDetails[${index}].propertyDetailName`, resourceDetail.propertyDetailName);
        formData.append(`ResourceDetails[${index}].price`, resourceDetail.price);
        formData.append(`ResourceDetails[${index}].quantity`, resourceDetail.quantity);
        formData.append(`ResourceDetails[${index}].image`, resourceDetail.image);
      });

      // Gửi yêu cầu tới API
      apiService
        .createResourceForPrintJob(formData)
        .then((response) => {
          if (response.data.status === 201) {
            // Hiển thị thông báo thành công và đóng dialog
            this.$emit("showSuccess", "Tài nguyên đã được thêm thành công.");
            this.closeDialog(); // Gọi hàm đóng dialog
          } else {
            // Thông báo lỗi từ response trong dialog
            this.errorMessage = response.data.message;
          }
        })
        .catch((error) => {
          console.error("Lỗi khi thêm tài nguyên:", error);
          // Hiển thị lỗi trong dialog
          this.errorMessage = "Có lỗi xảy ra khi thêm tài nguyên.";
        });
    },

    closeDialog() {
      this.$emit("update:dialog", false); // Bắn sự kiện về component cha để đóng dialog
      this.activePanels = []; // Reset trạng thái panel khi đóng dialog
      this.resourceProperties = {}; // Reset resource properties
      this.errorMessage = ''; // Xóa thông báo lỗi khi đóng dialog
    },
  },
  mounted() {
    this.fetchResources(); // Gọi API khi component được mount
    console.log("ResourceDialog mounted with printJobId:", this.printJobId);
  },
};
</script>

<style scoped>
.v-card {
  background-color: #fafafa;
  border-radius: 8px;
}

.v-expansion-panels {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.v-list-item-title {
  font-weight: 500;
}

.v-card-title {
  padding: 16px;
  background-color: #1976d2;
  color: white;
}

.v-btn {
  margin-right: 10px;
}

.v-list-item-content {
  padding: 16px;
}

.v-row {
  margin-bottom: 10px;
}
</style>
