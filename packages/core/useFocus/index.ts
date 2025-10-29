import type { WritableComputedRef } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { MaybeElementRef } from '../unrefElement'
import { computed, shallowRef, watch } from 'vue'
import { unrefElement } from '../unrefElement'
import { useEventListener } from '../useEventListener'

export interface UseFocusOptions extends ConfigurableWindow {
  /**
   * 初始值。如果设置为true，则焦点将设置在目标上
   *
   * @default false
   */
  initialValue?: boolean

  /**
   * 复制CSS的:focus-visible行为
   *
   * @default false
   */
  focusVisible?: boolean

  /**
   * 防止元素获得焦点时滚动到该元素
   *
   * @default false
   */
  preventScroll?: boolean
}

export interface UseFocusReturn {
  /**
   * 如果读取为true，则元素已获得焦点。如果读取为false，则元素没有焦点
   * 如果设置为true，则元素将获得焦点。如果设置为false，则元素将失去焦点
   */
  focused: WritableComputedRef<boolean>
}

/**
 * 跟踪或设置DOM元素的焦点状态
 *
 * @see https://vueuse.org/useFocus
 * @param target 焦点和模糊事件的目标元素
 * @param options 配置选项
 */
export function useFocus(target: MaybeElementRef, options: UseFocusOptions = {}): UseFocusReturn {
  // 从选项中解构配置
  const { initialValue = false, focusVisible = false, preventScroll = false } = options

  // 内部焦点状态
  const innerFocused = shallowRef(false)
  // 目标元素计算属性
  const targetElement = computed(() => unrefElement(target))

  // 监听器选项
  const listenerOptions = { passive: true }
  // 监听焦点事件
  useEventListener(targetElement, 'focus', (event) => {
    // 如果不需要焦点可见性检查，或者元素匹配:focus-visible伪类
    if (!focusVisible || (event.target as HTMLElement).matches?.(':focus-visible'))
      innerFocused.value = true
  }, listenerOptions)
  // 监听失焦事件
  useEventListener(targetElement, 'blur', () => innerFocused.value = false, listenerOptions)

  // 创建可写的计算属性
  const focused = computed({
    get: () => innerFocused.value,
    set(value: boolean) {
      // 如果设置为false且当前有焦点，则失焦
      if (!value && innerFocused.value)
        targetElement.value?.blur()
      // 如果设置为true且当前没有焦点，则聚焦
      else if (value && !innerFocused.value)
        targetElement.value?.focus({ preventScroll })
    },
  })

  // 监听目标元素变化，设置初始焦点状态
  watch(
    targetElement,
    () => {
      focused.value = initialValue
    },
    { immediate: true, flush: 'post' },
  )

  return { focused }
}