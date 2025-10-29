/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:52:08
 * @FilePath: \vueuse\packages\core\useDisplayMedia\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRef } from 'vue'
import type { ConfigurableNavigator } from '../_configurable'
import { shallowRef, watch } from 'vue'
import { defaultNavigator } from '../_configurable'
import { useEventListener } from '../useEventListener'
import { useSupported } from '../useSupported'

export interface UseDisplayMediaOptions extends ConfigurableNavigator {
  /**
   * 是否启用流
   * @default false
   */
  enabled?: MaybeRef<boolean>

  /**
   * 流视频媒体约束
   */
  video?: boolean | MediaTrackConstraints | undefined
  /**
   * 流音频媒体约束
   */
  audio?: boolean | MediaTrackConstraints | undefined
}

/**
 * 响应式 `mediaDevices.getDisplayMedia` 流
 *
 * @see https://vueuse.org/useDisplayMedia
 * @param options 配置选项
 */
export function useDisplayMedia(options: UseDisplayMediaOptions = {}) {
  const enabled = shallowRef(options.enabled ?? false) // 是否启用
  const video = options.video // 视频约束
  const audio = options.audio // 音频约束
  const { navigator = defaultNavigator } = options // 导航器对象
  const isSupported = useSupported(() => navigator?.mediaDevices?.getDisplayMedia) // 是否支持

  const constraint: MediaStreamConstraints = { audio, video } // 媒体约束

  const stream = shallowRef<MediaStream | undefined>() // 媒体流

  async function _start() { // 内部启动函数
    if (!isSupported.value || stream.value)
      return
    stream.value = await navigator!.mediaDevices.getDisplayMedia(constraint)
    stream.value?.getTracks().forEach(t => useEventListener(t, 'ended', stop, { passive: true })) // 监听轨道结束事件
    return stream.value
  }

  async function _stop() { // 内部停止函数
    stream.value?.getTracks().forEach(t => t.stop())
    stream.value = undefined
  }

  function stop() { // 停止函数
    _stop()
    enabled.value = false
  }

  async function start() { // 启动函数
    await _start()
    if (stream.value)
      enabled.value = true
    return stream.value
  }

  watch( // 监听启用状态
    enabled,
    (v) => {
      if (v)
        _start()
      else
        _stop()
    },
    { immediate: true },
  )

  return {
    isSupported,
    stream,
    start,
    stop,
    enabled,
  }
}

export type UseDisplayMediaReturn = ReturnType<typeof useDisplayMedia> // useDisplayMedia函数的返回类型