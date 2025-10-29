---
category: Animation
---

# useIntervalFn

带有控制功能的`setInterval`包装器

## 用法

```ts
import { useIntervalFn } from '@vueuse/core'

const { pause, resume, isActive } = useIntervalFn(() => {
  /* 你的函数 */
}, 1000)
```