---
category: Array
---

# useArrayIncludes

响应式 `Array.includes`
Reactive `Array.includes`

## 用法

### 与响应式数组一起使用

```ts
import { useArrayIncludes } from '@vueuse/core'

const list = ref([0, 2, 4, 6, 8])
const result = useArrayIncludes(list, 10)
// result.value: false
list.value.push(10)
// result.value: true
list.value.pop()
// result.value: false
```

### 使用对象数组和键比较

```ts
import { useArrayIncludes } from '@vueuse/core'

const list = ref([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' },
])

const result = useArrayIncludes(list, { id: 2, name: 'Jane' }, 'id')
// result.value: true
```

### 使用自定义比较函数

```ts
import { useArrayIncludes } from '@vueuse/core'

const list = ref([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' },
])

const result = useArrayIncludes(
  list,
  { id: 2, name: 'Jane' },
  (element, value) => element.id === value.id && element.name === value.name
)
// result.value: true
```

### 使用 fromIndex 选项

```ts
import { useArrayIncludes } from '@vueuse/core'

const list = ref([1, 2, 3, 4, 5])
const result = useArrayIncludes(list, 3, { fromIndex: 2 })
// result.value: true
```

## 类型声明

```ts
export type UseArrayIncludesComparatorFn<T, V> = ((element: T, value: V, index: number, array: MaybeRefOrGetter<T>[]) => boolean)

export interface UseArrayIncludesOptions<T, V> {
  fromIndex?: number
  comparator?: UseArrayIncludesComparatorFn<T, V> | keyof T
}

export type UseArrayIncludesReturn = ComputedRef<boolean>
```