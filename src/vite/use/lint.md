# 使用lint工具保证代码质量和风格
`代码是给人看的，其次才是给机器运行的`

多人协作的情况下，统一代码风格可以帮助提高代码可读性，提升代码质量和开发效率，甚至可以提前规避下语法错误。我们借助lint工具可以保证规范落地，将代码风格和质量交给lint工具自定完成，开发者只需要注重应用逻辑本身。

下面我们将引入`ESLint` `prettier` `husky`等主流Lint工具，并借助lint-staged和vscode插件，搭建完整的前端开发和代码提交工作流。

## Eslint
Eslint是代码静态检查工具，通过解析代码的 AST 来分析代码格式，检查代码的风格和质量问题。

### 安装
先安装eslint的npm包
``` bash 
pnpm i eslint -D
```
执行下述Eslint的初始化命令,执行交互式命令

``` bash 
npx eslint --init
```
Eslint帮我们生成`.eslintrc.json`配置文件，由于项目中使用了Ts和React,还需要安装以下依赖包。
```bash
pnpm i eslint-plugin-react@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest -D
```
### 配置相关  
简单介绍一下elsint配置文件，细节可以查看[文档详情](http://eslint.cn/docs/user-guide/configuring)
1. `env` 和 `globals`
env 指名了一组预定义的全局变量，例如 **browser** **node** 等等。
而globals定义了eslint不知道的全局变量。
2. parser 解释器

ESLint 底层默认使用 Espree来进行 AST 解析，这个解析器目前已经基于 Acron 来实现，虽然说 Acron 目前能够解析绝大多数的 ECMAScript 规范的语法，但还是不支持 TypeScript ，因此需要引入其他的解析器完成 TS 的解析。

社区提供了@typescript-eslint/parser这个解决方案，专门为了 TypeScript 的解析而诞生，将 TS 代码转换为 Espree 能够识别的格式(即 Estree 格式)，然后在 Eslint 下通过Espree进行格式检查， 以此兼容了 TypeScript 语法。

3. parserOptions  解析器选项

这个配置可以对上述的解析器进行能力定制，默认情况下 ESLint 支持 ES5 语法，你可以配置这个选项，具体内容如下:

ecmaVersion: 这个配置和 Acron 的 ecmaVersion 是兼容的，可以配置 ES + 数字(如 ES6)或者ES + 年份(如 ES2015)，也可以直接配置为latest，启用最新的 ES 语法。
sourceType: 默认为script，如果使用 ES Module 则应设置为module
ecmaFeatures: 为一个对象，表示想使用的额外语言特性，如开启 jsx。

4. rule 具体代码规则 

rules 配置即代表在 ESLint 中手动调整哪些代码规则，比如禁止在 if 语句中使用赋值语句这条规则可以像如下的方式配置:
``` js
// .eslintrc.js
module.exports = {
  // 其它配置省略
  rules: {
    // key 为规则名，value 配置内容
    "no-cond-assign": ["error", "always"]
  }
}
``` 
5. plugins 非js原生代码提供规则和解释器 https://eslint.org/docs/latest/use/configure/plugins
6. extends 

extends 相当于继承另外一份 ESLint 配置，可以配置为一个字符串，也可以配置成一个字符串数组。主要分如下 3 种情况:

从 ESLint 本身继承；
从类似 eslint-config-xxx 的 npm 包继承；
从 ESLint 插件继承。


## Prettier
虽然Eslint在代码风格的检测和校验有着出色的表现，但是仅限于类js语言,prettier在格式化上有着更广泛的应用。

## Husky  pre-commit 和 commit-msg
pre-commit 支持在提交前执行命令，例如单元测试，对暂存区的修改进行格式化
commit-msg 主要是为了规范我们提交commit信息的格式