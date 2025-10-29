<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:05:07
 * @FilePath: \vueuse\packages\core\useFocusWithin\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: Sensors
---

# useFocusWithin

响应式工具，用于跟踪元素或其任何后代元素是否获得焦点。它旨在匹配`:focus-within` CSS伪类的行为。一个常见的用例是在表单元素上查看其任何输入当前是否获得焦点。

## 基本用法

```vue
<script setup lang="ts">
import { useFocusWithin } from '@vueuse/core'
import { ref, watch } from 'vue'

const target = ref()
const { focused } = useFocusWithin(target)

watch(focused, (focused) => {
  if (focused)
    console.log('目标包含已获得焦点的元素')
  else
    console.log('目标不包含已获得焦点的元素')
})
</script>

<template>
  <form ref="target">
    <input type="text" placeholder="名字">
    <input type="text" placeholder="姓氏">
    <input type="text" placeholder="邮箱">
    <input type="text" placeholder="密码">
  </form>
</template>
```