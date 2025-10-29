/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:55:26
 * @FilePath: \vueuse\packages\core\useElementSize\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeComputedElementRef } from '../unrefElement'
import type { UseResizeObserverOptions } from '../useResizeObserver'
import { toArray, tryOnMounted } from '@vueuse/shared'
import { computed, shallowRef, watch } from 'vue'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'
import { useResizeObserver } from '../useResizeObserver'

export interface ElementSize {
  width: number   // 宽度
  height: number  // 高度
}

/**
 * HTML元素的响应式尺寸。
 *
 * @see https://vueuse.org/useElementSize
 * @param target 目标元素
 * @param initialSize 初始尺寸，默认为 { width: 0, height: 0 }
 * @param options 选项配置，包含window和box属性
 */
export function useElementSize(
  target: MaybeComputedElementRef,
  initialSize: ElementSize = { width: 0, height: 0 },
  options: UseResizeObserverOptions = {},
) {
  const { window = defaultWindow, box = 'content-box' } = options
  // 判断是否为SVG元素
  const isSVG = computed(() => unrefElement(target)?.namespaceURI?.includes('svg'))
  // 元素宽度和高度的响应式引用
  const width = shallowRef(initialSize.width)
  const height = shallowRef(initialSize.height)

  // 使用ResizeObserver监听元素尺寸变化
  const { stop: stop1 } = useResizeObserver(
    target,
    ([entry]) => {
      // 根据box类型选择不同的尺寸计算方式
      const boxSize = box === 'border-box'
        ? entry.borderBoxSize
        : box === 'content-box'
          ? entry.contentBoxSize
          : entry.devicePixelContentBoxSize

      // 如果是SVG元素，使用getBoundingClientRect获取尺寸
      if (window && isSVG.value) {
        const $elem = unrefElement(target)
        if ($elem) {
          const rect = $elem.getBoundingClientRect()
          width.value = rect.width
          height.value = rect.height
        }
      }
      else {
        // 对于普通元素，根据boxSize计算尺寸
        if (boxSize) {
          const formatBoxSize = toArray(boxSize)
          width.value = formatBoxSize.reduce((acc, { inlineSize }) => acc + inlineSize, 0)
          height.value = formatBoxSize.reduce((acc, { blockSize }) => acc + blockSize, 0)
        }
        else {
          // 如果boxSize不可用，使用contentRect作为后备方案
          width.value = entry.contentRect.width
          height.value = entry.contentRect.height
        }
      }
    },
    options,
  )

  // 组件挂载时获取初始尺寸
  tryOnMounted(() => {
    const ele = unrefElement(target)
    if (ele) {
      width.value = 'offsetWidth' in ele ? ele.offsetWidth : initialSize.width
      height.value = 'offsetHeight' in ele ? ele.offsetHeight : initialSize.height
    }
  })

  // 监听目标元素的变化
  const stop2 = watch(
    () => unrefElement(target),
    (ele) => {
      width.value = ele ? initialSize.width : 0
      height.value = ele ? initialSize.height : 0
    },
  )

  // 停止监听函数
  function stop() {
    stop1()
    stop2()
  }

  return {
    width,
    height,
    stop,
  }
}

// useElementSize函数的返回类型
export type UseElementSizeReturn = ReturnType<typeof useElementSize>