import { get } from './base'

export function processSongs(songs) {
  if (!songs.length) {
    // 因为 processSongs返回的就是一个 promise，所以如果这个歌手点进来发现一首歌都搜不到的话，就将传进来的 songs原样返回
    return Promise.resolve(songs)
  }

  // 跟 registerSongsUrl的 url必须一致
  return get('/api/getSongsUrl', {
    mid: songs.map((song) => {
      return song.mid
    })
  }).then((result) => {
    // 这个就是Node返回给前端的 urlMap数据
    const map = result.map
    return songs.map((song) => {
      // 拿到url
      song.url = map[song.mid]
      return song
    }).filter((song) => {
      // 后来发现正常的 url里面都包含 vkey字段，所以这里使用 filter将不满足条件的 url过滤掉
      return song.url && song.url.indexOf('vkey') > -1
    })
  })
}

const lyricMap = {}

export function getLyric(song) {
  if (song.lyric) {
    return Promise.resolve(song.lyric)
  }
  const mid = song.mid
  const lyric = lyricMap[mid]
  if (lyric) {
    return Promise.resolve(lyric)
  }

  return get('/api/getLyric', {
    mid
  }).then((result) => {
    const lyric = result ? result.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
    lyricMap[mid] = lyric
    return lyric
  })
}
