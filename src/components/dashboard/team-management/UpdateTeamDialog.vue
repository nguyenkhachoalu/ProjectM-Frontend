<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
            <v-card-title>Cập nhật thông tin phòng ban {{ teamName }}</v-card-title>
            <v-card-text>
                <v-alert v-if="errorMessage" type="error" dismissible>{{ errorMessage }}</v-alert>
                <v-text-field v-model="name" label="Tên nhóm" variant="outlined" :rules="nameRules" />
                <v-text-field v-model="description" label="Mô tả" variant="outlined" :rules="descriptionRules" />
                <v-select v-model="managerId" :items="leaders" label="Chọn Trưởng phòng" item-title="fullName"
                    item-value="id" variant="outlined" :rules="managerRules" />
            </v-card-text>
            <v-card-actions class="d-flex justify-space-between">
                <v-btn text @click="closeDialog">Hủy</v-btn>
                <v-btn color="primary" @click="updateTeam" :disabled="!isFormValid">Cập nhật</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import RequestTeam from '@/models/requests/request_team';
import apiService from '@/services/apiService';

export default {
    props: {
        modelValue: Boolean,
        teamId: Number,
        teamName: String,
        currentLeaderId: Number,
        leaders: Array,
        currentDescription: String,
    },

    data() {
        return {
            dialog: this.modelValue,
            name: this.teamName, // Khởi tạo rỗng, sẽ cập nhật sau
            description: this.currentDescription,
            managerId: this.currentLeaderId,
            errorMessage: '', // Biến để lưu lỗi nếu có
            nameRules: [(v) => !!v || 'Tên nhóm không được để trống'],
            descriptionRules: [(v) => !!v || 'Mô tả không được để trống'],
            managerRules: [(v) => !!v || 'Vui lòng chọn quản lý'],
        };
    },
    computed: {
        isFormValid() {
            return (
                this.name &&
                this.description &&
                this.managerId
            );
        },
    },
    watch: {
        // Watch các props khi có thay đổi và gán giá trị cho form fields
        teamName(newVal) {
            this.name = newVal;
        },
        currentDescription(newVal) {
            this.description = newVal;
        },
        currentLeaderId(newVal) {
            this.managerId = newVal;
        },
        modelValue(val) {
            this.dialog = val;
        },
        dialog(val) {
            this.$emit('update:modelValue', val);
        },
    },
    methods: {
        updateTeam() {
            const requestTeam = new RequestTeam(this.name, this.description, this.managerId);

            // Gọi API cập nhật team
            apiService.updateTeam(this.teamId, requestTeam)
                .then((response) => {
                    if (response.status === 200) {
                        // Cập nhật thành công, đóng dialog
                        this.$emit('update-team', this.teamId, requestTeam);
                        this.closeDialog();
                    } else {
                        // Nếu có lỗi, hiển thị thông báo lỗi
                        this.errorMessage = response.message || 'Có lỗi xảy ra khi cập nhật team';
                    }
                })
                .catch((error) => {
                    console.error('Lỗi:', error);
                    this.errorMessage = error.response?.data?.message || 'Lỗi không xác định';
                });
        },
        closeDialog() {
            this.dialog = false;
            this.errorMessage = ''; // Xóa thông báo lỗi khi đóng dialog
            this.$emit('refresh-teams')
        },
    },
};
</script>
