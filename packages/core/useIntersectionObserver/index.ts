/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:09:55
 * @FilePath: \vueuse\packages\core\useIntersectionObserver\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { Pausable } from '@vueuse/shared'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { MaybeComputedElementRef, MaybeElement } from '../unrefElement'
import { noop, notNullish, toArray, tryOnScopeDispose } from '@vueuse/shared'
import { computed, shallowRef, toValue, watch } from 'vue'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'
import { useSupported } from '../useSupported'

export interface UseIntersectionObserverOptions extends ConfigurableWindow {
  /**
   * 创建时立即启动IntersectionObserver
   *
   * @default true
   */
  immediate?: boolean

  /**
   * 用作测试交集时边界框的Element或Document
   */
  root?: MaybeComputedElementRef | Document

  /**
   * 指定在计算交集时添加到根边界框的一组偏移量的字符串
   */
  rootMargin?: string

  /**
   * 单个数字或介于0.0和1之间的数字数组
   * @default 0
   */
  threshold?: number | number[]
}

export interface UseIntersectionObserverReturn extends Pausable {
  isSupported: ComputedRef<boolean>
  stop: () => void
}

/**
 * 检测目标元素的可见性
 *
 * @see https://vueuse.org/useIntersectionObserver
 * @param target 目标元素或元素数组
 * @param callback 回调函数
 * @param options 配置选项
 */
export function useIntersectionObserver(
  target: MaybeComputedElementRef | MaybeRefOrGetter<MaybeElement[]> | MaybeComputedElementRef[],
  callback: IntersectionObserverCallback,
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn {
  // 从选项中解构配置
  const {
    root,
    rootMargin = '0px',
    threshold = 0,
    window = defaultWindow,
    immediate = true,
  } = options

  // 检查是否支持IntersectionObserver API
  const isSupported = useSupported(() => window && 'IntersectionObserver' in window)
  // 计算目标元素列表
  const targets = computed(() => {
    const _target = toValue(target)
    return toArray(_target).map(unrefElement).filter(notNullish)
  })

  // 清理函数
  let cleanup = noop
  // 是否激活状态
  const isActive = shallowRef(immediate)

  // 如果支持API，则设置监听
  const stopWatch = isSupported.value
    ? watch(
        () => [targets.value, unrefElement(root as MaybeComputedElementRef), isActive.value] as const,
        ([targets, root]) => {
          cleanup()
          if (!isActive.value)
            return

          if (!targets.length)
            return

          // 创建IntersectionObserver实例
          const observer = new IntersectionObserver(
            callback,
            {
              root: unrefElement(root),
              rootMargin,
              threshold,
            },
          )

          // 观察所有目标元素
          targets.forEach(el => el && observer.observe(el))

          // 设置清理函数
          cleanup = () => {
            observer.disconnect()
            cleanup = noop
          }
        },
        { immediate, flush: 'post' },
      )
    : noop

  // 停止观察
  const stop = () => {
    cleanup()
    stopWatch()
    isActive.value = false
  }

  // 组件卸载时自动停止观察
  tryOnScopeDispose(stop)

  return {
    isSupported,
    isActive,
    pause() {
      cleanup()
      isActive.value = false
    },
    resume() {
      isActive.value = true
    },
    stop,
  }
}