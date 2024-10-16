import { createRouter, createWebHistory } from 'vue-router';
import apiService from '@/services/apiService';
import Cookies from 'js-cookie';
import AuthForm from '../components/baseform/AuthForm.vue';
import DashboardForm from '../components/baseform/DashboardForm.vue';
import FirstPage from '../components/baseform/FirstPage.vue';
import Login from '../components/auth/Login.vue';
import Register from '../components/auth/Register.vue';
import Profile from '../components/auth/Profile.vue';
import ForgotPassword from '../components/auth/ForgotPassword.vue';
import UserComponent from '../components/dashboard/user-management/User.vue';
import DasboardComponent from '../components/dashboard/dashboard/dashboard.vue';
import TeamComponent from '../components/dashboard/team-management/Team.vue';
import ProjectComponent from '../components/dashboard/project-management/ProjectComponent.vue';
import UnauthorizedComponent from '../components/errors/Unauthorized.vue';
import SettingForm from '../components/baseform/SettingForm.vue';
import ProfileComponent from '../components/auth/Profile.vue';
import ProjectProcessingComponent from '../components/dashboard/project-management/project_tasks/ProjectProcessingComponent.vue';
import DesignComponent from '../components/dashboard/project-management/project_tasks/design/DesignComponent.vue';
import DeliveryComponent from '../components/dashboard/project-management/project_tasks/delivery/DeliveryComponent.vue';
import PrintComponent from '../components/dashboard/project-management/project_tasks/print/PrintComponent.vue';
import DetailPrintJobComponent from '../components/dashboard/project-management/project_tasks/print/DetailPrintJobComponent.vue';
import CustomerComponent from '../components/dashboard/customer-management/CustomerComponent.vue';
import DeliveryTaskComponent from '../components/dashboard/project-management/project_tasks/delivery/DeliveryTaskComponent.vue';
const routes = [
  {
    path: '/',
    name: 'FirstPage',
    component: FirstPage,
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '/auth',
    component: AuthForm,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
      },
      {
        path: 'forgotpassword',
        name: 'ForgotPassword',
        component: ForgotPassword,
      },
    ],
  },
  {
    path: '/dashboard-form',
    component: DashboardForm,
    children: [
      {
        path: 'dashboard',
        name: 'Dasboard',
        component: DasboardComponent,
      },
      {
        path: 'project-processing/:projectId/:projectImage/:projectName/:projectStatus/:projectExpectedEndDate',
        name: 'ProjectProcessing',
        component: ProjectProcessingComponent,
        props: route => ({
          projectId: route.params.projectId,
          projectImage: route.params.projectImage,
          projectName: route.params.projectName,
          projectStatus: route.params.projectStatus,
          projectExpectedEndDate: route.params.projectExpectedEndDate
        }),
        children: [
          {
            path: 'design',
            name: 'Design',
            component: DesignComponent,
            props: true
          },
          {
            path: 'print/:designId',
            name: 'Print',
            component: PrintComponent,
            props: true,
          },
          {
            path: 'print-job/:printJobId/:printJobStatus', // Đường dẫn đến DetailPrintJobComponent
            name: 'DetailPrintJob',
            component: DetailPrintJobComponent,
            props: (route) => ({
              printJobId: Number(route.params.printJobId),
              printJobStatus: String(route.params.printJobStatus),
            }),
          },
        ]
      },
      {
        path: 'delivery',
        name: 'Delivery',
        component: DeliveryComponent,
        beforeEnter: (to, from, next) => {
          if (apiService.checkAdminOrManagerPermission()) {
            next(); // Nếu có quyền Admin, cho phép truy cập
          } else {
            next('/unauthorized'); // Nếu không có quyền, chuyển hướng
          }
        }
      },
      {
        path: 'delivery-task',
        name: 'Delivery Task',
        component: DeliveryTaskComponent,
      },
      {
        path: 'customer',
        name: 'Customer',
        component: CustomerComponent,
      },
      {
        path: 'user',
        name: 'User',
        component: UserComponent,
      },
      {
        path: 'project',
        name: 'Project',
        component: ProjectComponent,
      },
      {
        path: 'team',
        name: 'Team',
        component: TeamComponent,
        beforeEnter: (to, from, next) => {
          if (apiService.checkAdminPermission()) {
            next(); // Nếu có quyền Admin, cho phép truy cập
          } else {
            next('/unauthorized'); // Nếu không có quyền, chuyển hướng
          }
        }
      },
    ],
  },
  
  {
    path: '/setting',
    component: SettingForm,
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileComponent,
      },

    ],
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const token = Cookies.get('accessToken');

  // Các trang auth có thể truy cập mà không cần login
  const publicPages = ['/auth/login', '/auth/register', '/auth/forgotpassword'];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !token) {
    return next('/auth/login'); // Nếu chưa login, chuyển hướng về trang login
  }
  if (to.name === 'Unauthorized') {
    return next(); // Cho phép điều hướng tới Unauthorized
  }
  next(); // Cho phép truy cập nếu đã đăng nhập hoặc truy cập vào trang public
});
export default router;
