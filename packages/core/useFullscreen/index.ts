import type { ConfigurableDocument } from '../_configurable'
import type { MaybeElementRef } from '../unrefElement'
import { tryOnMounted, tryOnScopeDispose } from '@vueuse/shared'
import { computed, shallowRef } from 'vue'
import { defaultDocument } from '../_configurable'
import { unrefElement } from '../unrefElement'
import { useEventListener } from '../useEventListener'
import { useSupported } from '../useSupported'

export interface UseFullscreenOptions extends ConfigurableDocument {
  /**
   * 组件卸载时自动退出全屏
   *
   * @default false
   */
  autoExit?: boolean
}

// 全屏变化事件列表
const eventHandlers = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'webkitendfullscreen',
  'mozfullscreenchange',
  'MSFullscreenChange',
] as any as 'fullscreenchange'[]

/**
 * 响应式全屏API
 *
 * @see https://vueuse.org/useFullscreen
 * @param target 目标元素
 * @param options 配置选项
 */
export function useFullscreen(
  target?: MaybeElementRef,
  options: UseFullscreenOptions = {},
) {
  // 从选项中解构配置
  const {
    document = defaultDocument,
    autoExit = false,
  } = options

  // 目标元素引用，默认为文档元素
  const targetRef = computed(() => unrefElement(target) ?? document?.documentElement)
  // 全屏状态引用
  const isFullscreen = shallowRef(false)

  // 计算请求全屏方法
  const requestMethod = computed<'requestFullscreen' | undefined>(() => {
    return [
      'requestFullscreen',
      'webkitRequestFullscreen',
      'webkitEnterFullscreen',
      'webkitEnterFullScreen',
      'webkitRequestFullScreen',
      'mozRequestFullScreen',
      'msRequestFullscreen',
    ].find(m => (document && m in document) || (targetRef.value && m in targetRef.value)) as 'requestFullscreen' | undefined
  })

  // 计算退出全屏方法
  const exitMethod = computed<'exitFullscreen' | undefined>(() => {
    return [
      'exitFullscreen',
      'webkitExitFullscreen',
      'webkitExitFullScreen',
      'webkitCancelFullScreen',
      'mozCancelFullScreen',
      'msExitFullscreen',
    ].find(m => (document && m in document) || (targetRef.value && m in targetRef.value)) as 'exitFullscreen' | undefined
  })

  // 计算全屏启用状态方法
  const fullscreenEnabled = computed<'fullscreenEnabled' | undefined>(() => {
    return [
      'fullScreen',
      'webkitIsFullScreen',
      'webkitDisplayingFullscreen',
      'mozFullScreen',
      'msFullscreenElement',
    ].find(m => (document && m in document) || (targetRef.value && m in targetRef.value)) as 'fullscreenEnabled' | undefined
  })

  // 获取全屏元素方法
  const fullscreenElementMethod = [
    'fullscreenElement',
    'webkitFullscreenElement',
    'mozFullScreenElement',
    'msFullscreenElement',
  ].find(m => (document && m in document)) as 'fullscreenElement' | undefined

  // 检查是否支持全屏API
  const isSupported = useSupported(() =>
    targetRef.value
    && document
    && requestMethod.value !== undefined
    && exitMethod.value !== undefined
    && fullscreenEnabled.value !== undefined)

  // 检查当前元素是否处于全屏状态
  const isCurrentElementFullScreen = (): boolean => {
    if (fullscreenElementMethod)
      return document?.[fullscreenElementMethod] === targetRef.value
    return false
  }

  // 检查是否有元素处于全屏状态
  const isElementFullScreen = (): boolean => {
    if (fullscreenEnabled.value) {
      if (document && document[fullscreenEnabled.value] != null) {
        return document[fullscreenEnabled.value]
      }
      else {
        const target = targetRef.value
        // @ts-expect-error - Fallback for WebKit and iOS Safari browsers
        if (target?.[fullscreenEnabled.value] != null) {
          // @ts-expect-error - Fallback for WebKit and iOS Safari browsers
          return Boolean(target[fullscreenEnabled.value])
        }
      }
    }
    return false
  }

  // 退出全屏
  async function exit() {
    if (!isSupported.value || !isFullscreen.value)
      return
    if (exitMethod.value) {
      if (document?.[exitMethod.value] != null) {
        await document[exitMethod.value]()
      }
      else {
        const target = targetRef.value
        // @ts-expect-error - Fallback for Safari iOS
        if (target?.[exitMethod.value] != null)
          // @ts-expect-error - Fallback for Safari iOS
          await target[exitMethod.value]()
      }
    }

    isFullscreen.value = false
  }

  // 进入全屏
  async function enter() {
    if (!isSupported.value || isFullscreen.value)
      return

    // 如果已经有元素处于全屏状态，先退出
    if (isElementFullScreen())
      await exit()

    const target = targetRef.value
    if (requestMethod.value && target?.[requestMethod.value] != null) {
      await target[requestMethod.value]()
      isFullscreen.value = true
    }
  }

  // 切换全屏状态
  async function toggle() {
    await (isFullscreen.value ? exit() : enter())
  }

  // 全屏变化事件处理回调
  const handlerCallback = () => {
    const isElementFullScreenValue = isElementFullScreen()
    if (!isElementFullScreenValue || (isElementFullScreenValue && isCurrentElementFullScreen()))
      isFullscreen.value = isElementFullScreenValue
  }

  // 监听器选项
  const listenerOptions = { capture: false, passive: true }
  // 监听文档上的全屏变化事件
  useEventListener(document, eventHandlers, handlerCallback, listenerOptions)
  // 监听目标元素上的全屏变化事件
  useEventListener(() => unrefElement(targetRef), eventHandlers, handlerCallback, listenerOptions)

  // 组件挂载时初始化状态
  tryOnMounted(handlerCallback, false)

  // 如果设置了自动退出，在组件卸载时退出全屏
  if (autoExit)
    tryOnScopeDispose(exit)

  return {
    isSupported,
    isFullscreen,
    enter,
    exit,
    toggle,
  }
}

export type UseFullscreenReturn = ReturnType<typeof useFullscreen>