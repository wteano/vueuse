/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 14:09:43
 * @FilePath: \vueuse\packages\core\useMutationObserver\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { MaybeComputedElementRef, MaybeElement } from '../unrefElement'
import { notNullish, toArray, tryOnScopeDispose } from '@vueuse/shared'
import { computed, toValue, watch } from 'vue'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'
import { useSupported } from '../useSupported'

export interface UseMutationObserverOptions extends MutationObserverInit, ConfigurableWindow {}

/**
 * 监听DOM树的变化。
 *
 * @see https://vueuse.org/useMutationObserver
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver MutationObserver MDN
 * @param target 目标元素或元素数组
 * @param callback 变化时的回调函数
 * @param options 配置选项
 */
export function useMutationObserver(
  target: MaybeComputedElementRef | MaybeComputedElementRef[] | MaybeRefOrGetter<MaybeElement[]>,
  callback: MutationCallback,
  options: UseMutationObserverOptions = {},
) {
  const { window = defaultWindow, ...mutationOptions } = options
  let observer: MutationObserver | undefined
  const isSupported = useSupported(() => window && 'MutationObserver' in window)

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }
  }

  const targets = computed(() => {
    const value = toValue(target)
    const items = toArray(value)
      .map(unrefElement)
      .filter(notNullish)
    return new Set(items)
  })

  const stopWatch = watch(
    targets,
    (newTargets) => {
      cleanup()

      if (isSupported.value && newTargets.size) {
        observer = new MutationObserver(callback)
        newTargets.forEach(el => observer!.observe(el, mutationOptions))
      }
    },
    { immediate: true, flush: 'post' },
  )

  const takeRecords = () => {
    return observer?.takeRecords()
  }

  const stop = () => {
    stopWatch()
    cleanup()
  }

  tryOnScopeDispose(stop)

  return {
    isSupported,
    stop,
    takeRecords,
  }
}

export type UseMutationObserverReturn = ReturnType<typeof useMutationObserver>