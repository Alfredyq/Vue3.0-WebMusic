// 无论是收藏的歌曲还是之前播放过的歌曲，我们都希望能刷新后仍然存在，所以使用本地存储的方式。而且不是一个地方会用到本地存储，所以将这部分代码做一个抽象，支持复用
import storage from 'good-storage'

function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare) // 根据传进来的比较函数，判断当前数据是否在缓存中
  if (index === 0) { // 如果数据存在，直接返回，不重复保存
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val) // 将数据插入到数组的最顶端
  if (maxLen && arr.length > maxLen) {
    // 保存的歌曲数目超过限制，则最开始保存的数据被删除
    arr.pop()
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare) // 根据传进来的比较函数，判断当前数据是否在缓存中
  if (index > -1) { // 数据存在，直接删除
    arr.splice(index, 1)
  }
}

export function save(item, key, compare, maxLen) {
  const itemsArray = storage.get(key) || [] // 根据key获取 localStorage 缓存，如果没有缓存，则返回一个[]空数组
  insertArray(itemsArray, item, compare, maxLen)
  storage.set(key, itemsArray) // localStorage 中，每一个key保存的就是一个数组
  return itemsArray
}

export function remove(key, compare) {
  const itemsArray = storage.get(key) || [] // 根据key获取 localStorage 缓存，如果没有缓存，则返回一个[]空数组
  deleteFromArray(itemsArray, compare)
  storage.set(key, itemsArray) // localStorage 中，每一个key保存的就是一个数组
  return itemsArray
}

export function load(key) { // 首次加载的时候从内存中读取原始数据
  return storage.get(key) || []
}

export function clear(key) {
  storage.remove(key)
  return []
}

export function saveAll(items, key) {
  storage.set(key, items)
}
