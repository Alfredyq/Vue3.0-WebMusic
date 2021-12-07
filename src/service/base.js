// 前端所有跟请求相关的代码都放在service目录下进行维护
// 本文件是对 axios.get函数 进行一层封装
import axios from 'axios'

// 这是开发环境的根目录，但发布到线上后根目录可能会变
const baseURL = '/'
const ERR_OK = 0

axios.defaults.baseURL = baseURL

export function get(url, params) {
  return axios.get(url, {
    params
  }).then((res) => {
    // 封装的主要是这一块：对标准的响应数据的结构做一层处理，实际上就是对错误码的封装(标准化的东西一般是可以拿来做封装的)
    const serverData = res.data
    // 这里也可以做一些其他错误码的扩展，跟后端约定传过来什么错误码就执行什么逻辑
    if (serverData.code === ERR_OK) {
      return serverData.result
    }
  }).catch((e) => {
    console.log(e)
  })
}
