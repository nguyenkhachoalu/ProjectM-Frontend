<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-card-title class="headline">Tạo dự án mới</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="validForm">
          <v-row>
            <!-- Tên dự án và hình ảnh -->
            <v-col cols="6">
              <v-text-field v-model="projectName" label="Tên dự án" required :rules="projectNameRules"
                :error-messages="errorMessages.projectName" @input="resetFieldError('projectName')"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-file-input v-model="image" label="Chọn hình ảnh" accept="image/*" required :rules="imageRules"
                :error-messages="errorMessages.image" @input="resetFieldError('image')"></v-file-input>
            </v-col>
          </v-row>

          <!-- Mô tả yêu cầu -->
          <v-textarea v-model="requestDescriptionFromCustomer" label="Mô tả yêu cầu" rows="3" outlined
            :rules="requestDescriptionRules" :error-messages="errorMessages.requestDescriptionFromCustomer"
            @input="resetFieldError('requestDescriptionFromCustomer')"></v-textarea>

          <!-- Ngày bắt đầu, Ngày dự kiến kết thúc và Khách hàng -->
          <v-row>
            <v-col cols="4">
              <v-text-field v-model="startDate" label="Ngày bắt đầu" type="date" required :rules="startDateRules"
                :error-messages="errorMessages.startDate" @input="resetFieldError('startDate')"></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="expectedEndDate" label="Ngày dự kiến kết thúc" type="date" required
                :rules="expectedEndDateRules" :error-messages="errorMessages.expectedEndDate"
                @input="resetFieldError('expectedEndDate')"></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-select v-model="customerId" :items="customers" label="Chọn khách hàng" item-title="fullName"
                item-value="id" required :rules="customerIdRules" :error-messages="errorMessages.customerId"
                @input="resetFieldError('customerId')"></v-select>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Thông báo lỗi -->
      <v-alert v-if="errorMessage" type="error" dismissible>{{ errorMessage }}</v-alert>

      <!-- Các nút hành động -->
      <v-card-actions>
        <v-btn :disabled="!validForm || isCreating" color="primary" @click="createProject">Tạo</v-btn>
        <v-btn @click="closeDialog">Hủy</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiService from '@/services/apiService';

export default {
  props: {
    modelValue: Boolean,
  },
  data() {
    return {
      dialog: this.modelValue,
      projectName: '',
      requestDescriptionFromCustomer: '',
      startDate: '',
      image: null,
      customerId: null,
      customers: [],
      expectedEndDate: '',
      errorMessage: '',
      errorMessages: {
        projectName: [],
        requestDescriptionFromCustomer: [],
        startDate: [],
        expectedEndDate: [],
        customerId: [],
        image: [],
      },
      validForm: false,
      isCreating: false,
    };
  },
  computed: {
    projectNameRules() {
      return [v => !!v || 'Tên dự án không được để trống'];
    },
    requestDescriptionRules() {
      return [v => !!v || 'Mô tả yêu cầu không được để trống'];
    },
    startDateRules() {
      return [
        v => !!v || 'Ngày bắt đầu không được để trống',
        () => this.errorMessages || this.errorMessages
      ];
    },
    expectedEndDateRules() {
      return [
        v => !!v || 'Ngày kết thúc không được để trống',
        () => this.errorMessages || this.errorMessages
      ];
    },
    customerIdRules() {
      return [v => !!v || 'Vui lòng chọn khách hàng'];
    },
    imageRules() {
      return [v => !!v || 'Vui lòng chọn hình ảnh'];
    }
  },
  methods: {
    resetFieldError(fieldName) {
      this.errorMessages[fieldName] = [];
    },
    createProject() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.isCreating = true;

      const projectData = {
        projectName: this.projectName,
        requestDescriptionFromCustomer: this.requestDescriptionFromCustomer,
        startDate: this.startDate,
        image: this.image,
        customerId: this.customerId,
        expectedEndDate: this.expectedEndDate,
      };

      apiService
        .createProject(projectData)
        .then((response) => {
          if (response.message === 'Đã tạo thành công project') {
            this.$emit('project-created', response.data);
            this.closeDialog();
          } else {
            this.errorMessage = response.message;
            this.handleValidationErrors(this.errorMessage);
          }
        })
        .catch((error) => {
          this.errorMessage = error.message || 'Có lỗi xảy ra khi tạo dự án';
        })
        .finally(() => {
          this.isCreating = false;
        });
    },
    closeDialog() {
      this.$refs.form.resetValidation();
      this.dialog = false;
      this.projectName = '';
      this.requestDescriptionFromCustomer = '';
      this.startDate = '';
      this.image = null;
      this.customerId = null;
      this.expectedEndDate = '';
      this.errorMessage = '';
      this.errorMessages = {
        projectName: [],
        requestDescriptionFromCustomer: [],
        startDate: [],
        expectedEndDate: [],
        customerId: [],
        image: [],
      };
    },
    fetchCustomers() {
      apiService
        .getCustomers()
        .then((response) => {
          this.customers = response.data;
        })
        .catch((error) => {
          console.error('Lỗi khi lấy danh sách khách hàng:', error);
        });
    },
    handleValidationErrors(errorMessage) {
      if (errorMessage.includes('Ngày bắt đầu phải lớn hơn ngày hiện tại')) {
        this.errorMessages.startDate = ['Ngày bắt đầu phải lớn hơn ngày hiện tại'];
      }

      if (errorMessage.includes('Ngày kết thúc dự kiến phải lớn hơn ngày bắt đầu')) {
        this.errorMessages.expectedEndDate = ['Ngày kết thúc dự kiến phải lớn hơn ngày bắt đầu'];
      }
      if (errorMessage.includes('Bạn không có quyền tạo project')) {
        this.$router.push({ name: 'Unauthorized' });
        return; // Thêm return để ngăn điều hướng khác
      }

      if (errorMessage.includes('Team Không có quyền tạo project')) {
        this.$router.push({ name: 'Unauthorized' });
        return; // Thêm return để ngăn điều hướng khác
      }
    },
  },
  watch: {
    modelValue(val) {
      this.dialog = val;
    },
    dialog(val) {
      this.$emit('update:modelValue', val);
    },
  },
  mounted() {
    this.fetchCustomers();
  },
};
</script>