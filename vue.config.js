const registerRouter = require('./backend/router')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        // 全局引入变量和mixin函数
        additionalData: `
          @import "@/assets/scss/variable.scss";
          @import "@/assets/scss/mixin.scss";
        `
      }
    }
  },
  devServer: {
    // 利用express？去起一个Node Server，这里的app是一个express？实例，调用app去搭建后端路由
    before(app) {
      registerRouter(app)
    }
  }
}
