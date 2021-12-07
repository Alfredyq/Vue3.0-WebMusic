// ref 是vue暴露的响应式API
import { nextTick, ref, computed, watch } from 'vue'

export default function useFixed(props) {
  // ref 接受一个内部值并返回一个响应式且可变的 ref 对象。ref 对象仅有一个 ref.value property，指向该内部值。
  // 这些数据都是ref，都是响应式的
  const groupRef = ref(null)
  const listHeights = ref([]) // 保存所有li元素的高度区间的数组
  const scrollY = ref(0)
  const currentIndex = ref(0)
  const distance = ref(0) // 下面的title将上面的title顶出去
  const TITLE_HEIGHT = 30 // 值为30是因为title的height样式就是30px

  const fixedTitle = computed(() => {
    if (scrollY.value < 0) {
      return ''
    }
    const currentGroup = props.data[currentIndex.value]
    return currentGroup ? currentGroup.title : ''
  })

  // 3-6节 2:21 实现下面的title将上面的title顶出去的效果。原理就是通过计算距离，来改变样式
  const fixedStyle = computed(() => {
    const distanceVal = distance.value
    const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0// 偏移值
    return {
      transform: `translate3d(0,${diff}px,0)`
    }
  })

  // 观测props.data这个数据是否发生变化。但是数据发生变化之后，dom并没有随即跟着改变，dom的改变是发生在nextTick后，所以calculate计算也应该在dom改变后再执行，因为calculate需要用到更新后的dom
  watch(() => props.data, async () => {
    await nextTick()
    calculate()
  })

  // 监听scrollY值发生变化
  watch(scrollY, (newScrollY) => {
    const listHeightsVal = listHeights.value
    for (let i = 0; i < listHeightsVal.length - 1; i++) {
      const heightTop = listHeightsVal[i]
      const heightBottom = listHeightsVal[i + 1]
      if (newScrollY >= heightTop && newScrollY <= heightBottom) {
        currentIndex.value = i
        distance.value = heightBottom - newScrollY
      }
    }
  })

  // 等到dom发生变化的时候，计算列表的高度，但前提是需要获取到页面某些 dom元素的高度
  function calculate() {
    // 获取 ul这个 dom元素里面所有的 children,list 实际上是一个 dom的数组
    const list = groupRef.value.children
    const listHeightsVal = listHeights.value
    let height = 0

    listHeightsVal.length = 0
    listHeightsVal.push(height)

    for (let i = 0; i < list.length; i++) {
      height += list[i].clientHeight
      listHeightsVal.push(height)
    }
  }

  function onScroll(position) {
    scrollY.value = -position.y
  }

  return {
    groupRef,
    onScroll,
    fixedTitle,
    fixedStyle,
    currentIndex
  }
}
