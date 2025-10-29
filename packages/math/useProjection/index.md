---
category: '@Math'
related: createGenericProjection
---

# useProjection

响应式地将数值从一个范围映射到另一个范围。

## 用法

```ts
import { useProjection } from '@vueuse/math'

const input = ref(0)
const projected = useProjection(input, [0, 10], [0, 100])

input.value = 5 // projected.value === 50
input.value = 10 // projected.value === 100
```