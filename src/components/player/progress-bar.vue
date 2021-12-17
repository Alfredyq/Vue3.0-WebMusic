<!--  歌曲进度条组件  -->
<template>
  <div
    class="progress-bar"
    @click="onClick"
  >
    <!--  底层的灰度的进度条   -->
    <div class="bar-inner">
      <!--  最上面的亮色进度条   -->
      <div
        class="progress"
        ref="progress"
        :style="progressStyle"
      ></div>
      <!--  亮色进度条上的按钮   -->
      <div
        class="progress-btn-wrapper"
        :style="btnStyle"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend.prevent="onTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  const progressBtnWidth = 16
  // const barWidth

  export default {
    name: 'progress-bar',
    emits: ['progress-changing', 'progress-changed'],
    props: {
      progress: {
        type: Number,
        default: 0 // progress 的值为从 0-1 之间的小数，表示当前歌曲的进度情况
      }
    },
    data() {
      return {
        offset: 0 // 偏移量
      }
    },
    computed: {
      progressStyle() {
        // 亮色进度条，只需设置宽度
        return `width:${this.offset}px`
      },
      btnStyle() {
        // 进度条上的按钮
        return `transform:translate3d(${this.offset}px,0,0)`
      }
    },
    watch: {
      // 监听外面传进来的 progress 的变化，实时的改变 offset 偏移量
      progress(newProgress) {
        this.setOffset(newProgress)
      }
    },
    created() {
      this.touch = {}
    },
    // mounted () {
    //    const barWidth = this.$el.clientWidth - progressBtnWidth
    // },
    methods: {
      onTouchStart(e) {
        this.touch.x1 = e.touches[0].pageX // 点击位置的x轴坐标值
        this.touch.beginWidth = this.$refs.progress.clientWidth // 点击时，亮色进度条的宽度
      },
      onTouchMove(e) {
        const delta = e.touches[0].pageX - this.touch.x1 // 点击位置距离亮色进度条的距离
        const tempWidth = this.touch.beginWidth + delta // 进度条移动到点击位置时候，进度条的长度
        const barWidth = this.$el.clientWidth - progressBtnWidth // 进度条总的长度
        const progress = Math.min(1, Math.max(tempWidth / barWidth, 0)) // 计算跳到点击位置，歌曲应该是什么进度
        this.offset = barWidth * progress
        this.$emit('progress-changing', progress) // 通知外面的组件(player)，progress发生改变，此时手指还未离开
        console.log('onTouchMove: progress' + progress)
      },
      onTouchEnd() {
        const barWidth = this.$el.clientWidth - progressBtnWidth
        const progress = this.$refs.progress.clientWidth / barWidth
        this.$emit('progress-changed', progress) // 通知外面的组件(player)，progress发生改变，此时手指已经离开
        console.log('onTouchEnd: progress' + progress)
      },
      onClick(e) {
        const rect = this.$el.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        const barWidth = this.$el.clientWidth - progressBtnWidth
        const progress = offsetWidth / barWidth
        this.$emit('progress-changed', progress)
      },
      setOffset(progress) {
        // 理论上用computed也可以，但一开始获取 this.$el 是获取不到的，因为元素还没渲染出来，这就是为什么用 watch 的原因，watch是监听变化，等监听到的时候，元素是肯定已经被渲染出来了
        // 进度条实际长度 = 进度条总长度 - btn的长度（16px）  为啥每次都要获取进度条的总长度呢？因为进度条的长度是适配设备显示器的，大的显示器进度条就长点
        const barWidth = this.$el.clientWidth - progressBtnWidth
        this.offset = barWidth * progress // 偏移量 = 进度条长度 x 进度
        // console.log('inner: ' + progress)
        // console.log('barWidth: ' + this.$el.clientWidth)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid $color-text;
          border-radius: 50%;
          background: $color-theme;
        }
      }
    }
  }
</style>
