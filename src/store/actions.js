import { PLAY_MODE } from '../assets/js/constant'

// 点击一首歌曲开始播放
export function selectPlay({ commit }, { list, index }) {
  // 这就是 Action，能对 mutations 进行封装，支持一次提交多个mutations，实际上还是对 mutations进行操作
  commit('setPlayMode', PLAY_MODE.sequence)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlaylist', list)
  commit('setCurrentIndex', index)
}
