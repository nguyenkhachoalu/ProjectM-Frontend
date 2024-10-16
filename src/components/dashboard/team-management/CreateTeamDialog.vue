<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>Tạo nhóm mới</v-card-title>
        <v-card-text>
          <!-- Tên nhóm input with validation -->
          <v-text-field
            v-model="name"
            label="Tên nhóm"
            :rules="nameRules"
            variant="outlined"
            required
          />
          <!-- Mô tả input with validation -->
          <v-text-field
            v-model="description"
            label="Mô tả"
            :rules="descriptionRules"
            variant="outlined"
            required
          />
          <!-- Quản lý select with validation -->
          <v-select
            v-model="managerId"
            :items="leaders"
            label="Quản lý"
            :rules="managerRules"
            item-title="fullName"
            item-value="id"
            variant="outlined"
            required
          />
        </v-card-text>
  
        <v-card-actions class="d-flex justify-space-between">
          <v-btn text @click="closeDialog">Hủy</v-btn>
          <v-btn
            color="primary"
            @click="createTeam"
            :disabled="!isFormValid"
          >
            Tạo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import apiService from '@/services/apiService';
  import RequestTeam from '@/models/requests/request_team';
  
  export default {
    props: {
      modelValue: Boolean, // v-model compatibility
      leaders: Array, // Receive leaders from parent component
    },
    data() {
      return {
        dialog: this.modelValue,
        name: '',
        description: '',
        managerId: null,
        // Validation rules
        nameRules: [(v) => !!v || 'Tên nhóm không được để trống'],
        descriptionRules: [(v) => !!v || 'Mô tả không được để trống'],
        managerRules: [(v) => !!v || 'Vui lòng chọn quản lý'],
      };
    },
    computed: {
      // Check if the form is valid
      isFormValid() {
        return (
          this.name &&
          this.description &&
          this.managerId
        );
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
    methods: {
      createTeam() {
        const teamRequest = new RequestTeam(this.name, this.description, this.managerId);
        apiService.createTeam(teamRequest)
          .then((response) => {
            this.$emit('team-created', response.data);
            this.closeDialog();
          })
          .catch(error => console.error(error));
      },
      closeDialog() {
        this.dialog = false;
      },
    },
  };
  </script>
  