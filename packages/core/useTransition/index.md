---
category: 动画
---

# useTransition

在值之间进行过渡

## 用法

定义一个要跟随的源值，当值改变时，输出将过渡到新值。如果在过渡进行中源值发生变化，新的过渡将从上一个过渡中断的地方开始。

```ts
import { TransitionPresets, useTransition } from '@vueuse/core'
import { shallowRef } from 'vue'

const source = shallowRef(0)

const output = useTransition(source, {
  duration: 1000,
  easing: TransitionPresets.easeInOutCubic,
})
```

可以使用[三次贝塞尔曲线](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/cubic-bezier#description)自定义过渡缓动。

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
useTransition(source, {
  easing: [0.75, 0, 0.25, 1],
})
```

以下过渡效果可通过`TransitionPresets`常量使用。

- [`linear`](https://cubic-bezier.com/#0,0,1,1)
- [`easeInSine`](https://cubic-bezier.com/#.12,0,.39,0)
- [`easeOutSine`](https://cubic-bezier.com/#.61,1,.88,1)
- [`easeInOutSine`](https://cubic-bezier.com/#.37,0,.63,1)
- [`easeInQuad`](https://cubic-bezier.com/#.11,0,.5,0)
- [`easeOutQuad`](https://cubic-bezier.com/#.5,1,.89,1)
- [`easeInOutQuad`](https://cubic-bezier.com/#.45,0,.55,1)
- [`easeInCubic`](https://cubic-bezier.com/#.32,0,.67,0)
- [`easeOutCubic`](https://cubic-bezier.com/#.33,1,.68,1)
- [`easeInOutCubic`](https://cubic-bezier.com/#.65,0,.35,1)
- [`easeInQuart`](https://cubic-bezier.com/#.5,0,.75,0)
- [`easeOutQuart`](https://cubic-bezier.com/#.25,1,.5,1)
- [`easeInOutQuart`](https://cubic-bezier.com/#.76,0,.24,1)
- [`easeInQuint`](https://cubic-bezier.com/#.64,0,.78,0)
- [`easeOutQuint`](https://cubic-bezier.com/#.22,1,.36,1)
- [`easeInOutQuint`](https://cubic-bezier.com/#.83,0,.17,1)
- [`easeInExpo`](https://cubic-bezier.com/#.7,0,.84,0)
- [`easeOutExpo`](https://cubic-bezier.com/#.16,1,.3,1)
- [`easeInOutExpo`](https://cubic-bezier.com/#.87,0,.13,1)
- [`easeInCirc`](https://cubic-bezier.com/#.55,0,1,.45)
- [`easeOutCirc`](https://cubic-bezier.com/#0,.55,.45,1)
- [`easeInOutCirc`](https://cubic-bezier.com/#.85,0,.15,1)
- [`easeInBack`](https://cubic-bezier.com/#.36,0,.66,-.56)
- [`easeOutBack`](https://cubic-bezier.com/#.34,1.56,.64,1)
- [`easeInOutBack`](https://cubic-bezier.com/#.68,-.6,.32,1.6)

对于更复杂的缓动，可以提供自定义函数。

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
function easeOutElastic(n) {
  return n === 0
    ? 0
    : n === 1
      ? 1
      : (2 ** (-10 * n)) * Math.sin((n * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
}

useTransition(source, {
  easing: easeOutElastic,
})
```

默认情况下，`source`必须是数字或数字数组。对于更复杂的值，定义自定义`interpolation`函数。例如，以下代码将过渡Three.js的旋转。

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
import { Quaternion } from 'three'

const source = ref(new Quaternion())

const output = useTransition(source, {
  interpolation: (q1, q2, t) => new Quaternion().slerpQuaternions(q1, q2, t)
})
```

要控制过渡何时开始，设置`delay`值。要围绕过渡编排行为，定义`onStarted`或`onFinished`回调。

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
useTransition(source, {
  delay: 1000,
  onStarted() {
    // 过渡开始后调用
  },
  onFinished() {
    // 过渡结束后调用
  },
})
```

要停止过渡，定义布尔值`disabled`属性。请注意，这与持续时间为`0`不同。禁用的过渡**同步**跟踪源值。它们不遵守`delay`，也不会触发`onStarted`或`onFinished`回调。

为了获得更多控制，可以通过`transition`函数手动执行过渡。此函数返回一个在过渡完成时解析的promise。可以通过定义返回真值的`abort`函数来取消手动过渡。

```ts
import { transition } from '@vueuse/core'

await transition(source, from, to, {
  abort() {
    if (shouldAbort)
      return true
  }
})
```