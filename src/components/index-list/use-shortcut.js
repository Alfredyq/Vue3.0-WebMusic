import { ref, computed } from 'vue'

export default function useShortcut(props, groupRef) {
  const ANCHOR_HEIGHT = 18 // 侧边栏字母之间的距离，固定为18px
  const scrollRef = ref(null)

  // shortcutList根据 props.data计算而来，得到数组中所有group的title
  const shortcutList = computed(() => {
    return props.data.map((group) => {
      return group.title
    })
  })

  const touch = {}

  // 点击侧边栏，快速跳到目标栏
  function onShortcutTouchStart(e) {
    // 确定点击的是侧边栏的哪个字母
    const anchorIndex = parseInt(e.target.dataset.index)
    // 点击的第一个纵坐标
    touch.y1 = e.touches[0].pageY
    touch.anchorIndex = anchorIndex

    scrollTo(anchorIndex)
  }

  // 拖动侧边栏，快速浏览
  function onShortcutTouchMove(e) {
    // 点击的第二个纵坐标
    touch.y2 = e.touches[0].pageY
    const delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0 // delta是🔺，求偏移了多少个字母的位置。 |0是正数向下取整的一种方法
    const anchorIndex = touch.anchorIndex + delta

    scrollTo(anchorIndex)
  }

  function scrollTo(index) {
    if (isNaN(index)) { // 当交互是在侧边栏之外，就不理会这次交互
      return
    }
    // 对index进行限制，否则如果超出了，会出现错误
    index = Math.max(0, Math.min(shortcutList.value.length - 1, index))
    const targetEl = groupRef.value.children[index] // 根据点击的字母，找到要滚动到的目标 el的 dom
    const scroll = scrollRef.value.scroll // scrollRef.value是 scroll.vue 中的scroll实例
    scroll.scrollToElement(targetEl, 0)
  }

  return {
    shortcutList,
    scrollRef,
    onShortcutTouchStart,
    onShortcutTouchMove
  }
}
