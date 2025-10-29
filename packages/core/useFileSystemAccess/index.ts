import type { Awaitable } from '@vueuse/shared'
import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import { computed, shallowRef, toValue, watch } from 'vue'
import { defaultWindow } from '../_configurable'
import { useSupported } from '../useSupported'

/**
 * window.showOpenFilePicker 参数
 * @see https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker#parameters
 */
export interface FileSystemAccessShowOpenFileOptions {
  multiple?: boolean
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
  excludeAcceptAllOption?: boolean
}

/**
 * window.showSaveFilePicker 参数
 * @see https://developer.mozilla.org/en-US/docs/Web/API/window/showSaveFilePicker#parameters
 */
export interface FileSystemAccessShowSaveFileOptions {
  suggestedName?: string
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
  excludeAcceptAllOption?: boolean
}

/**
 * 文件句柄
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
 */
export interface FileSystemFileHandle {
  getFile: () => Promise<File>
  createWritable: () => FileSystemWritableFileStream
}

/**
 * 文件系统可写文件流
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream
 */
interface FileSystemWritableFileStream extends WritableStream {
  /**
   * 写入数据
   * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
   */
  write: FileSystemWritableFileStreamWrite
  /**
   * 移动到指定位置
   * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/seek
   */
  seek: (position: number) => Promise<void>
  /**
   * 截断文件到指定大小
   * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/truncate
   */
  truncate: (size: number) => Promise<void>
}

/**
 * 文件流写入方法
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
 */
interface FileSystemWritableFileStreamWrite {
  (data: string | BufferSource | Blob): Promise<void>
  (options: { type: 'write', position: number, data: string | BufferSource | Blob }): Promise<void>
  (options: { type: 'seek', position: number }): Promise<void>
  (options: { type: 'truncate', size: number }): Promise<void>
}

/**
 * 文件系统访问窗口接口
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
 */
export type FileSystemAccessWindow = Window & {
  showSaveFilePicker: (options: FileSystemAccessShowSaveFileOptions) => Promise<FileSystemFileHandle>
  showOpenFilePicker: (options: FileSystemAccessShowOpenFileOptions) => Promise<FileSystemFileHandle[]>
}

export type UseFileSystemAccessCommonOptions = Pick<FileSystemAccessShowOpenFileOptions, 'types' | 'excludeAcceptAllOption'>
export type UseFileSystemAccessShowSaveFileOptions = Pick<FileSystemAccessShowSaveFileOptions, 'suggestedName'>

export type UseFileSystemAccessOptions = ConfigurableWindow & UseFileSystemAccessCommonOptions & {
  /**
   * 文件数据类型
   */
  dataType?: MaybeRefOrGetter<'Text' | 'ArrayBuffer' | 'Blob'>
}

/**
 * 创建和读写本地文件
 * @see https://vueuse.org/useFileSystemAccess
 */
export function useFileSystemAccess(): UseFileSystemAccessReturn<string | ArrayBuffer | Blob>
export function useFileSystemAccess(options: UseFileSystemAccessOptions & { dataType: 'Text' }): UseFileSystemAccessReturn<string>
export function useFileSystemAccess(options: UseFileSystemAccessOptions & { dataType: 'ArrayBuffer' }): UseFileSystemAccessReturn<ArrayBuffer>
export function useFileSystemAccess(options: UseFileSystemAccessOptions & { dataType: 'Blob' }): UseFileSystemAccessReturn<Blob>
export function useFileSystemAccess(options: UseFileSystemAccessOptions): UseFileSystemAccessReturn<string | ArrayBuffer | Blob>
export function useFileSystemAccess(options: UseFileSystemAccessOptions = {}): UseFileSystemAccessReturn<string | ArrayBuffer | Blob> {
  // 从选项中解构配置
  const {
    window: _window = defaultWindow,
    dataType = 'Text',
  } = options

  const window = _window as FileSystemAccessWindow
  // 检查浏览器是否支持文件系统访问API
  const isSupported = useSupported(() => window && 'showSaveFilePicker' in window && 'showOpenFilePicker' in window)

  // 文件句柄引用
  const fileHandle = shallowRef<FileSystemFileHandle>()
  // 文件数据引用
  const data = shallowRef<string | ArrayBuffer | Blob>()

  // 文件对象引用
  const file = shallowRef<File>()
  // 文件名计算属性
  const fileName = computed(() => file.value?.name ?? '')
  // 文件MIME类型计算属性
  const fileMIME = computed(() => file.value?.type ?? '')
  // 文件大小计算属性
  const fileSize = computed(() => file.value?.size ?? 0)
  // 文件最后修改时间计算属性
  const fileLastModified = computed(() => file.value?.lastModified ?? 0)

  /**
   * 打开文件
   * @param _options 打开文件选项
   */
  async function open(_options: UseFileSystemAccessCommonOptions = {}) {
    if (!isSupported.value)
      return
    // 显示文件选择对话框
    const [handle] = await window.showOpenFilePicker({ ...toValue(options), ..._options })
    fileHandle.value = handle
    // 更新文件数据
    await updateData()
  }

  /**
   * 创建新文件
   * @param _options 创建文件选项
   */
  async function create(_options: UseFileSystemAccessShowSaveFileOptions = {}) {
    if (!isSupported.value)
      return
    // 显示保存文件对话框
    fileHandle.value = await (window as FileSystemAccessWindow).showSaveFilePicker({ ...options, ..._options })
    data.value = undefined
    // 更新文件数据
    await updateData()
  }

  /**
   * 保存文件
   * @param _options 保存文件选项
   */
  async function save(_options: UseFileSystemAccessShowSaveFileOptions = {}) {
    if (!isSupported.value)
      return

    if (!fileHandle.value)
    // 如果没有文件句柄，则另存为
      return saveAs(_options)

    if (data.value) {
      // 创建可写流
      const writableStream = await fileHandle.value.createWritable()
      // 写入数据
      await writableStream.write(data.value)
      // 关闭流
      await writableStream.close()
    }
    // 更新文件信息
    await updateFile()
  }

  /**
   * 另存为
   * @param _options 另存为选项
   */
  async function saveAs(_options: UseFileSystemAccessShowSaveFileOptions = {}) {
    if (!isSupported.value)
      return

    // 显示保存文件对话框
    fileHandle.value = await (window as FileSystemAccessWindow).showSaveFilePicker({ ...options, ..._options })

    if (data.value) {
      // 创建可写流
      const writableStream = await fileHandle.value.createWritable()
      // 写入数据
      await writableStream.write(data.value)
      // 关闭流
      await writableStream.close()
    }

    // 更新文件信息
    await updateFile()
  }

  /**
   * 更新文件信息
   */
  async function updateFile() {
    file.value = await fileHandle.value?.getFile()
  }

  /**
   * 更新文件数据
   */
  async function updateData() {
    // 先更新文件信息
    await updateFile()
    const type = toValue(dataType)
    // 根据数据类型读取文件内容
    if (type === 'Text')
      data.value = await file.value?.text()
    else if (type === 'ArrayBuffer')
      data.value = await file.value?.arrayBuffer()
    else if (type === 'Blob')
      data.value = file.value
  }

  // 监听数据类型变化，更新文件数据
  watch(() => toValue(dataType), updateData)

  return {
    isSupported,
    data,
    file,
    fileName,
    fileMIME,
    fileSize,
    fileLastModified,
    open,
    create,
    save,
    saveAs,
    updateData,
  }
}

/**
 * useFileSystemAccess返回类型
 */
export interface UseFileSystemAccessReturn<T = string> {
  /**
   * 是否支持文件系统访问API
   */
  isSupported: ComputedRef<boolean>
  /**
   * 文件数据
   */
  data: ShallowRef<T | undefined>
  /**
   * 文件对象
   */
  file: ShallowRef<File | undefined>
  /**
   * 文件名
   */
  fileName: ComputedRef<string>
  /**
   * 文件MIME类型
   */
  fileMIME: ComputedRef<string>
  /**
   * 文件大小
   */
  fileSize: ComputedRef<number>
  /**
   * 文件最后修改时间
   */
  fileLastModified: ComputedRef<number>
  /**
   * 打开文件
   */
  open: (_options?: UseFileSystemAccessCommonOptions) => Awaitable<void>
  /**
   * 创建文件
   */
  create: (_options?: UseFileSystemAccessShowSaveFileOptions) => Awaitable<void>
  /**
   * 保存文件
   */
  save: (_options?: UseFileSystemAccessShowSaveFileOptions) => Awaitable<void>
  /**
   * 另存为
   */
  saveAs: (_options?: UseFileSystemAccessShowSaveFileOptions) => Awaitable<void>
  /**
   * 更新文件数据
   */
  updateData: () => Awaitable<void>
}