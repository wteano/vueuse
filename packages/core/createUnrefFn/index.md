<!--
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 14:03:47
 * @FilePath: \vueuse\packages\core\createUnrefFn\index.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
category: Utilities
related: reactify
---

# createUnrefFn
# 创建解引用函数

Make a plain function accepting ref and raw values as arguments.
Returns the same value the unconverted function returns, with proper typing.
将普通函数转换为可以接受ref和原始值作为参数的函数。
返回与未转换函数相同的值，具有适当的类型。

::: tip
Make sure you're using the right tool for the job. Using `reactify`
might be more pertinent in some cases where you want to evaluate the function on each changes of it's arguments.
确保您使用了正确的工具。在某些情况下，当您希望在参数每次更改时评估函数时，使用`reactify`可能更合适。
:::

## Usage
## 用法

```ts
import { createUnrefFn } from '@vueuse/core'
import { shallowRef } from 'vue'

const url = shallowRef('https://httpbin.org/post')
const data = shallowRef({ foo: 'bar' })

function post(url, data) {
  return fetch(url, { data })
}
const unrefPost = createUnrefFn(post)

post(url, data) /* ❌ Will throw an error because the arguments are refs */
post(url, data) /* ❌ 会抛出错误，因为参数是refs */
unrefPost(url, data) /* ✔️ Will Work because the arguments will be auto unref */
unrefPost(url, data) /* ✔️ 将会工作，因为参数会自动解引用 */
```

## Type Declarations
## 类型声明

```ts
/**
 * 将函数的参数转换为MaybeRef类型
 */
export type UnrefFn<T> = T extends (...args: infer A) => infer R
  ? (...args: { [K in keyof A]: MaybeRef<A[K]> }) => R
  : never

/**
 * 创建一个可以接受ref和原始值作为参数的函数
 * @param fn 要转换的函数
 * @returns 转换后的函数
 */
export function createUnrefFn<T extends Function>(fn: T): UnrefFn<T>
```

## Source
## 源码

```ts
/* This implementation is original ported from https://github.com/shorwood/pompaute by Stanley Horwood */

import type { MaybeRef } from 'vue'
import { toValue } from 'vue'

/**
 * 将函数的参数转换为MaybeRef类型
 */
export type UnrefFn<T> = T extends (...args: infer A) => infer R
  ? (...args: { [K in keyof A]: MaybeRef<A[K]> }) => R
  : never

/**
 * 将普通函数转换为可以接受ref和原始值作为参数的函数。
 * 返回与未转换函数相同的值，具有适当的类型。
 * 
 * Make a plain function accepting ref and raw values as arguments.
 * Returns the same value the unconverted function returns, with proper typing.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function createUnrefFn<T extends Function>(fn: T): UnrefFn<T> {
  return function (this: any, ...args: any[]) {
    return fn.apply(this, args.map(i => toValue(i)))
  } as UnrefFn<T>
}
```