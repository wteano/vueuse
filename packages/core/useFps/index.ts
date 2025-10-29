/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:05:22
 * @FilePath: \vueuse\packages\core\useFps\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ShallowRef } from 'vue'
import { shallowRef } from 'vue'
import { useRafFn } from '../useRafFn'

export interface UseFpsOptions {
  /**
   * 每隔x帧计算一次FPS
   * @default 10
   */
  every?: number
}

/* @__NO_SIDE_EFFECTS__ */
export function useFps(options?: UseFpsOptions): ShallowRef<number> {
  // FPS值引用
  const fps = shallowRef(0)
  // 如果浏览器不支持performance API，直接返回
  if (typeof performance === 'undefined')
    return fps
  // 计算间隔帧数，默认为10帧
  const every = options?.every ?? 10

  // 上次计算时间
  let last = performance.now()
  // 计数器
  let ticks = 0

  // 使用requestAnimationFrame循环
  useRafFn(() => {
    ticks += 1
    // 当达到指定帧数时计算FPS
    if (ticks >= every) {
      const now = performance.now()
      const diff = now - last
      // 计算FPS并四舍五入
      fps.value = Math.round(1000 / (diff / ticks))
      last = now
      ticks = 0
    }
  })

  return fps
}