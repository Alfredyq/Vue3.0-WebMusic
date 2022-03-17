import { PLAY_MODE, SEARCH_KEY } from '../assets/js/constant'
import { load } from '../assets/js/array-store'

const state = {
  playing: false, // 状态，当前是否在播放
  sequenceList: [], // 顺序播放列表
  playList: [], // 当前的播放列表
  playMode: PLAY_MODE.sequence,
  currentIndex: 0, // 当前播放索引，也就是当前播放哪首歌
  fullScreen: false, // 播放器状态，全屏或缩小化的
  // favoriteList: load(FAVORITE_KEY), // 收藏歌曲列表
  favoriteList: [],
  searchHistory: load(SEARCH_KEY), // 搜索历史
  // playHistory: load(PLAY_KEY) // 播放历史
  playHistory: []
}

export default state
