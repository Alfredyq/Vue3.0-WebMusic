/*
    *  该文件是运行在Node.js端的，获取数据的基本的思路就是后端代理，即提供接口路由供前端页面使用，然后在路由内部，
    我们接收到前端请求后，再发送HTTP请求到第三方服务接口，携带相应的请求参数，包括签名的参数字段等等。
    *  对于从第三方接口返回的数据，我们会做一层数据处理，最终提供给前端的数据前端可以直接使用，无需再处理。这样也比较
    符合真实企业项目的开发规范，即数据的处理放在后端做，前端只做数据渲染和交互。
 */
const axios = require('axios')
const pinyin = require('pinyin')

// 获取签名方法
const getSecuritySign = require('./sign')

// 成功
const ERR_OK = 0
const token = 5381

// 歌曲图片加载失败时使用的默认图片
const fallbackPicUrl = 'https://y.gtimg.cn/mediastyle/music_v11/extra/default_300x300.jpg?max_age=31536000'

// 公共参数
const commonParams = {
  g_tk: token,
  loginUin: 0,
  hostUin: 0,
  inCharset: 'utf8',
  outCharset: 'utf-8',
  notice: 0,
  needNewCode: 0,
  format: 'json',
  platform: 'yqq.json'
}

// 获取一个随机数值
function getRandomVal(prefix = '') {
  return prefix + (Math.random() + '').replace('0.', '')
}

// 对 axios get 请求的封装
function get(url, params) {
  return axios.get(url, {
    // 修改请求的 headers 值，让第三方服务接口认为当前请求是合法的。
    headers: {
      referer: 'https://y.qq.com/',
      origin: 'https://y.qq.com/'
    },
    // 合并公共请求参数，将 commonParams 这个公共参数放在后端进行封装。
    // 这个公共参数是第三方服务接口需要的，但跟我们本身的业务无关，所以放在后端封装好了
    params: Object.assign({}, commonParams, params)
  })
}

// 处理歌曲列表
function handleSongList(list) {
  const songList = []

  list.forEach((item) => {
    const info = item.songInfo || item
    if (info.pay.pay_play !== 0 || !info.interval) {
      // 过滤付费歌曲和获取不到时长的歌曲
      return
    }

    // 构造歌曲的数据结构
    const song = {
      id: info.id,
      mid: info.mid,
      name: info.name,
      singer: mergeSinger(info.singer),
      url: '', // 在当前url拿不到，而且每天都在变化，在另一个接口获取
      duration: info.interval,
      pic: info.album.mid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${info.album.mid}.jpg?max_age=2592000` : fallbackPicUrl,
      album: info.album.name
    }

    songList.push(song)
  })

  return songList
}

// 合并多个歌手的姓名
function mergeSinger(singer) {
  const ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}

// 注册后端路由
function registerRouter(app) {
  registerRecommend(app)

  registerSingerList(app)

  registerSingerDetail(app)
}

// 注册推荐列表接口路由。这里包括了轮播图的接口和歌单的接口。
function registerRecommend(app) {
  // app是一个传进来的express实例，用get方法去实现代理后端路由接口服务
  app.get('/api/getRecommend', (req, res) => {
    // 第三方服务接口 url
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

    // 构造请求 data 参数
    const data = JSON.stringify({
      comm: { ct: 24 },
      recomPlaylist: {
        method: 'get_hot_recommend',
        param: { async: 1, cmd: 2 },
        module: 'playlist.HotRecommendServer'
      },
      focus: {
        module: 'music.musicHall.MusicHallPlatform',
        method: 'GetFocus',
        param: {}
      }
    })

    // 随机数值
    const randomVal = getRandomVal('recom')
    // 计算签名值
    const sign = getSecuritySign(data)

    // 发送 get 请求到第三方服务接口
    get(url, {
      sign,
      '-': randomVal,
      data
    }).then((response) => {
      // 拿到响应结果
      const data = response.data
      if (data.code === ERR_OK) {
        // 轮播图数据
        // 根据拿到的轮播图的数据的结构进行处理，从中提取出我们所需要的数据就ok
        console.log('/***********1111111************/')
        console.log(data)
        console.log('/***********2222222************/')
        console.log(data.focus.data.shelf)
        const focusList = data.focus.data.shelf.v_niche[0].v_card
        const sliders = []
        const jumpPrefixMap = {
          10002: 'https://y.qq.com/n/yqq/album/',
          10014: 'https://y.qq.com/n/yqq/playlist/',
          10012: 'https://y.qq.com/n/yqq/mv/v/'
        }
        // 最多获取 10 条数据
        const len = Math.min(focusList.length, 10)
        for (let i = 0; i < len; i++) {
          const item = focusList[i]
          const sliderItem = {}
          // 单个轮播图数据包括 id、pic、link 等字段
          sliderItem.id = item.id
          sliderItem.pic = item.cover
          if (jumpPrefixMap[item.jumptype]) {
            sliderItem.link = jumpPrefixMap[item.jumptype] + (item.subid || item.id) + '.html'
          } else if (item.jumptype === 3001) {
            sliderItem.link = item.id
          }
          sliders.push(sliderItem)
        }

        // 处理推荐歌单数据
        // 因为轮播图数据和歌单数据在同一个接口里面就能够获取，所以就放一个接口处理里面实现了。
        console.log('/***********3333333************/')
        console.log(data)
        console.log('/***********4444444************/')
        console.log(data.recomPlaylist.data)
        const albumList = data.recomPlaylist.data.v_hot
        const albums = []
        for (let i = 0; i < albumList.length; i++) {
          const item = albumList[i]
          const albumItem = {}
          // 推荐歌单数据包括 id、uername、title、pic 等字段
          albumItem.id = item.content_id
          albumItem.username = item.username
          albumItem.title = item.title
          albumItem.pic = item.cover

          albums.push(albumItem)
        }

        // 往前端发送一个标准格式的响应数据，包括成功错误码和数据
        res.json({
          code: ERR_OK,
          result: {
            sliders,
            albums
          }
        })
      } else {
        res.join(data)
      }
    })
  })
}

// 注册歌手列表接口路由
function registerSingerList(app) {
  app.get('/api/getSingerList', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
    const HOT_NAME = '热'

    const data = JSON.stringify({
      comm: { ct: 24, cv: 0 },
      singerList: {
        module: 'Music.SingerListServer',
        method: 'get_singer_list',
        param: { area: -100, sex: -100, genre: -100, index: -100, sin: 0, cur_page: 1 }
      }
    })

    const randomKey = getRandomVal('getUCGI')
    const sign = getSecuritySign(data)

    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      console.log(data)
      if (data.code === ERR_OK) {
        // 处理歌手列表数据
        const singerList = data.singerList.data.singerlist

        // 构造歌手 Map 数据结构
        const singerMap = {
          hot: {
            title: HOT_NAME,
            list: map(singerList.slice(0, 10))
          }
        }

        singerList.forEach((item) => {
          // 把歌手名转成拼音
          const p = pinyin(item.singer_name)
          if (!p || !p.length) {
            return
          }
          // 获取歌手名拼音的首字母
          const key = p[0][0].slice(0, 1).toUpperCase()
          if (key) {
            if (!singerMap[key]) {
              singerMap[key] = {
                title: key, // 拼音首字母
                list: []
              }
            }
            // 每个字母下面会有多名歌手，把对应歌手存到数组对应位置
            singerMap[key].list.push(map([item])[0])
          }
        })

        // 热门歌手
        const hot = []
        // 歌手按字母排序
        const letter = []

        // 遍历处理 singerMap，让结果有序
        for (const key in singerMap) {
          const item = singerMap[key]
          if (item.title.match(/[a-zA-Z]/)) {
            letter.push(item)
          } else if (item.title === HOT_NAME) {
            hot.push(item)
          }
        }
        // 按字母顺序排序
        letter.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })

        // Node端处理好数据后，返回给前端的结果
        res.json({
          code: ERR_OK,
          result: {
            // originData: data, // 将未处理过的原始数据传给前端
            singers: hot.concat(letter) // 处理好的数据
          }
        })
      } else {
        res.json(data)
      }
    })
  })

  // 做一层数据映射，构造单个 singer 数据结构
  function map(singerList) {
    return singerList.map((item) => {
      return {
        id: item.singer_id,
        mid: item.singer_mid,
        name: item.singer_name,
        pic: item.singer_pic.replace(/\.webp$/, '.jpg').replace('150x150', '800x800')
      }
    })
  }
}

// 注册歌手详情接口路由
function registerSingerDetail(app) {
  app.get('/api/getSingerDetail', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

    const data = JSON.stringify({
      comm: { ct: 24, cv: 0 },
      singerSongList: {
        method: 'GetSingerSongList',
        param: { order: 1, singerMid: req.query.mid, begin: 0, num: 100 },
        module: 'musichall.song_list_server'
      }
    })

    const randomKey = getRandomVal('getSingerSong')
    const sign = getSecuritySign(data)

    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        const list = data.singerSongList.data.songList
        // 歌单详情、榜单详情接口都有类似处理逻辑，所以封装成函数
        const songList = handleSongList(list)

        res.json({
          code: ERR_OK,
          result: {
            songs: songList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

module.exports = registerRouter
