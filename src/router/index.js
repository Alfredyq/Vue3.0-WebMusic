import { createRouter, createWebHashHistory } from 'vue-router'
import Recommend from '@/views/recommend'
import Search from '@/views/search'
import Singer from '@/views/singer'
import Toplist from '@/views/top-list'

const routes = [
  {
    path: '/',
    redirect: '/recommend'
    // name: 'Recommend',
    // component: Recommend
  },
  {
    path: '/recommend',
    name: 'Recommend',
    component: Recommend
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/singer',
    name: 'Singer',
    component: Singer
  },
  {
    path: '/top-list',
    name: 'Top-list',
    component: Toplist
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
