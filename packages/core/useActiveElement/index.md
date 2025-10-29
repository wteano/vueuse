<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:39:20
 * @FilePath: \vueuse\packages\core\useActiveElement\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: Elements
---

# useActiveElement
# 响应式活动元素

Reactive `document.activeElement`
响应式的 `document.activeElement`

## Usage
## 用法

```vue
<script setup lang="ts">
import { useActiveElement } from '@vueuse/core'
import { watch } from 'vue'

const activeElement = useActiveElement()

watch(activeElement, (el) => {
  console.log('focus changed to', el)
})
</script>
```

## Component Usage
## 组件用法

```vue
<template>
  <UseActiveElement v-slot="{ element }">
    Active element is {{ element?.dataset.id }}
  </UseActiveElement>
</template>
```