<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:45:08
 * @FilePath: \vueuse\packages\core\usePreferredDark\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: 浏览器
---

# usePreferredDark

响应式深色主题偏好

## 用法

```ts
import { usePreferredDark } from '@vueuse/core'

const isDark = usePreferredDark()
```

## 组件用法

```vue
<template>
  <UsePreferredDark v-slot="{ prefersDark }">
    偏好深色模式: {{ prefersDark }}
  </UsePreferredDark>
</template>
```