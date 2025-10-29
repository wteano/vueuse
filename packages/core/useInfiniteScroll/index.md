---
category: 传感器
---

# useInfiniteScroll

元素的无限滚动。

## 用法

```vue
<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

const el = useTemplateRef<HTMLElement>('el')
const data = ref([1, 2, 3, 4, 5, 6])

const { reset } = useInfiniteScroll(
  el,
  () => {
    // 加载更多
    data.value.push(...moreData)
  },
  {
    distance: 10,
    canLoadMore: () => {
      // 指示何时没有更多内容可加载，以便onLoadMore停止触发
      // if (noMoreContent) return false
      return true // 用于演示目的
    },
  }
)

function resetList() {
  data.value = []
  reset()
}
</script>

<template>
  <div ref="el">
    <div v-for="item in data">
      {{ item }}
    </div>
  </div>
  <button @click="resetList()">
    重置
  </button>
</template>
```

## 方向

不同的滚动方向需要不同的CSS样式设置：

| 方向 | 必需的CSS |
| --- | --- |
| `bottom`（默认） | 无需特殊设置 |
| `top` | `display: flex;`<br>`flex-direction: column-reverse;` |
| `left` | `display: flex;`<br>`flex-direction: row-reverse;` |
| `right` | `display: flex;` |

::: warning
确保使用`canLoadMore`指示何时没有更多内容可加载，否则只要有更多内容的空间，`onLoadMore`就会触发。
:::

## 指令用法

```vue
<script setup lang="ts">
import { vInfiniteScroll } from '@vueuse/components'
import { ref } from 'vue'

const data = ref([1, 2, 3, 4, 5, 6])

function onLoadMore() {
  const length = data.value.length + 1
  data.value.push(...Array.from({ length: 5 }, (_, i) => length + i))
}
function canLoadMore() {
  // 指示何时没有更多内容可加载，以便onLoadMore停止触发
  // if (noMoreContent) return false
  return true // 用于演示目的
}
</script>

<template>
  <div v-infinite-scroll="onLoadMore">
    <div v-for="item in data" :key="item">
      {{ item }}
    </div>
  </div>

  <!-- 带选项 -->
  <div v-infinite-scroll="[onLoadMore, { distance: 10, canLoadMore }]">
    <div v-for="item in data" :key="item">
      {{ item }}
    </div>
  </div>
</template>
```