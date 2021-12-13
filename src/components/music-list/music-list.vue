<template>
  <div class="music-list">
    <div class="back"
         @click="goBack"
    >
      <i class="icon-back"></i>
    </div>
    <h1 class="title">{{ title }}</h1>
    <div class="bg-image"
         :style="bgImageStyle"
         ref="bgImage"
    >
      <div class="play-btn-wrapper"
           :style="playBtnStyle"
      >
        <div class="play-btn"
             v-show="songs.length > 0"
             @click="random"
        >
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <!--  图片上面设置一层半透明层   -->
      <div class="filter"
           :style="filterStyle"
      ></div>
    </div>
    <!--  probe-type：派发 scroll事件。设置为3的时候，任何时候都派发 scroll 事件   -->
    <scroll class="list"
            :style="scrollStyle"
            v-loading="loading"
            v-no-result:[noResultText]="noResult"
            :probe-type="3"
            @scroll="onScroll"
    >
      <div class="song-list-wrapper">
<!--        调用song-list的地方就能监听到 song-list 传出来的 selectItem 事件，这里的 select是 song-list自定义的 emit派发事件，名字必须保持一致-->
        <song-list :songs="songs"
                   @selected="selectItem"
        ></song-list>
      </div>
    </scroll>
  </div>
</template>

<script>
import Scroll from '../base/scroll/scroll'
import SongList from '../base/song-list/song-list'
import { mapActions } from 'vuex' // Vuex的语法糖，https://vuex.vuejs.org/zh/guide/actions.html#%E5%9C%A8%E7%BB%84%E4%BB%B6%E4%B8%AD%E5%88%86%E5%8F%91-action

const RESERVED_HEIGHT = 40 // 设置一个高度常量，歌手的歌单列表最多升到离页面顶端40px位置处

export default {
  name: 'music-list',
  components: {
    Scroll,
    SongList
  },
  props: {
    songs: {
      type: Array,
      default() {
        return []
      }
    },
    title: String,
    pic: String, // 背景图片
    loading: Boolean,
    noResultText: {
      type: String,
      default: '抱歉，没有找到可播放的歌曲'
    }
  },
  data() {
    return {
      imageHeight: 0,
      scrollY: 0, // 歌单列表滚动的Y值距离，向上为正，向下为负
      maxTranslateY: 0 // 歌手的歌单列表最大能滚动的距离
    }
  },
  methods: {
    goBack() {
      // 回退方法，很简单就能实现
      this.$router.back()
    },
    onScroll(pos) {
      this.scrollY = -pos.y // 因为y值是一个正值
    },
    // 拿到 song-list 组件传过来的数据
    selectItem({ song, index }) {
      // 在这里就可以派发一个Action
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random() {
      this.randomPlay(this.songs)
    },
    // 语法糖 mapActions 辅助函数将组件的 methods 映射为 store.dispatch 调用
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  computed: {
    noResult() {
      // 当loading加载完毕，且获取的数据长度为0，返回true，触发no-result指令
      return !this.loading && !this.songs.length
    },
    bgImageStyle() {
      // 根据歌单列表的拖拽情况，实时调整背景图片的样式
      const scrollY = this.scrollY
      let zIndex = 0
      let paddingTop = '70%'
      let height = 0
      let translateZ = 0 // 解决ios移动端问题，这个样式等于z-index

      // 歌单列表滚动的距离超过最大滚动距离后
      if (scrollY > this.maxTranslateY) {
        zIndex = 10
        paddingTop = 0
        height = `${RESERVED_HEIGHT}px` // 可以写成固定40px，但不够优雅
        translateZ = 1
      }

      // 向下拉歌单列表时
      let scale = 1
      if (scrollY < 0) {
        scale = 1 + Math.abs(scrollY / this.imageHeight)
      }

      return {
        zIndex,
        paddingTop,
        height,
        backgroundImage: `url(${this.pic})`,
        transform: `scale(${scale})translateZ(${translateZ}px)`
      }
    },
    playBtnStyle() {
      let display = ''
      if (this.scrollY >= this.maxTranslateY) {
        // 歌曲列表滚动到最上方的时候，随机播放按钮不显示
        display = 'none'
      }
      return {
        display
      }
    },
    scrollStyle() {
      return {
        top: `${this.imageHeight}px` // 根据图片的高度，设置歌单列表离顶部的距离
      }
    },
    filterStyle() {
      // 设置背景图片的高斯模糊效果，blur值越大，图片越模糊
      let blur = 0
      const scrollY = this.scrollY
      const imageHeight = this.imageHeight
      if (scrollY >= 0) {
        // 因为图片推到最高，高斯模糊效果应该达到最大，所以应该设置一个最大值，那就是当图片推到最高时
        blur = Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) * 20
      }
      return {
        backdropFilter: `blur(${blur}px)`
      }
    }
  },
  mounted () {
    // 获取class为bg-image的div高度
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT
  }
}
</script>

<style lang="scss" scoped>
.music-list {
  position: relative;
  height: 100%;
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 20;
    transform: translateZ(2px);
    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }
  .title {
    position: absolute;
    top: 0;
    left: 10%;
    width: 80%;
    z-index: 20;
    transform: translateZ(2px);
    @include no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }
  .bg-image {
    position: relative;
    width: 100%;
    transform-origin: top;
    background-size: cover;
    .play-btn-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 10;
      width: 100%;
      .play-btn {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;
      }
      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
        font-size: $font-size-medium-x;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: $font-size-small;
      }
    }
    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }
  .list {
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 0;
    .song-list-wrapper {
      padding: 20px 30px;
      background: $color-background;
    }
  }
}
</style>
