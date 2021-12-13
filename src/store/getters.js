export const currentSong = (state) => {
  // 根据当前的播放列表和播放索引，获取当前播放的歌曲
  return state.playList[state.currentIndex]
}
