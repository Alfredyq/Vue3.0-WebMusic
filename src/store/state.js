import { PLAY_MODE } from '../assets/js/constant'

const state = {
  playing: false, // 状态，当前是否在播放
  sequenceList: [], // 顺序播放列表
  playList: [], // 当前的播放列表
  playMode: PLAY_MODE.sequence,
  currentIndex: 0, // 当前播放索引，也就是当前播放哪首歌
  fullScreen: false // 播放器状态，全屏或缩小化的
}

export default state
