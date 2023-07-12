# 学习在 Vite 中处理静态资源

静态资源处理是前端常见的问题，真实工程中不仅仅包含源码，还包含了引入一些静态资源，包含了`图片`,`JSON`,`Worker文件`,`Web Assembly文件`等等。

而本身Vite在开发阶段使用Esmodule加载资源，但是静态文件本身不是标准的module，所以vite需要做的一方面就是将静态文件解析为ES模块，另一方面就是在生产环境下考虑静态资源的部署问题，体积问题以及网络性能问题。

## 资源解析别名
在引入资源时可以使用别名代表路径缩写
``` ts
// vite.config.ts
{
  resolve: {
    // 别名配置
    alias: {
      '@assets': './src/assets'
    }
  }
}
```
路径别名使用
```ts
import imgUrl from '@assets/logo.svg'
```


## 静态资源导入

当我们import静态资源时，vite会返回一个解析后的URL。
``` js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```
上述的,`imgUrl`在开发环境将会是`./img.png`，在生产环境会被统一打包hash处理，将会是`assets/img.[hash].png`。
下面是需要注意的点：
- 在css中使用`url()`将会被一样处理
- 如果在vueSFC单文件组件引用资源，将会被转化成import导入的形式。
- 可以在`vite.config.ts`中使用`assetsInclude`选项拓展其他的拓展名（除了一些通用的文件类型）
- vite在生成环境打包时，会使用hash的方式打包
- 使用`assetsInlineLimit`选项可以限制限制使用base64格式打包资源的最大体积。


## JSON 资源
Vite内置了JSON文件的解析，可以导出一个按名导出的ES模块。比如
``` ts
import packageConfig from '../package.json'
import {version} from '../package.json'
```
当然vite提供了json的配置选项，已配置按名导出和序列化。

## web worker 
### 什么是web  worker
- worker 支持使用其他线程去执行js代码
- worker 执行任务不会影响用户界面的渲染
- worker 可以通过send 和 receive 消息和主线程进行通信
### 使用query指定worker的导出
``` ts
// 导出为一个worker自定义构造器
import webworker from './webworker.js?worker' 
// 导出为url
import webworker from './webworker.js?url' 
// 内联至当前文件，不单独打包
import webworker from './webworker.js?inline' 
// 以字符串的方式导出
import webworker from './webworker.js?raw' 
```
[其他方法导出worker](https://vitejs.dev/guide/features.html#web-workers)
