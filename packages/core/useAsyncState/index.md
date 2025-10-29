---
category: State
---

# useAsyncState
# 异步状态管理

Reactive async state. Will not block your setup function and will trigger changes once the promise is ready. The state is a `shallowRef` by default.
响应式异步状态。不会阻塞您的setup函数，并在promise准备就绪时触发更改。状态默认为`shallowRef`。

## Usage
## 用法

```ts
import { useAsyncState } from '@vueuse/core'
import axios from 'axios'

const { state, isReady, isLoading } = useAsyncState(
  axios
    .get('https://jsonplaceholder.typicode.com/todos/1')
    .then(t => t.data),
  { id: null },
)
```

### Manually trigger the async function
### 手动触发异步函数

You can also trigger it manually. This is useful when you want to control when the async function is executed.
您也可以手动触发它。这在您想控制异步函数何时执行时很有用。

```vue
<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'

const { state, execute, executeImmediate } = useAsyncState(action, '', { immediate: false })

async function action(event) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return `${event.target.textContent} clicked!`
}
</script>

<template>
  <p>State: {{ state }}</p>

  <button class="button" @click="executeImmediate">
    Execute now
  </button>

  <button class="ml-2 button" @click="event => execute(500, event)">
    Execute with delay
  </button>
</template>
```