---
category: 浏览器
---

# useEventListener

轻松使用EventListener。在挂载时使用[addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)注册事件，在卸载时自动使用[removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)移除。

## 用法

```ts
import { useEventListener } from '@vueuse/core'

useEventListener(document, 'visibilitychange', (evt) => {
  console.log(evt)
})
```

您还可以传递一个ref作为事件目标，当您更改目标时，`useEventListener`将取消注册前一个事件并注册新事件。

```vue
<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const element = useTemplateRef('element')
useEventListener(element, 'keydown', (e) => {
  console.log(e.key)
})
</script>

<template>
  <div v-if="cond" ref="element">
    Div1
  </div>
  <div v-else ref="element">
    Div2
  </div>
</template>
```

您还可以调用返回的函数来取消注册监听器。

```ts
import { useEventListener } from '@vueuse/core'

const cleanup = useEventListener(document, 'keydown', (e) => {
  console.log(e.key)
})

cleanup() // 这将取消注册监听器。
```

注意，如果您的组件也在SSR（服务器端渲染）中运行，您可能会遇到错误（如`document is not defined`），因为像`document`和`window`这样的DOM API在Node.js中不可用。为避免这种情况，您可以将逻辑放在`onMounted`钩子内。

```ts
import { useEventListener } from '@vueuse/core'
// ---cut---
// onMounted只会在客户端调用
// 因此它保证DOM API可用。
onMounted(() => {
  useEventListener(document, 'keydown', (e) => {
    console.log(e.key)
  })
})
```