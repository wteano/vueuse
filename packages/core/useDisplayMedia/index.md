---
category: 传感器
related: useUserMedia
---

# useDisplayMedia

响应式 [`mediaDevices.getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) 流。

## 用法

```vue
<script setup lang="ts">
import { useDisplayMedia } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const { stream, start } = useDisplayMedia()

// 开始流
start()

const videoRef = useTemplateRef('video')
watchEffect(() => {
  // 在视频元素上预览
  videoRef.value.srcObject = stream.value
})
</script>

<template>
  <video ref="video" />
</template>
```