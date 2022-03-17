import { createRouter, createWebHashHistory } from 'vue-router'

// import Recommend from '@/views/recommend'
// import Search from '@/views/search'
// import Singer from '@/views/singer'
// import TopList from '@/views/top-list'
// import SingerDetail from '@/views/singer-detail'
// import Album from '@/views/album'
// import TopDetail from '@/views/top-detail'
// import UserCenter from '@/views/user-center'

// import() 函数在 ES2020 提案中引入，可以异步动态加载模块 里面的/* */写法是一种叫做魔术注释的方式
const Recommend = () => import('@/views/recommend'/* webpackChunkName: "recommend" */)
const Singer = () => import('@/views/singer'/* webpackChunkName: "singer" */)
const TopList = () => import('@/views/top-list'/* webpackChunkName: "top-list" */)
const Search = () => import('@/views/search'/* webpackChunkName: "search" */)
const SingerDetail = () => import('@/views/singer-detail'/* webpackChunkName: "singer-detail" */)
const Album = () => import('@/views/album'/* webpackChunkName: "album" */)
const TopDetail = () => import('@/views/top-detail'/* webpackChunkName: "top-detail" */)
const UserCenter = () => import('@/views/user-center'/* webpackChunkName: "user-center" */)

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
    component: Recommend,
    children: [
      {
        path: ':id',
        component: Album
      }
    ]
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
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
    component: TopList,
    children: [
      {
        path: ':id',
        component: TopDetail
      }
    ]
  },
  {
    path: '/user',
    components: {
      user: UserCenter
    }
    // component: UserCenter
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
