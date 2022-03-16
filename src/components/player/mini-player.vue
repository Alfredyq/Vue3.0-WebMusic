<!--  底部小播放器  -->
<template>
  <transition name="mini">
    <div class="mini-player"
         v-show="!fullScreen"
         @click="showNormalPlayer"
    >
      <!--    mini-player 中的 mini-CD   -->
      <div class="cd-wrapper">
        <div class="cd" ref="cdRef">
          <img :class="cdCls"
               width="40"
               height="40"
               :src="currentSong.pic"
               ref="cdImageRef"
          >
        </div>
      </div>
      <div class="slider-wrapper" ref="sliderWrapperRef">
        <div class="slider-group">
          <div class="slider-page"
               v-for="song in playlist"
               :key="song.id"
          >
            <h2 class="name">{{song.name}}</h2>
            <p class="desc">{{song.singer}}</p>
          </div>
        </div>
      </div>
      <div class="control">
        <progress-circle
            :radius="32"
            :progress="progress"
        >
          <i class="icon-mini"
             :class="miniPlayIcon"
             @click.stop="togglePlay"
          ></i>
        </progress-circle>
      </div>
      <div class="control" @click.stop="showPlaylist">
        <i class="icon-playlist"></i>
      </div>
      <playlist ref="playlistRef"></playlist>
    </div>
  </transition>
</template>

<script>
  import { useStore } from 'vuex'
  import { computed, ref } from 'vue'
  import useCd from './use-cd'
  import ProgressCircle from './progress-circle'
  import useMiniSlider from './use-mini-slider'
  import Playlist from './playlist'

  export default {
    name: 'mini-player',
    components: {
      Playlist,
      ProgressCircle
    },
    // 父组件传进来的值，可以是参数也可以是函数
    props: {
      progress: {
        type: Number,
        default: 0
      },
      togglePlay: Function
    },
    setup() {
      const playlistRef = ref(null)

      /**  *************  vuex  *************  **/
      const store = useStore()
      const fullScreen = computed(() => store.state.fullScreen)
      const currentSong = computed(() => store.getters.currentSong)
      const playing = computed(() => store.state.playing)
      const playlist = computed(() => {
          console.log('playlist: ')
          console.log(playlist)
          return store.state.playList
        }
      )

      /**  *************  hooks  *************  **/
      const { cdCls, cdRef, cdImageRef } = useCd() // 让 mini-cd旋转
      const { sliderWrapperRef } = useMiniSlider() // mini-player 手指滑动切歌

      const miniPlayIcon = computed(() => {
        return playing.value ? 'icon-pause-mini' : 'icon-play-mini'
      })

      function showNormalPlayer() {
        store.commit('setFullScreen', true)
      }

      function showPlaylist() {
        playlistRef.value.show()
      }

      return {
        playlistRef,
        fullScreen,
        currentSong,
        playlist,
        miniPlayIcon,
        showNormalPlayer,
        showPlaylist,
        // cd
        cdCls,
        cdRef,
        cdImageRef,
        // mini-slider
        sliderWrapperRef
      }
    }
  }
</script>

<style lang="scss" scoped>
  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;
    .cd-wrapper {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;
      .cd {
        height: 100%;
        width: 100%;
        img {
          border-radius: 50%;
          &.playing {
            animation: rotate 10s linear infinite;
          }
          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }
    .slider-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .slider-group {
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        .slider-page {
          display: inline-block;
          width: 100%;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          .name {
            margin-bottom: 2px;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text;
          }
          .desc {
            @include no-wrap();
            font-size: $font-size-small;
            color: $color-text-d;
          }
        }
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-playlist {
        position: relative;
        top: -2px;
        font-size: 28px;
        color: $color-theme-d;
      }
      .icon-mini {
        position: absolute;
        left: 0;
        top: 0;
        color: $color-theme-d;
        font-size: 32px;
      }
    }
    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1); // 动画时长
    }
    &.mini-enter-from, &.mini-leave-to {
      opacity: 0;
      transform: translate3d(0, 100%, 0) // Y轴有百分之百的位移
    }
  }
</style>
