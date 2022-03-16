<template>
  <div class="singer-detail">
    <music-list
         :songs="songs"
         :pic="pic"
         :title="title"
         :loading="loading"
    ></music-list>
  </div>
</template>

<script>
import MusicList from '../components/music-list/music-list'
import storage from 'good-storage'
import { getSingerDetail } from '../service/singer'
import { processSongs } from '../service/song'
import { SINGER_KEY } from '../assets/js/constant'

// 写法一 与album.vue中业务代码类似，所以对类似代码做了抽离
// export default createDetailComponent('singer-detail', SINGER_KEY, getSingerDetail)

// 写法二
export default {
  name: 'singer-detail',
  components: {
    MusicList
  },
  props: {
    singer: Object
  },
  data() {
    return {
      songs: [],
      loading: true
    }
  },
  computed: {
    computedSinger() {
      let ret = null
      const singer = this.singer
      if (singer) {
        // 如果有传进来的props的singer，那就优先使用props数据
        ret = singer
      } else {
        // 没传进来的props数据
        const cachedSinger = storage.session.get(SINGER_KEY)
        if (cachedSinger && cachedSinger.mid === this.$route.params.id) {
          // 且缓存的mid和当前页面路由的path的id相同，那么说明就是当前页面的刷新
          ret = cachedSinger
        }
      }
      return ret
    },
    // 图片和title 都可以通过 props中的singer拿到，所以资源的获取写在计算属性中
    pic() {
      // return this.singer && this.singer.pic
      // 改用计算属性的singer
      const singer = this.computedSinger
      return singer && singer.pic
    },
    title() {
      // return this.singer && this.singer.name
      // 改用计算属性的singer
      const singer = this.computedSinger
      return singer && singer.name
    }
  },
  async created() {
    if (!this.computedSinger) {
      // 如果没拿到当前页面的singer值的话，就不执行下面的数据获取逻辑，直接回退到父级路由
      const path = this.$route.matched[0].path // 获取一级路由的path
      console.log(this.$route)
      this.$router.push({
        path
      })
      return
    }
    const result = await getSingerDetail(this.computedSinger)
    this.songs = await processSongs(result.songs)
    this.loading = false // 数据加载完成，就将loading取消。通过props传给music-list组件
    console.log(this.songs)
  }
}
</script>

<style lang="scss" scoped>
.singer-detail {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;
}
</style>
