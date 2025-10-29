---
category: 网络
---

# useEventSource

[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)或[服务器发送事件](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)实例打开一个到HTTP服务器的持久连接，该服务器以text/event-stream格式发送事件。

## 用法

```ts
import { useEventSource } from '@vueuse/core'

const { status, data, error, close } = useEventSource('https://event-source-url')
```

更多选项请参阅[类型声明](#type-declarations)。

### 命名事件

您可以使用第二个参数定义命名事件

```ts
import { useEventSource } from '@vueuse/core'
// ---cut---
const { event, data } = useEventSource(
  'https://event-source-url',
  ['notice', 'update']
)
```

### immediate

默认启用。

在调用组合式函数时立即建立连接。

### autoConnect

默认启用。

如果url作为ref提供，当url更改时，它将自动重新连接到新url。

### 错误时自动重连

在错误时自动重新连接（默认禁用）。

```ts
import { useEventSource } from '@vueuse/core'
// ---cut---
const { status, data, close } = useEventSource(
  'https://event-source-url',
  [],
  {
    autoReconnect: true,
  }
)
```

或者对其行为进行更多控制：

```ts
import { useEventSource } from '@vueuse/core'
// ---cut---
const { status, data, close } = useEventSource(
  'https://event-source-url',
  [],
  {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        alert('重试3次后无法连接EventSource')
      },
    },
  }
)
```

### 数据序列化

使用序列化函数对传入的数据应用自定义转换。

```ts
import { useEventSource } from '@vueuse/core'
// ---cut---
const { data } = useEventSource(
  'https://event-source-url',
  [],
  {
    serializer: {
      read: rawData => JSON.parse(rawData),
    },
  }
)

// 如果服务器发送：'{"name":"John","age":30}'
// data.value将是：{ name: 'John', age: 30 }
```