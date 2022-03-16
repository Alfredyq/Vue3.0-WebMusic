// 将播放器组件的一些增强性的功能抽离出来，放在其他文件里面进行维护，这样setup()函数不会太过臃肿，比如拆到其他composition API中
// 这里是实现播放按钮的切换
import { useStore } from 'vuex'
import { computed } from 'vue'
import { PLAY_MODE } from '../../assets/js/constant'

export default function useMode() {
  const store = useStore()
  const playMode = computed(() => store.state.playMode)

  const modeIcon = computed(() => {
    const playModeVal = playMode.value
    // 两个嵌套的三元运算符，根据播放模式选择播放图标
    return playModeVal === PLAY_MODE.sequence ? 'icon-sequence' : (playModeVal === PLAY_MODE.random ? 'icon-random' : 'icon-loop')
  })

  // 播放模式的文案
  const modeText = computed(() => {
    const playModeVal = playMode.value
    return playModeVal === PLAY_MODE.sequence
      ? '顺序播放'
      : playModeVal === PLAY_MODE.random
        ? '随机播放'
        : '单曲循环'
  })

  // 按下播放模式按钮 => ( 改变当前播放模式 + 改变当前播放列表 )
  function changeMode() {
    const mode = (playMode.value + 1) % 3 // 更改播放模式
    store.dispatch('changeMode', mode)
  }

  return {
    modeIcon,
    modeText,
    changeMode
  }
}
