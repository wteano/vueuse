<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:35:50
 * @FilePath: \vueuse\packages\core\useDark\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: 浏览器
related:
  - useColorMode
  - usePreferredDark
  - useStorage
---

# useDark

具有自动数据持久化的响应式暗黑模式。

<CourseLink href="https://vueschool.io/lessons/theming-with-vueuse-usedark-and-usecolormode?friend=vueuse">通过这个来自Vue School的免费视频课程学习useDark！</CourseLink>

## 基本用法

```ts
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
```

## 行为

`useDark`结合了`usePreferredDark`和`useStorage`。启动时，它从localStorage/sessionStorage读取值（键可配置）以查看是否有用户配置的颜色方案，如果没有，它将使用用户的系统偏好设置。当您更改`isDark`引用时，它将更新相应元素的属性，然后将偏好设置存储到存储中（默认键：`vueuse-color-scheme`）以实现持久化。

> 请注意，`useDark`只处理DOM属性更改，以便您在CSS中应用适当的选择器。它不会为您处理实际的样式、主题或CSS。

## 配置

默认情况下，它使用[Tailwind CSS偏好的暗黑模式](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually)，当`dark`类应用于`html`标签时启用暗黑模式，例如：

```html
<!--浅色模式-->
<html>
  ...
</html>

<!--暗黑模式-->
<html class="dark">
  ...
</html>
```

当然，您也可以自定义它以使其与大多数CSS框架一起工作。

例如：

```ts
import { useDark } from '@vueuse/core'
// ---cut---
const isDark = useDark({
  selector: 'body',
  attribute: 'color-scheme',
  valueDark: 'dark',
  valueLight: 'light',
})
```

将像这样工作：

```html
<!--浅色模式-->
<html>
  <body color-scheme="light">
    ...
  </body>
</html>

<!--暗黑模式-->
<html>
  <body color-scheme="dark">
    ...
  </body>
</html>
```

如果上述配置仍然不符合您的需求，您可以使用`onChanged`选项来完全控制如何处理更新。

```ts
import { useDark } from '@vueuse/core'
// ---cut---
const isDark = useDark({
  onChanged(dark) {
    // 更新DOM，调用API或其他操作
  },
})
```

## 组件用法

```vue
<template>
  <UseDark v-slot="{ isDark, toggleDark }">
    <button @click="toggleDark()">
      Is Dark: {{ isDark }}
    </button>
  </UseDark>
</template>
```