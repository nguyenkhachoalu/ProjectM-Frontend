<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
            <v-card-title>Cập nhật Trưởng phòng cho {{ teamName }}</v-card-title>
            <v-card-text>
                <v-select
                    v-model="selectedLeader"
                    :items="leaders"
                    label="Chọn Trưởng phòng mới"
                    item-title="fullName"
                    item-value="id"
                    variant="outlined"
                    :rules="[v => !!v || 'Vui lòng chọn Trưởng phòng']"
                />
            </v-card-text>
            <v-card-actions class="d-flex justify-space-between">
                <v-btn text @click="closeDialog">Hủy</v-btn>
                <v-btn color="primary" @click="updateTeamLeader" :disabled="!selectedLeader">Cập nhật</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,
        teamId: Number,
        teamName: String,
        currentLeaderId: Number, // ID của leader hiện tại
        leaders: Array
    },
    data() {
        return {
            dialog: this.modelValue,
            selectedLeader: this.currentLeaderId, // Set mặc định là leader hiện tại
        };
    },
    watch: {
        modelValue(val) {
            this.dialog = val;
        },
        dialog(val) {
            this.$emit('update:modelValue', val);
        },
        currentLeaderId(newLeaderId) {
            // Mỗi khi leader hiện tại thay đổi, cập nhật selectedLeader
            this.selectedLeader = newLeaderId;
        }
    },
    methods: {
        updateTeamLeader() {
            // Gửi event lên component cha để cập nhật leader mới
            this.$emit('update-team-leader', this.teamId, this.selectedLeader);
            this.closeDialog();
        },
        closeDialog() {
            this.dialog = false;
        }
    }
};
</script>
