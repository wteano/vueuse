---
category: Sensors
---

# onKeyStroke
# 键盘按键监听

Listen for keyboard keystrokes.
监听键盘按键。

## Usage
## 用法

```ts
import { onKeyStroke } from '@vueuse/core'

onKeyStroke('ArrowDown', (e) => {
  e.preventDefault()
})
```

See [this table](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) for all key codes.
查看[此表格](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)获取所有键码。

### Listen To Multiple Keys
### 监听多个键

```ts
import { onKeyStroke } from '@vueuse/core'

onKeyStroke(['s', 'S', 'ArrowDown'], (e) => {
  e.preventDefault()
})

// listen to all keys by [true / skip the keyDefine]
// 通过 [true / 跳过键定义] 监听所有键
onKeyStroke(true, (e) => {
  e.preventDefault()
})
onKeyStroke((e) => {
  e.preventDefault()
})
```

### Custom Event Target
### 自定义事件目标

```ts
import { onKeyStroke } from '@vueuse/core'
// ---cut---
onKeyStroke('A', (e) => {
  console.log('Key A pressed on document')
}, { target: document })
```

### Ignore Repeated Events
### 忽略重复事件

The callback will trigger only once when pressing `A` and **hold down**.
当按下 `A` 并**按住**时，回调只会触发一次。

```ts
import { onKeyStroke } from '@vueuse/core'
// ---cut---
// use `autoRepeat` option
// 使用 `autoRepeat` 选项
onKeyStroke('A', (e) => {
  console.log('Key A pressed')
}, { dedupe: true })
```

Reference: [KeyboardEvent.repeat](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat)
参考：[KeyboardEvent.repeat](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat)

## Directive Usage
## 指令用法

```vue
<script setup lang="ts">
import { vOnKeyStroke } from '@vueuse/components'

function onUpdate(e: KeyboardEvent) {
  // impl...
  // 实现...
}
</script>

<template>
  <input v-on-key-stroke:c,v="onUpdate" type="text">
  <!-- with options -->
  <!-- 带选项 -->
  <input v-on-key-stroke:c,v="[onUpdate, { eventName: 'keyup' }]" type="text">
</template>
```

### Custom Keyboard Event
### 自定义键盘事件

```ts
import { onKeyStroke } from '@vueuse/core'
// ---cut---
onKeyStroke('Shift', (e) => {
  console.log('Shift key up')
}, { eventName: 'keyup' })
```

Or

```ts
import { onKeyUp } from '@vueuse/core'
// ---cut---
onKeyUp('Shift', () => console.log('Shift key up'))
```

## Shorthands
## 简写

- `onKeyDown` - alias for `onKeyStroke(key, handler, {eventName: 'keydown'})` - `onKeyStroke(key, handler, {eventName: 'keydown'})` 的别名
- `onKeyPressed` - alias for `onKeyStroke(key, handler, {eventName: 'keypress'})` - `onKeyStroke(key, handler, {eventName: 'keypress'})` 的别名
- `onKeyUp` - alias for `onKeyStroke(key, handler, {eventName: 'keyup'})` - `onKeyStroke(key, handler, {eventName: 'keyup'})` 的别名