---
category: '@Math'
---

# useClamp

响应式地将值限制在两个其他值之间。

## 用法

```ts
import { useClamp } from '@vueuse/math'

const min = shallowRef(0)
const max = shallowRef(10)
const value = useClamp(0, min, max)
```

你也可以传入一个`ref`，当源ref变化时，返回的`computed`会更新：

```ts
import { useClamp } from '@vueuse/math'

const number = shallowRef(0)
const clamped = useClamp(number, 0, 10)
```