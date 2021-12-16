import { PLAY_MODE } from '../assets/js/constant'
import { shuffle } from '../assets/js/util'

// 点击一首歌曲开始播放
export function selectPlay({ commit }, { list, index }) {
  // 这就是 Action，能对 mutations 进行封装，支持一次提交多个 mutations ，实际上还是对 mutations 进行操作
  commit('setPlayMode', PLAY_MODE.sequence) // 顺序播放
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlayList', list)
  commit('setCurrentIndex', index)
}

// 随机播放
export function randomPlay({ commit }, list) {
  commit('setPlayMode', PLAY_MODE.random) // 随机播放
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlayList', shuffle(list))
  commit('setCurrentIndex', 0)
}

// 改变播放模式
export function changeMode({ commit, state, getters }, mode) {
  const currentId = getters.currentSong.id // 缓存起当前播放歌曲的id

  if (mode === PLAY_MODE.random) {
    // 切换到随机播放
    commit('setPlayList', shuffle(state.sequenceList))
  } else {
    // 切换到顺序播放或单曲循环
    commit('setPlayList', shuffle(state.sequenceList))
  }

  const index = state.playList.findIndex((song) => {
    // 遍历当前播放列表所有歌曲，根据id，返回这首歌曲在更新后播放列表中的index
    return song.id === currentId
  })

  commit('setCurrentIndex', index)
  commit('setPlayMode', mode)
}
