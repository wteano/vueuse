/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:50:59
 * @FilePath: \vueuse\packages\core\useDevicePixelRatio\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { WatchStopHandle } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import { noop, watchImmediate } from '@vueuse/shared'
import { readonly, shallowRef } from 'vue'
import { defaultWindow } from '../_configurable'
import { useMediaQuery } from '../useMediaQuery'

/**
 * 响应式跟踪 `window.devicePixelRatio`。
 *
 * @see https://vueuse.org/useDevicePixelRatio
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useDevicePixelRatio(options: ConfigurableWindow = {}) {
  const {
    window = defaultWindow, // 窗口对象
  } = options

  const pixelRatio = shallowRef(1) // 像素比
  const query = useMediaQuery(() => `(resolution: ${pixelRatio.value}dppx)`, options) // 媒体查询
  let stop: WatchStopHandle = noop // 停止监听函数

  if (window) {
    stop = watchImmediate(query, () => pixelRatio.value = window!.devicePixelRatio) // 监听媒体查询变化
  }

  return {
    pixelRatio: readonly(pixelRatio), // 只读的像素比
    stop, // 停止监听函数
  }
}

export type UseDevicePixelRatioReturn = ReturnType<typeof useDevicePixelRatio> // useDevicePixelRatio函数的返回类型