<template>
    <v-container fluid>
        <v-row>
            <!-- Phần bên trái hiển thị thông tin của PrintJob -->
            <v-col cols="12" md="4">
                <v-card outlined>
                    <v-card-title class="font-weight-bold text-center">
                        PrintJob {{ printJobId }}
                    </v-card-title>

                    <v-card-text style="text-align: center;">
                        <v-row>
                            <v-col cols="12">
                                <h2>Trạng thái: {{ printJobStatus }}</h2>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Phần bên phải hiển thị danh sách ResourceDetails -->
            <v-col cols="12" md="8">
                <v-row>
                    <v-col cols="12" v-for="resource in resourceDetails" :key="resource.id">
                        <v-card outlined>
                            <v-card-title>
                                {{ resource.propertyDetailName }}
                            </v-card-title>

                            <v-card-text>
                                <v-row>
                                    <v-col cols="3">
                                        <v-number-input :min="0" label="Giá" v-model="resource.price" variant="outlined"
                                            control-variant="split"></v-number-input>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-number-input :min="0" label="Số lượng" v-model="resource.quantity"
                                            variant="outlined" control-variant="split"></v-number-input>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-file-input v-model="resource.imageFile" variant="outlined" label="Chọn ảnh"
                                            accept="image/*"></v-file-input>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-btn color="primary" @click="editResource(resource)"
                                            variant="outlined">Sửa</v-btn>
                                        <v-btn color="red" @click="deleteResource(resource.id)"
                                            variant="outlined">Xóa</v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

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

        <!-- Thông báo thành công -->
        <v-snackbar v-model="successSnackbar" top color="green" timeout="2000">
            {{ successMessage }}
        </v-snackbar>
    </v-container>
</template>

<script>
import apiService from "@/services/apiService"; // Import dịch vụ API
import { VNumberInput } from 'vuetify/labs/VNumberInput';

export default {
    components: {
        VNumberInput,
    },
    props: {
        printJobId: {
            type: Number,
            required: true, // Nhận printJobId từ PrintComponent
        },
        printJobStatus: {
            type: String,
            required: true, // Trạng thái của PrintJob
        },
    },
    data() {
        return {
            printJobInfo: {}, // Lưu thông tin PrintJob
            resourceDetails: [], // Lưu chi tiết tài nguyên của PrintJob
            errorDialog: false, // Trạng thái mở/đóng dialog lỗi
            errorMessage: '', // Thông báo lỗi
            successSnackbar: false, // Trạng thái snackbar
            successMessage: '', // Thông báo thành công
        };
    },
    methods: {
        fetchPrintJobDetails() {
            // Gọi API để lấy chi tiết PrintJob và các ResourceDetails
            apiService
                .getResourceDetailByPrintJob(this.printJobId)
                .then((response) => {
                    console.log(response.status)
                    if (response.status === 200) {
                        this.resourceDetails = response.data; // Gán tài nguyên vào data
                    } else {
                        this.showErrorDialog(response.message);
                    }
                })
                .catch((error) => {
                    this.showErrorDialog("Lỗi khi tải tài nguyên.", error);
                });
        },

        editResource(resource) {
            // Kiểm tra các trường không được để trống
            if (!resource.price || !resource.quantity || !resource.imageFile) {
                this.showErrorDialog("Không được để trống giá trị nào.");
                return;
            }

            // Tạo payload cho request
            const payload = new FormData();
            payload.append("PropertyDetailName", resource.propertyDetailName);
            payload.append("Image", resource.imageFile);
            payload.append("Price", resource.price);
            payload.append("Quantity", resource.quantity);

            // Gọi API update
            apiService.updateResourceDetail(resource.id, payload)
                .then(response => {
                    if (response.status === 200) {
                        this.showSuccessSnackbar("Cập nhật thành công!");
                    } else {
                        this.showErrorDialog(response.message);
                    }
                })
                .catch(error => {
                    this.showErrorDialog("Lỗi khi cập nhật tài nguyên.", error);
                });
        },

        deleteResource(resourceId) {
            // Xóa tài nguyên
            apiService.deleteResourceDetailById(resourceId)
                .then(response => {
                    if (response.status === 200) {
                        this.resourceDetails = this.resourceDetails.filter(resource => resource.id !== resourceId);
                        this.showSuccessSnackbar("Xóa tài nguyên thành công!");
                    } else {
                        this.showErrorDialog(response.message);
                    }
                })
                .catch(error => {
                    this.showErrorDialog("Lỗi khi xóa tài nguyên.", error);
                });
        },

        showErrorDialog(message) {
            this.errorMessage = message;
            this.errorDialog = true;
        },

        closeErrorDialog() {
            this.errorDialog = false;
        },

        showSuccessSnackbar(message) {
            this.successMessage = message;
            this.successSnackbar = true;
        }
    },
    mounted() {
        this.fetchPrintJobDetails(); // Gọi API khi component được mount
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

.d-flex {
    display: flex;
}

.justify-center {
    justify-content: center;
}

.align-center {
    align-items: center;
}

.flex-column {
    flex-direction: column;
}
</style>
