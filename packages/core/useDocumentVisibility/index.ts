/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:52:31
 * @FilePath: \vueuse\packages\core\useDocumentVisibility\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ConfigurableDocument } from '../_configurable'
import { shallowRef } from 'vue'
import { defaultDocument } from '../_configurable'
import { useEventListener } from '../useEventListener'

/**
 * 响应式跟踪 `document.visibilityState`。
 *
 * @see https://vueuse.org/useDocumentVisibility
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useDocumentVisibility(options: ConfigurableDocument = {}) {
  const { document = defaultDocument } = options // 文档对象
  if (!document)
    return shallowRef('visible')

  const visibility = shallowRef(document.visibilityState) // 可见性状态

  useEventListener(document, 'visibilitychange', () => { // 监听可见性变化
    visibility.value = document.visibilityState
  }, { passive: true })

  return visibility
}

export type UseDocumentVisibilityReturn = ReturnType<typeof useDocumentVisibility> // useDocumentVisibility函数的返回类型