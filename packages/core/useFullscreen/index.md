---
category: Browser
---

# useFullscreen

响应式[全屏API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)。它提供了将特定元素（及其后代）以全屏模式显示的方法，以及在不再需要时退出全屏模式的方法。这使得可以使用用户的整个屏幕来呈现所需内容（例如在线游戏），从屏幕上移除所有浏览器用户界面元素和其他应用程序，直到全屏模式关闭。

## 用法

```ts
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, enter, exit, toggle } = useFullscreen()
```

使指定元素全屏显示。某些平台（如iOS的Safari）只允许视频元素全屏显示。

```vue
<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const el = useTemplateRef('el')
const { isFullscreen, enter, exit, toggle } = useFullscreen(el)
</script>

<template>
  <video ref="el" />
</template>
```

## 组件用法

```vue
<template>
  <UseFullscreen v-slot="{ toggle }">
    <video />
    <button @click="toggle">
      进入全屏
    </button>
  </UseFullscreen>
</template>
```