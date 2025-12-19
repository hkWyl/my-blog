import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  ],
})

// 路由守卫：设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - bug毁灭者` : 'bug毁灭者'
  next()
})

export default router
