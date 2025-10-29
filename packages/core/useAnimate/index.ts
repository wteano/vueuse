import type { Mutable } from '@vueuse/shared'
import type { ComputedRef, MaybeRef, ShallowRef, WritableComputedRef } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { MaybeComputedElementRef } from '../unrefElement'
import { isObject, objectOmit, tryOnMounted, tryOnScopeDispose } from '@vueuse/shared'
import { computed, shallowReactive, shallowRef, toValue, watch } from 'vue'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'
import { useEventListener } from '../useEventListener'
import { useRafFn } from '../useRafFn'
import { useSupported } from '../useSupported'

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

type AnimateStoreKeys = Extract<keyof Animation, 'startTime' | 'currentTime' | 'timeline' | 'playbackRate' | 'pending' | 'playState' | 'replaceState'>

type AnimateStore = Mutable<Pick<Animation, AnimateStoreKeys>>

/**
 * 响应式Web动画API
 * Reactive Web Animations API
 *
 * @see https://vueuse.org/useAnimate
 * @param target
 * @param keyframes
 * @param options
 */
export function useAnimate(
  target: MaybeComputedElementRef,
  keyframes: UseAnimateKeyframes,
  options?: number | UseAnimateOptions,
): UseAnimateReturn {
  let config: UseAnimateOptions
  let animateOptions: undefined | number | KeyframeAnimationOptions

  if (isObject(options)) {
    config = options
    animateOptions = objectOmit(options, ['window', 'immediate', 'commitStyles', 'persist', 'onReady', 'onError'])
  }
  else {
    config = { duration: options }
    animateOptions = options
  }

  const {
    window = defaultWindow,
    immediate = true,
    commitStyles,
    persist,
    playbackRate: _playbackRate = 1,
    onReady,
    onError = (e: unknown) => {
      console.error(e)
    },
  } = config

  const isSupported = useSupported(() => window && HTMLElement && 'animate' in HTMLElement.prototype)

  const animate = shallowRef<Animation | undefined>(undefined)
  const store = shallowReactive<AnimateStore>({
    startTime: null,
    currentTime: null,
    timeline: null,
    playbackRate: _playbackRate,
    pending: false,
    playState: immediate ? 'idle' : 'paused',
    replaceState: 'active',
  })

  const pending = computed(() => store.pending)
  const playState = computed(() => store.playState)
  const replaceState = computed(() => store.replaceState)

  const startTime = computed<CSSNumberish | number | null>({
    get() {
      return store.startTime
    },
    set(value) {
      store.startTime = value
      if (animate.value)
        animate.value.startTime = value
    },
  })

  const currentTime = computed({
    get() {
      return store.currentTime
    },
    set(value) {
      store.currentTime = value
      if (animate.value) {
        animate.value.currentTime = value
        syncResume()
      }
    },
  })

  const timeline = computed({
    get() {
      return store.timeline
    },
    set(value) {
      store.timeline = value
      if (animate.value)
        animate.value.timeline = value
    },
  })

  const playbackRate = computed({
    get() {
      return store.playbackRate
    },
    set(value) {
      store.playbackRate = value
      if (animate.value)
        animate.value.playbackRate = value
    },
  })

  const play = () => {
    if (animate.value) {
      try {
        animate.value.play()
        syncResume()
      }
      catch (e) {
        syncPause()
        onError(e)
      }
    }
    else {
      update()
    }
  }

  const pause = () => {
    try {
      animate.value?.pause()
      syncPause()
    }
    catch (e) {
      onError(e)
    }
  }

  const reverse = () => {
    if (!animate.value)
      update()
    try {
      animate.value?.reverse()
      syncResume()
    }
    catch (e) {
      syncPause()
      onError(e)
    }
  }

  const finish = () => {
    if (!animate.value)
      update()
    try {
      animate.value?.finish()
      syncFinish()
    }
    catch (e) {
      onError(e)
    }
  }

  const cancel = () => {
    if (!animate.value)
      return
    try {
      animate.value?.cancel()
      syncIdle()
    }
    catch (e) {
      onError(e)
    }
  }

  const update = () => {
    if (!isSupported.value)
      return

    const el = unrefElement(target)
    if (!el)
      return

    const keyframesValue = toValue(keyframes)
    if (!keyframesValue)
      return

    animate.value?.cancel()
    animate.value = el.animate(keyframesValue, animateOptions)
    syncAnimate()
    onReady?.(animate.value)
  }

  const syncAnimate = () => {
    if (!animate.value)
      return

    store.startTime = animate.value.startTime
    store.currentTime = animate.value.currentTime
    store.timeline = animate.value.timeline
    store.playbackRate = animate.value.playbackRate
    store.pending = animate.value.pending
    store.playState = animate.value.playState
    store.replaceState = animate.value.replaceState
  }

  const syncIdle = () => {
    if (!animate.value)
      return
    store.playState = animate.value.playState
    store.pending = animate.value.pending
  }

  const syncPause = () => {
    if (!animate.value)
      return
    store.playState = animate.value.playState
    store.pending = animate.value.pending
  }

  const syncResume = () => {
    if (!animate.value)
      return
    store.playState = animate.value.playState
    store.pending = animate.value.pending
  }

  const syncFinish = () => {
    if (!animate.value)
      return
    store.playState = animate.value.playState
    store.pending = animate.value.pending
  }

  watch(
    () => toValue(target),
    (el) => {
      if (el)
        update()
    },
    { immediate: true },
  )

  watch(
    () => toValue(keyframes),
    () => update(),
  )

  watch(
    () => animateOptions,
    () => update(),
  )

  tryOnScopeDispose(() => {
    if (animate.value && !persist)
      animate.value.cancel()
  })

  return {
    isSupported,
    animate,
    play,
    pause,
    reverse,
    finish,
    cancel,
    pending,
    playState,
    replaceState,
    startTime,
    currentTime,
    timeline,
    playbackRate,
  }
}

export type UseAnimateReturn = ReturnType<typeof useAnimate>