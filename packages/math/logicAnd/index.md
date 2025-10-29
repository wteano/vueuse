---
category: '@Math'
alias: and
related: logicNot, logicOr
---

# logicAnd

对多个ref进行`AND`条件判断。

## 用法

```ts
import { whenever } from '@vueuse/core'
import { logicAnd } from '@vueuse/math'

const a = ref(true)
const b = ref(false)

whenever(logicAnd(a, b), () => {
  console.log('a和b现在都为真值！')
})
```