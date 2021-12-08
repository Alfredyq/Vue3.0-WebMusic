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
      this.$router.push({
        path: `/singer/${singer.mid}`
      })
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
