import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 精确处理数值的乘法运算。
 *
 * @param value - 要处理的值
 * @param power - 乘数
 * @returns 值与乘数相乘的结果
 */
function accurateMultiply(value: number, power: number): number {
  const valueStr = value.toString()

  if (value > 0 && valueStr.includes('.')) {
    // 获取小数位数
    const decimalPlaces = valueStr.split('.')[1].length
    const multiplier = 10 ** decimalPlaces

    // 通过整数运算避免浮点数精度问题
    return (value * multiplier * power) / multiplier
  }
  else {
    return value * power
  }
}

export interface UsePrecisionOptions {
  /**
   * 用于舍入的数学方法
   *
   * @default 'round'
   */
  math?: 'floor' | 'ceil' | 'round'
}

/**
 * 响应式地设置数字的精度。
 *
 * @see https://vueuse.org/usePrecision
 *
 * @__NO_SIDE_EFFECTS__
 */
export function usePrecision(
  value: MaybeRefOrGetter<number>,
  digits: MaybeRefOrGetter<number>,
  options?: MaybeRefOrGetter<UsePrecisionOptions>,
): ComputedRef<number> {
  return computed<number>(() => {
    // 获取响应式值
    const _value = toValue(value)
    const _digits = toValue(digits)
    // 计算精度对应的乘数
    const power = 10 ** _digits
    // 使用指定的舍入方法处理精度
    return Math[toValue(options)?.math || 'round'](accurateMultiply(_value, power)) / power
  })
}