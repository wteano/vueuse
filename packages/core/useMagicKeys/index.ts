/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:14:01
 * @FilePath: \vueuse\packages\core\useMagicKeys\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { noop } from '@vueuse/shared'
import { computed, reactive, shallowRef, toValue } from 'vue'
import { defaultWindow } from '../_configurable'
import { useEventListener } from '../useEventListener'
import { DefaultMagicKeysAliasMap } from './aliasMap'

export interface UseMagicKeysOptions<Reactive extends boolean> {
  /**
   * 返回响应式对象而不是ref对象
   *
   * @default false
   */
  reactive?: Reactive

  /**
   * 监听事件的目标
   *
   * @default window
   */
  target?: MaybeRefOrGetter<EventTarget>

  /**
   * 键的别名映射，所有键都应为小写
   * { 目标: 键码 }
   *
   * @example { ctrl: "control" }
   * @default <预定义映射>
   */
  aliasMap?: Record<string, string>

  /**
   * 注册被动监听器
   *
   * @default true
   */
  passive?: boolean

  /**
   * 键盘按下/释放事件的自定义事件处理器。
   * 当您想应用自定义逻辑时很有用。
   *
   * 使用`e.preventDefault()`时，需要向useMagicKeys()传递`passive: false`。
   */
  onEventFired?: (e: KeyboardEvent) => void | boolean
}

export interface MagicKeysInternal {
  /**
   * 当前按下的键的集合，
   * 存储原始键码。
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
   */
  current: Set<string>
}

export type UseMagicKeysReturn<Reactive extends boolean>
  = Readonly<
    Omit<Reactive extends true
      ? Record<string, boolean>
      : Record<string, ComputedRef<boolean>>, keyof MagicKeysInternal>
      & MagicKeysInternal
  >

/**
 * 响应式按键状态，支持魔法键组合。
 *
 * @see https://vueuse.org/useMagicKeys
 */
export function useMagicKeys(options?: UseMagicKeysOptions<false>): UseMagicKeysReturn<false>
export function useMagicKeys(options: UseMagicKeysOptions<true>): UseMagicKeysReturn<true>
export function useMagicKeys(options: UseMagicKeysOptions<boolean> = {}): UseMagicKeysReturn<boolean> {
  // 从选项中解构配置
  const {
    reactive: useReactive = false,
    target = defaultWindow,
    aliasMap = DefaultMagicKeysAliasMap,
    passive = true,
    onEventFired = noop,
  } = options
  
  // 当前按下的键集合
  const current = reactive(new Set<string>())
  
  // 基础对象，包含toJSON方法和current属性
  const obj = {
    toJSON() { return {} },
    current,
  }
  
  // 根据是否使用响应式创建refs对象
  const refs: Record<string, any> = useReactive ? reactive(obj) : obj
  
  // Meta键依赖集合
  const metaDeps = new Set<string>()
  
  // 修饰键映射
  const depsMap = new Map<string, Set<string>>([
    ['Meta', metaDeps],
    ['Shift', new Set<string>()],
    ['Alt', new Set<string>()],
  ])
  
  // 已使用的键集合
  const usedKeys = new Set<string>()

  // 设置refs值
  function setRefs(key: string, value: boolean) {
    if (key in refs) {
      if (useReactive)
        refs[key] = value
      else
        refs[key].value = value
    }
  }

  // 重置所有键状态
  function reset() {
    current.clear()
    for (const key of usedKeys)
      setRefs(key, false)
  }

  // 更新依赖关系
  function updateDeps(value: boolean, e: KeyboardEvent, keys: string[]) {
    if (!value || typeof e.getModifierState !== 'function')
      return
    for (const [modifier, depsSet] of depsMap) {
      if (e.getModifierState(modifier)) {
        keys.forEach(key => depsSet.add(key))
        break
      }
    }
  }

  // 清理依赖关系
  function clearDeps(value: boolean, key: string) {
    if (value)
      return
    const depsMapKey = `${key[0].toUpperCase()}${key.slice(1)}`
    const deps = depsMap.get(depsMapKey)
    if (!(['shift', 'alt'].includes(key)) || !deps)
      return

    const depsArray = Array.from(deps)
    const depsIndex = depsArray.indexOf(key)
    depsArray.forEach((key, index) => {
      if (index >= depsIndex) {
        current.delete(key)
        setRefs(key, false)
      }
    })
    deps.clear()
  }

  // 更新refs值
  function updateRefs(e: KeyboardEvent, value: boolean) {
    const key = e.key?.toLowerCase()
    const code = e.code?.toLowerCase()
    const values = [code, key].filter(Boolean)

    // 更新当前键集合
    if (key) {
      if (value)
        current.add(key)
      else
        current.delete(key)
    }

    // 更新所有相关键的状态
    for (const key of values) {
      usedKeys.add(key)
      setRefs(key, value)
    }

    // 更新依赖关系
    updateDeps(value, e, [...current, ...values])
    clearDeps(value, key)

    // #1312
    // 在macOS中，当Meta键释放时，键不会触发"keyup"事件
    // 我们手动跟踪它的组合并释放
    if (key === 'meta' && !value) {
      // Meta键释放
      metaDeps.forEach((key) => {
        current.delete(key)
        setRefs(key, false)
      })
      metaDeps.clear()
    }
  }

  // 监听键盘按下事件
  useEventListener(target, 'keydown', (e: KeyboardEvent) => {
    updateRefs(e, true)
    return onEventFired(e)
  }, { passive })
  
  // 监听键盘释放事件
  useEventListener(target, 'keyup', (e: KeyboardEvent) => {
    updateRefs(e, false)
    return onEventFired(e)
  }, { passive })

  // #1350
  // 监听失焦和聚焦事件，重置状态
  useEventListener('blur', reset, { passive })
  useEventListener('focus', reset, { passive })

  // 创建代理对象处理键组合
  const proxy = new Proxy(
    refs,
    {
      get(target, prop, rec) {
        if (typeof prop !== 'string')
          return Reflect.get(target, prop, rec)

        prop = prop.toLowerCase()
        // 处理别名
        if (prop in aliasMap)
          prop = aliasMap[prop]
        
        // 创建新的跟踪
        if (!(prop in refs)) {
          if (/[+_-]/.test(prop)) {
            // 处理组合键
            const keys = prop.split(/[+_-]/g).map(i => i.trim())
            refs[prop] = computed(() => keys.map(key => toValue(proxy[key])).every(Boolean))
          }
          else {
            // 单个键
            refs[prop] = shallowRef(false)
          }
        }
        const r = Reflect.get(target, prop, rec)
        return useReactive ? toValue(r) : r
      },
    },
  )

  return proxy as UseMagicKeysReturn<boolean>
}

export { DefaultMagicKeysAliasMap } from './aliasMap'