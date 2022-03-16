<template>
  <!--  v-loading是自定义的组件，会动态插入到下面这个div内部，如果loading值是true就插入，false就不插入，从true变成false就移除。这个逻辑是我们自己去实现的  -->
  <div class="recommend" v-loading:[loadingText]="loading">
  <!--    自定义的scroll组件    -->
    <scroll class="recommend-content">
      <div>
        <div class="slider-wrapper">
          <div class="slider-content">
          <!--  v-if 确保传进来的数据不为空  -->
            <slider v-if="sliders.length" :sliders="sliders"></slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title"  v-show="!loading">热门歌单推荐</h1>
          <ul>
            <li class="item"
                v-for="item in albums"
                :key="item.id"
            >
              <div class="icon">
              <!--  使用vue3-lazy插件，使用v-lazy指令就能实现图片懒加载效果   -->
<!--                <img width="60" height="60" :src="item.pic">-->
                <img width="60" height="60" v-lazy="item.pic">
              </div>
              <div class="text">
                <h2 class="name">
                  {{ item.username }}
                </h2>
                <p class="title">
                  {{ item.title }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
  </div>
</template>

<script>
import { getRecommend } from '../service/recommend'
import Slider from '../components/base/slider/slider'
// import Scroll from '../components/base/scroll/scroll'
import Scroll from '../components/wrap-scroll'

export default {
  name: 'recommend',
  // 局部注册
  components: {
    Slider,
    Scroll
  },
  data() {
    return {
      sliders: [],
      albums: [],
      loadingText: ''
    }
  },
  computed: {
    loading() {
      return !this.sliders.length && !this.albums.length
    }
  },
  // 发送请求肯定是在推荐页面的生命周期开始的时候，但 发送请求->获取到数据 这个过程肯定是异步的，所以将这个create过程设置为异步
  // 在钩子函数内部发送请求然后获取数据，赋值给data
  async created () {
    const result = await getRecommend()
    console.log(result)
    this.sliders = result.sliders
    this.albums = result.albums

    // 延时两秒请求资源，测试 loading 的效果
    // setTimeout(async () => {
    //   const result = await getRecommend()
    //   console.log(result)
    //   this.sliders = result.sliders
    //   this.albums = result.albums
    // }, 2000)
  }
}
</script>

<style lang="scss" scoped>
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  overflow: scroll;
  .recommend-content {
    height: 100%;
    overflow: hidden;
    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 40%;
      overflow: hidden;
      .slider-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    }
    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }
      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }
        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;
        }
        .name {
          margin-bottom: 10px;
          color: $color-text;
        }
        .title {
          color: $color-text-d;
        }
      }
    }
  }
}
</style>
