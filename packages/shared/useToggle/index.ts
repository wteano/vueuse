import type { MaybeRef, MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import { isRef, shallowRef, toValue } from 'vue'

export type ToggleFn = (value?: boolean) => void

export type UseToggleReturn = [ShallowRef<boolean>, ToggleFn] | ToggleFn

export interface UseToggleOptions<Truthy, Falsy> {
  truthyValue?: MaybeRefOrGetter<Truthy>
  falsyValue?: MaybeRefOrGetter<Falsy>
}

export function useToggle<Truthy, Falsy, T = Truthy | Falsy>(initialValue: Ref<T>, options?: UseToggleOptions<Truthy, Falsy>): (value?: T) => T
export function useToggle<Truthy = true, Falsy = false, T = Truthy | Falsy>(initialValue?: T, options?: UseToggleOptions<Truthy, Falsy>): [ShallowRef<T>, (value?: T) => T]

/**
 * 带有切换功能的布尔值引用
 *
 * @see https://vueuse.org/useToggle
 * @param [initialValue] 初始值
 * @param options 配置选项
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useToggle(
  initialValue: MaybeRef<boolean> = false,
  options: UseToggleOptions<true, false> = {},
): UseToggleReturn {
  const {
    truthyValue = true,
    falsyValue = false,
  } = options

  const valueIsRef = isRef(initialValue)
  const _value = shallowRef(initialValue) as ShallowRef<boolean>

  function toggle(value?: boolean) {
    // 有参数时
    if (arguments.length) {
      _value.value = value!
      return _value.value
    }
    else {
      const truthy = toValue(truthyValue)
      _value.value = _value.value === truthy
        ? toValue(falsyValue)
        : truthy
      return _value.value
    }
  }

  if (valueIsRef)
    return toggle
  else
    return [_value, toggle] as const
}