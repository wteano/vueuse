<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:20:35
 * @FilePath: \vueuse\packages\math\useFloor\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: '@Math'
---

# useFloor

响应式的`Math.floor`。

## 用法

```ts
import { useFloor } from '@vueuse/math'

const value = ref(45.95)
const result = useFloor(value) // 45
```