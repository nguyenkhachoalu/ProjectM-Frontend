<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
            <v-card-title>Đổi Phòng ban cho {{ userName }}</v-card-title>
            <v-card-text>
                <v-select
                    v-model="selectedDepartment"
                    :items="departments"
                    label="Chọn Phòng ban mới"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    :rules="[v => !!v || 'Vui lòng chọn Phòng ban']"
                />
            </v-card-text>
            <v-card-actions class="d-flex justify-space-between">
                <v-btn text @click="closeDialog">Hủy</v-btn>
                <v-btn color="primary" @click="updateUserDepartment" :disabled="!selectedDepartment">Cập nhật</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,
        userId: Number,
        userName: String,
        currentDepartmentId: Number, // ID của phòng ban hiện tại
        departments: Array, // Danh sách phòng ban
    },
    data() {
        return {
            dialog: this.modelValue,
            selectedDepartment: this.currentDepartmentId, // Set mặc định là phòng ban hiện tại
        };
    },
    watch: {
        modelValue(val) {
            this.dialog = val;
        },
        dialog(val) {
            this.$emit('update:modelValue', val);
        },
        currentDepartmentId(newDepartmentId) {
            this.selectedDepartment = newDepartmentId;
        }
    },
    methods: {
        updateUserDepartment() {
            // Gửi event lên component cha để cập nhật phòng ban mới
            this.$emit('update-user-department', this.userId, this.selectedDepartment);
            this.closeDialog();
        },
        closeDialog() {
            this.dialog = false;
        }
    }
};
</script>
