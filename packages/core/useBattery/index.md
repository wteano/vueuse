---
category: Sensors
---

# useBattery
# 电池状态

Reactive [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API), more often referred to as the Battery API, provides information about the system's battery charge level and lets you be notified by events that are sent when the battery level or charging status change. This can be used to adjust your app's resource usage to reduce battery drain when the battery is low, or to save changes before the battery runs out in order to prevent data loss.
响应式[电池状态API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)，通常称为电池API，提供有关系统电池充电级别的信息，并在电池电量或充电状态更改时通过发送事件通知您。这可以用来调整应用程序的资源使用，以在电池电量低时减少电池消耗，或者在电池耗尽前保存更改以防止数据丢失。

## Usage
## 用法

```ts
import { useBattery } from '@vueuse/core'

const { charging, chargingTime, dischargingTime, level } = useBattery()
```

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| charging        | `Boolean` | 如果设备当前正在充电 / If the device is currently charging.      |
| chargingTime    | `Number`  | 设备完全充电所需的秒数 / The number of seconds until the device becomes fully charged.     |
| dischargingTime | `Number`  | 设备完全放电前的秒数 / The number of seconds before the device becomes fully discharged. |
| level           | `Number`  | 表示当前充电级别的0到1之间的数字 / A number between 0 and 1 representing the current charge level.   |

## Use-cases
## 使用场景

Our applications normally are not empathetic to battery level, we can make a few adjustments to our applications that will be more friendly to low battery users.
我们的应用程序通常对电池电量不够敏感，我们可以对应用程序进行一些调整，使其对低电量用户更加友好。

- Trigger a special "dark-mode" battery saver theme settings.
  触发特殊的"暗色模式"电池节省主题设置。
- Stop auto playing videos in news feeds.
  停止在新闻信息流中自动播放视频。
- Disable some background workers that are not critical.
  禁用一些非关键的后台工作进程。
- Limit network calls and reduce CPU/Memory consumption.
  限制网络调用并减少CPU/内存消耗。

## Component Usage
## 组件用法

```vue
<template>
  <UseBattery v-slot="{ charging }">
    Is Charging: {{ charging }}
  </UseBattery>
</template>
```