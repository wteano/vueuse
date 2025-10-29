---
category: Sensors
---

# useGeolocation

响应式[地理位置API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)。它允许用户在愿意的情况下向Web应用程序提供他们的位置信息。出于隐私原因，系统会请求用户许可以报告位置信息。

## 用法

```ts
import { useGeolocation } from '@vueuse/core'

const { coords, locatedAt, error, resume, pause } = useGeolocation()
```

| 状态     | 类型                                                                          | 描述                                                              |
| --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| coords    | [`Coordinates`](https://developer.mozilla.org/en-US/docs/Web/API/Coordinates) | 检索到的位置信息，如纬度和经度 |
| locatedAt | `Date`                                                                        | 最后一次地理位置调用的时间                                    |
| error     | `string`                                                                      | 地理位置API失败时的错误消息。                          |
| resume    | `function`                                                                    | 恢复更新地理位置的控制函数                          |
| pause     | `function`                                                                    | 暂停更新地理位置的控制函数                           |

## 配置

`useGeolocation`函数接受[PositionOptions](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions)对象作为可选参数。

## 组件用法

```vue
<template>
  <UseGeolocation v-slot="{ coords: { latitude, longitude } }">
    纬度: {{ latitude }}
    经度: {{ longitude }}
  </UseGeolocation>
</template>
```