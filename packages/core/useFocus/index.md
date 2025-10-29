---
category: Sensors
---

# useFocus

响应式工具，用于跟踪或设置DOM元素的焦点状态。状态变化会反映目标元素是否为聚焦元素。从外部设置响应式值将分别为`true`和`false`值触发`focus`和`blur`事件。

## 基本用法

```ts
import { useFocus } from '@vueuse/core'

const target = shallowRef()
const { focused } = useFocus(target)

watch(focused, (focused) => {
  if (focused)
    console.log('输入元素已获得焦点')
  else console.log('输入元素已失去焦点')
})
```

## 设置初始焦点

要在元素首次渲染时聚焦，可以将`initialValue`选项设置为`true`。这将在目标元素上触发`focus`事件。

```ts
import { useFocus } from '@vueuse/core'

const target = shallowRef()
const { focused } = useFocus(target, { initialValue: true })
```

## 更改焦点状态

`focused`响应式ref的变化将分别为`true`和`false`值自动触发`focus`和`blur`事件。您可以利用此行为来聚焦目标元素作为另一个操作的结果（例如，如下所示的按钮点击）。

```vue
<script setup lang="ts">
import { useFocus } from '@vueuse/core'
import { shallowRef } from 'vue'

const input = shallowRef()
const { focused } = useFocus(input)
</script>

<template>
  <div>
    <button type="button" @click="focused = true">
      点击我以聚焦下方输入框
    </button>
    <input ref="input" type="text">
  </div>
</template>
```