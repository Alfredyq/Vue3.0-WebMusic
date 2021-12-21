import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '../../service/song'
import Lyric from 'lyric-parser'

export default function useLyric({ songReady, currentTime }) {
  const currentLyric = ref(null)
  const currentLineNum = ref(0)
  const pureMusicLyric = ref('')
  const playingLyric = ref('') // 当前正在播放歌词是什么
  const lyricScrollRef = ref(null)
  const lyricListRef = ref(null)

  const store = useStore()
  const currentSong = computed(() => store.getters.currentSong)

  watch(currentSong, async (newSong) => {
    if (!newSong.url || !newSong.id) {
      return
    }

    // 因为请求是异步的，所以不能确定请求回来之后，播放的是请求的歌词，所以先将歌词停掉，不然快速切歌然后再切回来歌词就会出现问题
    stopLyric()
    currentLyric.value = null
    currentLineNum.value = 0
    pureMusicLyric.value = ''
    playingLyric.value = ''

    // 因为 getLyric 的请求是个异步的操作，所以这个函数前面要加一个 async
    const lyric = await getLyric(newSong)
    // console.log(lyric)
    store.commit('addSongLyric', { // 将歌词缓存进 sequenceList里面，为了同一首歌只要请求一次歌词
      song: newSong,
      lyric
    })
    if (currentSong.value.lyric !== lyric) {
      // 因为 getLyric 的过程是一个异步的，当歌词获取到之后可能已经发生了切歌，所以判断当前正在播放的歌曲的歌词不是获取到的，那下面的代码就不需执行了
      return
    }

    currentLyric.value = new Lyric(lyric, handleLyric) // 两个参数，一个歌词字符串，一个函数
    const hasLyric = currentLyric.value.lines.length
    if (hasLyric) { // 获取到了歌词
      if (songReady.value) {
        playLyric() // 播放歌词
      }
    } else {
      playingLyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '')
    }
  })

  function playLyric() {
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.seek(currentTime.value * 1000) // 根据当前播放时间，找到对应行数的歌词
    }
  }

  function stopLyric() {
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.stop() // 停止播放歌词
    }
  }

  // 一行歌词放完跳到下一行的时候，进入这个处理函数
  function handleLyric({ lineNum, txt }) { // 两个自带参数，一个是播放到哪一行，一个是该行的歌词
    currentLineNum.value = lineNum // 高亮正在播放的那一行
    playingLyric.value = txt
    const scrollComp = lyricScrollRef.value
    const listEl = lyricListRef.value
    if (!listEl) { // 如果没有歌词，就不需要滚动歌词
      return
    }
    if (lineNum > 5) { // lineNum>5 的时候才开始滚动
      const lineEl = listEl.children[lineNum - 5] // 获取到每一行歌词对应的 element 的 dom。减5是为了让正在播放的歌词在偏中间的位置。
      scrollComp.scroll.scrollToElement(lineEl, 1000)
    } else { // 否则都不滚动
      scrollComp.scroll.scrollTo(0, 0, 1000)
    }
  }

  return {
    currentLyric,
    currentLineNum,
    pureMusicLyric,
    playingLyric,
    lyricScrollRef,
    lyricListRef,
    playLyric,
    stopLyric
  }
}
