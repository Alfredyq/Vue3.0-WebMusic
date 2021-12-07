<template>
  <div ref="rootRef">
    <slot></slot>
  </div>
</template>

<script>
import useScroll from './use-scroll'
import { ref } from 'vue'

export default {
  name: 'scroll',
  props: {
    click: {
      type: Boolean,
      default: true
    },
    // 核心配置项，决定是否派发 scroll 事件：https://better-scroll.github.io/docs/zh-CN/guide/base-scroll-options.html#probetype
    // 设置默认值为0，不派发 scroll事件，等到需要派发 scroll事件的页面时候，再修改 probeType的属性为 3
    probeType: {
      type: Number,
      default: 0
    }
  },
  // 向外派发的事件
  emits: ['scroll'],
  // 注意，这里传递的是emit，而不是emits！！！否则程序会不能正常运行
  setup(props, { emit }) {
    const rootRef = ref(null)
    const scroll = useScroll(rootRef, props, emit)

    return {
      rootRef,
      scroll
    }
  }
}
</script>

<style scoped>

</style>
