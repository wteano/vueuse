---
category: 元素
---

# useMutationObserver

监听DOM树的变化。[MutationObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## 用法

```vue
<script setup lang="ts">
import { useMutationObserver } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

const el = useTemplateRef('el')
const messages = ref([])

useMutationObserver(el, (mutations) => {
  if (mutations[0])
    messages.value.push(mutations[0].attributeName)
}, {
  attributes: true,
})
</script>

<template>
  <div ref="el">
    Hello VueUse
  </div>
</template>
```