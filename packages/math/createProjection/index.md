---
category: '@Math'
related: useProjection, createGenericProjection
---

# createProjection

响应式地将数值从一个范围映射到另一个范围。

## 用法

```ts
import { createProjection } from '@vueuse/math'

const useProjector = createProjection([0, 10], [0, 100])
const input = ref(0)
const projected = useProjector(input) // projected.value === 0

input.value = 5 // projected.value === 50
input.value = 10 // projected.value === 100
```