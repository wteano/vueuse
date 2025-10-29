/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:41:53
 * @FilePath: \vueuse\packages\core\useCycleList\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRef, MaybeRefOrGetter, ShallowRef, WritableComputedRef } from 'vue'
import { toRef } from '@vueuse/shared'
import { computed, shallowRef, toValue, watch } from 'vue'

export interface UseCycleListOptions<T> {
  /**
   * 状态的初始值。
   * 可以提供一个ref来重用。
   */
  initialValue?: MaybeRef<T>

  /**
   * 当找不到当前值时的默认索引
   */
  fallbackIndex?: number

  /**
   * 获取当前值索引的自定义函数。
   */
  getIndexOf?: (value: T, list: T[]) => number
}

/**
 * 循环遍历项目列表
 *
 * @see https://vueuse.org/useCycleList
 */
export function useCycleList<T>(list: MaybeRefOrGetter<T[]>, options?: UseCycleListOptions<T>): UseCycleListReturn<T> {
  const state = shallowRef(getInitialValue()) as ShallowRef<T> // 当前状态的响应式引用
  const listRef = toRef(list) // 列表的响应式引用

  const index = computed<number>({ // 当前索引的计算属性
    get() {
      const targetList = listRef.value

      let index = options?.getIndexOf
        ? options.getIndexOf(state.value, targetList)
        : targetList.indexOf(state.value)

      if (index < 0)
        index = options?.fallbackIndex ?? 0

      return index
    },
    set(v) {
      set(v)
    },
  })

  function set(i: number) { // 设置指定索引的函数
    const targetList = listRef.value
    const length = targetList.length
    const index = (i % length + length) % length
    const value = targetList[index]
    state.value = value
    return value
  }

  function shift(delta = 1) { // 移动指定步数的函数
    return set(index.value + delta)
  }

  function next(n = 1) { // 向前移动n步的函数
    return shift(n)
  }

  function prev(n = 1) { // 向后移动n步的函数
    return shift(-n)
  }

  function getInitialValue() { // 获取初始值的函数
    return toValue(options?.initialValue ?? toValue<T[]>(list)[0]) ?? undefined
  }

  watch(listRef, () => set(index.value)) // 监听列表变化，更新当前状态

  return {
    state,
    index,
    next,
    prev,
    go: set,
  }
}

export interface UseCycleListReturn<T> { // useCycleList函数的返回类型
  state: ShallowRef<T>
  index: WritableComputedRef<number>
  next: (n?: number) => T
  prev: (n?: number) => T
  /**
   * 跳转到指定索引
   */
  go: (i: number) => T
}