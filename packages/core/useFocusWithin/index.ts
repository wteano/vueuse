import type { ComputedRef } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { MaybeElementRef } from '../unrefElement'
import { computed, shallowRef } from 'vue'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'
import { useActiveElement } from '../useActiveElement'
import { useEventListener } from '../useEventListener'

export interface UseFocusWithinReturn {
  /**
   * 如果元素或其任何后代元素获得焦点，则为true
   */
  focused: ComputedRef<boolean>
}

// 焦点进入事件
const EVENT_FOCUS_IN = 'focusin'
// 焦点离开事件
const EVENT_FOCUS_OUT = 'focusout'
// CSS伪类选择器
const PSEUDO_CLASS_FOCUS_WITHIN = ':focus-within'

/**
 * 跟踪焦点是否包含在目标元素内
 *
 * @see https://vueuse.org/useFocusWithin
 * @param target 要跟踪的目标元素
 * @param options 配置选项
 */
export function useFocusWithin(target: MaybeElementRef, options: ConfigurableWindow = {}): UseFocusWithinReturn {
  // 从选项中解构配置
  const { window = defaultWindow } = options
  // 目标元素计算属性
  const targetElement = computed(() => unrefElement(target))
  // 内部焦点状态
  const _focused = shallowRef(false)
  // 焦点状态计算属性
  const focused = computed(() => _focused.value)
  // 获取当前活动元素
  const activeElement = useActiveElement(options)

  // 如果没有window对象或没有活动元素，直接返回焦点状态
  if (!window || !activeElement.value) {
    return { focused }
  }

  // 监听器选项
  const listenerOptions = { passive: true }
  // 监听焦点进入事件
  useEventListener(targetElement, EVENT_FOCUS_IN, () => _focused.value = true, listenerOptions)
  // 监听焦点离开事件
  useEventListener(targetElement, EVENT_FOCUS_OUT, () =>
    _focused.value = targetElement.value?.matches?.(PSEUDO_CLASS_FOCUS_WITHIN) ?? false, listenerOptions)

  return { focused }
}