import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/pages/LandingPage.vue';
import { getToken } from '@/utils/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/admin/Dashboard.vue')
        },
        {
          path: 'batch',
          name: 'batch',
          component: () => import('@/views/admin/BatchList.vue')
        },
        {
          path: 'system',
          name: 'system',
          component: () => import('@/views/admin/System.vue')
        }
      ]
    }
  ]
});

// 路由守卫:需要 auth 的路由,无 token 跳首页(本次不做登录页)
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !getToken()) {
    next('/');
  } else {
    next();
  }
});

export default router;
