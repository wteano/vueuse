---
category: Component
outline: deep
---

# createReusableTemplate
# 创建可重用模板

Define and reuse template inside the component scope.
在组件作用域内定义和重用模板。

## Motivation
## 动机

It's common to have the need to reuse some part of the template. For example:
重用模板的某些部分是很常见的需求。例如：

```vue
<template>
  <dialog v-if="showInDialog">
    <!-- something complex -->
    <!-- 复杂的内容 -->
  </dialog>
  <div v-else>
    <!-- something complex -->
    <!-- 复杂的内容 -->
  </div>
</template>
```

We'd like to reuse our code as much as possible. So normally we might need to extract those duplicated parts into a component. However, in a separated component you lose the ability to access the local bindings. Defining props and emits for them can be tedious sometimes.
我们希望尽可能重用代码。通常，我们可能需要将这些重复的部分提取到一个组件中。但是，在分离的组件中，您将失去访问本地绑定的能力。为它们定义props和emits有时可能很繁琐。

So this function is made to provide a way for defining and reusing templates inside the component scope.
因此，这个函数提供了一种在组件作用域内定义和重用模板的方法。

## Usage
## 用法

In the previous example, we could refactor it to:
在上面的例子中，我们可以将其重构为：

```vue
<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
</script>

<template>
  <DefineTemplate>
    <!-- something complex -->
    <!-- 复杂的内容 -->
  </DefineTemplate>

  <dialog v-if="showInDialog">
    <ReuseTemplate />
  </dialog>
  <div v-else>
    <ReuseTemplate />
  </div>
</template>
```

- `<DefineTemplate>` will register the template and renders nothing.
- `<DefineTemplate>` 会注册模板但不渲染任何内容。

- `<ReuseTemplate>` will render the template provided by `<DefineTemplate>`.
- `<ReuseTemplate>` 将渲染由 `<DefineTemplate>` 提供的模板。

- `<DefineTemplate>` must be used before `<ReuseTemplate>`.
- `<DefineTemplate>` 必须在 `<ReuseTemplate>` 之前使用。

> **Note**: It's recommended to extract as separate components whenever possible. Abusing this function might lead to bad practices for your codebase.
> **注意**：建议尽可能提取为单独的组件。滥用此函数可能导致代码库的不良实践。

### Options API
### 选项式API

When using with [Options API](https://vuejs.org/guide/introduction.html#api-styles), you will need to define `createReusableTemplate` outside of the component setup and pass to the `components` option in order to use them in the template.
当使用[选项式API](https://vuejs.org/guide/introduction.html#api-styles)时，您需要在组件设置之外定义`createReusableTemplate`，并将其传递给`components`选项，以便在模板中使用它们。

```vue
<script>
import { createReusableTemplate } from '@vueuse/core'
import { defineComponent } from 'vue'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

export default defineComponent({
  components: {
    DefineTemplate,
    ReuseTemplate,
  },
  setup() {
    // ...
  },
})
</script>

<template>
  <DefineTemplate v-slot="{ data, msg, anything }">
    <div>{{ data }} passed from usage</div>
    <div>{{ data }} 从用法传递</div>
  </DefineTemplate>

  <ReuseTemplate :data="data" msg="The first usage" />
</template>
```

### Passing Data
### 传递数据

You can also pass data to the template using slots:
您还可以使用插槽将数据传递给模板：

- Use `v-slot="..."` to access the data on `<DefineTemplate>`
- 使用 `v-slot="..."` 访问 `<DefineTemplate>` 上的数据

- Directly bind the data on `<ReuseTemplate>` to pass them to the template
- 直接在 `<ReuseTemplate>` 上绑定数据以将它们传递给模板

```vue
<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
</script>

<template>
  <DefineTemplate v-slot="{ data, msg, anything }">
    <div>{{ data }} passed from usage</div>
    <div>{{ data }} 从用法传递</div>
  </DefineTemplate>

  <ReuseTemplate :data="data" msg="The first usage" />
  <ReuseTemplate :data="anotherData" msg="The second usage" />
  <ReuseTemplate v-bind="{ data: something, msg: 'The third' }" />
</template>
```

### TypeScript Support
### TypeScript支持

`createReusableTemplate` accepts a generic type to provide type support for the data passed to the template:
`createReusableTemplate` 接受泛型类型，为传递给模板的数据提供类型支持：

```vue
<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'

// Comes with pair of `DefineTemplate` and `ReuseTemplate`
// 附带 `DefineTemplate` 和 `ReuseTemplate` 对
const [DefineFoo, ReuseFoo] = createReusableTemplate<{ msg: string }>()

// You can create multiple reusable templates
// 您可以创建多个可重用模板
const [DefineBar, ReuseBar] = createReusableTemplate<{ items: string[] }>()
</script>

<template>
  <DefineFoo v-slot="{ msg }">
    <!-- `msg` is typed as `string` -->
    <!-- `msg` 被类型化为 `string` -->
    <div>Hello {{ msg.toUpperCase() }}</div>
  </DefineFoo>

  <ReuseFoo msg="World" />

  <!-- @ts-expect-error Type Error! -->
  <!-- @ts-expect-error 类型错误！ -->
  <ReuseFoo :msg="1" />
</template>
```

Optionally, if you are not a fan of array destructuring, the following usages are also legal:
或者，如果您不喜欢数组解构，以下用法也是合法的：

```vue
<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'

const { define: DefineFoo, reuse: ReuseFoo } = createReusableTemplate<{
  msg: string
}>()
</script>

<template>
  <DefineFoo v-slot="{ msg }">
    <div>Hello {{ msg.toUpperCase() }}</div>
  </DefineFoo>

  <ReuseFoo msg="World" />
</template>
```

```vue
<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'

const TemplateFoo = createReusableTemplate<{ msg: string }>()
</script>

<template>
  <TemplateFoo.define v-slot="{ msg }">
    <div>Hello {{ msg.toUpperCase() }}</div>
  </TemplateFoo.define>

  <TemplateFoo.reuse msg="World" />
</template>
```

::: warning
Passing boolean props without `v-bind` is not supported. See the [Caveats](#boolean-props) section for more details.
不支持不使用 `v-bind` 传递布尔属性。有关详细信息，请参阅[注意事项](#boolean-props)部分。
:::

### Props and Attributes
### 属性和特性

By default, all props and attributes passed to `<ReuseTemplate>` will be passed to the template. If you don't want certain props to be passed to the DOM, you need to define the runtime props:
默认情况下，传递给 `<ReuseTemplate>` 的所有props和属性都将传递给模板。如果您不希望某些props传递给DOM，您需要定义运行时props：

```ts
import { createReusableTemplate } from '@vueuse/core'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate({
  props: {
    msg: String,
    enable: Boolean,
  }
})
```

If you don't want to pass any props to the template, you can pass the `inheritAttrs` option:
如果您不想将任何props传递给模板，可以传递 `inheritAttrs` 选项：

```ts
const [DefineTemplate, ReuseTemplate] = createReusableTemplate({
  inheritAttrs: false
})
```

## Type Declarations
## 类型声明

```ts
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
 */
export function createReusableTemplate<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends ObjectLiteralWithPotentialObjectLiterals = Record<'default', undefined>,
>(
  options: CreateReusableTemplateOptions<Bindings> = {},
): ReusableTemplatePair<Bindings, MapSlotNameToSlotProps>
```

## Source
## 源码

```ts
import type { ComponentObjectPropsOptions, DefineComponent, Slot } from 'vue'
import { camelize, makeDestructurable } from '@vueuse/shared'
import { defineComponent, shallowRef } from 'vue'

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
```