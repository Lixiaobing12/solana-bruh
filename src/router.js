import * as VueRouter from 'vue-router';
import home from '@/page/home.vue';

const routes = [
    { path: '/', component: home, name: "home" },
]

export const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes,
})