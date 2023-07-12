# 学习在 Vite 中接入 CSS 工程化方案

## 前端开发 CSS 的痛点

- 开发体验欠佳，比如无法使用嵌套的选择器语法
- 样式污染 相同类名，可能会被意外的覆盖
- 浏览器兼容 需要兼容不同的浏览器，意味着开发者需要针对不同的浏览器写不同的冗余代码
- 打包体积 没有使用的代码也会打包到代码中

## 常见的 CSS 解决方案

### CSS 预处理器

类似于 less 和 scss 这类预处理器，可以使用嵌套规则以及像编程语言一样写变量和条件、循环语句。

- Vite 本身内置了对 CSS 预处理器的支持，不过需要单独安装相关的预处理器。(解决开发体验的问题)

```bash
pnpm install less
```

Vite 本身提供了 api 支持将单独文件注入到所有样式文件中,你可以将你需要一些全局样式变量注入到全局中。

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `import "src/less/global.less";`,
      },
    },
  },
});
```

### CSS module

简单来说，每个符合 CSS module 格式的 CSS 文件，会被看做是 CSS module，它们可以不作用于全局，而只对目标元素生效。

### PostCSS

和 preCSS 刚好相反，PostCSS 是为了解决编写 css 后的兼容压缩等问题。

- pxtorem
  将 px 转换为 rem 单位，这个在移动端场景经常使用

```bash
pnpm install -D less

```

vite 相关配置

```js
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        Pxtorem({
          rootValue: 16,
        }),
      ],
    },
  },
});
```

### CSS 原子化框架
windicss 是一种原子化css工具，相比于Tailwind可以按需生成css工具类。
- windicss [安装方法](https://windicss.org/integrations/vite.html#configuration)
- 常见的一些配置
1. Preflight  禁止使用windicss
```  ts
import { defineConfig } from 'vite-plugin-windicss'
export default defineConfig({
  preflight: false,
})
```
2. Safelist 类名是使用动态生成的，windicss无法在构建时生成对应的类名，可以事先预置动态数据可以生成的类名

``` html
<!-- will not be detected -->
<div className={`p-${size}`}>
```

``` ts
export default defineConfig({
  safelist: 'p-1 p-2 p-3 p-4',
})
```

3. Scanning 指定和排除你想要扫描的文件

``` ts
import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: ['src/**/*.{vue,html,jsx,tsx}'],
    exclude: ['node_modules', '.git'],
  },
})
```

4. Attributify Mode 属性化类名
``` html
<button
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
```

``` ts
export default {
  attributify: true,
}
```

**属性化使用前缀表示**

``` html
<button
  w:bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  w:text="sm white"
  w:font="mono light"
  w:p="y-2 x-4"
  w:border="2 rounded blue-200"
>
  Button
</button>
```

``` ts
export default {
  attributify: {
    prefix: 'w:',
  },
}
```