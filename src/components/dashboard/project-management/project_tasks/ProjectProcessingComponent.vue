<template> 
    <v-container>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" md="8" lg="6">
          <v-card outlined class="pa-5">
            <v-row no-gutters>
              <!-- Cột cho hình ảnh -->
              <v-col cols="12" md="6" class="text-center">
                <v-img :src="projectImage" alt="Project Image" class="mb-2" max-width="250" />
              </v-col>
  
              <!-- Cột cho thông tin dự án -->
              <v-col cols="12" md="6">
                <v-card-title class="font-weight-bold text-center project-name">{{ projectName }}</v-card-title>
                <v-row justify="space-between" class="mt-4">
                  <!-- Trạng thái -->
                  <v-col cols="6" class="text-center">
                    <v-chip class="status-chip" color="primary" label>{{ projectStatus }}</v-chip>
                  </v-col>
  
                  <!-- Ngày kết thúc dự kiến -->
                  <v-col cols="6" class="text-center">
                    <v-chip class="end-date-chip" color="success" label>{{ formattedEndDate }}</v-chip>
                    <p class="end-date-label">Ngày kết thúc dự kiến</p>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
  
      <router-view :project-id="projectId" />
    </v-container>
  </template>
  
<script>
export default {
  props: {
    projectId: {
      type: String,
      required: true
    },
    projectImage: {
      type: String,
      required: true
    },
    projectName: {
      type: String,
      required: true
    },
    projectStatus: {
      type: String,
      required: true
    },
    projectExpectedEndDate: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedEndDate() {
      const date = new Date(this.projectExpectedEndDate);
      return date.toLocaleDateString('vi-VN'); // Định dạng ngày thành Ngày/Tháng/Năm
    }
  },
  methods: {
    goToDesign() {
      // Chuyển sang component "Design" và truyền projectId qua params
      this.$router.push({
        name: 'Design',
        params: {
          projectId: this.projectId
        }
      });
    }
  },
  mounted() {
    this.goToDesign()
    }
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

v-card {
  max-width: 100%;
  margin: 0 auto;
}

v-img {
  object-fit: cover;
}

.text-center {
  text-align: center;
}

.project-name {
  font-size: 24px; /* Tăng kích thước tên dự án */
}

.project-id {
  font-size: 16px;
}

.status-chip {
  font-size: 18px; /* Tăng kích thước trạng thái */
}

.end-date-label {
  font-size: 14px; /* Nhãn cho ngày kết thúc dự kiến */
  margin-bottom: 4px;
}

.end-date-chip {
  font-size: 18px; /* Tăng kích thước ngày kết thúc dự kiến */
}
</style>
