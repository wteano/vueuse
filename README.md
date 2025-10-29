<p align="center">
<a href="https://github.com/vueuse/vueuse#gh-light-mode-only">
  <img src="https://raw.githubusercontent.com/vueuse/vueuse/main/packages/public/logo-vertical.png#gh-light-mode-only" alt="VueUse - Vue组合式API工具集合" width="300">
</a>
<a href="https://github.com/vueuse/vueuse#gh-dark-mode-only">
  <img src="https://raw.githubusercontent.com/vueuse/vueuse/main/packages/public/logo-vertical-dark.png#gh-dark-mode-only" alt="VueUse - Vue组合式API工具集合" width="300">
</a>
<br>
Vue组合式API实用工具集合
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@vueuse/core" target="__blank"><img src="https://img.shields.io/npm/v/@vueuse/core?color=a1b858&label=" alt="NPM版本"></a>
<a href="https://www.npmjs.com/package/@vueuse/core" target="__blank"><img alt="NPM下载量" src="https://img.shields.io/npm/dm/@vueuse/core?color=50a36f&label="></a>
<a href="https://app.codecov.io/gh/vueuse/vueuse"><img alt="代码覆盖率" src="https://img.shields.io/codecov/c/github/vueuse/vueuse?color=42b883&labelColor=354a5e"></a>
<a href="https://vueuse.org" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=docs%20%26%20demos&color=1e8a7a" alt="文档与演示"></a>
<img alt="函数数量" src="https://vueuse.org/badge-function-count.svg">
<br>
<a href="https://github.com/vueuse/vueuse" target="__blank"><img alt="GitHub星标" src="https://img.shields.io/github/stars/vueuse/vueuse?style=social"></a>
</p>

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'>
  </a>
</p>

## 🚀 特性

- 🎪 [**交互式文档与演示**](https://vueuse.org)
- ⚡ **完全可摇树优化**：只取你需要的，[打包体积小](https://vueuse.org/export-size)
- 🦾 **强类型**：使用[TypeScript](https://www.typescriptlang.org/)编写，带有[TS文档](https://github.com/microsoft/tsdoc)
- 🔋 **SSR友好**
- 🌎 **无需打包工具**：可通过CDN使用
- 🔩 **灵活**：可配置的事件过滤器和目标
- 🔌 **可选[附加组件](https://vueuse.org/add-ons)**：路由器、Firebase、RxJS等

## 🦄 使用

```ts
import { useLocalStorage, useMouse, usePreferredDark } from '@vueuse/core'

const { x, y } = useMouse()

// 如果用户偏好深色主题
const isDark = usePreferredDark()

// 在localStorage中持久化状态
const store = useLocalStorage(
  'my-storage',
  {
    name: 'Apple',
    color: 'red',
  },
)
```

参考[函数列表](https://vueuse.org/functions)或[文档](https://vueuse.org/)了解更多详情。

## 📦 安装

> 从v14.0开始，VueUse需要Vue v3.5+
> 从v13.0开始，VueUse需要Vue v3.3+
> 从v12.0开始，VueUse不再支持Vue 2。请使用v11.x以支持Vue 2。

```bash
npm i @vueuse/core
```

[附加组件](https://vueuse.org/add-ons.html) | [Nuxt模块](https://vueuse.org/guide/index.html#nuxt)

###### 演示

- [Vite + Vue 3](https://github.com/vueuse/vueuse-vite-starter)
- [Nuxt 3 + Vue 3](https://github.com/antfu/vitesse-nuxt3)
- [Webpack + Vue 3](https://github.com/vueuse/vueuse-vue3-example)

### CDN

```vue
<script src="https://unpkg.com/@vueuse/shared"></script>

<script src="https://unpkg.com/@vueuse/core"></script>
```

它将作为`window.VueUse`暴露到全局

## 🪴 项目活动

![Alt](https://repobeats.axiom.co/api/embed/a406ba7461a6a087dbdb14d4395046c948d44c51.svg 'Repobeats分析图像')

## 🧱 贡献

查看[**贡献指南**](https://vueuse.org/contributing)

## 🌸 致谢

这个项目深受以下优秀项目的启发：

- [streamich/react-use](https://github.com/streamich/react-use)
- [u3u/vue-hooks](https://github.com/u3u/vue-hooks)
- [logaretm/vue-use-web](https://github.com/logaretm/vue-use-web)
- [kripod/react-hooks](https://github.com/kripod/react-hooks)

并感谢[GitHub上的所有贡献者](https://github.com/vueuse/vueuse/graphs/contributors)！

## 👨‍🚀 贡献者

### Open Collective上的财务贡献者

<a href="https://opencollective.com/vueuse"><img src="https://opencollective.com/vueuse/individuals.svg?width=890"></a>

## 📄 许可证

[MIT许可证](https://github.com/vueuse/vueuse/blob/main/LICENSE) © 2019-至今 [Anthony Fu](https://github.com/antfu)