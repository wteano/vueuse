/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 14:11:02
 * @FilePath: \vueuse\packages\core\useScrollLock\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { Fn } from '@vueuse/shared'
import type { MaybeRefOrGetter } from 'vue'
import { isIOS, toRef, tryOnScopeDispose } from '@vueuse/shared'
import { computed, shallowRef, toValue, watch } from 'vue'

import { resolveElement } from '../_resolve-element'
import { useEventListener } from '../useEventListener'

function checkOverflowScroll(ele: Element): boolean {
  const style = window.getComputedStyle(ele)
  if (
    style.overflowX === 'scroll'
    || style.overflowY === 'scroll'
    || (style.overflowX === 'auto' && ele.clientWidth < ele.scrollWidth)
    || (style.overflowY === 'auto' && ele.clientHeight < ele.scrollHeight)
  ) {
    return true
  }
  else {
    const parent = ele.parentNode as Element

    if (!parent || parent.tagName === 'BODY')
      return false

    return checkOverflowScroll(parent)
  }
}

function preventDefault(rawEvent: TouchEvent): boolean {
  const e = rawEvent || window.event

  const _target = e.target as Element

  // Do not prevent if element or parentNodes have overflow: scroll set.
  if (checkOverflowScroll(_target))
    return false

  // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
  if (e.touches.length > 1)
    return true

  if (e.preventDefault)
    e.preventDefault()

  return false
}

const elInitialOverflow = new WeakMap<HTMLElement, CSSStyleDeclaration['overflow']>()

/**
 * 锁定元素的滚动
 *
 * @see https://vueuse.org/useScrollLock
 * @param element 要锁定滚动的元素
 */
export function useScrollLock(
  element: MaybeRefOrGetter<HTMLElement | SVGElement | Window | Document | null | undefined>,
  initialState = false,
) {
  const isLocked = shallowRef(initialState)
  let stopTouchMoveListener: Fn | null = null
  let initialOverflow: CSSStyleDeclaration['overflow'] = ''

  watch(toRef(element), (el) => {
    const target = resolveElement(toValue(el))
    if (target) {
      const ele = target as HTMLElement
      if (!elInitialOverflow.get(ele))
        elInitialOverflow.set(ele, ele.style.overflow)

      if (ele.style.overflow !== 'hidden')
        initialOverflow = ele.style.overflow

      if (ele.style.overflow === 'hidden')
        return isLocked.value = true

      if (isLocked.value)
        return ele.style.overflow = 'hidden'
    }
  }, {
    immediate: true,
  })

  const lock = () => {
    const el = resolveElement(toValue(element))
    if (!el || isLocked.value)
      return
    if (isIOS) {
      stopTouchMoveListener = useEventListener(
        el,
        'touchmove',
        (e) => { preventDefault(e as TouchEvent) },
        { passive: false },
      )
    }
    el.style.overflow = 'hidden'
    isLocked.value = true
  }

  const unlock = () => {
    const el = resolveElement(toValue(element))
    if (!el || !isLocked.value)
      return
    if (isIOS)
      stopTouchMoveListener?.()
    el.style.overflow = initialOverflow
    elInitialOverflow.delete(el as HTMLElement)
    isLocked.value = false
  }

  tryOnScopeDispose(unlock)

  return computed<boolean>({
    get() {
      return isLocked.value
    },
    set(v) {
      if (v)
        lock()
      else unlock()
    },
  })
}