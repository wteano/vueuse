import type { MaybeRefOrGetter } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import { increaseWithUnit, pxValue, tryOnMounted } from '@vueuse/shared'
import { computed, shallowRef, toValue } from 'vue'
import { defaultWindow } from '../_configurable'
import { useMediaQuery } from '../useMediaQuery'
import { useSSRWidth } from '../useSSRWidth'

export * from './breakpoints'

export type Breakpoints<K extends string = string> = Record<K, MaybeRefOrGetter<number | string>>

export interface UseBreakpointsOptions extends ConfigurableWindow {
  /**
   * 用于生成的快捷方法（如`.lg`）的查询策略
   *
   * 'min-width' - 当视口大于或等于lg断点时，.lg将为true（移动端优先）
   * 'max-width' - 当视口小于xl断点时，.lg将为true（桌面端优先）
   *
   * @default "min-width"
   */
  strategy?: 'min-width' | 'max-width'
  ssrWidth?: number
}

/**
 * 响应式视口断点
 *
 * @see https://vueuse.org/useBreakpoints
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useBreakpoints<K extends string>(
  breakpoints: Breakpoints<K>,
  options: UseBreakpointsOptions = {},
) {
  function getValue(k: MaybeRefOrGetter<K>, delta?: number) { // 获取断点值的函数
    let v = toValue(breakpoints[toValue(k)])

    if (delta != null)
      v = increaseWithUnit(v, delta)

    if (typeof v === 'number')
      v = `${v}px`

    return v
  }

  const { window = defaultWindow, strategy = 'min-width', ssrWidth = useSSRWidth() } = options

  const ssrSupport = typeof ssrWidth === 'number' // 是否支持SSR
  const mounted = ssrSupport ? shallowRef(false) : { value: true } // 是否已挂载
  if (ssrSupport) {
    tryOnMounted(() => mounted.value = !!window)
  }

  function match(query: 'min' | 'max', size: string): boolean { // 匹配媒体查询的函数
    if (!mounted.value && ssrSupport) {
      return query === 'min' ? ssrWidth >= pxValue(size) : ssrWidth <= pxValue(size)
    }
    if (!window)
      return false
    return window.matchMedia(`(${query}-width: ${size})`).matches
  }

  const greaterOrEqual = (k: MaybeRefOrGetter<K>) => { // 大于或等于断点的函数
    return useMediaQuery(() => `(min-width: ${getValue(k)})`, options)
  }

  const smallerOrEqual = (k: MaybeRefOrGetter<K>) => { // 小于或等于断点的函数
    return useMediaQuery(() => `(max-width: ${getValue(k)})`, options)
  }

  const shortcutMethods = (Object.keys(breakpoints) as K[]) // 快捷方法对象
    .reduce((shortcuts, k) => {
      Object.defineProperty(shortcuts, k, {
        get: () => strategy === 'min-width'
          ? greaterOrEqual(k)
          : smallerOrEqual(k),
        enumerable: true,
        configurable: true,
      })
      return shortcuts
    }, {} as Record<K, ReturnType<typeof greaterOrEqual>>)

  function current() { // 当前激活的断点列表
    const points = (Object.keys(breakpoints) as K[])
      .map(k => [k, shortcutMethods[k], pxValue(getValue(k))] as const)
      .sort((a, b) => a[2] - b[2])
    return computed(() => points.filter(([, v]) => v.value).map(([k]) => k))
  }

  return Object.assign(shortcutMethods, {
    greaterOrEqual,
    smallerOrEqual,
    greater(k: MaybeRefOrGetter<K>) { // 大于断点的函数
      return useMediaQuery(() => `(min-width: ${getValue(k, 0.1)})`, options)
    },
    smaller(k: MaybeRefOrGetter<K>) { // 小于断点的函数
      return useMediaQuery(() => `(max-width: ${getValue(k, -0.1)})`, options)
    },
    between(a: MaybeRefOrGetter<K>, b: MaybeRefOrGetter<K>) { // 两个断点之间的函数
      return useMediaQuery(() => `(min-width: ${getValue(a)}) and (max-width: ${getValue(b, -0.1)})`, options)
    },
    isGreater(k: MaybeRefOrGetter<K>) { // 是否大于断点
      return match('min', getValue(k, 0.1))
    },
    isGreaterOrEqual(k: MaybeRefOrGetter<K>) { // 是否大于或等于断点
      return match('min', getValue(k))
    },
    isSmaller(k: MaybeRefOrGetter<K>) { // 是否小于断点
      return match('max', getValue(k, -0.1))
    },
    isSmallerOrEqual(k: MaybeRefOrGetter<K>) { // 是否小于或等于断点
      return match('max', getValue(k))
    },
    isInBetween(a: MaybeRefOrGetter<K>, b: MaybeRefOrGetter<K>) { // 是否在两个断点之间
      return match('min', getValue(a)) && match('max', getValue(b, -0.1))
    },
    current,
    active() { // 当前激活的断点
      const bps = current()
      return computed(() => bps.value.length === 0 ? '' : bps.value.at(strategy === 'min-width' ? -1 : 0)!)
    },
  })
}

export type UseBreakpointsReturn<K extends string = string> = ReturnType<typeof useBreakpoints<K>> // useBreakpoints函数的返回类型