/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:59:44
 * @FilePath: \vueuse\packages\core\useEyeDropper\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { shallowRef } from 'vue'
import { useSupported } from '../useSupported'

// EyeDropper打开选项接口
export interface EyeDropperOpenOptions {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal?: AbortSignal
}

// EyeDropper接口定义
export interface EyeDropper {
  // eslint-disable-next-line ts/no-misused-new
  new(): EyeDropper
  open: (options?: EyeDropperOpenOptions) => Promise<{ sRGBHex: string }>
  [Symbol.toStringTag]: 'EyeDropper'
}

// useEyeDropper函数选项接口
export interface UseEyeDropperOptions {
  /**
   * 初始sRGBHex值。
   *
   * @default ''
   */
  initialValue?: string
}

/**
 * 响应式[EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)
 *
 * @see https://vueuse.org/useEyeDropper
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useEyeDropper(options: UseEyeDropperOptions = {}) {
  // 从选项中解构初始值
  const { initialValue = '' } = options
  // 检查浏览器是否支持EyeDropper API
  const isSupported = useSupported(() => typeof window !== 'undefined' && 'EyeDropper' in window)
  // 存储选中的颜色值的响应式引用
  const sRGBHex = shallowRef(initialValue)

  // 打开颜色选择器
  async function open(openOptions?: EyeDropperOpenOptions) {
    if (!isSupported.value)
      return
    // 创建EyeDropper实例
    const eyeDropper: EyeDropper = new (window as any).EyeDropper()
    // 打开颜色选择器并等待用户选择颜色
    const result = await eyeDropper.open(openOptions)
    // 更新sRGBHex值为选中的颜色
    sRGBHex.value = result.sRGBHex
    return result
  }

  return { isSupported, sRGBHex, open }
}

// useEyeDropper函数返回类型
export type UseEyeDropperReturn = ReturnType<typeof useEyeDropper>