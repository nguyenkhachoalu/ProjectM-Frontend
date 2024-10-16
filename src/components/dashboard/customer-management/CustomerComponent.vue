<template>
    <v-container>
        <!-- Danh sách khách hàng -->
        <v-card>
            <v-card-title>Danh sách khách hàng</v-card-title>
            <v-card-text>
                <v-list>
                    <v-list-item v-for="customer in customers" :key="customer.id">
                        <v-list-item-content>
                            <v-list-item-title>{{ customer.fullName }}</v-list-item-title>
                            <v-list-item-subtitle>{{ customer.phoneNumber }} | {{ customer.email }} | {{
                                customer.address }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>

        <!-- Form tạo khách hàng mới -->
        <v-card class="mt-5">
            <v-card-title>Thêm Khách Hàng Mới</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="createCustomer">
                    <v-text-field label="Họ và tên" v-model="newCustomer.fullName" required></v-text-field>
                    <v-text-field label="Số điện thoại" v-model="newCustomer.phoneNumber" required></v-text-field>
                    <v-text-field label="Email" v-model="newCustomer.email" required></v-text-field>

                    <v-select label="Tỉnh/Thành phố" :items="tinhThanhList" item-title="name_with_type"
                        item-value="code" v-model="selectedTinhThanh" required></v-select>

                    <v-select label="Quận/Huyện" :items="quanHuyenList" item-title="name_with_type" item-value="code"
                        v-model="selectedQuanHuyen" required></v-select>

                    <v-select label="Phường/Xã" :items="phuongXaList" item-title="name_with_type" item-value="code"
                        v-model="selectedPhuongXa" required></v-select>


                    <!-- Nút tạo khách hàng -->
                    <v-btn color="primary" type="submit">Tạo Khách Hàng</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import apiService from '@/services/apiService';
import { TINH_THANH } from '@/mapvn/tinhThanh';  // Đổi lại từ export const
import { QUAN_HUYEN } from '@/mapvn/quanHuyen';  // Đổi lại từ export const
import { PHUONG_XA } from '@/mapvn/phuongXa';   // Đổi lại từ export const
// Import danh sách phường xã

export default {
    data() {
        return {
            customers: [],  // Danh sách khách hàng
            newCustomer: {
                fullName: '',
                phoneNumber: '',
                email: '',
                address: '',
            },
            tinhThanhList: Object.values(TINH_THANH), // Dữ liệu tỉnh thành từ TINH_THANH
            quanHuyenList: [],  // Danh sách quận huyện sẽ cập nhật khi chọn tỉnh thành
            phuongXaList: [],
            selectedTinhThanh: null,  // Tỉnh thành đã chọn
            selectedQuanHuyen: null,  // Quận huyện đã chọn
            selectedPhuongXa: null,  // Phường xã đã chọn
        };
    },
    watch: {
        selectedTinhThanh(newValue) {
            this.quanHuyenList = Object.values(QUAN_HUYEN).filter(qh => qh.parent_code === newValue);
            this.selectedQuanHuyen = null;
            this.phuongXaList = [];
        },
        selectedQuanHuyen(newValue) {
            this.phuongXaList = Object.values(PHUONG_XA).filter(px => px.parent_code === newValue);
            this.selectedPhuongXa = null;
        }
    },
    methods: {
        // Lấy danh sách khách hàng từ API
        fetchCustomers() {
            apiService.getAllCustomers()
                .then(response => {
                    this.customers = response.data;
                })
                .catch(error => {
                    console.error('Lỗi khi lấy danh sách khách hàng:', error);
                });
        },

        // Tạo khách hàng mới
        createCustomer() {
            const address = this.phuongXaList.find(x => x.code === this.selectedPhuongXa).path_with_type;
            const newCustomerData = {
                ...this.newCustomer,
                address,
            };

            apiService.createCustomer(newCustomerData)
                .then(() => {
                    this.fetchCustomers();  // Cập nhật danh sách khách hàng sau khi tạo mới
                    alert('Tạo khách hàng thành công');
                })
                .catch(error => {
                    console.error('Lỗi khi tạo khách hàng:', error);
                });
        }
    },
    mounted() {
        this.fetchCustomers();  // Lấy danh sách khách hàng khi component được mount
    }
};
</script>

<style scoped>
/* Tuỳ chỉnh kích thước hoặc margin nếu cần */
</style>