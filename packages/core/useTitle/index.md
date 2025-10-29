---
category: 浏览器
---

# useTitle

响应式的文档标题。

::: warning
此组合式函数不兼容SSR。
:::

## 用法

```ts
import { useTitle } from '@vueuse/core'

const title = useTitle()
console.log(title.value) // 打印当前标题
title.value = 'Hello' // 更改当前标题
```

立即设置初始标题：

```ts
import { useTitle } from '@vueuse/core'
// ---cut---
const title = useTitle('新标题')
```

传递一个`ref`，当源ref发生变化时标题将更新：

```ts
import { useTitle } from '@vueuse/core'
import { shallowRef } from 'vue'

const messages = shallowRef(0)

const title = computed(() => {
  return !messages.value ? '没有消息' : `${messages.value} 条新消息`
})

useTitle(title) // 文档标题将与ref "title"匹配
```

传递一个可选的模板标签 [Vue Meta Title Template](https://vue-meta.nuxtjs.org/guide/metainfo.html) 来更新要注入到此模板中的标题：

```ts
import { useTitle } from '@vueuse/core'
// ---cut---
const title = useTitle('新标题', {
  titleTemplate: '%s | 我的超棒网站'
})
```

::: warning
`observe`与`titleTemplate`不兼容。
:::