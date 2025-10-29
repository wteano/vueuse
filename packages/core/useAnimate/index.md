---
category: Animation
---

# useAnimate

响应式Web动画API
Reactive Web Animations API

## 用法

```ts
import { useAnimate } from '@vueuse/core'

const { isSupported, animate, play, pause, reverse, finish, cancel, pending, playState } = useAnimate(
  target,
  keyframes,
  options
)
```

### 基础用法

```ts
import { useAnimate } from '@vueuse/core'

const target = ref()
const keyframes = ref([
  { transform: 'scale(1)' },
  { transform: 'scale(1.5)' },
])

const {
  // 动画是否被支持
  // if the animation is supported
  isSupported,
  // 动画对象
  // the animation object
  animate,
  // 动画状态
  // the animation state
  playState,
  // 是否正在等待
  // if the animation is pending
  pending,
  // 动画控制
  // animation controls
  play,
  pause,
  reverse,
  finish,
  cancel,
} = useAnimate(target, keyframes, {
  duration: 1000,
  iterations: 5,
  direction: 'alternate',
})
```

### 自定义关键帧

```ts
import { useAnimate } from '@vueuse/core'

const target = ref()
const keyframes = computed(() => [
  { transform: `translateX(${offset.value}px)` },
  { transform: 'translateX(0)' },
])

const { play } = useAnimate(target, keyframes, {
  duration: 1000,
})
```

## 类型声明

```ts
export interface UseAnimateOptions extends KeyframeAnimationOptions, ConfigurableWindow {
  /**
   * 使用useAnimate时是否自动运行play
   * Will automatically run play when `useAnimate` is used
   *
   * @default true
   */
  immediate?: boolean
  /**
   * 是否将动画的最终样式状态提交到正在动画的元素
   * Whether to commits the end styling state of an animation to the element being animated
   * In general, you should use `fill` option with this.
   *
   * @default false
   */
  commitStyles?: boolean
  /**
   * 是否保持动画
   * Whether to persists the animation
   *
   * @default false
   */
  persist?: boolean
  /**
   * 动画初始化后执行
   * Executed after animation initialization
   */
  onReady?: (animate: Animation) => void
  /**
   * 捕获到错误时的回调
   * Callback when error is caught.
   */
  onError?: (e: unknown) => void
}

export type UseAnimateKeyframes = MaybeRef<Keyframe[] | PropertyIndexedKeyframes | null>

export interface UseAnimateReturn {
  isSupported: ComputedRef<boolean>
  animate: ShallowRef<Animation | undefined>
  play: () => void
  pause: () => void
  reverse: () => void
  finish: () => void
  cancel: () => void

  pending: ComputedRef<boolean>
  playState: ComputedRef<AnimationPlayState>
  replaceState: ComputedRef<AnimationReplaceState>
  startTime: WritableComputedRef<CSSNumberish | number | null>
  currentTime: WritableComputedRef<CSSNumberish | number | null>
  timeline: WritableComputedRef<AnimationTimeline | null>
  playbackRate: WritableComputedRef<number>
}
```