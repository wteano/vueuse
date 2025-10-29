---
category: 传感器
---

# useMousePressed

响应式鼠标按压状态。通过目标元素上的 `mousedown` `touchstart` 触发，通过窗口上的 `mouseup` `mouseleave` `touchend` `touchcancel` 释放。

## 基本用法

```ts
import { useMousePressed } from '@vueuse/core'

const { pressed } = useMousePressed()
```

默认启用触摸。如果只想检测鼠标变化，请将 `touch` 设置为 `false`

```ts
import { useMousePressed } from '@vueuse/core'
// ---cut---
const { pressed } = useMousePressed({ touch: false })
```

如果只想在特定元素上捕获 `mousedown` 和 `touchstart`，可以通过传递元素的 ref 来指定 `target`。

```vue
<script setup lang="ts">
import { useMousePressed } from '@vueuse/core'
// ---cut---
import { useTemplateRef } from 'vue'

const el = useTemplateRef<HTMLDivElement>('el')

const { pressed } = useMousePressed({ target: el })
</script>

<template>
  <div ref="el">
    只有点击此元素才会触发更新。
  </div>
</template>
```

## 组件用法

```vue
<template>
  <UseMousePressed v-slot="{ pressed }">
    是否按下: {{ pressed }}
  </UseMousePressed>
</template>
```