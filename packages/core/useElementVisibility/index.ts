/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:56:10
 * @FilePath: \vueuse\packages\core\useElementVisibility\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { MaybeComputedElementRef } from '../unrefElement'
import type { UseIntersectionObserverOptions } from '../useIntersectionObserver'
import { watchOnce } from '@vueuse/shared'
import { shallowRef, toValue } from 'vue'
import { defaultWindow } from '../_configurable'
import { useIntersectionObserver } from '../useIntersectionObserver'

export interface UseElementVisibilityOptions extends ConfigurableWindow, Pick<UseIntersectionObserverOptions, 'threshold'> {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin
   * 根边距，类似于CSS中的margin语法
   */
  rootMargin?: MaybeRefOrGetter<string>
  /**
   * 用于检查目标元素可见性的视口元素
   */
  scrollTarget?: MaybeRefOrGetter<HTMLElement | undefined | null>
  /**
   * 在元素可见性第一次变化时停止跟踪
   *
   * @default false
   */
  once?: boolean
}

/**
 * 跟踪元素在视口内的可见性。
 *
 * @see https://vueuse.org/useElementVisibility
 * @param element 要跟踪可见性的元素
 * @param options 配置选项
 */
export function useElementVisibility(
  element: MaybeComputedElementRef,
  options: UseElementVisibilityOptions = {},
) {
  const {
    window = defaultWindow,
    scrollTarget,
    threshold = 0,
    rootMargin,
    once = false,
  } = options
  // 元素是否可见的响应式引用
  const elementIsVisible = shallowRef(false)

  // 使用IntersectionObserver监听元素的可见性
  const { stop } = useIntersectionObserver(
    element,
    (intersectionObserverEntries) => {
      let isIntersecting = elementIsVisible.value

      // 根据条目时间获取isIntersecting的最新值
      let latestTime = 0
      for (const entry of intersectionObserverEntries) {
        if (entry.time >= latestTime) {
          latestTime = entry.time
          isIntersecting = entry.isIntersecting
        }
      }
      elementIsVisible.value = isIntersecting

      // 如果设置了once选项，在第一次可见性变化后停止监听
      if (once) {
        watchOnce(elementIsVisible, () => {
          stop()
        })
      }
    },
    {
      root: scrollTarget,
      window,
      threshold,
      rootMargin: toValue(rootMargin),
    },
  )

  return elementIsVisible
}

// useElementVisibility函数的返回类型
export type UseElementVisibilityReturn = ReturnType<typeof useElementVisibility>