import BetterScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

// Options API 和 Composition API 最大的区别就是，Composition暴露很多API，需要开发人员知道
// 这个API是干嘛的，然后手动去import引入进来。而 Options API 只要去做一些配置就好了。
import { onMounted, onUnmounted, onActivated, onDeactivated, ref } from 'vue'

BetterScroll.use(Slide)

// 一个Hook函数，在vue实例创建的时候，初始化BetterScroll
// 但是vue实例的setup阶段，Dom没并没有渲染出来（在Mounted钩子函数之后才被渲染出来），
// 所以我们只能够在Mounted钩子函数内部初始化 BetterScroll 实例
export default function useSlider(wrapperRef) {
  const slider = ref(null)
  const currentPageIndex = ref(0)

  onMounted(() => {
    const sliderVal = slider.value = new BetterScroll(wrapperRef.value, {
      click: true,
      scrollX: true,
      scrollY: false,
      momentum: false,
      bounce: false,
      probeType: 2,
      slide: true
    })

    sliderVal.on('slideWillChange', (page) => {
      currentPageIndex.value = page.pageX
    })
  })

  // 手动销毁 BetterScroll 实例
  onUnmounted(() => {
    slider.value.destroy()
  })

  onActivated(() => {
    slider.value.enable()
    slider.value.refresh()
  })

  onDeactivated(() => {
    slider.value.disable()
  })

  return {
    slider,
    currentPageIndex
  }
}
