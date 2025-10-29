---
category: 浏览器
---

# useClipboard

响应式[剪贴板API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)。提供响应剪贴板命令（剪切、复制和粘贴）以及异步读取和写入系统剪贴板的能力。对剪贴板内容的访问受到[权限API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)的保护。未经用户许可，不允许读取或更改剪贴板内容。

<CourseLink href="https://vueschool.io/lessons/reactive-browser-wrappers-in-vueuse-useclipboard?friend=vueuse">通过这个来自Vue School的免费视频课程学习如何响应式地将文本保存到剪贴板！</CourseLink>

## 用法

```vue
<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const source = ref('Hello')
const { text, copy, copied, isSupported } = useClipboard({ source })
</script>

<template>
  <div v-if="isSupported">
    <button @click="copy(source)">
      <!-- 默认情况下，`copied`将在1.5秒后重置 -->
      <span v-if="!copied">复制</span>
      <span v-else>已复制！</span>
    </button>
    <p>当前复制内容: <code>{{ text || '无' }}</code></p>
  </div>
  <p v-else>
    您的浏览器不支持剪贴板API
  </p>
</template>
```

设置`legacy: true`以在[剪贴板API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)不可用时保持复制能力。它将使用[execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)作为回退方式处理复制。

## 组件用法

```vue
<template>
  <UseClipboard v-slot="{ copy, copied }" source="复制我">
    <button @click="copy()">
      {{ copied ? '已复制' : '复制' }}
    </button>
  </UseClipboard>
</template>
```