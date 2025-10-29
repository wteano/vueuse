---
category: Array
---

# useArrayDifference

响应式获取两个数组的差集
Reactive get array difference of two arrays.

默认情况下，它返回第一个数组相对于第二个数组的差集，即 `A \ B`，B在A中的[相对补集](<https://en.wikipedia.org/wiki/Complement_(set_theory)>)。

您可以传递 `symmetric` 选项来获取两个数组的[对称差集](https://en.wikipedia.org/wiki/Symmetric_difference) `A △ B`。

## 用法

### 与响应式数组一起使用

```ts
import { useArrayDifference } from '@vueuse/core'

const list1 = ref([0, 1, 2, 3, 4, 5])
const list2 = ref([4, 5, 6])
const result = useArrayDifference(list1, list2)
// result.value: [0, 1, 2, 3]
list2.value = [0, 1, 2]
// result.value: [3, 4, 5]
```

### 与响应式数组一起使用并使用函数比较

```ts
import { useArrayDifference } from '@vueuse/core'

const list1 = ref([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
const list2 = ref([{ id: 4 }, { id: 5 }, { id: 6 }])

const result = useArrayDifference(list1, list2, (value, othVal) => value.id === othVal.id)
// result.value: [{ id: 1 }, { id: 2 }, { id: 3 }]
```

### 对称差集

通过传递 `symmetric` 选项，此组合式函数也支持[对称差集](https://en.wikipedia.org/wiki/Symmetric_difference)。

```ts {10}
import { useArrayDifference } from '@vueuse/core'

const list1 = ref([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
const list2 = ref([{ id: 4 }, { id: 5 }, { id: 6 }])

const result = useArrayDifference(
  list1,
  list2,
  (value, othVal) => value.id === othVal.id,
  { symmetric: true }
)
// result.value: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 6 }]
```

## 类型声明

```ts
export interface UseArrayDifferenceOptions {
  /**
   * 返回不对称差集
   * Returns asymmetric difference
   *
   * @see https://en.wikipedia.org/wiki/Symmetric_difference
   * @default false
   */
  symmetric?: boolean
}

export type UseArrayDifferenceReturn<T = any> = ComputedRef<T[]>
```