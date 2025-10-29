import type { ConfigurableDocumentOrShadowRoot, ConfigurableWindow } from '../_configurable'
import { shallowRef } from 'vue'
import { defaultWindow } from '../_configurable'
import { onElementRemoval } from '../onElementRemoval'
import { useEventListener } from '../useEventListener'

export interface UseActiveElementOptions extends ConfigurableWindow, ConfigurableDocumentOrShadowRoot {
  /**
   * 在shadow dom中深度搜索活动元素
   * Search active element deeply inside shadow dom
   *
   * @default true
   */
  deep?: boolean
  /**
   * 当元素从DOM中移除时跟踪活动元素
   * 底层使用MutationObserver
   * Track active element when it's removed from the DOM
   * Using a MutationObserver under the hood
   * @default false
   */
  triggerOnRemoval?: boolean
}

/**
 * 响应式的 `document.activeElement`
 * Reactive `document.activeElement`
 *
 * @see https://vueuse.org/useActiveElement
 * @param options
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useActiveElement<T extends HTMLElement>(
  options: UseActiveElementOptions = {},
) {
  const {
    window = defaultWindow,
    deep = true,
    triggerOnRemoval = false,
  } = options
  const document = options.document ?? window?.document

  const getDeepActiveElement = () => {
    let element = document?.activeElement
    if (deep) {
      while (element?.shadowRoot)
        element = element?.shadowRoot?.activeElement
    }
    return element
  }

  const activeElement = shallowRef<T | null | undefined>()
  const trigger = () => {
    activeElement.value = getDeepActiveElement() as T | null | undefined
  }

  if (window) {
    const listenerOptions = {
      capture: true,
      passive: true,
    }

    useEventListener(
      window,
      'blur',
      (event) => {
        if (event.relatedTarget !== null)
          return
        trigger()
      },
      listenerOptions,
    )
    useEventListener(
      window,
      'focus',
      trigger,
      listenerOptions,
    )
  }

  if (triggerOnRemoval) {
    onElementRemoval(activeElement, trigger, { document })
  }

  trigger()

  return activeElement
}

export type UseActiveElementReturn = ReturnType<typeof useActiveElement>