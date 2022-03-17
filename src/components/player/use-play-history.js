import { useStore } from 'vuex'
import { PLAY_KEY } from '@/assets/js/constant'
import { save } from '@/assets/js/array-store'

export default function usePlayHistory() {
  const store = useStore()

  const maxLen = 200

  function savePlay(song) {
    // 保存到 localStorage
    const songs = save(song, PLAY_KEY, (item) => {
      return item.id === song.id
    }, maxLen)

    // 同时也保存到 vuex 的 PlayHistory 中
    store.commit('setPlayHistory', songs)
  }

  return {
    savePlay
  }
}
