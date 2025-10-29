---
category: State
related: useRefHistory
---

# useManualRefHistory

当用户调用`commit()`时，手动跟踪ref的更改历史，同时提供撤销和重做功能

## 用法

```ts {5} twoslash include usage
import { useManualRefHistory } from '@vueuse/core'
import { shallowRef } from 'vue'

const counter = shallowRef(0)
const { history, commit, undo, redo } = useManualRefHistory(counter)

counter.value += 1
commit()

console.log(history.value)
/* [
  { snapshot: 1, timestamp: 1601912898062 },
  { snapshot: 0, timestamp: 1601912898061 }
] */
```

你可以使用`undo`将ref值重置到最后的历史点。

```ts
// @include: usage
// ---cut---
console.log(counter.value) // 1
undo()
console.log(counter.value) // 0
```

#### 可变对象的历史记录

如果你要变更源对象，你需要传递一个自定义的克隆函数或使用`clone: true`作为参数，这是一个最小克隆函数`x => JSON.parse(JSON.stringify(x))`的快捷方式，它将同时用于`dump`和`parse`。

```ts {5}
import { useManualRefHistory } from '@vueuse/core'
import { ref } from 'vue'

const counter = ref({ foo: 1, bar: 2 })
const { history, commit, undo, redo } = useManualRefHistory(counter, { clone: true })

counter.value.foo += 1
commit()
```

#### 自定义克隆函数

要使用功能完整或自定义的克隆函数，你可以通过`clone`选项进行设置。

例如，使用[structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)：

```ts
import { useManualRefHistory } from '@vueuse/core'

const refHistory = useManualRefHistory(target, { clone: structuredClone })
```

或者使用[lodash的`cloneDeep`](https://lodash.com/docs/4.17.15#cloneDeep)：

```ts
import { useManualRefHistory } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'

const refHistory = useManualRefHistory(target, { clone: cloneDeep })
```

或者更轻量级的[`klona`](https://github.com/lukeed/klona)：

```ts
import { useManualRefHistory } from '@vueuse/core'
import { klona } from 'klona'

const refHistory = useManualRefHistory(target, { clone: klona })
```

#### 自定义转储和解析函数

除了使用`clone`选项，你还可以传递自定义函数来控制序列化和解析。如果你不需要历史值是对象，这可以在撤销时节省额外的克隆。如果你希望快照已经字符串化以便保存到本地存储，这也很有用。

```ts
import { useManualRefHistory } from '@vueuse/core'

const refHistory = useManualRefHistory(target, {
  dump: JSON.stringify,
  parse: JSON.parse,
})
```

### 历史记录容量

默认情况下，我们将保留所有历史记录（无限制），直到你明确清除它们。你可以通过`capacity`选项设置要保留的最大历史记录数量。

```ts
import { useManualRefHistory } from '@vueuse/core'

const refHistory = useManualRefHistory(target, {
  capacity: 15, // 限制为15条历史记录
})

refHistory.clear() // 明确清除所有历史记录
```