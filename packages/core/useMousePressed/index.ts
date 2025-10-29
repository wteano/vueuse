import type { ConfigurableWindow } from '../_configurable'
import type { MaybeComputedElementRef } from '../unrefElement'
import type { UseMouseSourceType } from '../useMouse'
import { computed, shallowRef } from 'vue'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'
import { useEventListener } from '../useEventListener'

export interface MousePressedOptions extends ConfigurableWindow {
  /**
   * 监听 `touchstart` `touchend` 事件
   *
   * @default true
   */
  touch?: boolean

  /**
   * 监听 `dragstart` `drop` 和 `dragend` 事件
   *
   * @default true
   */
  drag?: boolean

  /**
   * 使用 `capture` 选项设置为 `true` 添加事件监听器
   * (参见 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture))
   *
   * @default false
   */
  capture?: boolean

  /**
   * 初始值
   *
   * @default false
   */
  initialValue?: boolean

  /**
   * 要捕获点击的目标元素
   */
  target?: MaybeComputedElementRef

  /**
   * 当鼠标按下时调用的回调函数
   *
   * @param event
   */
  onPressed?: (event: MouseEvent | TouchEvent | DragEvent) => void

  /**
   * 当鼠标释放时调用的回调函数
   *
   * @param event
   */
  onReleased?: (event: MouseEvent | TouchEvent | DragEvent) => void
}

/**
 * 响应式鼠标按压状态
 *
 * @see https://vueuse.org/useMousePressed
 * @param options - 配置选项
 */
export function useMousePressed(options: MousePressedOptions = {}) {
  const {
    touch = true,
    drag = true,
    capture = false,
    initialValue = false,
    window = defaultWindow,
  } = options

  const pressed = shallowRef(initialValue)
  const sourceType = shallowRef<UseMouseSourceType>(null)

  if (!window) {
    return {
      pressed,
      sourceType,
    }
  }

  const onPressed = (srcType: UseMouseSourceType) => (event: MouseEvent | TouchEvent | DragEvent) => {
    pressed.value = true
    sourceType.value = srcType
    options.onPressed?.(event)
  }
  const onReleased = (event: MouseEvent | TouchEvent | DragEvent) => {
    pressed.value = false
    sourceType.value = null
    options.onReleased?.(event)
  }

  const target = computed(() => unrefElement(options.target) || window)

  const listenerOptions = { passive: true, capture }
  useEventListener<MouseEvent>(target, 'mousedown', onPressed('mouse'), listenerOptions)

  useEventListener<MouseEvent>(window, 'mouseleave', onReleased, listenerOptions)
  useEventListener<MouseEvent>(window, 'mouseup', onReleased, listenerOptions)

  if (drag) {
    useEventListener<DragEvent>(target, 'dragstart', onPressed('mouse'), listenerOptions)

    useEventListener<DragEvent>(window, 'drop', onReleased, listenerOptions)
    useEventListener<DragEvent>(window, 'dragend', onReleased, listenerOptions)
  }

  if (touch) {
    useEventListener<TouchEvent>(target, 'touchstart', onPressed('touch'), listenerOptions)

    useEventListener<TouchEvent>(window, 'touchend', onReleased, listenerOptions)
    useEventListener<TouchEvent>(window, 'touchcancel', onReleased, listenerOptions)
  }

  return {
    pressed,
    sourceType,
  }
}

export type UseMousePressedReturn = ReturnType<typeof useMousePressed>