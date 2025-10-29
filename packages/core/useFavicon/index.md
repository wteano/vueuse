---
category: 浏览器
---

# useFavicon

响应式favicon

## 用法

```ts {3}
import { useFavicon } from '@vueuse/core'

const icon = useFavicon()

icon.value = 'dark.png' // 更改当前图标
```

### 传递源引用

您可以传递一个`ref`给它，源引用的变化将自动反映到您的favicon上。

```ts {7}
import { useFavicon, usePreferredDark } from '@vueuse/core'
import { computed } from 'vue'

const isDark = usePreferredDark()
const favicon = computed(() => isDark.value ? 'dark.png' : 'light.png')

useFavicon(favicon)
```

当传递源引用时，返回的引用将与源引用相同

```ts
import { useFavicon } from '@vueuse/core'
// ---cut---
const source = shallowRef('icon.png')
const icon = useFavicon(source)

console.log(icon === source) // true
```