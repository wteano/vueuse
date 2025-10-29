/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 14:12:50
 * @FilePath: \vueuse\packages\core\useTransition\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import { identity as linear, promiseTimeout, tryOnScopeDispose } from '@vueuse/shared'
import { computed, shallowRef, toValue, watch } from 'vue'
import { defaultWindow } from '../_configurable'

/**
 * 三次贝塞尔点
 */
export type CubicBezierPoints = [number, number, number, number]

/**
 * 缓动函数
 */
export type EasingFunction = (n: number) => number

/**
 * 插值函数
 */
export type InterpolationFunction<T> = (from: T, to: T, t: number) => T

/**
 * 过渡选项
 */
export interface TransitionOptions<T> extends ConfigurableWindow {

  /**
   * 手动中止过渡
   */
  abort?: () => any

  /**
   * 过渡持续时间（毫秒）
   */
  duration?: MaybeRef<number>

  /**
   * 用于计算过渡进度的缓动函数或三次贝塞尔点
   */
  easing?: MaybeRef<EasingFunction | CubicBezierPoints>

  /**
   * 自定义插值函数
   */
  interpolation?: InterpolationFunction<T>

  /**
   * 用于计算过渡进度的缓动函数或三次贝塞尔点
   * @deprecated `transition`选项已弃用，请使用`easing`代替。
   */
  transition?: MaybeRef<EasingFunction | CubicBezierPoints>
}

export interface UseTransitionOptions<T> extends TransitionOptions<T> {
  /**
   * 开始过渡前等待的毫秒数
   */
  delay?: MaybeRef<number>

  /**
   * 禁用过渡
   */
  disabled?: MaybeRef<boolean>

  /**
   * 过渡完成后执行的回调
   */
  onFinished?: () => void

  /**
   * 过渡开始后执行的回调
   */
  onStarted?: () => void
}

const _TransitionPresets = {
  easeInSine: [0.12, 0, 0.39, 0],
  easeOutSine: [0.61, 1, 0.88, 1],
  easeInOutSine: [0.37, 0, 0.63, 1],
  easeInQuad: [0.11, 0, 0.5, 0],
  easeOutQuad: [0.5, 1, 0.89, 1],
  easeInOutQuad: [0.45, 0, 0.55, 1],
  easeInCubic: [0.32, 0, 0.67, 0],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeInQuart: [0.5, 0, 0.75, 0],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeInQuint: [0.64, 0, 0.78, 0],
  easeOutQuint: [0.22, 1, 0.36, 1],
  easeInOutQuint: [0.83, 0, 0.17, 1],
  easeInExpo: [0.7, 0, 0.84, 0],
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
  easeInCirc: [0.55, 0, 1, 0.45],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeInOutCirc: [0.85, 0, 0.15, 1],
  easeInBack: [0.36, 0, 0.66, -0.56],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeInOutBack: [0.68, -0.6, 0.32, 1.6],
} as const

/**
 * 常用过渡效果
 *
 * @see https://easings.net
 */
export const TransitionPresets = /* #__PURE__ */ Object.assign({}, { linear }, _TransitionPresets) as Record<keyof typeof _TransitionPresets, CubicBezierPoints> & { linear: EasingFunction }

/**
 * 从三次贝塞尔点创建缓动函数
 */
function createEasingFunction([p0, p1, p2, p3]: CubicBezierPoints): EasingFunction {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1
  const c = (a1: number) => 3 * a1

  const calcBezier = (t: number, a1: number, a2: number) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t

  const getSlope = (t: number, a1: number, a2: number) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1)

  const getTforX = (x: number) => {
    let aGuessT = x

    for (let i = 0; i < 4; ++i) {
      const currentSlope = getSlope(aGuessT, p0, p2)
      if (currentSlope === 0)
        return aGuessT
      const currentX = calcBezier(aGuessT, p0, p2) - x
      aGuessT -= currentX / currentSlope
    }

    return aGuessT
  }

  return (x: number) => (p0 === p1 && p2 === p3) ? x : calcBezier(getTforX(x), p1, p3)
}

function lerp(a: number, b: number, alpha: number) {
  return a + alpha * (b - a)
}

function defaultInterpolation<T>(a: T, b: T, t: number) {
  const aVal = toValue(a)
  const bVal = toValue(b)

  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return lerp(aVal, bVal, t) as T
  }

  if (Array.isArray(aVal) && Array.isArray(bVal)) {
    return aVal.map((v, i) => lerp(v, toValue(bVal[i]), t)) as T
  }

  throw new TypeError('Unknown transition type, specify an interpolation function.')
}

function normalizeEasing(easing: MaybeRef<EasingFunction | CubicBezierPoints> | undefined) {
  return typeof easing === 'function'
    ? easing
    : (toValue(easing) ?? linear)
}

/**
 * 从一个值过渡到另一个值
 *
 * @param source 源值
 * @param from 起始值
 * @param to 目标值
 * @param options 过渡选项
 */
export function transition<T>(
  source: Ref<T>,
  from: MaybeRefOrGetter<T>,
  to: MaybeRefOrGetter<T>,
  options: TransitionOptions<T> = {},
): PromiseLike<void> {
  const {
    window = defaultWindow,
  } = options
  const fromVal = toValue(from)
  const toVal = toValue(to)
  const duration = toValue(options.duration) ?? 1000
  const startedAt = Date.now()
  const endAt = Date.now() + duration

  const interpolation = typeof options.interpolation === 'function'
    ? options.interpolation
    : defaultInterpolation

  const trans = typeof options.easing !== 'undefined'
    ? normalizeEasing(options.easing)
    : normalizeEasing(options.transition)

  const ease = typeof trans === 'function'
    ? trans
    : createEasingFunction(trans)

  return new Promise<void>((resolve) => {
    source.value = fromVal

    const tick = () => {
      if (options.abort?.()) {
        resolve()

        return
      }

      const now = Date.now()
      const alpha = ease((now - startedAt) / duration)

      source.value = interpolation(fromVal, toVal, alpha) as T

      if (now < endAt) {
        window?.requestAnimationFrame(tick)
      }
      else {
        source.value = toVal

        resolve()
      }
    }

    tick()
  })
}

/**
 * Transition from one value to another.
 * @deprecated The `executeTransition` function is deprecated, use `transition` instead.
 *
 * @param source
 * @param from
 * @param to
 * @param options
 */
export function executeTransition<T>(
  source: Ref<T>,
  from: MaybeRefOrGetter<T>,
  to: MaybeRefOrGetter<T>,
  options: TransitionOptions<T> = {},
) {
  return transition(source, from, to, options)
}

// static array of possibly reactive numbers
export function useTransition<T extends MaybeRefOrGetter<number>[]>(source: [...T], options?: UseTransitionOptions<T>): ComputedRef<{ [K in keyof T]: number }>

// reactive array of numbers
export function useTransition<T extends MaybeRefOrGetter<number[]>>(source: T, options?: UseTransitionOptions<T>): ComputedRef<number[]>

// custom type
export function useTransition<T>(source: MaybeRefOrGetter<T>, options?: UseTransitionOptions<T>): ComputedRef<T>

/**
 * Follow value with a transition.
 *
 * @see https://vueuse.org/useTransition
 * @param source
 * @param options
 */
export function useTransition<T>(
  source: MaybeRefOrGetter<T>,
  options: UseTransitionOptions<T> = {},
): ComputedRef<T> {
  let currentId = 0

  const sourceVal = (): T => {
    const v = toValue(source)

    return typeof options.interpolation === 'undefined' && Array.isArray(v)
      ? (v as any).map(toValue)
      : v
  }

  const outputRef = shallowRef(sourceVal())

  watch(sourceVal, async (to) => {
    if (toValue(options.disabled))
      return

    const id = ++currentId

    if (options.delay)
      await promiseTimeout(toValue(options.delay))

    if (id !== currentId)
      return

    options.onStarted?.()

    await transition(outputRef, outputRef.value, to, {
      ...options,
      abort: () => id !== currentId || options.abort?.(),
    })

    options.onFinished?.()
  }, { deep: true })

  watch(() => toValue(options.disabled), (disabled) => {
    if (disabled) {
      currentId++

      outputRef.value = sourceVal()
    }
  })

  tryOnScopeDispose(() => {
    currentId++
  })

  return computed(() => toValue(options.disabled) ? sourceVal() : outputRef.value)
}