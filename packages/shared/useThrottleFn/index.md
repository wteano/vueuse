---
category: 工具
related: refThrottled, refDebounced, useDebounceFn
---

# useThrottleFn

节流执行一个函数。对于限制事件处理程序（如resize和scroll）的执行速率特别有用。

> 节流就像一个扔球的弹簧：球飞出后需要一些时间收缩回来，所以在准备好之前它不能扔出更多的球。

## 用法

```ts
import { useThrottleFn } from '@vueuse/core'

const throttledFn = useThrottleFn(() => {
  // 做一些事情，它每秒最多被调用1次
}, 1000)

useEventListener(window, 'resize', throttledFn)
```

## 推荐阅读

- [**防抖 vs 节流**：权威视觉指南](https://kettanaito.com/blog/debounce-vs-throttle)
```