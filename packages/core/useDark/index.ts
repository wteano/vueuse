import type { BasicColorSchema, UseColorModeOptions } from '../useColorMode'
import { computed } from 'vue'
import { useColorMode } from '../useColorMode'

/**
 * useDark函数的配置选项
 */
export interface UseDarkOptions extends Omit<UseColorModeOptions<BasicColorSchema>, 'modes' | 'onChanged'> {
  /**
   * 当isDark=true时应用到目标元素的值
   *
   * @default 'dark'
   */
  valueDark?: string

  /**
   * 当isDark=false时应用到目标元素的值
   *
   * @default ''
   */
  valueLight?: string

  /**
   * 处理更新的自定义处理程序。
   * 当指定时，将覆盖默认行为。
   *
   * @default undefined
   */
  onChanged?: (isDark: boolean, defaultHandler: ((mode: BasicColorSchema) => void), mode: BasicColorSchema) => void
}

/**
 * 具有自动数据持久化的响应式暗黑模式。
 *
 * @see https://vueuse.org/useDark
 * @param options 配置选项
 * @returns 返回一个布尔值的响应式引用，表示是否为暗黑模式
 */
export function useDark(options: UseDarkOptions = {}) {
  const {
    valueDark = 'dark',
    valueLight = '',
  } = options

  const mode = useColorMode({
    ...options,
    onChanged: (mode, defaultHandler) => {
      if (options.onChanged)
        options.onChanged?.(mode === 'dark', defaultHandler, mode)
      else
        defaultHandler(mode)
    },
    modes: {
      dark: valueDark,
      light: valueLight,
    },
  })

  /** 系统颜色模式 */
  const system = computed(() => mode.system.value)

  /** 是否为暗黑模式的响应式引用 */
  const isDark = computed<boolean>({
    get() {
      return mode.value === 'dark'
    },
    set(v) {
      const modeVal = v ? 'dark' : 'light'
      if (system.value === modeVal)
        mode.value = 'auto'
      else
        mode.value = modeVal
    },
  })

  return isDark
}

/** useDark函数的返回类型 */
export type UseDarkReturn = ReturnType<typeof useDark>