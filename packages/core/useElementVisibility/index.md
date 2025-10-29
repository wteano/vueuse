---
category: 元素
---

# useElementVisibility

跟踪元素在视口内的可见性。

## 用法

```vue
<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const target = useTemplateRef<HTMLDivElement>('target')
const targetIsVisible = useElementVisibility(target)
</script>

<template>
  <div ref="target">
    <h1>Hello world</h1>
  </div>
</template>
```

### rootMargin

如果你希望在元素完全可见之前更早触发回调，可以使用`rootMargin`选项（参见[MDN IntersectionObserver/rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)）。

```ts
import { useElementVisibility } from '@vueuse/core'
// ---cut---
const targetIsVisible = useElementVisibility(target, {
  rootMargin: '0px 0px 100px 0px',
})
```

### threshold

如果你想控制更新值所需的可见性百分比，可以使用`threshold`选项（参见[MDN IntersectionObserver/threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#threshold)）。

```ts
const targetIsVisible = useElementVisibility(target, {
  threshold: 1.0, // 100%可见
})
```

## 组件用法

```vue
<template>
  <UseElementVisibility v-slot="{ isVisible }">
    是否可见: {{ isVisible }}
  </UseElementVisibility>
</template>
```

## 指令用法

```vue
<script setup lang="ts">
import { vElementVisibility } from '@vueuse/components'
import { shallowRef, useTemplateRef } from 'vue'

const target = useTemplateRef<HTMLDivElement>('target')
const isVisible = shallowRef(false)

function onElementVisibility(state) {
  isVisible.value = state
}
</script>

<template>
  <div v-element-visibility="onElementVisibility">
    {{ isVisible ? '内部' : '外部' }}
  </div>

  <!-- 带选项 -->
  <div ref="target">
    <div v-element-visibility="[onElementVisibility, { scrollTarget: target }]">
      {{ isVisible ? '内部' : '外部' }}
    </div>
  </div>
</template>
```