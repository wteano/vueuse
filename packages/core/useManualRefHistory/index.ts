import type { ComputedRef, Ref } from 'vue'
import type { CloneFn } from '../useCloned'
import { timestamp } from '@vueuse/shared'
import { computed, ref as deepRef, markRaw } from 'vue'
import { cloneFnJSON } from '../useCloned'

export interface UseRefHistoryRecord<T> {
  snapshot: T
  timestamp: number
}

export interface UseManualRefHistoryOptions<Raw, Serialized = Raw> {
  /**
   * 要保留的最大历史记录数。默认为无限制。
   */
  capacity?: number
  /**
   * 在拍摄快照时克隆，是dump的快捷方式：JSON.parse(JSON.stringify(value))。
   * 默认为false
   *
   * @default false
   */
  clone?: boolean | CloneFn<Raw>
  /**
   * 将数据序列化到历史记录中
   */
  dump?: (v: Raw) => Serialized
  /**
   * 从历史记录中反序列化数据
   */
  parse?: (v: Serialized) => Raw

  /**
   * 设置数据源
   */
  setSource?: (source: Ref<Raw>, v: Raw) => void
}

export interface UseManualRefHistoryReturn<Raw, Serialized> {
  /**
   * 来自参数的绕过跟踪的ref
   */
  source: Ref<Raw>

  /**
   * 用于撤销的历史记录数组，最新的在前
   */
  history: Ref<UseRefHistoryRecord<Serialized>[]>

  /**
   * 最后的历史点，如果暂停，source可能不同
   */
  last: Ref<UseRefHistoryRecord<Serialized>>

  /**
   * 与{@link UseManualRefHistoryReturn.history | history}相同
   */
  undoStack: Ref<UseRefHistoryRecord<Serialized>[]>

  /**
   * 用于重做的记录数组
   */
  redoStack: Ref<UseRefHistoryRecord<Serialized>[]>

  /**
   * 表示是否可以撤销的ref（非空undoStack）
   */
  canUndo: ComputedRef<boolean>

  /**
   * 表示是否可以重做的ref（非空redoStack）
   */
  canRedo: ComputedRef<boolean>

  /**
   * 撤销更改
   */
  undo: () => void

  /**
   * 重做更改
   */
  redo: () => void

  /**
   * 清除所有历史记录
   */
  clear: () => void

  /**
   * 创建新的历史记录
   */
  commit: () => void

  /**
   * 使用最新历史记录重置ref的值
   */
  reset: () => void
}

// 绕过函数，直接返回值
function fnBypass<F, T>(v: F) {
  return v as unknown as T
}

// 设置源值
function fnSetSource<F>(source: Ref<F>, value: F) {
  return source.value = value
}

type FnCloneOrBypass<F, T> = (v: F) => T

// 默认的dump函数，根据clone选项决定是否克隆
function defaultDump<R, S>(clone?: boolean | CloneFn<R>) {
  return (clone
    ? typeof clone === 'function'
      ? clone
      : cloneFnJSON
    : fnBypass
  ) as unknown as FnCloneOrBypass<R, S>
}

// 默认的parse函数，根据clone选项决定是否克隆
function defaultParse<R, S>(clone?: boolean | CloneFn<R>) {
  return (clone
    ? typeof clone === 'function'
      ? clone
      : cloneFnJSON
    : fnBypass
  ) as unknown as FnCloneOrBypass<S, R>
}

/**
 * 跟踪ref的更改历史，同时提供撤销和重做功能。
 *
 * @see https://vueuse.org/useManualRefHistory
 * @param source
 * @param options
 */
export function useManualRefHistory<Raw, Serialized = Raw>(
  source: Ref<Raw>,
  options: UseManualRefHistoryOptions<Raw, Serialized> = {},
): UseManualRefHistoryReturn<Raw, Serialized> {
  // 从选项中解构配置
  const {
    clone = false,
    dump = defaultDump<Raw, Serialized>(clone),
    parse = defaultParse<Raw, Serialized>(clone),
    setSource = fnSetSource,
  } = options

  // 创建历史记录
  function _createHistoryRecord(): UseRefHistoryRecord<Serialized> {
    return markRaw({
      snapshot: dump(source.value),
      timestamp: timestamp(),
    })
  }

  // 最后的历史记录
  const last: Ref<UseRefHistoryRecord<Serialized>> = deepRef(_createHistoryRecord()) as Ref<UseRefHistoryRecord<Serialized>>

  // 撤销栈
  const undoStack: Ref<UseRefHistoryRecord<Serialized>[]> = deepRef([])
  // 重做栈
  const redoStack: Ref<UseRefHistoryRecord<Serialized>[]> = deepRef([])

  // 设置源值
  const _setSource = (record: UseRefHistoryRecord<Serialized>) => {
    setSource(source, parse(record.snapshot))
    last.value = record
  }

  // 提交当前状态到历史记录
  const commit = () => {
    undoStack.value.unshift(last.value)
    last.value = _createHistoryRecord()

    // 如果设置了容量限制，超出部分删除
    if (options.capacity && undoStack.value.length > options.capacity)
      undoStack.value.splice(options.capacity, Number.POSITIVE_INFINITY)
    
    // 清空重做栈
    if (redoStack.value.length)
      redoStack.value.splice(0, redoStack.value.length)
  }

  // 清除所有历史记录
  const clear = () => {
    undoStack.value.splice(0, undoStack.value.length)
    redoStack.value.splice(0, redoStack.value.length)
  }

  // 撤销操作
  const undo = () => {
    const state = undoStack.value.shift()

    if (state) {
      redoStack.value.unshift(last.value)
      _setSource(state)
    }
  }

  // 重做操作
  const redo = () => {
    const state = redoStack.value.shift()

    if (state) {
      undoStack.value.unshift(last.value)
      _setSource(state)
    }
  }

  // 重置到最后的状态
  const reset = () => {
    _setSource(last.value)
  }

  // 历史记录，包含最后的状态和撤销栈
  const history = computed(() => [last.value, ...undoStack.value])

  // 是否可以撤销
  const canUndo = computed(() => undoStack.value.length > 0)
  // 是否可以重做
  const canRedo = computed(() => redoStack.value.length > 0)

  return {
    source,
    undoStack,
    redoStack,
    last,
    history,
    canUndo,
    canRedo,

    clear,
    commit,
    reset,
    undo,
    redo,
  }
}