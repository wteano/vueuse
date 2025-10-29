---
category: 浏览器
related:
  - useDark
  - usePreferredDark
  - useStorage
---

# useColorMode

响应式颜色模式（暗色 / 亮色 / 自定义），具有自动数据持久化功能。

## 基本用法

```ts
import { useColorMode } from '@vueuse/core'

const mode = useColorMode() // Ref<'dark' | 'light'>
```

默认情况下，它将使用`usePreferredDark`（即`auto`模式）匹配用户的浏览器偏好。读取ref时，默认返回当前颜色模式（`dark`、`light`或您的自定义模式）。通过启用`emitAuto`选项，`auto`模式可以包含在返回的模式中。写入ref时，它将触发DOM更新并将颜色模式持久化到本地存储（或您的自定义存储）。您可以传递`auto`以设置回自动模式。

```ts
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()
// ---cut---
mode.value // 'dark' | 'light'

mode.value = 'dark' // 更改为暗色模式并持久化

mode.value = 'auto' // 更改为自动模式
```

## 配置

```ts
import { useColorMode } from '@vueuse/core'

const mode = useColorMode({
  attribute: 'theme',
  modes: {
    // 自定义颜色
    dim: 'dim',
    cafe: 'cafe',
  },
}) // Ref<'dark' | 'light' | 'dim' | 'cafe'>
```

## 高级用法

您还可以显式访问系统偏好和存储的用户覆盖模式。

```ts
import { useColorMode } from '@vueuse/core'

const { system, store } = useColorMode()

system.value // 'dark' | 'light'
store.value // 'dark' | 'light' | 'auto'

const myColorMode = computed(() => store.value === 'auto' ? system.value : store.value)
```

## 组件用法

```vue
<template>
  <UseColorMode v-slot="color">
    <button @click="color.mode = color.mode === 'dark' ? 'light' : 'dark'">
      模式 {{ color.mode }}
    </button>
  </UseColorMode>
</template>
```