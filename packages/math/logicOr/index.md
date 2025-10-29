---
category: '@Math'
alias: or
related: logicAnd, logicNot
---

# logicOr

对多个ref进行`OR`条件判断。

## 用法

```ts
import { whenever } from '@vueuse/core'
import { logicOr } from '@vueuse/math'

const a = ref(true)
const b = ref(false)

whenever(logicOr(a, b), () => {
  console.log('a或b中至少有一个为真值！')
})
```