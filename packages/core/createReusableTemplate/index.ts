import type { ComponentObjectPropsOptions, DefineComponent, Slot } from 'vue'
import { camelize, makeDestructurable } from '@vueuse/shared'
import { defineComponent, shallowRef } from 'vue'

/**
 * 具有潜在对象字面量的对象字面量类型
 */
type ObjectLiteralWithPotentialObjectLiterals = Record<string, Record<string, any> | undefined>

/**
 * 从插槽映射生成插槽类型
 */
type GenerateSlotsFromSlotMap<T extends ObjectLiteralWithPotentialObjectLiterals> = {
  [K in keyof T]: Slot<T[K]>
}

/**
 * 定义模板组件类型
 */
export type DefineTemplateComponent<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends ObjectLiteralWithPotentialObjectLiterals,
> = DefineComponent & {
  new(): { $slots: { default: (_: Bindings & { $slots: GenerateSlotsFromSlotMap<MapSlotNameToSlotProps> }) => any } }
}

/**
 * 重用模板组件类型
 */
export type ReuseTemplateComponent<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends ObjectLiteralWithPotentialObjectLiterals,
> = DefineComponent<Bindings> & {
  new(): { $slots: GenerateSlotsFromSlotMap<MapSlotNameToSlotProps> }
}

/**
 * 可重用模板对类型
 */
export type ReusableTemplatePair<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends ObjectLiteralWithPotentialObjectLiterals,
> = [
  DefineTemplateComponent<Bindings, MapSlotNameToSlotProps>,
  ReuseTemplateComponent<Bindings, MapSlotNameToSlotProps>,
] & {
  define: DefineTemplateComponent<Bindings, MapSlotNameToSlotProps>
  reuse: ReuseTemplateComponent<Bindings, MapSlotNameToSlotProps>
}

/**
 * 创建可重用模板选项
 */
export interface CreateReusableTemplateOptions<Props extends Record<string, any>> {
  /**
   * 是否从重用组件继承属性
   *
   * @default true
   */
  inheritAttrs?: boolean
  /**
   * 重用组件的属性定义
   */
  props?: ComponentObjectPropsOptions<Props>
}

/**
 * 此函数成对创建`define`和`reuse`组件，
 * 它还允许传递泛型以进行类型绑定。
 *
 * @see https://vueuse.org/createReusableTemplate
 *
 * @__NO_SIDE_EFFECTS__
 */
export function createReusableTemplate<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends ObjectLiteralWithPotentialObjectLiterals = Record<'default', undefined>,
>(
  options: CreateReusableTemplateOptions<Bindings> = {},
): ReusableTemplatePair<Bindings, MapSlotNameToSlotProps> {
  const {
    inheritAttrs = true,
  } = options

  const render = shallowRef<Slot | undefined>()

  const define = defineComponent({
    setup(_, { slots }) {
      return () => {
        render.value = slots.default
      }
    },
  }) as unknown as DefineTemplateComponent<Bindings, MapSlotNameToSlotProps>

  const reuse = defineComponent({
    inheritAttrs,
    props: options.props,
    setup(props, { attrs, slots }) {
      return () => {
        if (!render.value && process.env.NODE_ENV !== 'production')
          throw new Error('[VueUse] Failed to find the definition of reusable template')
        const vnode = render.value?.({
          ...(options.props == null
            ? keysToCamelKebabCase(attrs)
            : props),
          $slots: slots,
        })

        return (inheritAttrs && vnode?.length === 1) ? vnode[0] : vnode
      }
    },
  }) as unknown as ReuseTemplateComponent<Bindings, MapSlotNameToSlotProps>

  return makeDestructurable(
    { define, reuse },
    [define, reuse],
  ) as ReusableTemplatePair<Bindings, MapSlotNameToSlotProps>
}

/**
 * 将对象的键转换为驼峰命名或短横线命名
 */
function keysToCamelKebabCase(obj: Record<string, any>) {
  const newObj: typeof obj = {}
  for (const key in obj)
    newObj[camelize(key)] = obj[key]
  return newObj
}