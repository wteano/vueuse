import type { ConfigurableEventFilter } from '@vueuse/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { Position } from '../types'
import { shallowRef } from 'vue'
import { defaultWindow } from '../_configurable'
import { useEventListener } from '../useEventListener'

/**
 * 鼠标坐标类型
 * - 'page': 相对于整个文档的坐标
 * - 'client': 相对于可视区域的坐标
 * - 'screen': 相对于屏幕的坐标
 * - 'movement': 相对于上次移动事件的坐标
 */
export type UseMouseCoordType = 'page' | 'client' | 'screen' | 'movement'

/**
 * 输入源类型
 * - 'mouse': 鼠标输入
 * - 'touch': 触摸输入
 * - null: 无输入
 */
export type UseMouseSourceType = 'mouse' | 'touch' | null

/**
 * 鼠标事件提取器函数类型
 * @param event - 鼠标事件或触摸事件
 * @returns 返回[x, y]坐标数组，或返回null/undefined
 */
export type UseMouseEventExtractor = (event: MouseEvent | Touch) => [x: number, y: number] | null | undefined

/**
 * useMouse函数的配置选项
 */
export interface UseMouseOptions extends ConfigurableWindow, ConfigurableEventFilter {
  /**
   * 鼠标位置基于页面、客户端、屏幕或相对于之前位置
   *
   * @default 'page'
   */
  type?: UseMouseCoordType | UseMouseEventExtractor

  /**
   * 在目标元素上监听事件
   *
   * @default 'Window'
   */
  target?: MaybeRefOrGetter<Window | EventTarget | null | undefined>

  /**
   * 监听触摸移动事件
   *
   * @default true
   */
  touch?: boolean

  /**
   * 在窗口上监听滚动事件，仅在type为'page'时有效
   *
   * @default true
   */
  scroll?: boolean

  /**
   * 当触发touchend事件时重置为初始值
   *
   * @default false
   */
  resetOnTouchEnds?: boolean

  /**
   * 初始值
   */
  initialValue?: Position
}

/**
 * 内置的鼠标事件提取器
 */
const UseMouseBuiltinExtractors: Record<UseMouseCoordType, UseMouseEventExtractor> = {
  page: event => [event.pageX, event.pageY],
  client: event => [event.clientX, event.clientY],
  screen: event => [event.screenX, event.screenY],
  movement: event => (event instanceof MouseEvent
    ? [event.movementX, event.movementY]
    : null
  ),
} as const

/**
 * 响应式鼠标位置
 *
 * @see https://vueuse.org/useMouse
 * @param options - 配置选项
 * @returns 返回包含x、y坐标和输入源类型的对象
 */
export function useMouse(options: UseMouseOptions = {}) {
  const {
    type = 'page',
    touch = true,
    resetOnTouchEnds = false,
    initialValue = { x: 0, y: 0 },
    window = defaultWindow,
    target = window,
    scroll = true,
    eventFilter,
  } = options

  // 保存上一次的鼠标事件和滚动位置
  let _prevMouseEvent: MouseEvent | null = null
  let _prevScrollX = 0
  let _prevScrollY = 0

  // 创建响应式引用
  const x = shallowRef(initialValue.x)
  const y = shallowRef(initialValue.y)
  const sourceType = shallowRef<UseMouseSourceType>(null)

  // 获取坐标提取器
  const extractor = typeof type === 'function'
    ? type
    : UseMouseBuiltinExtractors[type]

  /**
   * 鼠标事件处理函数
   */
  const mouseHandler = (event: MouseEvent) => {
    const result = extractor(event)
    _prevMouseEvent = event

    if (result) {
      [x.value, y.value] = result
      sourceType.value = 'mouse'
    }

    if (window) {
      _prevScrollX = window.scrollX
      _prevScrollY = window.scrollY
    }
  }

  /**
   * 触摸事件处理函数
   */
  const touchHandler = (event: TouchEvent) => {
    if (event.touches.length > 0) {
      const result = extractor(event.touches[0])
      if (result) {
        [x.value, y.value] = result
        sourceType.value = 'touch'
      }
    }
  }

  /**
   * 滚动事件处理函数
   */
  const scrollHandler = () => {
    if (!_prevMouseEvent || !window)
      return
    const pos = extractor(_prevMouseEvent)

    if (_prevMouseEvent instanceof MouseEvent && pos) {
      x.value = pos[0] + window.scrollX - _prevScrollX
      y.value = pos[1] + window.scrollY - _prevScrollY
    }
  }

  /**
   * 重置坐标为初始值
   */
  const reset = () => {
    x.value = initialValue.x
    y.value = initialValue.y
  }

  // 包装事件处理函数以支持事件过滤器
  const mouseHandlerWrapper = eventFilter
    ? (event: MouseEvent) => eventFilter(() => mouseHandler(event), {} as any)
    : (event: MouseEvent) => mouseHandler(event)

  const touchHandlerWrapper = eventFilter
    ? (event: TouchEvent) => eventFilter(() => touchHandler(event), {} as any)
    : (event: TouchEvent) => touchHandler(event)

  const scrollHandlerWrapper = eventFilter
    ? () => eventFilter(() => scrollHandler(), {} as any)
    : () => scrollHandler()

  // 添加事件监听器
  if (target) {
    const listenerOptions = { passive: true }
    useEventListener(target, ['mousemove', 'dragover'], mouseHandlerWrapper, listenerOptions)
    if (touch && type !== 'movement') {
      useEventListener(target, ['touchstart', 'touchmove'], touchHandlerWrapper, listenerOptions)
      if (resetOnTouchEnds)
        useEventListener(target, 'touchend', reset, listenerOptions)
    }
    if (scroll && type === 'page')
      useEventListener(window, 'scroll', scrollHandlerWrapper, listenerOptions)
  }

  return {
    x,
    y,
    sourceType,
  }
}

/**
 * useMouse函数的返回类型
 */
export type UseMouseReturn = ReturnType<typeof useMouse>