/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:54:42
 * @FilePath: \vueuse\packages\core\useElementBounding\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeComputedElementRef } from '../unrefElement'
import { tryOnMounted } from '@vueuse/shared'
import { shallowRef, watch } from 'vue'
import { unrefElement } from '../unrefElement'
import { useEventListener } from '../useEventListener'
import { useMutationObserver } from '../useMutationObserver'
import { useResizeObserver } from '../useResizeObserver'

export interface UseElementBoundingOptions {
  /**
   * 在组件卸载时将值重置为0
   *
   * @default true
   */
  reset?: boolean

  /**
   * 监听窗口大小变化事件
   *
   * @default true
   */
  windowResize?: boolean
  /**
   * 监听窗口滚动事件
   *
   * @default true
   */
  windowScroll?: boolean

  /**
   * 在组件挂载时立即调用更新
   *
   * @default true
   */
  immediate?: boolean

  /**
   * 重新计算边界框的时机
   *
   * 设置为 `next-frame` 在与 {@link useBreakpoints} 等功能一起使用时很有用，
   * 因为布局（影响观察元素的边界框）在当前tick中不会更新。
   *
   * @default 'sync'
   */
  updateTiming?: 'sync' | 'next-frame'
}

/**
 * HTML元素的响应式边界框。
 *
 * @see https://vueuse.org/useElementBounding
 * @param target 目标元素
 */
export function useElementBounding(
  target: MaybeComputedElementRef,
  options: UseElementBoundingOptions = {},
) {
  const {
    reset = true,
    windowResize = true,
    windowScroll = true,
    immediate = true,
    updateTiming = 'sync',
  } = options

  // 元素边界框的各个属性
  const height = shallowRef(0)  // 高度
  const bottom = shallowRef(0)  // 底部位置
  const left = shallowRef(0)    // 左侧位置
  const right = shallowRef(0)   // 右侧位置
  const top = shallowRef(0)     // 顶部位置
  const width = shallowRef(0)   // 宽度
  const x = shallowRef(0)       // x坐标
  const y = shallowRef(0)       // y坐标

  // 重新计算元素的边界框
  function recalculate() {
    const el = unrefElement(target)

    if (!el) {
      if (reset) {
        height.value = 0
        bottom.value = 0
        left.value = 0
        right.value = 0
        top.value = 0
        width.value = 0
        x.value = 0
        y.value = 0
      }
      return
    }

    const rect = el.getBoundingClientRect()

    height.value = rect.height
    bottom.value = rect.bottom
    left.value = rect.left
    right.value = rect.right
    top.value = rect.top
    width.value = rect.width
    x.value = rect.x
    y.value = rect.y
  }

  // 更新函数，根据updateTiming决定何时重新计算
  function update() {
    if (updateTiming === 'sync')
      recalculate()
    else if (updateTiming === 'next-frame')
      requestAnimationFrame(() => recalculate())
  }

  // 监听目标元素的大小变化
  useResizeObserver(target, update)
  // 监听目标元素的变化
  watch(() => unrefElement(target), ele => !ele && update())
  // 监听CSS或样式变化
  useMutationObserver(target, update, {
    attributeFilter: ['style', 'class'],
  })

  // 监听窗口滚动事件
  if (windowScroll)
    useEventListener('scroll', update, { capture: true, passive: true })
  // 监听窗口大小变化事件
  if (windowResize)
    useEventListener('resize', update, { passive: true })

  // 组件挂载后立即更新
  tryOnMounted(() => {
    if (immediate)
      update()
  })

  return {
    height,
    bottom,
    left,
    right,
    top,
    width,
    x,
    y,
    update,
  }
}

// useElementBounding函数的返回类型
export type UseElementBoundingReturn = ReturnType<typeof useElementBounding>