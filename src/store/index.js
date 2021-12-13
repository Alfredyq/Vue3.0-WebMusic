// Logger插件，支持开发环境下查看提交的状态。
import { createStore, createLogger } from 'vuex'
import state from './state'
import mutations from './mutations'
import * as getters from './getters'
import * as actions from './actions'

// 判断当前是否是开发环境。 process.env.NODE_ENV 有两种状态：development(开发) 和 production(生产/线上)
const debug = process.env.NODE_ENV !== 'production'

export default createStore({
  state,
  getters,
  mutations,
  actions,
  strict: debug, // 严格模式，帮助检查 state 的修改是否是在提交 mutations 的时候。因为开启 strict，就会深度 watch state的变化，如果不是的话，就会发出警告
  plugins: debug ? [createLogger()] : [] // 因为 plugins是一个数组，所以要用[]将插件包起来

  // 因为我们这是一个中型复杂项目，所以不在这里填充这些属性，而是拆分成一个个文件
  // state: {
  // },
  // mutations: {
  // },
  // actions: {
  // },
  // modules: {
  // }
})
