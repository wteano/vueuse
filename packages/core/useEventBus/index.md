---
category: 工具
---

# useEventBus

一个基本的事件总线。

## 用法

```ts
import { useEventBus } from '@vueuse/core'

const bus = useEventBus<string>('news')

function listener(event: string) {
  console.log(`新闻: ${event}`)
}

// 监听事件
const unsubscribe = bus.on(listener)

// 触发事件
bus.emit('东京奥运会已经开始')

// 取消注册监听器
unsubscribe()
// 或者
bus.off(listener)

// 清除所有监听器
bus.reset()
```

在组件`setup`中注册的监听器将在组件卸载时自动取消注册。

## TypeScript

使用`EventBusKey`是将事件类型绑定到键的关键，类似于Vue的[`InjectionKey`](https://antfu.me/posts/typed-provide-and-inject-in-vue)工具。

```ts
// fooKey.ts
import type { EventBusKey } from '@vueuse/core'

export const fooKey: EventBusKey<{ name: foo }> = Symbol('symbol-key')
```

```ts
import { useEventBus } from '@vueuse/core'

import { fooKey } from './fooKey'

const bus = useEventBus(fooKey)

bus.on((e) => {
  // `e` 将是 `{ name: foo }`
})
```