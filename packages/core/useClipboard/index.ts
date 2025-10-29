/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */

import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import type { ConfigurableNavigator } from '../_configurable'
import { useTimeoutFn } from '@vueuse/shared'
import { computed, readonly, shallowRef, toValue } from 'vue'
import { defaultNavigator } from '../_configurable'
import { useEventListener } from '../useEventListener'
import { usePermission } from '../usePermission'
import { useSupported } from '../useSupported'

/**
 * useClipboard函数的配置选项
 */
export interface UseClipboardOptions<Source> extends ConfigurableNavigator {
  /**
   * 启用剪贴板读取功能
   *
   * @default false
   */
  read?: boolean

  /**
   * 复制源
   */
  source?: Source

  /**
   * 重置`copied`引用状态的毫秒数
   *
   * @default 1500
   */
  copiedDuring?: number

  /**
   * 如果剪贴板API未定义，是否回退到document.execCommand('copy')
   *
   * @default false
   */
  legacy?: boolean
}

/**
 * useClipboard函数的返回值
 */
export interface UseClipboardReturn<Optional> {
  /** 是否支持剪贴板API */
  isSupported: ComputedRef<boolean>
  /** 剪贴板中的文本内容（只读） */
  text: Readonly<ShallowRef<string>>
  /** 是否已复制（只读） */
  copied: Readonly<ShallowRef<boolean>
  /** 复制函数 */
  copy: Optional extends true ? (text?: string) => Promise<void> : (text: string) => Promise<void>
}

/**
 * 响应式剪贴板API。
 *
 * @see https://vueuse.org/useClipboard
 * @param options 配置选项
 * @__NO_SIDE_EFFECTS__
 */
export function useClipboard(options?: UseClipboardOptions<undefined>): UseClipboardReturn<false>
export function useClipboard(options: UseClipboardOptions<MaybeRefOrGetter<string>>): UseClipboardReturn<true>
export function useClipboard(options: UseClipboardOptions<MaybeRefOrGetter<string> | undefined> = {}): UseClipboardReturn<boolean> {
  const {
    navigator = defaultNavigator,
    read = false,
    source,
    copiedDuring = 1500,
    legacy = false,
  } = options

  /** 是否支持剪贴板API */
  const isClipboardApiSupported = useSupported(() => (navigator && 'clipboard' in navigator))
  /** 剪贴板读取权限 */
  const permissionRead = usePermission('clipboard-read')
  /** 剪贴板写入权限 */
  const permissionWrite = usePermission('clipboard-write')
  /** 是否支持剪贴板功能 */
  const isSupported = computed(() => isClipboardApiSupported.value || legacy)
  /** 剪贴板文本内容 */
  const text = shallowRef('')
  /** 是否已复制 */
  const copied = shallowRef(false)
  /** 复制状态重置定时器 */
  const timeout = useTimeoutFn(() => copied.value = false, copiedDuring, { immediate: false })

  /** 更新剪贴板文本内容 */
  async function updateText() {
    let useLegacy = !(isClipboardApiSupported.value && isAllowed(permissionRead.value))
    if (!useLegacy) {
      try {
        text.value = await navigator!.clipboard.readText()
      }
      catch {
        useLegacy = true
      }
    }
    if (useLegacy) {
      text.value = legacyRead()
    }
  }

  if (isSupported.value && read)
    useEventListener(['copy', 'cut'], updateText, { passive: true })

  /** 复制文本到剪贴板 */
  async function copy(value = toValue(source)) {
    if (isSupported.value && value != null) {
      let useLegacy = !(isClipboardApiSupported.value && isAllowed(permissionWrite.value))
      if (!useLegacy) {
        try {
          await navigator!.clipboard.writeText(value)
        }
        catch {
          useLegacy = true
        }
      }
      if (useLegacy)
        legacyCopy(value)

      text.value = value
      copied.value = true
      timeout.start()
    }
  }

  /** 使用传统方法复制文本 */
  function legacyCopy(value: string) {
    const ta = document.createElement('textarea')
    ta.value = value
    ta.style.position = 'absolute'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }

  /** 使用传统方法读取文本 */
  function legacyRead() {
    return document?.getSelection?.()?.toString() ?? ''
  }

  /** 检查权限状态是否允许 */
  function isAllowed(status: PermissionState | undefined) {
    return status === 'granted' || status === 'prompt'
  }

  return {
    isSupported,
    text: readonly(text),
    copied: readonly(copied),
    copy,
  }
}