---
category: 网络
---

# useFetch

响应式[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)提供了中止请求、在请求发送前拦截请求、当URL改变时自动重新获取请求以及使用预定义选项创建自己的`useFetch`的功能。

<CourseLink href="https://vueschool.io/lessons/vueuse-utilities-usefetch-and-reactify?friend=vueuse">通过Vue School的免费视频课程学习useFetch！</CourseLink>

::: tip
当与Nuxt 3一起使用时，此函数将**不会**被自动导入，而是使用Nuxt内置的[`useFetch()`](https://v3.nuxtjs.org/api/composables/use-fetch)。如果要使用VueUse中的此函数，请使用显式导入。
:::

## 用法

### 基本用法

只需提供一个URL即可使用`useFetch`函数。URL可以是字符串或`ref`。`data`对象将包含请求的结果，`error`对象将包含任何错误，`isFetching`对象将指示请求是否正在加载。

```ts
import { useFetch } from '@vueuse/core'

const { isFetching, error, data } = useFetch(url)
```

### 异步用法

`useFetch`也可以像普通fetch一样被await。注意，每当组件是异步的，使用它的任何组件都必须将该组件包装在`<Suspense>`标签中。您可以在[Vue 3官方文档](https://vuejs.org/guide/built-ins/suspense.html)中阅读更多关于suspense API的信息。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { isFetching, error, data } = await useFetch(url)
```

### URL变化时重新获取

对URL参数使用`ref`将允许`useFetch`函数在URL更改时自动触发另一个请求。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const url = ref('https://my-api.com/user/1')

const { data } = useFetch(url, { refetch: true })

url.value = 'https://my-api.com/user/2' // 将触发另一个请求
```

### 防止请求立即触发

将`immediate`选项设置为false将阻止请求立即触发，直到调用`execute`函数。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { execute } = useFetch(url, { immediate: false })

execute()
```

### 中止请求

可以使用`useFetch`函数中的`abort`函数来中止请求。`canAbort`属性指示是否可以中止请求。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { abort, canAbort } = useFetch(url)

setTimeout(() => {
  if (canAbort.value)
    abort()
}, 100)
```

也可以使用`timeout`属性自动中止请求。当达到给定的超时时间时，它将调用`abort`函数。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { data } = useFetch(url, { timeout: 100 })
```

### 拦截请求

`beforeFetch`选项可以在请求发送前拦截请求并修改请求选项和URL。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { data } = useFetch(url, {
  async beforeFetch({ url, options, cancel }) {
    const myToken = await getMyToken()

    if (!myToken)
      cancel()

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${myToken}`,
    }

    return {
      options,
    }
  },
})
```

`afterFetch`选项可以在更新响应数据前拦截响应数据。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { data } = useFetch(url, {
  afterFetch(ctx) {
    if (ctx.data.title === 'HxH')
      ctx.data.title = 'Hunter x Hunter' // 修改响应数据

    return ctx
  },
})
```

当`updateDataOnError`设置为`true`时，`onFetchError`选项可以在更新响应数据和错误前拦截它们。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { data } = useFetch(url, {
  updateDataOnError: true,
  onFetchError(ctx) {
    // 当5xx响应时ctx.data可以为null
    if (ctx.data === null)
      ctx.data = { title: 'Hunter x Hunter' } // 修改响应数据

    ctx.error = new Error('Custom Error') // 修改错误
    return ctx
  },
})

console.log(data.value) // { title: 'Hunter x Hunter' }
```

### 设置请求方法和返回类型

可以通过在`useFetch`末尾添加适当的方法来设置请求方法和返回类型。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
// 请求将使用GET方法发送，数据将被解析为JSON
const { data } = useFetch(url).get().json()

// 请求将使用POST方法发送，数据将被解析为文本
const { data } = useFetch(url).post().text()

// 或者使用选项设置方法

// 请求将使用GET方法发送，数据将被解析为blob
const { data } = useFetch(url, { method: 'GET' }, { refetch: true }).blob()
```

### 创建自定义实例

`createFetch`函数将返回一个带有提供给它的任何预配置选项的useFetch函数。这对于与整个应用程序中使用相同基础URL或需要Authorization头部的API交互非常有用。

```ts
import { createFetch } from '@vueuse/core'
// ---cut---
const useMyFetch = createFetch({
  baseUrl: 'https://my-api.com',
  options: {
    async beforeFetch({ options }) {
      const myToken = await getMyToken()
      options.headers.Authorization = `Bearer ${myToken}`

      return { options }
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})

const { isFetching, error, data } = useMyFetch('users')
```

如果要控制预配置实例和新创建实例之间的`beforeFetch`、`afterFetch`、`onFetchError`的行为，可以提供一个`combination`选项来在`overwrite`或`chaining`之间切换。

```ts
import { createFetch } from '@vueuse/core'
// ---cut---
const useMyFetch = createFetch({
  baseUrl: 'https://my-api.com',
  combination: 'overwrite',
  options: {
    // 预配置实例中的beforeFetch只在新创建的实例不传递beforeFetch时运行
    async beforeFetch({ options }) {
      const myToken = await getMyToken()
      options.headers.Authorization = `Bearer ${myToken}`

      return { options }
    },
  },
})

// 使用useMyFetch的beforeFetch
const { isFetching, error, data } = useMyFetch('users')

// 使用自定义的beforeFetch
const { isFetching, error, data } = useMyFetch('users', {
  async beforeFetch({ url, options, cancel }) {
    const myToken = await getMyToken()

    if (!myToken)
      cancel()

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${myToken}`,
    }

    return {
      options,
    }
  },
})
```

可以通过在`afterFetch`或`onFetchError`中调用`execute`方法来重新执行请求。这是一个刷新令牌的简单示例：

```ts
import { createFetch } from '@vueuse/core'
// ---cut---
let isRefreshing = false
const refreshSubscribers: Array<() => void> = []

const useMyFetch = createFetch({
  baseUrl: 'https://my-api.com',
  options: {
    async beforeFetch({ options }) {
      const myToken = await getMyToken()
      options.headers.Authorization = `Bearer ${myToken}`

      return { options }
    },
    afterFetch({ data, response, context, execute }) {
      if (needRefreshToken) {
        if (!isRefreshing) {
          isRefreshing = true
          refreshToken().then((newToken) => {
            if (newToken.value) {
              isRefreshing = false
              setMyToken(newToken.value)
              onRefreshed()
            }
            else {
              refreshSubscribers.length = 0
              // 处理刷新令牌错误
            }
          })
        }

        return new Promise((resolve) => {
          addRefreshSubscriber(() => {
            execute().then((response) => {
              resolve({ data, response })
            })
          })
        })
      }

      return { data, response }
    },
    // 或者使用带有updateDataOnError的onFetchError
    updateDataOnError: true,
    onFetchError({ error, data, response, context, execute }) {
      // 与afterFetch相同
      return { error, data }
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})

async function refreshToken() {
  const { data, execute } = useFetch<string>('refresh-token', {
    immediate: false,
  })

  await execute()
  return data
}

function onRefreshed() {
  refreshSubscribers.forEach(callback => callback())
  refreshSubscribers.length = 0
}

function addRefreshSubscriber(callback: () => void) {
  refreshSubscribers.push(callback)
}

const { isFetching, error, data } = useMyFetch('users')
```

### 事件

`onFetchResponse`和`onFetchError`将分别在fetch请求响应和错误时触发。

```ts
import { useFetch } from '@vueuse/core'
// ---cut---
const { onFetchResponse, onFetchError } = useFetch(url)

onFetchResponse((response) => {
  console.log(response.status)
})

onFetchError((error) => {
  console.error(error.message)
})
```