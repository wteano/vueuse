---
category: Sensors
---

# onClickOutside
# 监听外部点击

Listen for clicks outside of an element. Useful for modal or dropdown.
监听元素外部的点击。适用于模态框或下拉菜单。

## Usage
## 用法

```vue
<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const target = useTemplateRef<HTMLElement>('target')

onClickOutside(target, event => console.log(event))
</script>

<template>
  <div ref="target">
    Hello world
  </div>
  <div>Outside element</div>
</template>
```

If you need more control over triggering the handler, you can use the `controls` option.
如果您需要更多控制触发处理程序的方式，可以使用 `controls` 选项。

```ts
const { cancel, trigger } = onClickOutside(
  modalRef,
  (event) => {
    modal.value = false
  },
  { controls: true },
)

useEventListener('pointermove', (e) => {
  cancel()
  // or
  trigger(e)
})
```

If you want to ignore certain elements, you can use the `ignore` option. Provide the elements to ignore as an array of Refs or CSS Selectors.
如果您想忽略某些元素，可以使用 `ignore` 选项。将要忽略的元素作为 Ref 或 CSS 选择器的数组提供。

```ts
const ignoreElRef = useTemplateRef<HTMLElement>('ignoreEl')
const ignoreElSelector = '.ignore-el'

onClickOutside(
  target,
  event => console.log(event),
  { ignore: [ignoreElRef, ignoreElSelector] },
)
```

## Component Usage
## 组件用法

```vue
<template>
  <OnClickOutside :options="{ ignore: [/* ... */] }" @trigger="count++">
    <div>
      Click Outside of Me
    </div>
  </OnClickOutside>
</template>
```

## Directive Usage
## 指令用法

```vue
<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'
import { shallowRef } from 'vue'

const modal = shallowRef(false)
function closeModal() {
  modal.value = false
}
</script>

<template>
  <button @click="modal = true">
    Open Modal
  </button>
  <div v-if="modal" v-on-click-outside="closeModal">
    Hello World
  </div>
</template>
```

You can also set the handler as an array to set the configuration items of the instruction.
您也可以将处理程序设置为数组来设置指令的配置项。

```vue
<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'
import { shallowRef, useTemplateRef } from 'vue'

const modal = shallowRef(false)

const ignoreElRef = useTemplateRef<HTMLElement>('ignoreEl')

const onClickOutsideHandler = [
  (ev) => {
    console.log(ev)
    modal.value = false
  },
  { ignore: [ignoreElRef] },
]
</script>

<template>
  <button @click="modal = true">
    Open Modal
  </button>

  <div ref="ignoreElRef">
    click outside ignore element
  </div>

  <div v-if="modal" v-on-click-outside="onClickOutsideHandler">
    Hello World
  </div>
</template>
```