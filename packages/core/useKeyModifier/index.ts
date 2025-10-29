/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:12:20
 * @FilePath: \vueuse\packages\core\useKeyModifier\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ShallowRef } from 'vue'
import type { ConfigurableDocument } from '../_configurable'
import type { WindowEventName } from '../useEventListener'
import { shallowRef } from 'vue'
import { defaultDocument } from '../_configurable'
import { useEventListener } from '../useEventListener'

export type KeyModifier = 'Alt' | 'AltGraph' | 'CapsLock' | 'Control' | 'Fn' | 'FnLock' | 'Meta' | 'NumLock' | 'ScrollLock' | 'Shift' | 'Symbol' | 'SymbolLock'

// 默认监听的事件列表
const defaultEvents: WindowEventName[] = ['mousedown', 'mouseup', 'keydown', 'keyup']

export interface UseModifierOptions<Initial> extends ConfigurableDocument {
  /**
   * 将提示更新修饰符状态的事件名称
   *
   * @default ['mousedown', 'mouseup', 'keydown', 'keyup']
   */
  events?: WindowEventName[]

  /**
   * 返回ref的初始值
   *
   * @default null
   */
  initial?: Initial
}

export type UseKeyModifierReturn<Initial> = ShallowRef<Initial extends boolean ? boolean : boolean | null>

/* @__NO_SIDE_EFFECTS__ */
export function useKeyModifier<Initial extends boolean | null>(modifier: KeyModifier, options: UseModifierOptions<Initial> = {}): UseKeyModifierReturn<Initial> {
  // 从选项中解构配置
  const {
    events = defaultEvents,
    document = defaultDocument,
    initial = null,
  } = options

  // 修饰符状态
  const state = shallowRef(initial) as ShallowRef<boolean>

  // 如果存在document对象，则添加事件监听
  if (document) {
    events.forEach((listenerEvent) => {
      useEventListener(document, listenerEvent, (evt: KeyboardEvent | MouseEvent) => {
        // 检查事件对象是否有getModifierState方法
        if (typeof evt.getModifierState === 'function')
          state.value = evt.getModifierState(modifier)
      }, { passive: true })
    })
  }

  return state
}