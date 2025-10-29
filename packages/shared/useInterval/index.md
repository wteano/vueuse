---
category: Animation
---

# useInterval

每个间隔递增的响应式计数器

## 用法

```ts
import { useInterval } from '@vueuse/core'

// 计数器每200ms递增一次
const counter = useInterval(200)
```

```ts
import { useInterval } from '@vueuse/core'
// ---cut---
const { counter, reset, pause, resume } = useInterval(200, {
  controls: true
})
```