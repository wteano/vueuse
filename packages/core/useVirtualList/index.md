---
category: 组件
---

# useVirtualList

::: warning
如果您需要更多功能，请考虑使用 [`vue-virtual-scroller`](https://github.com/Akryum/vue-virtual-scroller) 代替。
:::

轻松创建虚拟列表。虚拟列表（有时称为[_虚拟滚动器_](https://vue-virtual-scroller-demo.netlify.app/)）允许您高效地渲染大量项目。它们只使用`wrapper`元素模拟`container`元素的完整高度，仅渲染在`container`元素内显示项目所需的最小DOM节点数量。

## 用法

### 简单列表

```ts
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  Array.from(Array.from({ length: 99999 }).keys()),
  {
    // 保持 `itemHeight` 与项目的行高同步。
    itemHeight: 22,
  },
)
```

### 配置

| 状态        | 类型     | 描述                                                                                     |
| ---------- | -------- | ----------------------------------------------------------------------------------------------- |
| itemHeight | `number` | 确保 `wrapper` 元素的总高度计算正确。\*                |
| itemWidth  | `number` | 确保 `wrapper` 元素的总宽度计算正确。\*                 |
| overscan   | `number` | 预渲染的DOM节点数量。如果您滚动非常快，可以防止项目之间出现空白。 |

\* `itemHeight` 或 `itemWidth` 必须与每行的渲染高度保持同步。如果您在滚动到列表底部时看到额外的空白或抖动，请确保 `itemHeight` 或 `itemWidth` 与行的高度相同。

### 响应式列表

```ts
import { useToggle, useVirtualList } from '@vueuse/core'
import { computed } from 'vue'

const [isEven, toggle] = useToggle()
const allItems = Array.from(Array.from({ length: 99999 }).keys())
const filteredList = computed(() => allItems.filter(i => isEven.value ? i % 2 === 0 : i % 2 === 1))

const { list, containerProps, wrapperProps } = useVirtualList(
  filteredList,
  {
    itemHeight: 22,
  },
)
```

```vue
<template>
  <p>显示 {{ isEven ? '偶数' : '奇数' }} 项目</p>
  <button @click="toggle">
    切换偶数/奇数
  </button>
  <div v-bind="containerProps" style="height: 300px">
    <div v-bind="wrapperProps">
      <div v-for="item in list" :key="item.index" style="height: 22px">
        行: {{ item.data }}
      </div>
    </div>
  </div>
</template>
```

### 水平列表

```ts
import { useVirtualList } from '@vueuse/core'

const allItems = Array.from(Array.from({ length: 99999 }).keys())

const { list, containerProps, wrapperProps } = useVirtualList(
  allItems,
  {
    itemWidth: 200,
  },
)
```

```vue
<template>
  <div v-bind="containerProps" style="height: 300px">
    <div v-bind="wrapperProps">
      <div v-for="item in list" :key="item.index" style="width: 200px">
        行: {{ item.data }}
      </div>
    </div>
  </div>
</template>
```

## 组件用法

```vue
<template>
  <UseVirtualList :list="list" :options="options" height="300px">
    <template #default="props">
      <!-- 您可以在这里获取列表的当前项目 -->
      <div style="height: 22px">
        行 {{ props.index }} {{ props.data }}
      </div>
    </template>
  </UseVirtualList>
</template>
```

要滚动到特定元素，组件暴露了 `scrollTo(index: number) => void` 方法。