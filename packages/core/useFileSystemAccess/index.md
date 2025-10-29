---
category: Browser
---

# useFileSystemAccess

使用[FileSystemAccessAPI](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)创建和读写本地文件

## 用法

```ts
import { useFileSystemAccess } from '@vueuse/core'

const {
  isSupported,
  data,
  file,
  fileName,
  fileMIME,
  fileSize,
  fileLastModified,
  create,
  open,
  save,
  saveAs,
  updateData
} = useFileSystemAccess()
```