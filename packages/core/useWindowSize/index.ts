/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:39:49
 * @FilePath: \vueuse\packages\core\useWindowSize\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ConfigurableWindow } from '../_configurable'
import { tryOnMounted } from '@vueuse/shared'
import { shallowRef, watch } from 'vue'
import { defaultWindow } from '../_configurable'
import { useEventListener } from '../useEventListener'
import { useMediaQuery } from '../useMediaQuery'

export interface UseWindowSizeOptions extends ConfigurableWindow {
  initialWidth?: number
  initialHeight?: number
  /**
   * 监听窗口的`orientationchange`事件
   *
   * @default true
   */
  listenOrientation?: boolean

  /**
   * 宽度和高度是否应包含滚动条
   * 仅在`type`为`'inner'`时有效
   *
   * @default true
   */
  includeScrollbar?: boolean

  /**
   * 使用`window.innerWidth`、`window.outerWidth`或`window.visualViewport`
   * visualViewport文档来自MDN(https://developer.mozilla.org/zh-CN/docs/Web/API/VisualViewport)
   * @default 'inner'
   */
  type?: 'inner' | 'outer' | 'visual'
}

/**
 * 响应式的窗口大小。
 *
 * @see https://vueuse.org/useWindowSize
 * @param options
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useWindowSize(options: UseWindowSizeOptions = {}) {
  const {
    window = defaultWindow,
    initialWidth = Number.POSITIVE_INFINITY,
    initialHeight = Number.POSITIVE_INFINITY,
    listenOrientation = true,
    includeScrollbar = true,
    type = 'inner',
  } = options

  const width = shallowRef(initialWidth) // 窗口宽度的响应式引用
  const height = shallowRef(initialHeight) // 窗口高度的响应式引用

  const update = () => { // 更新窗口大小的函数
    if (window) {
      if (type === 'outer') {
        width.value = window.outerWidth
        height.value = window.outerHeight
      }
      else if (type === 'visual' && window.visualViewport) {
        const { width: visualViewportWidth, height: visualViewportHeight, scale } = window.visualViewport
        width.value = Math.round(visualViewportWidth * scale)
        height.value = Math.round(visualViewportHeight * scale)
      }
      else if (includeScrollbar) {
        width.value = window.innerWidth
        height.value = window.innerHeight
      }
      else {
        width.value = window.document.documentElement.clientWidth
        height.value = window.document.documentElement.clientHeight
      }
    }
  }

  update()
  tryOnMounted(update)

  const listenerOptions = { passive: true }
  useEventListener('resize', update, listenerOptions)

  if (window && type === 'visual' && window.visualViewport) {
    useEventListener(window.visualViewport, 'resize', update, listenerOptions)
  }

  if (listenOrientation) {
    const matches = useMediaQuery('(orientation: portrait)')
    watch(matches, () => update())
  }

  return { width, height }
}

export type UseWindowSizeReturn = ReturnType<typeof useWindowSize> // useWindowSize函数的返回类型