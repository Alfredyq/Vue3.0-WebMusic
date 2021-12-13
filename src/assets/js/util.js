// Knuth shuffle 洗牌算法，对传进来的数组进行打乱
export function shuffle(source) {
  const arr = source.slice() // 相当于数组的复制，这样就不会对原数组产生修改
  for (let i = 0; i < arr.length; i++) {
    const j = getRandomInt(i)
    swap(arr, i, j)
  }
  return arr
}

function getRandomInt(max) {
  // Math.floor向下取整。如果传进来的数是10，那么Math.random求0-11之间(不包括11)的随机数，向下取整就是求一个0-10之间的整数
  return Math.floor(Math.random() * (max + 1))
}

// 交换数组内的两个元素
function swap(arr, i, j) {
  const t = arr[i]
  arr[i] = arr[j]
  arr[j] = t
}
