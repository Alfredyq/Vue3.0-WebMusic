import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import LazyPlugin from 'vue3-lazy'
import loadingDirective from './components/base/loading/directive'
import noResultDirective from './components/base/no-result/directive'
import { load, saveAll } from '@/assets/js/array-store'
import { FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constant'
import { processSongs } from '@/service/song'

// 引入全局样式文件
import '@/assets/scss/index.scss'

// 从本地缓存中加载 favoriteSongs，然后更新所有歌曲的 url
const favoriteSongs = load(FAVORITE_KEY)
if (favoriteSongs.length > 0) {
  processSongs(favoriteSongs).then((songs) => {
    store.commit('setFavoriteList', songs)
    saveAll(songs, FAVORITE_KEY)
  })
}

// 同理，更新所有 historySongs 的 url
const historySongs = load(PLAY_KEY)
if (historySongs.length > 0) {
  processSongs(historySongs).then((songs) => {
    store.commit('setPlayHistory', songs) // 保存到 store 中
    saveAll(songs, PLAY_KEY) // 保存到 localStorage 中
  })
}

/** *********** 版本一 *********** **/
// createApp(App).use(store).use(router).mount('#app')

/** *********** 版本二 *********** **/
// 引入lazy-load插件，全局注册了一个v-lazy指令，使用的时候把 v-bind:src="..." 改成 v-lazy="..."
// createApp(App).use(store).use(router).use(LazyPlugin, {
//   loading: require('../src/assets/imag/img.png')
// }).mount('#app')

/** *********** 版本三 *********** **/
// 在当前app下，全局注册 loadingDirective，那么在这个app内所有的组件都可以使用自定义的 v-loading 指令
// createApp(App).use(store).use(router).use(LazyPlugin, {
//   loading: require('../src/assets/imag/img.png')
// }).directive('loading', loadingDirective).mount('#app')

/** *********** 版本四 *********** **/
// 在版本三基础上，添加 v-no-result 指令
createApp(App).use(store).use(router).use(LazyPlugin, {
  loading: require('../src/assets/imag/img.png')
}).directive('loading', loadingDirective).directive('no-result', noResultDirective).mount('#app')
