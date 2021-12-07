import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import LazyPlugin from 'vue3-lazy'
import loadingDirective from './components/base/loading/directive'

// 引入全局样式文件
import '@/assets/scss/index.scss'

/** *********** 版本一 *********** **/
// createApp(App).use(store).use(router).mount('#app')

/** *********** 版本二 *********** **/
// 引入lazy-load插件，全局注册了一个v-lazy指令，使用的时候把 v-bind:src="..." 改成 v-lazy="..."
// createApp(App).use(store).use(router).use(LazyPlugin, {
//   loading: require('../src/assets/imag/img.png')
// }).mount('#app')

/** *********** 版本三 *********** **/
// 在当前app下，全局注册 loadingDirective，那么在这个app内所有的组件都可以使用自定义的 v-loading 指令
createApp(App).use(store).use(router).use(LazyPlugin, {
  loading: require('../src/assets/imag/img.png')
}).directive('loading', loadingDirective).mount('#app')
