---
category: '@Math'
alias: not
---

# logicNot

对ref进行`NOT`条件判断。

## 用法

```ts
import { whenever } from '@vueuse/core'
import { logicNot } from '@vueuse/math'

const a = ref(true)

whenever(logicNot(a), () => {
  console.log('a现在是假值！')
})
```