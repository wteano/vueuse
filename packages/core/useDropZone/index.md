---
category: 元素
---

# useDropZone

创建可以放置文件的区域。

::: warning

由于Safari浏览器的限制，文件类型验证只能在放置事件期间进行，而不能在拖动事件期间进行。因此，在Safari中，无论文件类型如何，拖动操作期间`isOverDropZone`值将始终为`true`。

:::

## 用法

```vue
<script setup lang="ts">
import { useDropZone } from '@vueuse/core'
import { ref } from 'vue'

const dropZoneRef = ref<HTMLDivElement>()

function onDrop(files: File[] | null) {
  // 当文件放置在区域上时调用
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  // 指定要接收的数据类型。
  dataTypes: ['image/jpeg'],
  // 控制多文件放置
  multiple: true,
  // 是否为未处理的事件阻止默认行为
  preventDefaultForUnhandled: false,
})
</script>

<template>
  <div ref="dropZoneRef">
    在此处放置文件
  </div>
</template>
```