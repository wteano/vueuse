/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:07:49
 * @FilePath: \vueuse\packages\core\useGeolocation\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */

import type { ConfigurableNavigator } from '../_configurable'
import { tryOnScopeDispose } from '@vueuse/shared'
import { ref as deepRef, shallowRef } from 'vue'
import { defaultNavigator } from '../_configurable'
import { useSupported } from '../useSupported'

export interface UseGeolocationOptions extends Partial<PositionOptions>, ConfigurableNavigator {
  /**
   * 是否立即开始获取位置
   *
   * @default true
   */
  immediate?: boolean
}

/**
 * 响应式地理位置API
 *
 * @see https://vueuse.org/useGeolocation
 * @param options 配置选项
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  // 从选项中解构配置
  const {
    enableHighAccuracy = true,
    maximumAge = 30000,
    timeout = 27000,
    navigator = defaultNavigator,
    immediate = true,
  } = options

  // 检查是否支持地理位置API
  const isSupported = useSupported(() => navigator && 'geolocation' in navigator)

  // 位置获取时间戳
  const locatedAt = shallowRef<number | null>(null)
  // 错误信息
  const error = shallowRef<GeolocationPositionError | null>(null)
  // 坐标信息
  const coords = deepRef<Omit<GeolocationPosition['coords'], 'toJSON'>>({
    accuracy: 0,
    latitude: Number.POSITIVE_INFINITY,
    longitude: Number.POSITIVE_INFINITY,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  })

  // 更新位置信息
  function updatePosition(position: GeolocationPosition) {
    locatedAt.value = position.timestamp
    coords.value = position.coords
    error.value = null
  }

  // 位置监听器ID
  let watcher: number

  // 恢复/开始位置监听
  function resume() {
    if (isSupported.value) {
      watcher = navigator!.geolocation.watchPosition(
        updatePosition,
        err => error.value = err,
        {
          enableHighAccuracy,
          maximumAge,
          timeout,
        },
      )
    }
  }

  // 如果设置了立即获取，则开始监听
  if (immediate)
    resume()

  // 暂停位置监听
  function pause() {
    if (watcher && navigator)
      navigator.geolocation.clearWatch(watcher)
  }

  // 组件卸载时自动暂停监听
  tryOnScopeDispose(() => {
    pause()
  })

  return {
    isSupported,
    coords,
    locatedAt,
    error,
    resume,
    pause,
  }
}

export type UseGeolocationReturn = ReturnType<typeof useGeolocation>