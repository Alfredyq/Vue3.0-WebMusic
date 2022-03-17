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

// 根据 song ，从播放列表中删除这首 song
export function removeSong({ commit, state }, song) {
  // slice 是获取 sequenceList 和 playlist 的副本，因为不能直接对他们进行修改操作
  const sequenceList = state.sequenceList.slice()
  const playList = state.playList.slice()

  const sequenceIndex = findIndex(sequenceList, song)
  const playIndex = findIndex(playList, song)
  if (sequenceIndex < 0 || playIndex < 0) {
    return
  }

  sequenceList.splice(sequenceIndex, 1)
  playList.splice(playIndex, 1)

  // 如果删除的歌曲在当前播放歌曲的前面，则要进行特殊处理，对 currentIndex 进行以下修改
  let currentIndex = state.currentIndex
  if (playIndex < currentIndex || currentIndex === playList.length) {
    currentIndex--
  }

  // Vuex 中对 state 数据的修改只能通过提交 mutation，所以这里只能使用 commit 方式对 sequenceList 和 playList 进行修改
  commit('setSequenceList', sequenceList)
  commit('setPlayList', playList)
  commit('setCurrentIndex', currentIndex)
  if (!playList.length) {
    commit('setPlayingState', false)
  }
}

// 清空歌曲，并且改变播放状态
export function clearSongList({ commit }) {
  commit('setSequenceList', [])
  commit('setPlayList', [])
  commit('setCurrentIndex', 0)
  commit('setPlayingState', false)
}

// 点击歌曲，添加到播放列表
export function addSong({ commit, state }, song) {
  const playList = state.playList.slice()
  const sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  const playIndex = findIndex(playList, song)

  // 该歌曲在 playList 已经存在
  if (playIndex > -1) {
    currentIndex = playIndex
  } else {
    // playList 不存在该歌曲
    playList.push(song)
    currentIndex = playList.length - 1
  }

  const sequenceIndex = findIndex(sequenceList, song)
  if (sequenceIndex === -1) {
    sequenceList.push(song)
  }

  commit('setSequenceList', sequenceList)
  commit('setPlayList', playList)
  commit('setCurrentIndex', currentIndex)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
}

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
