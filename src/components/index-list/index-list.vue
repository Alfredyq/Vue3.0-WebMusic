<!--    歌手列表    -->
<template>
  <scroll
    class="index-list"
    :probe-type="3"
    @scroll="onScroll"
    ref="scrollRef"
  >
    <ul ref="groupRef">
      <li
        v-for="group in data"
        :key="group.title"
        class="group"
      >
        <h2 class="title">{{group.title}}</h2>
        <ul>
          <li
            v-for="item in group.list"
            :key="item.id"
            class="item"
            @click="onItemClick(item)"
          >
            <img class="avatar" v-lazy="item.pic">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="fixed"
         v-show="fixedTitle"
         :style="fixedStyle"
    >
      <div class="fixed-title">{{ fixedTitle }}</div>
    </div>
    <!--    shortcut：捷径，快捷方式；screen shot：截屏   -->
    <!--    歌手页面侧边导航入口    -->
    <!--
      事件委托，只把事件绑定到父级元素上。绑定的事件更少，性能更好
      在事件的钩子函数中，我们也可以通过event对象拿到target，也就是拿到具体是哪个el元素触发的事件，
      然后根据索引，滚动到对应位置就好了。 阻止三个事件的冒泡
    -->
    <div class="shortcut"
         @touchstart.stop.prevent = 'onShortcutTouchStart'
         @touchmove.stop.prevent = 'onShortcutTouchMove'
         @touchend.stop.prevent
    >
      <ul>
        <li class="item"
            v-for="(item, index) in shortcutList"
            :key="item"
            :data-index="index"
            :class="{ 'current':currentIndex === index}"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </scroll>
</template>

<script>
// import Scroll from '../base/scroll/scroll'
import Scroll from '../wrap-scroll'
import useFixed from './use-fixed'
import useShortcut from './use-shortcut'

export default {
  name: 'index-list',
  components: {
    Scroll
  },
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const { groupRef, onScroll, fixedTitle, fixedStyle, currentIndex } = useFixed(props)
    const { shortcutList, scrollRef, onShortcutTouchStart, onShortcutTouchMove } = useShortcut(props, groupRef)

    function onItemClick(item) {
      console.log('歌手已点击')
      // 通过emit方法，定义一个自定义事件，歌手页面点击选择某位歌手，将数据派发给外面
      emit('select', item) // 这个item就是一个singer
    }

    return {
      onItemClick,
      // fixed 钩子返回的
      groupRef,
      onScroll,
      fixedTitle,
      fixedStyle,
      currentIndex,
      // shortcut 钩子返回的
      shortcutList,
      scrollRef,
      onShortcutTouchStart,
      onShortcutTouchMove
    }
  }
}
</script>

<style lang="scss" scoped>
.index-list {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;
  .group {
    padding-bottom: 30px;
    .title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
    .item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }
  .fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }
  .shortcut {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;
    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;
      &.current {
        color: $color-theme
      }
    }
  }
}
</style>
