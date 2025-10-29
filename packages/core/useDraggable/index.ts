import type { MaybeRefOrGetter } from 'vue'
import type { PointerType, Position } from '../types'
import { isClient, toRefs } from '@vueuse/shared'
import { computed, ref as deepRef, toValue } from 'vue'
import { defaultWindow } from '../_configurable'
import { useEventListener } from '../useEventListener'

export interface UseDraggableOptions {
  /**
   * 只有直接点击元素时才开始拖动
   *
   * @default false
   */
  exact?: MaybeRefOrGetter<boolean>

  /**
   * 阻止事件默认行为
   *
   * @default false
   */
  preventDefault?: MaybeRefOrGetter<boolean>

  /**
   * 阻止事件传播
   *
   * @default false
   */
  stopPropagation?: MaybeRefOrGetter<boolean>

  /**
   * 是否在捕获阶段派发事件
   *
   * @default true
   */
  capture?: boolean

  /**
   * 附加 `pointermove` 和 `pointerup` 事件的元素
   *
   * @default window
   */
  draggingElement?: MaybeRefOrGetter<HTMLElement | SVGElement | Window | Document | null | undefined>

  /**
   * 用于计算边界的元素（如果未设置，将使用事件的目标）
   *
   * @default undefined
   */
  containerElement?: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>

  /**
   * 触发拖动事件的句柄
   *
   * @default target
   */
  handle?: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>

  /**
   * 监听的指针类型
   *
   * @default ['mouse', 'touch', 'pen']
   */
  pointerTypes?: PointerType[]

  /**
   * 元素的初始位置
   *
   * @default { x: 0, y: 0 }
   */
  initialValue?: MaybeRefOrGetter<Position>

  /**
   * 开始拖动时的回调。返回 `false` 以防止拖动
   */
  onStart?: (position: Position, event: PointerEvent) => void | false

  /**
   * 拖动过程中的回调
   */
  onMove?: (position: Position, event: PointerEvent) => void

  /**
   * 拖动结束时的回调
   */
  onEnd?: (position: Position, event: PointerEvent) => void

  /**
   * 拖动轴
   *
   * @default 'both'
   */
  axis?: 'x' | 'y' | 'both'

  /**
   * 禁用拖放
   *
   * @default false
   */
  disabled?: MaybeRefOrGetter<boolean>

  /**
   * 允许触发拖动事件的鼠标按钮
   *
   * - `0`: 主按钮，通常是左键或未初始化状态
   * - `1`: 辅助按钮，通常是滚轮键或中键（如果存在）
   * - `2`: 次按钮，通常是右键
   * - `3`: 第四个按钮，通常是浏览器后退按钮
   * - `4`: 第五个按钮，通常是浏览器前进按钮
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value
   * @default [0]
   */
  buttons?: MaybeRefOrGetter<number[]>
}

/**
 * 使元素可拖动
 *
 * @see https://vueuse.org/useDraggable
 * @param target
 * @param options
 */
export function useDraggable(
  target: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>,
  options: UseDraggableOptions = {},
) {
  const {
    pointerTypes,
    preventDefault,
    stopPropagation,
    exact,
    onMove,
    onEnd,
    onStart,
    initialValue,
    axis = 'both',
    draggingElement = defaultWindow,
    containerElement,
    handle: draggingHandle = target,
    buttons = [0],
  } = options

  const position = deepRef<Position>( // 位置
    toValue(initialValue) ?? { x: 0, y: 0 },
  )

  const pressedDelta = deepRef<Position>() // 按下的偏移量

  const filterEvent = (e: PointerEvent) => { // 过滤事件
    if (pointerTypes)
      return pointerTypes.includes(e.pointerType as PointerType)
    return true
  }

  const handleEvent = (e: PointerEvent) => { // 处理事件
    if (toValue(preventDefault))
      e.preventDefault()
    if (toValue(stopPropagation))
      e.stopPropagation()
  }

  const start = (e: PointerEvent) => { // 开始拖动
    if (!toValue(buttons).includes(e.button))
      return
    if (toValue(options.disabled) || !filterEvent(e))
      return
    if (toValue(exact) && e.target !== toValue(target))
      return

    const container = toValue(containerElement) // 容器元素
    const containerRect = container?.getBoundingClientRect?.() // 容器矩形
    const targetRect = toValue(target)!.getBoundingClientRect() // 目标矩形
    const pos = { // 位置
      x: e.clientX - (container ? targetRect.left - containerRect!.left + container.scrollLeft : targetRect.left),
      y: e.clientY - (container ? targetRect.top - containerRect!.top + container.scrollTop : targetRect.top),
    }
    if (onStart?.(pos, e) === false)
      return
    pressedDelta.value = pos
    handleEvent(e)
  }
  const move = (e: PointerEvent) => { // 移动
    if (toValue(options.disabled) || !filterEvent(e))
      return
    if (!pressedDelta.value)
      return

    const container = toValue(containerElement) // 容器元素
    const targetRect = toValue(target)!.getBoundingClientRect() // 目标矩形
    let { x, y } = position.value
    if (axis === 'x' || axis === 'both') {
      x = e.clientX - pressedDelta.value.x
      if (container)
        x = Math.min(Math.max(0, x), container.scrollWidth - targetRect!.width)
    }
    if (axis === 'y' || axis === 'both') {
      y = e.clientY - pressedDelta.value.y
      if (container)
        y = Math.min(Math.max(0, y), container.scrollHeight - targetRect!.height)
    }
    position.value = {
      x,
      y,
    }
    onMove?.(position.value, e)
    handleEvent(e)
  }
  const end = (e: PointerEvent) => { // 结束拖动
    if (toValue(options.disabled) || !filterEvent(e))
      return
    if (!pressedDelta.value)
      return
    pressedDelta.value = undefined
    onEnd?.(position.value, e)
    handleEvent(e)
  }

  if (isClient) {
    const config = () => ({ // 配置
      capture: options.capture ?? true,
      passive: !toValue(preventDefault),
    })
    useEventListener(draggingHandle, 'pointerdown', start, config) // 监听指针按下
    useEventListener(draggingElement, 'pointermove', move, config) // 监听指针移动
    useEventListener(draggingElement, 'pointerup', end, config) // 监听指针抬起
  }

  return {
    ...toRefs(position),
    position,
    isDragging: computed(() => !!pressedDelta.value), // 是否正在拖动
    style: computed(
      () => `left:${position.value.x}px;top:${position.value.y}px;`, // 样式
    ),
  }
}

export type UseDraggableReturn = ReturnType<typeof useDraggable> // useDraggable函数的返回类型