/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:39:13
 * @FilePath: \vueuse\packages\core\useTitle\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ReadonlyRefOrGetter } from '@vueuse/shared'
import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import type { ConfigurableDocument } from '../_configurable'
import { toRef, tryOnScopeDispose } from '@vueuse/shared'
import { toValue, watch } from 'vue'
import { defaultDocument } from '../_configurable'
import { useMutationObserver } from '../useMutationObserver'

export type UseTitleOptionsBase = {
  /**
   * 卸载时恢复原始标题
   * @param originTitle 原始标题
   * @returns 恢复的标题
   */
  restoreOnUnmount?: false | ((originalTitle: string, currentTitle: string) => string | null | undefined)
} & (
  {
    /**
     * 使用MutationObserver观察`document.title`的变化
     * 不能与`titleTemplate`选项一起使用。
     *
     * @default false
     */
    observe?: boolean
  }
  | {
    /**
     * 用于解析标题的模板字符串（例如：'%s | My Website'）
     * 不能与`observe`选项一起使用。
     *
     * @default '%s'
     */
    titleTemplate?: MaybeRef<string> | ((title: string) => string)
  }
)

export type UseTitleOptions = ConfigurableDocument & UseTitleOptionsBase

/**
 * 响应式的文档标题。
 *
 * @see https://vueuse.org/useTitle
 * @param newTitle
 * @param options
 * @description 它不兼容SSR。您的值将仅在客户端应用。
 */
export function useTitle(
  newTitle: ReadonlyRefOrGetter<string | null | undefined>,
  options?: UseTitleOptions,
): ComputedRef<string | null | undefined>
export function useTitle(
  newTitle?: MaybeRef<string | null | undefined>,
  options?: UseTitleOptions,
): Ref<string | null | undefined>
export function useTitle(
  newTitle: MaybeRefOrGetter<string | null | undefined> = null,
  options: UseTitleOptions = {},
) {
  const {
    document = defaultDocument,
    restoreOnUnmount = t => t,
  } = options
  const originalTitle = document?.title ?? '' // 原始标题

  const title = toRef(newTitle ?? document?.title ?? null) // 标题的响应式引用
  const isReadonly = !!(newTitle && typeof newTitle === 'function') // 是否为只读

  function format(t: string) { // 格式化标题的函数
    if (!('titleTemplate' in options))
      return t
    const template = options.titleTemplate || '%s'
    return typeof template === 'function'
      ? template(t)
      : toValue(template).replace(/%s/g, t)
  }

  watch(
    title,
    (newValue, oldValue) => {
      if (newValue !== oldValue && document)
        document.title = format(newValue ?? '')
    },
    { immediate: true },
  )

  if ((options as any).observe && !(options as any).titleTemplate && document && !isReadonly) {
    useMutationObserver(
      document.head?.querySelector('title'),
      () => {
        if (document && document.title !== title.value)
          title.value = format(document.title)
      },
      { childList: true },
    )
  }

  tryOnScopeDispose(() => {
    if (restoreOnUnmount) {
      const restoredTitle = restoreOnUnmount(originalTitle, title.value || '')
      if (restoredTitle != null && document)
        document.title = restoredTitle
    }
  })

  return title
}

export type UseTitleReturn = ReturnType<typeof useTitle> // useTitle函数的返回类型