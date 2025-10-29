---
category: 元素
---

# useResizeObserver

报告元素内容或边框盒尺寸的变化

## 用法

```vue
<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

const el = useTemplateRef('el')
const text = ref('')

useResizeObserver(el, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  text.value = `宽度: ${width}, 高度: ${height}`
})
</script>

<template>
  <div ref="el">
    {{ text }}
  </div>
</template>
```

## 指令用法

```vue
<script setup lang="ts">
import { vResizeObserver } from '@vueuse/components'

const text = ref('')

function onResizeObserver(entries) {
  const [entry] = entries
  const { width, height } = entry.contentRect
  text.value = `宽度: ${width}, 高度: ${height}`
}
</script>

<template>
  <div v-resize-observer="onResizeObserver">
    {{ text }}
  </div>
</template>
```

[ResizeObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)