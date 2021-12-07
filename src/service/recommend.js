import { get } from './base.js'

// 封装前端请求函数
// 前端通过这里的get发送请求，然后到Node后端(router.js)对请求进行代理
export function getRecommend() {
  // 这里的 url 必须和 router.js 里面后端代理的路由接口的 url 一致
  return get('/api/getRecommend')
}
