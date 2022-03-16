<!--    播放器页面   -->
<template>
  <div class="player" v-show="playList.length">
    <!--    JavaScript 钩子   -->
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player"
           v-show="fullScreen"
      >
        <div class="background">
          <img :src="currentSong.pic">
        </div>
        <div class="top">
          <div class="back"
               @click="goBack"
          >
            <i class="icon-back"></i>
          </div>
          <h1 class="title">{{ currentSong.name }}</h1>
          <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>
        <div class="middle"
             @touchstart.prevent="onMiddleTouchStart"
             @touchmove.prevent="onMiddleTouchMove"
             @touchend.prevent="onMiddleTouchEnd"
        >
          <!--  旋转 CD 视图  -->
          <div class="middle-l" :style="middleLStyle">
            <div class="cd-wrapper"
                 ref="cdWrapperRef"
            >
              <div class="cd" ref="cdRef">
                <img class="image"
                     ref="cdImageRef"
                     :class="cdCls"
                     :src="currentSong.pic"
                >
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!--  动态歌词视图  -->
          <scroll
            class="middle-r"
            ref="lyricScrollRef"
            :style="middleRStyle"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric" ref="lyricListRef">
                <p class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines"
                   :key="line.num"
                >
                  {{line.txt}}
                </p>
              </div>
              <!--  出现纯音乐没有歌词的情况  -->
              <div class="pure-music" v-show="pureMusicLyric">
                <p>{{pureMusicLyric}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <!--    歌曲当前播放进度（分秒）    -->
            <span class="time time-l">{{ formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
            <!--    监听 progress-bar emit传出来的两个事件 progress-changing 和 progress-changed   -->
              <progress-bar
                ref="barRef"
                :progress="progress"
                @progress-changing="onProgressChanging"
                @progress-changed="onProgressChanged"
              ></progress-bar>
            </div>
            <!--    歌曲完整播放长度（分秒）    -->
            <span class="time time-r">{{ formatTime(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="modeIcon" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev" ></i>
            </div>
            <div class="icon i-center" :class="disableCls">
            <!--  根据播放状态改变播放按钮  -->
              <i :class="playIcon" @click="togglePlay"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next" ></i>
            </div>
            <div class="icon i-right">
              <i :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <mini-player :progress="progress"
                 :toggle-play="togglePlay"
    ></mini-player>
    <audio ref="audioRef"
           @pause="pause"
           @canplay="ready"
           @error="error"
           @timeupdate="updateTime"
           @ended="end"
    ></audio>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref, nextTick } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import useCd from './use-cd'
import useLyric from './use-lyric'
import useMiddleInteractive from './use-middle-interactive'
import useAnimation from './use-animation'
import ProgressBar from './progress-bar'
import MiniPlayer from './mini-player'
import { formatTime } from '../../assets/js/util'
import { PLAY_MODE } from '../../assets/js/constant'
import Scroll from '../base/scroll/scroll'

export default {
  name: 'player',
  components: {
    ProgressBar,
    Scroll,
    MiniPlayer
  },
  setup() {
    /**  *************  data  *************  **/
    const audioRef = ref(null)
    const barRef = ref(null)
    const songReady = ref(false)
    const currentTime = ref(0) // 歌曲当前播放时长
    let progressChanging = false // 是否在拖动进度条

    /**  *************  vuex  *************  **/
    // 用 computed 是想让数据是响应式的
    const store = useStore()
    const fullScreen = computed(() => store.state.fullScreen)
    const currentSong = computed(() => store.getters.currentSong) // 当前播放曲目
    const playing = computed(() => store.state.playing) // 播放状态
    const currentIndex = computed(() => store.state.currentIndex)
    const playMode = computed(() => store.state.playMode)
    const playList = computed(() => store.state.playList)

    /**  *************  computed  *************  **/
    const playIcon = computed(() => {
      return playing.value ? 'icon-pause' : 'icon-play'
    })
    const disableCls = computed(() => {
      // 歌曲未准备好的时候不允许操作 上一首、下一首 和 暂停按钮
      return songReady.value ? '' : 'disable'
    })
    const progress = computed(() => {
      // 计算歌曲当前播放进度 0-1之间的小数
      // console.log(currentTime.value / currentSong.value.duration)
      return currentTime.value / currentSong.value.duration
    })

    /**  *************  hooks  *************  **/
    const { modeIcon, changeMode } = useMode()
    const { getFavoriteIcon, toggleFavorite } = useFavorite()
    const { cdCls, cdRef, cdImageRef } = useCd()
    const { currentLyric, currentLineNum, pureMusicLyric, playingLyric, lyricScrollRef, lyricListRef, playLyric, stopLyric } = useLyric({ songReady, currentTime })
    const { currentShow, middleLStyle, middleRStyle, onMiddleTouchStart, onMiddleTouchMove, onMiddleTouchEnd } = useMiddleInteractive()
    const { cdWrapperRef, enter, afterEnter, leave, afterLeave } = useAnimation()
    /**  *************  watch 监控  *************  **/
    // 监控 currentSong 的变化，如果发生变化就能拿到 newSong，然后改变 player 页面的值
    watch(currentSong, (newSong) => {
      if (!newSong.id || !newSong.url) {
        return
      }
      songReady.value = false // 每次切歌的时候，先把 songReady置为 false
      currentTime.value = 0 // 歌曲播放进度重置为0
      const audioEl = audioRef.value // 通过 audioRef 拿到 audio 的dom对象
      audioEl.src = newSong.url
      console.log('watch currentSong!')
      audioEl.play() // 通过 audio 元素内置方法，播放歌曲。等歌曲缓冲好会触发 canplay，将 songReady置为 true
      store.commit('setPlayingState', true)
    })

    watch(playing, (newPlaying) => {
      if (!songReady.value) {
        // 歌曲未准备好
        return
      }

      const audioEl = audioRef.value
      console.log('audio.pause()')
      if (newPlaying) {
        audioEl.play()
        playLyric()
      } else {
        audioEl.pause()
        stopLyric()
      }
    })

    watch(fullScreen, async (newFullScreen) => {
      if (newFullScreen) {
        // 因为数据更改，到 DOM 发生变化，是发生到下一个 tick 上的。setOffset()内部有对DOM进行获取的操作，所以要加上nextTick()
        await nextTick()
        barRef.value.setOffset(progress.value)
      }
    })
    /**  *************  自定义的方法 *************  **/
    function goBack() {
      console.log('click back!')
      store.commit('setFullScreen', false)
    }

    function togglePlay() {
      // 将 Vuex 中的播放状态取反
      store.commit('setPlayingState', !playing.value)
    }

    function pause() { // 因为电脑待机等等其他外界因素导致 audio元素自己触发了 audio.pause()，我们在这里也要对应的对数据进行改变
      // 关掉播放器
      store.commit('setPlayingState', false)
    }

    function prev() {
      const list = playList.value
      if (!songReady.value || !list.length) {
        // 如果列表为空，就啥也不做
        return
      }

      if (list.length === 1) {
        // 当前播放列表只有一首歌，那就单曲循环播放当前这首歌
        loop()
      } else {
        let index = currentIndex.value - 1
        if (index === -1) {
          // 如果当前播放的是第一首歌，就把索引放到播放列表的最后一首
          index = list.length - 1
        }
        // 提交数据
        store.commit('setCurrentIndex', index)
        // if (!playing.value) {
        //   // 如果当前是暂停状态，按下上一首按钮，则跳到上一首开始播放
        //   store.commit('setPlayingState', true)
        // }
      }
    }

    function next() {
      const list = playList.value
      if (!songReady.value || !list.length) {
        // 如果列表为空，就啥也不做
        return
      }

      if (list.length === 1) {
        // 当前播放列表只有一首歌，那就单曲循环播放当前这首歌
        loop()
      } else {
        let index = currentIndex.value + 1
        if (index === list.length) {
          // 如果播放的是最后一首歌曲，则从播放列表从头开始播放
          index = 0
        }
        // 提交数据
        store.commit('setCurrentIndex', index)
        // if (!playing.value) {
        //   // 如果当前是暂停状态，按下下一首按钮，则跳到下一首开始播放
        //   store.commit('setPlayingState', true)
        // }
      }
    }

    function loop() { // 单曲从头播放
      const audioEl = audioRef.value
      audioEl.currentTime = 0 // 设置当前播放时间为 0，也就是实现从头播放
      audioEl.play()
    }

    function ready() {
      if (songReady.value) {
        // 如果已经ready了，就直接返回
        return
      }
      songReady.value = true
      playLyric()
    }

    function error() {
      // 有时候歌曲加载有问题，可能无法播放，就不会触发canplay事件让songReady为true，反而会触发一个error事件
      // 但是 songReady为false时，不能切歌，所以在error事件中，将songReady置为true，使其能够切歌
      songReady.value = true
    }

    function end() { // audio元素播放完毕，根据播放模式选择是播放下一曲还是循环本首歌曲
      currentTime.value = 0
      if (playMode.value === PLAY_MODE.loop) {
        loop()
      } else {
        next()
      }
    }

    function updateTime(e) { // 根据 audio 播放的时候会不断触发 updateTime 事件，在这个事件中实时更新 currentTime
      if (!progressChanging) { // 进度条在被拖动的时候不改变 currentTime，因为此时是根据手的拖动来计算的
        currentTime.value = e.target.currentTime
        // console.log(formatTime(currentTime.value))
      }
    }

    function onProgressChanging(progress) { // 这里函数的参数都是从组件中 emit 传出来的事件的值
      progressChanging = true
      console.log('onProgressChanging: ' + progressChanging)
      currentTime.value = currentSong.value.duration * progress // 修改进度条前面的时间
      playLyric() // 拖动的时候更新 Lyric 的进度，因为 Lyric 的进度是根据 currentTime 来计算的
      stopLyric()
    }

    function onProgressChanged(progress) {
      // 拖动完毕，改变 audio元素的播放
      progressChanging = false
      console.log('onProgressChanged: ' + progressChanging)
      audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
      // if (!playing.value) {
      //   store.commit('setPlayingState', true)
      // }
      playLyric() // 更新 Lyric 的进度
      console.log('playing: ' + playing.value)
      if (!playing.value) { // 如果现在是暂停播放，则更新歌词位置后还要暂停歌词播放
        stopLyric()
      }
    }

    return {
      /**  data  **/
      currentTime,
      /**  ref  **/
      audioRef,
      barRef,
      /**  Vuex  **/
      fullScreen,
      currentSong,
      playing,
      currentIndex,
      playMode,
      playList,
      /**  computed  **/
      playIcon,
      disableCls,
      progress,
      /**  钩子函数  **/
      modeIcon,
      changeMode,
      getFavoriteIcon,
      toggleFavorite,
      // cd
      cdCls,
      cdRef,
      cdImageRef,
      // lyric
      currentLyric,
      currentLineNum,
      pureMusicLyric,
      playingLyric,
      lyricScrollRef,
      lyricListRef,
      // middle-interactive
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd,
      // animation
      cdWrapperRef,
      enter,
      afterEnter,
      leave,
      afterLeave,
      /**  function  **/
      goBack,
      togglePlay,
      pause,
      prev,
      next,
      ready,
      error,
      end,
      updateTime,
      formatTime,
      onProgressChanging,
      onProgressChanged
    }
  }
}
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed; // 因为想是全屏播放，所以设置成 fixed 布局
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);

      img {
        width: 100%;
        height: 100%;
      }
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
      }
      .icon-back {
        display: block;
        padding: 9px;
        font-size: $font-size-large-x;
        color: $color-theme;
        transform: rotate(-90deg);
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        //display: none;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            img {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
            .playing {
              animation: rotate 20s linear infinite // 20s 线性无限旋转
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 40px;
          line-height: 30px;
          width: 40px;
          &.time-l {
            text-align: left;
          }
          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
    &.normal-enter-active, &.normal-leave-active {
      transition: all .6s; // 过渡时间 0.6s，想看具体的过渡效果，可以将过渡时间改长一点
      .top, .bottom {
        transition: all .6s cubic-bezier(0.45, 0, 0.55, 1); // 贝塞尔曲线，让它有个不同的过渡动画效果
      }
    }
    &.normal-enter-from, &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0)
      }
    }
  }
}
</style>
