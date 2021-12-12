// 创建一个像 loading directive.js的 directive.js文件
import { createApp } from 'vue'
import { addClass, removeClass } from '@/assets/js/dom'

const relativeCls = 'g-relative'

// 自定义组件，将loading组件生成的Dom，动态插入到指令作用到的Dom对象上
// 创建一个指令对象，然后在指定对象里面的 钩子函数 里面写一些逻辑
export default function createLoadingLikeDirective(Component) {
  return {
    mounted(el, binding) {
      // 创建一个 loading vue对象，然后拿到这个实例挂载到一个动态创建的div上，而这个动态创建的div并没有挂载到body上，所以它并没有完成实质上的dom上的挂载
      const app = createApp(Component)

      // loading组件对应的 dom 对象要挂载到el上
      const instance = app.mount(document.createElement('div'))

      const name = Component.name
      if (!el[name]) {
        el[name] = {}
      }

      // loading 组件对应的dom对象是保存在 instance中，而instance是mount()函数内部的局部变量，所以先保存到 el对象上
      el[name].instance = instance

      const title = binding.arg // 传入的自定义显示参数，eg：正在载入...
      if (typeof title !== 'undefined') { // 传进来的 title 不为空
        instance.setTitle(title)
      }

      // 实现挂载
      if (binding.value) {
        append(el)
      }
    },
    updated(el, binding) {
      const title = binding.arg // 传入的自定义显示参数，eg：正在载入...
      const name = Component.name
      if (typeof title !== 'undefined') { // 传进来的 title 不为空
        el[name].instance.setTitle(title)
      }
      if (binding.value !== binding.oldValue) {
        binding.value ? append(el) : remove(el)
      }
    }
  }

// 挂载 loading 组件的 dom到目标 dom内
  function append(el) {
    const name = Component.name

    // 通过 DOM API拿到 el的 style
    const style = getComputedStyle(el)

    // 如果打算挂载的 dom元素的样式不是这三种的话，得为他们添加 position:relative 样式
    // 因为 loading的样式是absolute，所以外面的 el样式必须是下面三种，才能实现垂直水平居中
    if (['absolute', 'fixed', 'relative'].indexOf(style.position) === -1) {
      // 为 el元素添加 position:relative 样式
      addClass(el, relativeCls)
    }

    // el.instance.$el 是 loading 组件对应的 dom对象
    el.appendChild(el[name].instance.$el)
  }

// 从目标 dom对象内移除 loading 组件的 dom
  function remove(el) {
    const name = Component.name
    removeClass(el, relativeCls)
    el.removeChild(el[name].instance.$el)
  }
}
