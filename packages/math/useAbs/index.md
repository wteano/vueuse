<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:19:38
 * @FilePath: \vueuse\packages\math\useAbs\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: '@Math'
---

# useAbs

响应式的`Math.abs`。

## 用法

```ts
import { useAbs } from '@vueuse/math'

const value = ref(-23)
const absValue = useAbs(value) // Ref<23>
```