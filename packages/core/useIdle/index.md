---
category: Sensors
---

# useIdle

跟踪用户是否处于非活动状态。

## 用法

```ts
import { useIdle } from '@vueuse/core'

const { idle, lastActive } = useIdle(5 * 60 * 1000) // 5分钟

console.log(idle.value) // true 或 false
```

以编程方式重置：

```ts
import { useCounter, useIdle } from '@vueuse/core'
import { watch } from 'vue'

const { inc, count } = useCounter()

const { idle, lastActive, reset } = useIdle(5 * 60 * 1000) // 5分钟

watch(idle, (idleValue) => {
  if (idleValue) {
    inc()
    console.log(`触发了 ${count.value} 次`)
    reset() // 重新启动空闲计时器。不会改变lastActive值
  }
})
```

## 组件用法

```vue
<template>
  <UseIdle v-slot="{ idle }" :timeout="5 * 60 * 1000">
    是否空闲: {{ idle }}
  </UseIdle>
</template>
```