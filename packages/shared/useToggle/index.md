<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:46:13
 * @FilePath: \vueuse\packages\shared\useToggle\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: 工具
---

# useToggle

带有实用函数的布尔值切换器。

## 用法

```ts
import { useToggle } from '@vueuse/core'

const [value, toggle] = useToggle()
```

当你传递一个ref时，`useToggle`将返回一个简单的切换函数：

```ts
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
```

注意：请注意，切换函数接受第一个参数作为覆盖值。你可能需要避免直接将函数传递给模板中的事件，因为事件对象会被传入。

```html
<!-- 注意：$event会被传入 -->
<button @click="toggleDark" />
<!-- 推荐这样做 -->
<button @click="toggleDark()" />
```