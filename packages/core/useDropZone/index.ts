/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:53:50
 * @FilePath: \vueuse\packages\core\useDropZone\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import { isClient } from '@vueuse/shared'
// eslint-disable-next-line no-restricted-imports
import { shallowRef, unref } from 'vue'

import { useEventListener } from '../useEventListener'

export interface UseDropZoneReturn {
  files: ShallowRef<File[] | null> // 文件列表
  isOverDropZone: ShallowRef<boolean> // 是否在放置区域上方
}

export interface UseDropZoneOptions {
  /**
   * 允许的数据类型，如果未设置，则允许所有数据类型。
   * 也可以是一个函数来检查数据类型。
   */
  dataTypes?: MaybeRef<readonly string[]> | ((types: readonly string[]) => boolean)
  onDrop?: (files: File[] | null, event: DragEvent) => void // 放置时的回调
  onEnter?: (files: File[] | null, event: DragEvent) => void // 进入时的回调
  onLeave?: (files: File[] | null, event: DragEvent) => void // 离开时的回调
  onOver?: (files: File[] | null, event: DragEvent) => void // 悬停时的回调
  /**
   * 允许放置多个文件。默认为 true。
   */
  multiple?: boolean
  /**
   * 为未处理的事件阻止默认行为。默认为 false。
   */
  preventDefaultForUnhandled?: boolean
}

/**
 * 创建拖放区域
 *
 * @param target
 * @param options
 */
export function useDropZone(
  target: MaybeRefOrGetter<HTMLElement | Document | null | undefined>,
  options: UseDropZoneOptions | UseDropZoneOptions['onDrop'] = {},
): UseDropZoneReturn {
  const isOverDropZone = shallowRef(false) // 是否在放置区域上方
  const files = shallowRef<File[] | null>(null) // 文件列表
  let counter = 0 // 计数器
  let isValid = true // 是否有效

  if (isClient) {
    const _options = typeof options === 'function' ? { onDrop: options } : options
    const multiple = _options.multiple ?? true // 是否允许多个文件
    const preventDefaultForUnhandled = _options.preventDefaultForUnhandled ?? false // 是否为未处理的事件阻止默认行为

    const getFiles = (event: DragEvent) => { // 获取文件
      const list = Array.from(event.dataTransfer?.files ?? [])
      return list.length === 0 ? null : (multiple ? list : [list[0]])
    }

    const checkDataTypes = (types: string[]) => { // 检查数据类型
      const dataTypes = unref(_options.dataTypes)

      if (typeof dataTypes === 'function')
        return dataTypes(types)

      if (!dataTypes?.length)
        return true

      if (types.length === 0)
        return false

      return types.every(type =>
        dataTypes.some(allowedType => type.includes(allowedType)),
      )
    }

    const checkValidity = (items: DataTransferItemList) => { // 检查有效性
      const types = Array.from(items ?? []).map(item => item.type)

      const dataTypesValid = checkDataTypes(types)
      const multipleFilesValid = multiple || items.length <= 1

      return dataTypesValid && multipleFilesValid
    }

    const isSafari = () => ( // 是否为Safari浏览器
      /^(?:(?!chrome|android).)*safari/i.test(navigator.userAgent)
      && !('chrome' in window)
    )

    const handleDragEvent = (event: DragEvent, eventType: 'enter' | 'over' | 'leave' | 'drop') => { // 处理拖动事件
      const dataTransferItemList = event.dataTransfer?.items
      isValid = (dataTransferItemList && checkValidity(dataTransferItemList)) ?? false

      if (preventDefaultForUnhandled) {
        event.preventDefault()
      }

      if (!isSafari() && !isValid) {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = 'none'
        }
        return
      }

      event.preventDefault()
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy'
      }

      const currentFiles = getFiles(event) // 当前文件

      switch (eventType) {
        case 'enter':
          counter += 1
          isOverDropZone.value = true
          _options.onEnter?.(null, event)
          break
        case 'over':
          _options.onOver?.(null, event)
          break
        case 'leave':
          counter -= 1
          if (counter === 0)
            isOverDropZone.value = false
          _options.onLeave?.(null, event)
          break
        case 'drop':
          counter = 0
          isOverDropZone.value = false
          if (isValid) {
            files.value = currentFiles
            _options.onDrop?.(currentFiles, event)
          }
          break
      }
    }

    useEventListener<DragEvent>(target, 'dragenter', event => handleDragEvent(event, 'enter')) // 监听拖动进入
    useEventListener<DragEvent>(target, 'dragover', event => handleDragEvent(event, 'over')) // 监听拖动悬停
    useEventListener<DragEvent>(target, 'dragleave', event => handleDragEvent(event, 'leave')) // 监听拖动离开
    useEventListener<DragEvent>(target, 'drop', event => handleDragEvent(event, 'drop')) // 监听放置
  }

  return {
    files,
    isOverDropZone,
  }
}