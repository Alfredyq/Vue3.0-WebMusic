<!--  播放列表  -->
<template>
  <teleport to="body">
<!--    控制整个列表的过渡效果-->
    <transition name="list-fade">
      <div
        class="playlist"
        v-show="visible && playlist.length"
        @click="hide"
      >
        <!--    包裹的内容层，@click.stop 阻止冒泡   -->
        <div class="list-wrapper" @click.stop>
          <div class="list-header">
            <h1 class="title">
              <i
                class="icon"
                :class="modeIcon"
                @click="changeMode"
              >
              </i>
              <span class="text">{{modeText}}</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
          </div>
          <scroll
            ref="scrollRef"
            class="list-content"
          >
            <transition-group
              ref="listRef"
              name="list"
              tag="ul"
            >
              <li
                class="item"
                v-for="song in sequenceList"
                :key="song.id"
                @click="selectItem(song)"
              >
                <i
                  class="current"
                  :class="getCurrentIcon(song)"
                ></i>
                <span class="text">{{song.name}}</span>
                <span class="favorite" @click.stop="toggleFavorite(song)">
                  <i :class="getFavoriteIcon(song)"></i>
                </span>
                <span
                  class="delete"
                  @click.stop="removeSong(song)"
                  :class="{'disable': removing}"
                >
                  <i class="icon-delete"></i>
                </span>
              </li>
            </transition-group>
          </scroll>
          <div class="list-add">
            <!--  click点击，展示出 addSong 页面  -->
            <div class="add" @click="showAddSong">
              <i class="icon-add"></i>
              <span class="text">添加歌曲到队列</span>
            </div>
          </div>
          <div class="list-footer" @click="hide">
            <span>关闭</span>
          </div>
        </div>
        <!--  删除歌曲的确认弹窗组件   -->
        <confirm
          ref="confirmRef"
          @confirm="confirmClear"
          text="是否清空播放列表？"
          confirm-btn-text="清空"
        ></confirm>
        <add-song ref="addSongRef"></add-song>
      </div>
    </transition>
  </teleport>
</template>

<script>
  import Scroll from '@/components/base/scroll/scroll'
  import Confirm from '@/components/base/confirm/confirm'
  import AddSong from '@/components/add-song/add-song'
  import { ref, computed, nextTick, watch } from 'vue'
  import { useStore } from 'vuex'
  import useMode from './use-mode'
  import useFavorite from './use-favorite'

  export default {
    name: 'playlist',
    components: {
      AddSong,
      Confirm,
      Scroll
    },
    setup() {
      const visible = ref(false)
      const removing = ref(false)
      const scrollRef = ref(null)
      const listRef = ref(null)
      const confirmRef = ref(null)
      const addSongRef = ref(null)

      const store = useStore()
      const playlist = computed(() => store.state.playList)
      const sequenceList = computed(() => store.state.sequenceList)
      const currentSong = computed(() => store.getters.currentSong)

      const { modeIcon, modeText, changeMode } = useMode()
      const { getFavoriteIcon, toggleFavorite } = useFavorite()

      // 观测 currentSong 是否发生变化，然后将播放列表的 scroll 滚动到对应的位置
      watch(currentSong, async (newSong) => {
        // 播放列表是否可见
        if (!visible.value || !newSong.id) {
          return
        }
        await nextTick()
        scrollToCurrent()
      })

      function getCurrentIcon(song) {
        if (song.id === currentSong.value.id) {
          return 'icon-play'
        }
      }

      async function show() {
        visible.value = true

        // 为什么要在 nextTick 后进行刷新，因为这里数据刚变，但 dom 的改变发生在一个 nextTick 后，
        // 而 refresh 依赖改变后的 dom，所以要在 refresh 前加一个 nextTick，等待渲染好的 DOM
        await nextTick()
        refreshScroll()
        scrollToCurrent()
      }

      function hide() {
        visible.value = false
      }

      // 根据点击的歌曲修改 currentIndex ，因为 currentSong 也是根据 currentIndex 来修改的
      function selectItem(song) {
        const index = playlist.value.findIndex((item) => {
          return song.id === item.id
        })

        store.commit('setCurrentIndex', index)
        store.commit('setPlayingState', true)
      }

      // 拿到 scroll 实例，
      function refreshScroll() {
        // scrollRef.value.scroll 就是 BetterScroll 对象
        scrollRef.value.scroll.refresh()
      }

      // 滚动到当前播放的歌曲，利用 BetterScroll 的 scrollToElement 方法，可以滚动到对应的 DOM 元素上
      function scrollToCurrent() {
        // 根据 currentSong 去遍历播放列表，找到当前歌曲在播放列表中的 索引值
        const index = sequenceList.value.findIndex((song) => {
          return currentSong.value.id === song.id
        })
        if (index === -1) {
          return
        }
        const target = listRef.value.$el.children[index]

        scrollRef.value.scroll.scrollToElement(target, 300)
      }

      // 根据当前选中的 song，从播放列表中删除。
      function removeSong(song) {
        if (removing.value) {
          return
        }
        removing.value = true
        store.dispatch('removeSong', song)
        if (!playlist.value.length) {
          hide()
        }
        setTimeout(() => {
          removing.value = false
        }, 300)
      }

      function showConfirm() {
        // 调用 confirm 组件内部的 show 方法，改变 confirm 组件是否能被看见
        confirmRef.value.show()
      }

      // 清空所有歌曲
      function confirmClear() {
        store.dispatch('clearSongList')
        hide()
      }

      function showAddSong() {
        addSongRef.value.show()
      }

      return {
        visible,
        removing,
        scrollRef,
        listRef,
        confirmRef,
        addSongRef,
        playlist,
        sequenceList,
        getCurrentIcon,
        show,
        hide,
        selectItem,
        removeSong,
        showConfirm,
        confirmClear,
        showAddSong,
        // mode
        modeIcon,
        modeText,
        changeMode,
        // favorite
        getFavoriteIcon,
        toggleFavorite
      }
    }
  }
</script>

<style lang="scss" scoped>
  .playlist {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    background-color: $color-background-d;
    &.list-fade-enter-active, &.list-fade-leave-active {
      transition: opacity .3s;
      .list-wrapper {
        transition: all .3s;
      }
    }
    &.list-fade-enter-from, &.list-fade-leave-to {
      opacity: 0;
      .list-wrapper {
        transform: translate3d(0, 100%, 0);
      }
    }
    .list-wrapper {
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 210;
      width: 100%;
      background-color: $color-highlight-background;
      .list-header {
        position: relative;
        padding: 20px 30px 10px 20px;
        .title {
          display: flex;
          align-items: center;
          .icon {
            margin-right: 10px;
            font-size: 24px;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
          .clear {
            @include extend-click();
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
      .list-content {
        max-height: 240px;
        overflow: hidden;
        .item {
          display: flex;
          align-items: center;
          height: 40px;
          padding: 0 30px 0 20px;
          overflow: hidden;
          .current {
            flex: 0 0 20px;
            width: 20px;
            font-size: $font-size-small;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text-d;
          }
          .favorite {
            @include extend-click();
            margin-right: 15px;
            font-size: $font-size-small;
            color: $color-theme;
            .icon-favorite {
              color: $color-sub-theme;
            }
          }
          .delete {
            @include extend-click();
            font-size: $font-size-small;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
          }
        }
      }
      .list-add {
        width: 140px;
        margin: 20px auto 30px auto;
        .add {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border: 1px solid $color-text-l;
          border-radius: 100px;
          color: $color-text-l;
          .icon-add {
            margin-right: 5px;
            font-size: $font-size-small-s;
          }
          .text {
            font-size: $font-size-small;
          }
        }
      }
      .list-footer {
        text-align: center;
        line-height: 50px;
        background: $color-background;
        font-size: $font-size-medium-x;
        color: $color-text-l;
      }
    }
  }
</style>
