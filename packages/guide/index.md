# 入门指南

<CourseLink href="https://vueschool.io/courses/vueuse-for-everyone?friend=vueuse">通过视频学习VueUse</CourseLink>

VueUse是一个基于[组合式API](https://vuejs.org/guide/extras/composition-api-faq.html)的实用函数集合。我们假设您在继续之前已经熟悉[组合式API](https://vuejs.org/guide/extras/composition-api-faq.html)的基本概念。

## 安装

> 从v12.0开始，VueUse不再支持Vue 2。请使用v11.x以支持Vue 2。

```bash
npm i @vueuse/core
```

[附加组件](/add-ons.html) | [Nuxt模块](/guide/index.html#nuxt)

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

### Nuxt

从v7.2.0开始，我们提供了一个Nuxt模块，为Nuxt 3和Nuxt Bridge启用自动导入。

使用[@nuxt/cli](https://nuxt.com/docs/api/commands/module)将vueuse模块安装到您的应用程序中：

```bash
npx nuxt@latest module add vueuse
```

或者使用npm：

```bash
npm i -D @vueuse/nuxt @vueuse/core
```

Nuxt 3

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
  ],
})
```

然后您可以在Nuxt应用程序的任何地方使用VueUse函数。例如：

```vue twoslash
<script setup lang="ts">
// ---cut-start---
// 实际上是自动导入的，但这里我们需要告诉TwoSlash
import { useMouse } from '@vueuse/core'
// ---cut-end---
const { x, y } = useMouse()
</script>

<template>
  <div>位置: {{ x }}, {{ y }}</div>
</template>
```

## 使用示例

只需从`@vueuse/core`导入您需要的函数

```vue twoslash
<script setup>
import { useLocalStorage, useMouse, usePreferredDark } from '@vueuse/core'

// 跟踪鼠标位置
const { x, y } = useMouse()

// 用户是否偏好深色主题
const isDark = usePreferredDark()

// 在localStorage中持久化状态
const store = useLocalStorage(
  'my-storage',
  {
    name: 'Apple',
    color: 'red',
  },
)
</script>
```

参考[函数列表](/functions)了解更多详情。