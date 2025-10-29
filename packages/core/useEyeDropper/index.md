---
category: 浏览器
---

# useEyeDropper

响应式[EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)

## 用法

```ts
import { useEyeDropper } from '@vueuse/core'

const { isSupported, open, sRGBHex } = useEyeDropper()
```

## 组件用法

```vue
<template>
  <UseEyeDropper v-slot="{ isSupported, sRGBHex, open }">
    <button :disabled="!isSupported" @click="() => open()">
      sRGBHex: {{ sRGBHex }}
    </button>
  </UseEyeDropper>
</template>
```