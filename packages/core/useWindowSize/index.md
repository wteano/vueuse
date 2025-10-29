---
category: 元素
---

# useWindowSize

响应式的窗口大小

## 用法

```vue
<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()
</script>

<template>
  <div>
    宽度: {{ width }}
    高度: {{ height }}
  </div>
</template>
```

## 组件用法

```vue
<template>
  <UseWindowSize v-slot="{ width, height }">
    宽度: {{ width }}
    高度: {{ height }}
  </UseWindowSize>
</template>
```