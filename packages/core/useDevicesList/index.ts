/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:51:39
 * @FilePath: \vueuse\packages\core\useDevicesList\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */

import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { ConfigurableNavigator } from '../_configurable'
import { computed, ref as deepRef, shallowRef } from 'vue'
import { defaultNavigator } from '../_configurable'
import { useEventListener } from '../useEventListener'
import { usePermission } from '../usePermission'
import { useSupported } from '../useSupported'

export interface UseDevicesListOptions extends ConfigurableNavigator {
  onUpdated?: (devices: MediaDeviceInfo[]) => void
  /**
   * 如果未授予权限，则立即请求权限，
   * 否则标签和设备ID可能为空
   *
   * @default false
   */
  requestPermissions?: boolean
  /**
   * 请求媒体权限的类型
   *
   * @default { audio: true, video: true }
   */
  constraints?: MediaStreamConstraints
}

export interface UseDevicesListReturn {
  /**
   * 所有设备
   */
  devices: Ref<MediaDeviceInfo[]>
  videoInputs: ComputedRef<MediaDeviceInfo[]>
  audioInputs: ComputedRef<MediaDeviceInfo[]>
  audioOutputs: ComputedRef<MediaDeviceInfo[]>
  permissionGranted: ShallowRef<boolean>
  ensurePermissions: () => Promise<boolean>
  isSupported: ComputedRef<boolean>
}

/**
 * 响应式 `enumerateDevices` 列出可用的输入/输出设备
 *
 * @see https://vueuse.org/useDevicesList
 * @param options 配置选项
 */
export function useDevicesList(options: UseDevicesListOptions = {}): UseDevicesListReturn {
  const {
    navigator = defaultNavigator, // 导航器对象
    requestPermissions = false, // 是否请求权限
    constraints = { audio: true, video: true }, // 媒体约束
    onUpdated, // 更新回调
  } = options

  const devices = deepRef([]) as Ref<MediaDeviceInfo[]> // 设备列表
  const videoInputs = computed(() => devices.value.filter(i => i.kind === 'videoinput')) // 视频输入设备
  const audioInputs = computed(() => devices.value.filter(i => i.kind === 'audioinput')) // 音频输入设备
  const audioOutputs = computed(() => devices.value.filter(i => i.kind === 'audiooutput')) // 音频输出设备
  const isSupported = useSupported(() => navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) // 是否支持
  const permissionGranted = shallowRef(false) // 权限是否已授予
  let stream: MediaStream | null // 媒体流

  async function update() { // 更新设备列表
    if (!isSupported.value)
      return

    devices.value = await navigator!.mediaDevices.enumerateDevices()
    onUpdated?.(devices.value)
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      stream = null
    }
  }

  async function ensurePermissions() { // 确保权限已授予
    const deviceName = constraints.video ? 'camera' : 'microphone' // 设备名称

    if (!isSupported.value)
      return false

    if (permissionGranted.value)
      return true

    const { state, query } = usePermission(deviceName, { controls: true })
    await query()
    if (state.value !== 'granted') {
      let granted = true
      try {
        const allDevices = await navigator!.mediaDevices.enumerateDevices()
        const hasCamera = allDevices.some(device => device.kind === 'videoinput')
        const hasMicrophone = allDevices.some(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
        constraints.video = hasCamera ? constraints.video : false
        constraints.audio = hasMicrophone ? constraints.audio : false
        stream = await navigator!.mediaDevices.getUserMedia(constraints)
      }
      catch {
        stream = null
        granted = false
      }
      update()
      permissionGranted.value = granted
    }
    else {
      permissionGranted.value = true
    }

    return permissionGranted.value
  }

  if (isSupported.value) {
    if (requestPermissions)
      ensurePermissions()

    useEventListener(navigator!.mediaDevices, 'devicechange', update, { passive: true }) // 监听设备变化
    update()
  }

  return {
    devices,
    ensurePermissions,
    permissionGranted,
    videoInputs,
    audioInputs,
    audioOutputs,
    isSupported,
  }
}