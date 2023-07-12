# 理解Vite的依赖预构建
Vite提升开发服务初次启动，首先通过把应用中的模块分为源码和依赖。其中源码会直接以ESM方式提供，浏览器分担了一部分打包的工作，Vite只需要对源码进行转换并提供，也只有页面需要动态导入才需要被处理。而依赖会通过基于esbuild的预构建进行处理，esbuild基于go语言会比其他基于js的打包器快到10-100倍。
## 为什么需要预构建
- 兼容cjs和umd
在开发模式中，Vite需要将依赖以ESM的方式提供给浏览器，但是有些依赖并不提供ESM，所以Vite需要将cjs/umd的依赖转化成esm。
- 性能
Vite会将掉多个模块组成的ESM依赖转成单个模块，从而提供页面性能。有些依赖可能会由多个独立的文件组成，这样import依赖时会产生许多个请求，这对浏览器的压力很大,合并文件，可以减少请求。


## 预构建的缓存

### 文件系统缓存
预构建的依赖将会缓存在node_modules/.vite文件夹中，浏览器访问页面时，第三方包也会被重写路径
``` js
import __vite__cjsImport1_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=e4336d2e";
const ReactDOM = __vite__cjsImport1_reactDom_client.__esModule ? __vite__cjsImport1_reactDom_client.default : __vite__cjsImport1_reactDom_client;
```
vite的缓存是否进行二次构建取决于下面几点
1. 包管理器的锁文件 `pnpm-lock.yaml`
2. vite.config.js的相关字段 `optimizeDeps`
3. NODE_ENV 的值。


只有当上述的条件发生变化时，Vite才会去替换缓存内容，否则一直使用。

可以在启动命令加入后缀 `--force` 例如 `pnpm dev --force` 或者直接删除.vite目录强制重新打包依赖。

### 浏览器缓存
已解析的依赖请求会使用`max-age=31536000,imutable`进行强缓存，已提高页面加载性能。只有当包管理锁文件发生变化，才会生成不同版本标识，对应不同url，此时浏览器会请求新的文件。

如果你想对你编辑过的依赖进行debug，你需要
1. 禁用浏览器缓存 
2. 使用`--force`重新打包依赖 
3. 重载页面


### 自动依赖搜寻
如果构建时没有发现现存依赖，Vite会自动扫描你的源码然后自动搜寻依赖进行预构建。如果服务已经启动，如果遇到新不在缓冲中的依赖，Vite会重新运行依赖构建处理，然后重载页面。

## 预构建的配置
1. entries

依赖搜寻入口，Vite默认搜寻所有项目中所有html文件作为入口，然后扫描对应的依赖并对依赖进行构建。
如果你的依赖不是html文件，而是其他文件，可以自定义依赖搜寻入口。

2. include 
Vite默认只会预构建在node_modules中的依赖包（只有vite可以分析的依赖包）,但是有些时候vite并不能完美分析我们需要的依赖包，所以我们可以提前配置vite无法分析的依赖包。
**动态import**
有些场景下，我们需要动态导入某些文件，vite并不支持对动态导入文件的预构建解析，动态导入只有在运行时才会被解析到,也就意味着vite会进行二次的预构建，然后重新加载页面，这是我们不期望看到的。

使用dynamic import
``` ts
const importModule = (fileName: string) => import(`./${fileName}.ts`);
function Test() {
  return (
    <div
      onClick={() => {
        importModule("dynamicImport");
      }}
    >
      hello test
    </div>
  );
}
export default Test;
```
vite开发启动后会发出warn，提示对dynamic import的不支持

``` bash 
/my-react-app/src/pages/test/Test.tsx
23:01:32 [vite] warning: 
/my-react-app/src/pages/test/Test.tsx
15 |  var _jsxFileName = "/Users/jiemicc/Desktop/workplace/\u5B66\u4E60/my-react-app/src/pages/test/Test.tsx";
16 |  import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
17 |  const importModule = (fileName) => import(`./${fileName}.ts`);
   |                                            ^
18 |  function Test() {
19 |    return /* @__PURE__ */ _jsxDEV("div", {
The above dynamic import cannot be analyzed by Vite.
See https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations for supported dynamic import formats. If this is intended to be left as-is, you can use the /* @vite-ignore */ comment inside the import() call to suppress this warning.

  Plugin: vite:import-analysis
  /my-react-app/src/pages/test/Test.tsx

```

当我们真正的执行dynamic import，控制台会有相应二次预构建的提示，同时也会重载页面
``` bash
23:18:42 [vite] ✨ new dependencies optimized: object-assign
23:18:42 [vite] ✨ optimized dependencies changed. reloading
```


3. esbuildOptions
传递options给esbuild当然vite进行扫描和优化时。部分特定的选项会被忽略，由于和vite依赖优化冲突的原因。
** 第三方依赖包，预构建失败**
第三方包可能也存在质量问题，导致esbuild构建出错，例如`react-virtualized`。

看一下具体构建错误
``` bash
No matching export in "node_modules/.pnpm/react-virtualized@9.22.3_biqbaboplfbrettd7655fr4n2y/node_modules/react-virtualized/dist/es/WindowScroller/WindowScroller.js" for import "bpfrpt_proptype_WindowScroller"

    node_modules/.pnpm/react-virtualized@9.22.3_biqbaboplfbrettd7655fr4n2y/node_modules/react-virtualized/dist/es/WindowScroller/utils/onScroll.js:74:9:
      74 │ import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";
```
原因是这个库的bpfrpt_proptype_WindowScroller并没有被导出，意味着这是多余的代码，这是导致vite预构建这个库报错的原因。

我们可以借用esbuildOptions的plugins（会与vite的依赖插件合并），在vite预构建时剔除这行代码。
``` ts
const esbuildPatchPlugin = {
  name: "react-virtualized-patch",
  setup(build) {
    build.onLoad(
      {
        filter:
          /react-virtualized\/dist\/es\/WindowScroller\/utils\/onScroll.js$/,
      },
      async (args) => {
        const text = await fs.promises.readFile(args.path, "utf8");

        return {
          contents: text.replace(
            'import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";',
            ""
          ),
        };
      }
    );
  },
};

// 插件加入 Vite 预构建配置
{
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildPatchPlugin];
    }
  }
}
```