<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 14:07:02
 * @FilePath: \vueuse\packages\core\useTimestamp\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: 动画
---

# useTimestamp

响应式的当前时间戳。

## 用法

```ts
import { useTimestamp } from '@vueuse/core'

const timestamp = useTimestamp({ offset: 0 })
```

```ts
import { useTimestamp } from '@vueuse/core'
// ---cut---
const { timestamp, pause, resume } = useTimestamp({ controls: true })
```

## 组件用法

```vue
<template>
  <UseTimestamp v-slot="{ timestamp, pause, resume }">
    当前时间: {{ timestamp }}
    <button @click="pause()">
      暂停
    </button>
    <button @click="resume()">
      恢复
    </button>
  </UseTimestamp>
</template>
```