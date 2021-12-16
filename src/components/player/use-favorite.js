import { useStore } from 'vuex'
import { computed } from 'vue'
import { save, remove } from '../../assets/js/array-store'
import { FAVORITE_KEY } from '../../assets/js/constant'

export default function useFavorite() {
  const store = useStore()
  const favoriteList = computed(() => store.state.favoriteList)
  const maxLen = 100

  function getFavoriteIcon(song) { // 根据某首歌确定收藏按钮的样式
    return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
  }

  function toggleFavorite(song) { // 将歌曲加入收藏列表中或从收藏列表中移除
    let list // 本地存储
    if (isFavorite(song)) {
      // remove
      list = remove(FAVORITE_KEY, compare)
    } else {
      // add
      list = save(song, FAVORITE_KEY, compare, maxLen)
    }
    store.commit('setFavoriteList', list)

    function compare(item) {
      return item.id === song.id
    }
  }

  function isFavorite(song) { // 判断某首歌曲是否在收藏列表中，返回true或false
    return favoriteList.value.findIndex((item) => {
      return item.id === song.id
    }) > -1
  }
  return {
    getFavoriteIcon,
    toggleFavorite
  }
}
