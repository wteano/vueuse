---
category: 工具
related: useThrottleFn
---

# useDebounceFn

防抖执行一个函数。

> 防抖就像一个忙碌的服务员：如果你不停地点餐，你的请求将被忽略，直到你停下来并给他们一些时间来考虑你最新的请求。

## 用法

```ts
import { useDebounceFn, useEventListener } from '@vueuse/core'

const debouncedFn = useDebounceFn(() => {
  // 做一些事情
}, 1000)

useEventListener(window, 'resize', debouncedFn)
```

你也可以传递第三个参数，设置最大等待时间，类似于[lodash的debounce](https://lodash.com/docs/4.17.15#debounce)

```ts
import { useDebounceFn, useEventListener } from '@vueuse/core'

// 如果由于重复输入在5000毫秒内没有调用，
// 函数仍然会被调用。
const debouncedFn = useDebounceFn(() => {
  // 做一些事情
}, 1000, { maxWait: 5000 })

useEventListener(window, 'resize', debouncedFn)
```

可选地，你可以使用Promise操作来获取函数的返回值。

```ts
import { useDebounceFn } from '@vueuse/core'

const debouncedRequest = useDebounceFn(() => 'response', 1000)

debouncedRequest().then((value) => {
  console.log(value) // 'response'
})

// 或者使用async/await
async function doRequest() {
  const value = await debouncedRequest()
  console.log(value) // 'response'
}
```

由于当开发者不需要返回值时，未处理的拒绝错误相当烦人，所以**默认情况下**，如果函数被取消，Promise将**不会**被拒绝。你需要指定选项`rejectOnCancel: true`来捕获拒绝。

```ts
import { useDebounceFn } from '@vueuse/core'

const debouncedRequest = useDebounceFn(() => 'response', 1000, { rejectOnCancel: true })

debouncedRequest()
  .then((value) => {
    // 做一些事情
  })
  .catch(() => {
    // 取消时做的一些事情
  })

// 再次调用将取消之前的请求并被拒绝
setTimeout(debouncedRequest, 500)
```

## 推荐阅读

- [**防抖 vs 节流**：权威视觉指南](https://kettanaito.com/blog/debounce-vs-throttle)