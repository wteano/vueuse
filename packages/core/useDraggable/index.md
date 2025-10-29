---
category: 元素
---

# useDraggable

使元素可拖动。

## 用法

```vue
<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const el = useTemplateRef<HTMLElement>('el')

// `style` 将是一个用于 `left: ?px; top: ?px;` 的辅助计算属性
const { x, y, style } = useDraggable(el, {
  initialValue: { x: 40, y: 40 },
})
</script>

<template>
  <div ref="el" :style="style" style="position: fixed">
    拖动我！我在 {{ x }}, {{ y }}
  </div>
</template>
```

设置 `preventDefault: true` 以覆盖浏览器中某些元素的默认拖放行为。

```ts
import { useDraggable } from '@vueuse/core'
// ---cut---
const { x, y, style } = useDraggable(el, {
  preventDefault: true,
  // 使用 `preventDefault: true`
  // 你可以禁用原生行为（例如，对于 img）
  // 并控制拖放，防止浏览器干扰。
})
```

## 组件用法

```vue
<template>
  <UseDraggable v-slot="{ x, y }" :initial-value="{ x: 10, y: 10 }">
    拖动我！我在 {{ x }}, {{ y }}
  </UseDraggable>
</template>
```

对于组件用法，可以向组件传递额外的属性 `storageKey` 和 `storageType`，并启用元素位置的持久化。

```vue
<template>
  <UseDraggable storage-key="vueuse-draggable" storage-type="session">
    刷新页面，我仍然在相同的位置！
  </UseDraggable>
</template>
```