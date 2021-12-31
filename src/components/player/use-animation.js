// 播放器全屏切换de过渡效果
import { ref } from 'vue'
import animations from 'create-keyframe-animation'

export default function useAnimation() {
  const cdWrapperRef = ref(null)
  let entering = false
  let leaving = false

  function enter(el, done) {
    if (leaving) { // 在 enter 动画还没执行完，就被用户点击执行 leave 动画，则手动执行 afterLeave 动画
      afterLeave()
    }
    entering = true
    const { x, y, scale } = getPosAndScale()

    const animation = {
      0: {
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})` // 从小cd的位置开始移动
      },
      100: {
        transform: 'translate3d(0, 0, 0) scale(1)'
      }
    }

    // 注册一个动画
    animations.registerAnimation({
      name: 'move',
      animation,
      presets: { // 预设
        duration: 600, // 动画时长 600ms
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)'
      }
    })

    // 调用 done 函数，vue 才知道动画结束，才能进入下面的 afterEnter 函数
    animations.runAnimation(cdWrapperRef.value, 'move', done)
  }

  // 做一些清理操作
  function afterEnter() {
    entering = false
    animations.unregisterAnimation('move')
    cdWrapperRef.value.style.animation = ''
  }

  function leave(el, done) {
    if (entering) { // 在 leave 动画还没执行完，就被用户点击执行 enter 动画，则手动执行 afterEnter 动画
      afterEnter()
    }
    leaving = true
    const { x, y, scale } = getPosAndScale()
    const cdWrapperEl = cdWrapperRef.value

    cdWrapperEl.style.transition = 'all 0.6s cubic-bezier(0.45, 0, 0.55, 1)' // 动画时长
    cdWrapperEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    cdWrapperEl.addEventListener('transitionend', next) // 绑定一个事件，等到动画结束，执行 done这个回调函数

    function next() {
      cdWrapperEl.removeEventListener('transitionend', next) // 事件解绑，因为是事件手动绑定的，所以也要手动解绑
      done()
    }
  }

  function afterLeave() {
    leaving = false
    const cdWrapperEl = cdWrapperRef.value

    cdWrapperEl.style.transition = ''
    cdWrapperEl.style.transform = ''
  }

  // 获取 偏移量 和 缩放大小
  function getPosAndScale() {
    const targetWidth = 40 // 小cd 的 width
    const paddingLeft = 20 // 小cd 到左边的距离 = paddingLeft + 小cd半径
    const paddingBottom = 10 // 小cd 到底部的距离 =  paddingBottom + 小cd半径
    const paddingTop = 80 // 大CD边缘 到顶部的距离
    const width = window.innerWidth * 0.8 // 大CD 的 width
    const x = -(window.innerWidth / 2 - paddingLeft - targetWidth / 2) // 大CD 的 x轴偏移量
    const y = window.innerHeight - paddingTop - width / 2 - paddingBottom - targetWidth / 2 // 大CD 的 y轴偏移量
    const scale = targetWidth / width // 从小cd 过渡到 大CD 的缩放倍数

    return {
      x,
      y,
      scale
    }
  }

  return {
    cdWrapperRef,
    enter,
    afterEnter,
    leave,
    afterLeave
  }
}
