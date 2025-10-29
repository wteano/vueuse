<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:17:58
 * @FilePath: \vueuse\packages\math\useSum\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: '@Math'
---

# useSum

响应式地获取数组的总和

## 用法

```ts
import { useSum } from '@vueuse/math'

const array = ref([1, 2, 3, 4])
const sum = useSum(array) // Ref<10>
```

```ts
import { useSum } from '@vueuse/math'

const a = ref(1)
const b = ref(3)

const sum = useSum(a, b, 2) // Ref<6>
```