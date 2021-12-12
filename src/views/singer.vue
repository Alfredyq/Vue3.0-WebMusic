<template>
  <div class="singer" v-loading:[loadingText]="!singers.length">
    <index-list
      :data="singers"
      @select="selectSinger"
    ></index-list>
    <router-view :singer="selectedSinger"></router-view>
  </div>
</template>

<script>
import { getSingerList } from '../service/singer'
import IndexList from '../components/index-list/index-list'
import storage from 'good-storage'
import { SINGER_KEY } from '../assets/js/constant'

export default {
  name: 'singer',
  components: {
    IndexList
  },
  data() {
    return {
      singers: [],
      loadingText: '歌手资源载入中',
      selectedSinger: null
    }
  },
  async created() {
    const data = await getSingerList()
    const result = data.singers
    // console.log('SingerList: ')
    console.log(result)
    this.singers = result
  },
  methods: {
    selectSinger(singer) {
      console.log('点击事件')
      this.selectedSinger = singer
      this.cacheSinger(singer) // 缓存singer到sessionStorage中
      this.$router.push({
        path: `/singer/${singer.mid}`
      })
    },
    cacheSinger(singer) {
      storage.session.set(SINGER_KEY, singer) // 使用sessionStorage缓存数据
    }
  }
}
</script>

<style lang="scss" scoped>
  .singer {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
  }
</style>
