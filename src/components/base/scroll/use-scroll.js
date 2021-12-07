import BetterScroll from '@better-scroll/core'
import ObserveDOM from '@better-scroll/observe-dom'
import { onMounted, onUnmounted, ref } from 'vue'

BetterScroll.use(ObserveDOM)

export default function useScroll(wrapperRef, options, emit) {
  const scroll = ref(null)

  onMounted(() => {
    const scrollVal = scroll.value = new BetterScroll(wrapperRef.value, {
      observeDOM: true,
      ...options
    })

    // 如果修改了 probeType，就开启监听 scroll事件，如果事件被触发，就将位置派发出去
    if (options.probeType > 0) {
      // scroll.value.on是 BetterScroll的 API，用来监听 scroll相关的事件。这里配置了'scroll'配置，是监听 页面是否在滚动
      // https://better-scroll.github.io/docs/zh-CN/guide/base-scroll-api.html#%E4%BA%8B%E4%BB%B6
      scrollVal.on('scroll', (position) => {
        // 通过自定义的事件派发，实时的将位置信息派发出去
        emit('scroll', position)
      })
    }
  })

  onUnmounted(() => {
    scroll.value.destroy()
  })

  return scroll
}
