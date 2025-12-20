import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/post/:id',
      name: 'post',
      component: () => import('../views/PostView.vue'),
      meta: { title: '文章详情' },
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/CategoriesView.vue'),
      meta: { title: '分类' },
    },
    {
      path: '/category/:name',
      name: 'category',
      component: () => import('../views/CategoryView.vue'),
      meta: { title: '分类文章' },
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('../views/TagsView.vue'),
      meta: { title: '标签' },
    },
    {
      path: '/tag/:name',
      name: 'tag',
      component: () => import('../views/TagView.vue'),
      meta: { title: '标签文章' },
    },
    {
      path: '/archive',
      name: 'archive',
      component: () => import('../views/ArchiveView.vue'),
      meta: { title: '归档' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: '关于' },
    },
    // 管理员路由
    {
      path: '/admin',
      name: 'admin-login',
      component: () => import('../views/AdminLogin.vue'),
      meta: { title: '管理员登录', hideLayout: true },
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/AdminView.vue'),
      meta: { title: '管理面板', requiresAuth: true, hideLayout: true },
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - bug毁灭者` : 'bug毁灭者'

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const { checkSession } = useAuth()
    if (!checkSession()) {
      // 未登录，重定向到登录页
      next({ name: 'admin-login' })
      return
    }
  }

  // 如果已登录，访问登录页，重定向到管理面板
  if (to.name === 'admin-login') {
    const { checkSession } = useAuth()
    if (checkSession()) {
      next({ name: 'admin-dashboard' })
      return
    }
  }

  next()
})

export default router
