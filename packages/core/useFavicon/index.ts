/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:00:36
 * @FilePath: \vueuse\packages\core\useFavicon\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ReadonlyRefOrGetter } from '@vueuse/shared'
import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import type { ConfigurableDocument } from '../_configurable'
import { toRef } from '@vueuse/shared'
import { watch } from 'vue'
import { defaultDocument } from '../_configurable'

// useFavicon函数选项接口
export interface UseFaviconOptions extends ConfigurableDocument {
  baseUrl?: string // 基础URL
  rel?: string // 链接关系，默认为'icon'
}

/**
 * 响应式favicon。
 *
 * @see https://vueuse.org/useFavicon
 * @param newIcon
 * @param options
 */
export function useFavicon(
  newIcon: ReadonlyRefOrGetter<string | null | undefined>,
  options?: UseFaviconOptions
): ComputedRef<string | null | undefined>
export function useFavicon(
  newIcon?: MaybeRef<string | null | undefined>,
  options?: UseFaviconOptions
): Ref<string | null | undefined>
export function useFavicon(
  newIcon: MaybeRefOrGetter<string | null | undefined> = null,
  options: UseFaviconOptions = {},
) {
  // 从选项中解构配置
  const {
    baseUrl = '',
    rel = 'icon',
    document = defaultDocument,
  } = options

  // 将newIcon转换为响应式引用
  const favicon = toRef(newIcon)

  // 应用图标到页面
  const applyIcon = (icon: string) => {
    // 查找所有匹配的link元素
    const elements = document?.head
      .querySelectorAll<HTMLLinkElement>(`link[rel*="${rel}"]`)
    // 如果没有找到匹配的元素，创建新的link元素
    if (!elements || elements.length === 0) {
      const link = document?.createElement('link')
      if (link) {
        link.rel = rel
        link.href = `${baseUrl}${icon}`
        link.type = `image/${icon.split('.').pop()}`
        document?.head.append(link)
      }
      return
    }
    // 更新现有元素的href
    elements?.forEach(el => el.href = `${baseUrl}${icon}`)
  }

  // 监听favicon变化并应用
  watch(
    favicon,
    (i, o) => {
      if (typeof i === 'string' && i !== o)
        applyIcon(i)
    },
    { immediate: true },
  )

  return favicon
}

// useFavicon函数返回类型
export type UseFaviconReturn = ReturnType<typeof useFavicon>