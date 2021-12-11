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
import { getSingerDetail } from '../service/singer'
import { processSongs } from '../service/song'
import MusicList from '../components/music-list/music-list'

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
    // 图片和title 都可以通过 props中的singer拿到，所以资源的获取写在计算属性中
    pic() {
      return this.singer && this.singer.pic
    },
    title() {
      return this.singer && this.singer.name
    }
  },
  async created() {
    const result = await getSingerDetail(this.singer)
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
