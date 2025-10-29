import type { MaybeRef } from '@vueuse/shared'
import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'

export interface UseCounterOptions {
  min?: number
  max?: number
}

/**
 * 响应式计数器
 * Reactive counter.
 *
 * @see https://vueuse.org/useCounter
 * @param [initialValue=0] - 初始值
 * @param options - 配置选项
 */
export function useCounter(initialValue = 0, options: UseCounterOptions = {}) {
  let _initialValue = initialValue
  const {
    min = -Infinity,
    max = Infinity,
  } = options

  // 如果初始值超出范围，则调整到范围内
  // if initial value is out of range, adjust it to the range
  if (initialValue < min) _initialValue = min
  if (initialValue > max) _initialValue = max

  const count = ref(_initialValue) as Ref<number>

  const {
    inc: _inc,
    dec: _dec,
    get,
    set: _set,
    reset: _reset,
  } = createCounterFunctions({
    count,
    min,
    max,
  })

  function inc(delta = 1, opts?: UseCounterOptions) {
    const { min: localMin = min, max: localMax = max } = opts ?? {}
    _inc(delta, localMin, localMax)
  }

  function dec(delta = 1, opts?: UseCounterOptions) {
    const { min: localMin = min, max: localMax = max } = opts ?? {}
    _dec(delta, localMin, localMax)
  }

  function set(value: MaybeRef<number>, opts?: UseCounterOptions) {
    const { min: localMin = min, max: localMax = max } = opts ?? {}
    _set(value, localMin, localMax)
  }

  function reset(value?: MaybeRef<number>, opts?: UseCounterOptions) {
    const { min: localMin = min, max: localMax = max } = opts ?? {}
    _reset(value, localMin, localMax)
  }

  return {
    count,
    inc,
    dec,
    set,
    reset,
  }
}

interface CounterFunctions {
  inc: (delta: number, min: number, max: number) => void
  dec: (delta: number, min: number, max: number) => void
  get: () => number
  set: (value: MaybeRef<number>, min: number, max: number) => void
  reset: (value: MaybeRef<number> | undefined, min: number, max: number) => void
}

function createCounterFunctions({
  count,
  min,
  max,
}: {
  count: Ref<number>
  min: number
  max: number
}): CounterFunctions {
  function inc(delta = 1, localMin = min, localMax = max) {
    count.value = Math.min(localMax, count.value + delta)
  }

  function dec(delta = 1, localMin = min, localMax = max) {
    count.value = Math.max(localMin, count.value - delta)
  }

  function get() {
    return count.value
  }

  function set(value: MaybeRef<number>, localMin = min, localMax = max) {
    const unrefValue = typeof value === 'function' ? value() : value
    count.value = Math.min(localMax, Math.max(localMin, unrefValue))
  }

  function reset(value: MaybeRef<number> | undefined, localMin = min, localMax = max) {
    const unrefValue = typeof value === 'function' ? value() : value
    count.value = Math.min(localMax, Math.max(localMin, unrefValue ?? 0))
  }

  return {
    inc,
    dec,
    get,
    set,
    reset,
  }
}

export interface UseCounterReturn {
  count: Ref<number>
  inc: (delta?: number, options?: UseCounterOptions) => void
  dec: (delta?: number, options?: UseCounterOptions) => void
  get: () => number
  set: (value: MaybeRef<number>, options?: UseCounterOptions) => void
  reset: (value?: MaybeRef<number>, options?: UseCounterOptions) => void
}