---
category: Sensors
---

# useMagicKeys

响应式按键状态，支持魔法键组合。

## 用法

```ts
import { useMagicKeys } from '@vueuse/core'

const { shift, space, a /* 你想要监控的键 */ } = useMagicKeys()

watch(space, (v) => {
  if (v)
    console.log('空格键已被按下')
})

watchEffect(() => {
  if (shift.value && a.value)
    console.log('Shift + A 已被按下')
})
```

查看[所有可能的键码](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values)。

### 组合键

你可以通过使用`+`或`_`连接键来神奇地使用组合键（快捷键/热键）。

```ts
import { useMagicKeys } from '@vueuse/core'

const keys = useMagicKeys()
const shiftCtrlA = keys['Shift+Ctrl+A']

watch(shiftCtrlA, (v) => {
  if (v)
    console.log('Shift + Ctrl + A 已被按下')
})
```

```ts
import { useMagicKeys } from '@vueuse/core'

const { Ctrl_A_B, space, alt_s /* ... */ } = useMagicKeys()

watch(Ctrl_A_B, (v) => {
  if (v)
    console.log('Control+A+B 已被按下')
})
```

你也可以使用`whenever`函数来简化代码

```ts
import { useMagicKeys, whenever } from '@vueuse/core'

const keys = useMagicKeys()

whenever(keys.shift_space, () => {
  console.log('Shift+Space 已被按下')
})
```

### 当前按下的键

提供了一个特殊属性`current`来表示当前所有按下的键。

```ts
import { useMagicKeys, whenever } from '@vueuse/core'

const { current } = useMagicKeys()

console.log(current) // Set { 'control', 'a' }

whenever(
  () => current.has('a') && !current.has('b'),
  () => console.log('A键被按下但B键没有'),
)
```

### 键别名

```ts
import { useMagicKeys, whenever } from '@vueuse/core'

const { shift_cool } = useMagicKeys({
  aliasMap: {
    cool: 'space',
  },
})

whenever(shift_cool, () => console.log('Shift + Space 已被按下'))
```

默认情况下，我们有一些[为常见实践预配置的别名](https://github.com/vueuse/vueuse/blob/main/packages/core/useMagicKeys/aliasMap.ts)。

### 条件性禁用

你的应用中可能有一些`<input />`元素，你不想在用户聚焦于这些输入时触发魔法键处理。下面是一个使用`useActiveElement`和`logicAnd`来实现这一点的例子。

```ts
import { useActiveElement, useMagicKeys, whenever } from '@vueuse/core'
import { logicAnd } from '@vueuse/math'

const activeElement = useActiveElement()
const notUsingInput = computed(() =>
  activeElement.value?.tagName !== 'INPUT'
  && activeElement.value?.tagName !== 'TEXTAREA',)

const { tab } = useMagicKeys()

whenever(logicAnd(tab, notUsingInput), () => {
  console.log('在输入框外按下了Tab键!')
})
```

### 自定义事件处理器

```ts
import { useMagicKeys, whenever } from '@vueuse/core'

const { ctrl_s } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 's' && e.type === 'keydown')
      e.preventDefault()
  },
})

whenever(ctrl_s, () => console.log('Ctrl+S 已被按下'))
```

> ⚠️ 不推荐这种用法，请谨慎使用。

### 响应式模式

默认情况下，`useMagicKeys()`的值是`Ref<boolean>`。如果你想在模板中使用对象，可以将其设置为响应式模式。

```ts
import { useMagicKeys } from '@vueuse/core'
// ---cut---
const keys = useMagicKeys({ reactive: true })
```

```vue
<template>
  <div v-if="keys.shift">
    你正在按住Shift键!
  </div>
</template>
```