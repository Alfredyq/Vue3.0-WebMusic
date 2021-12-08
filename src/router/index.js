import { createRouter, createWebHashHistory } from 'vue-router'
import Recommend from '@/views/recommend'
import Search from '@/views/search'
import Singer from '@/views/singer'
import TopList from '@/views/top-list'
import SingerDetail from '@/views/singer-detail'

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
    component: Singer,
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/top-list',
    name: 'Top-list',
    component: TopList
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
