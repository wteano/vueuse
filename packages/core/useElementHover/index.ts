import type { TimerHandle } from '@vueuse/shared'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { MaybeComputedElementRef } from '../unrefElement'
import { computed, shallowRef } from 'vue'
import { defaultWindow } from '../_configurable'
import { onElementRemoval } from '../onElementRemoval'
import { unrefElement } from '../unrefElement'
import { useEventListener } from '../useEventListener'

export interface UseElementHoverOptions extends ConfigurableWindow {
  /**
   * 鼠标进入延迟时间（毫秒）
   *
   * @default 0
   */
  delayEnter?: number
  
  /**
   * 鼠标离开延迟时间（毫秒）
   *
   * @default 0
   */
  delayLeave?: number
  
  /**
   * 元素移除时是否触发
   *
   * @default false
   */
  triggerOnRemoval?: boolean
}

/**
 * 响应式元素的悬停状态
 *
 * @see https://vueuse.org/useElementHover
 * @param el 目标元素
 * @param options 配置选项
 */
export function useElementHover(el: MaybeRefOrGetter<EventTarget | null | undefined>, options: UseElementHoverOptions = {}): ShallowRef<boolean> {
  const {
    delayEnter = 0,
    delayLeave = 0,
    triggerOnRemoval = false,
    window = defaultWindow,
  } = options

  const isHovered = shallowRef(false)
  let timer: TimerHandle

  const toggle = (entering: boolean) => {
    const delay = entering ? delayEnter : delayLeave
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }

    if (delay)
      timer = setTimeout(() => isHovered.value = entering, delay)
    else
      isHovered.value = entering
  }

  if (!window)
    return isHovered

  useEventListener(el, 'mouseenter', () => toggle(true), { passive: true })
  useEventListener(el, 'mouseleave', () => toggle(false), { passive: true })

  if (triggerOnRemoval) {
    onElementRemoval(
      computed(() => unrefElement(el as MaybeComputedElementRef)),
      () => toggle(false),
    )
  }

  return isHovered
}