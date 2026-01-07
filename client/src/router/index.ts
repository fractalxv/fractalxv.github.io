import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '/', component: () => import('../views/Home.vue') },
    { path: '/about', component: () => import('../views/About.vue') },
    { path: '/blog', component: () => import('../views/Blog.vue') },
    { path: '/blog/:slug', component: () => import('../views/BlogPost.vue') },
    { path: '/drawings', component: () => import('../views/Drawings.vue') },
    { path: '/admin', component: () => import('../views/Admin.vue') }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
