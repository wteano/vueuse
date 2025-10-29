# 贡献

感谢您对本项目贡献的兴趣！

> **警告**：**⚠️ 减缓新功能的添加**
>
> 随着VueUse用户群的持续增长，我们收到了大量的功能请求和拉取请求。结果，维护项目变得越来越具有挑战性，已经超出了我们的能力范围。因此，在不久的将来，我们可能需要减缓接受新功能的速度，优先考虑现有功能的稳定性和质量。**请注意，目前可能不会接受VueUse的新功能。**如果您有任何新想法，我们建议您首先将它们集成到自己的代码库中，根据您的需求进行迭代，并评估它们的通用性。如果您坚信您的想法对社区有益，您可以提交一个附带用例的拉取请求，我们很乐意审查和讨论。感谢您的理解。

## 开发

### 设置

将此仓库克隆到您的本地机器并安装依赖项。

```bash
pnpm install
```

我们使用VitePress进行快速开发和文档编写。您可以通过以下方式在本地启动它：

```bash
pnpm dev
```

### 测试

```bash
pnpm test:unit # 运行单元测试
```

如果您想使用实验性的浏览器测试，首先需要安装playwright依赖项。

```bash
nlx playwright install --with-deps
```

然后运行

```bash
pnpm test:browser
```

## 贡献

### 现有功能

随时可以增强现有功能。请尽量不要引入破坏性更改。

### 新功能

添加新功能有一些注意事项：

- 在开始工作之前，最好先打开一个问题进行讨论。
- 实现应该放在`packages/core`下的一个文件夹中，并在`index.ts`中暴露
- 在`core`包中，尽量不要引入第三方依赖，因为这个包的目标是尽可能轻量。
- 如果您想引入第三方依赖，请贡献给[@vueuse/integrations](https://github.com/vueuse/vueuse/tree/main/packages/integrations)或创建一个新的附加组件。
- 您可以在`packages/core/_template/`下找到功能模板，详细信息在[功能文件夹](#功能文件夹)部分解释。
- 在为您的功能编写文档时，`<!--FOOTER_STARTS-->`和`<!--FOOTER_ENDS-->`将在构建时自动更新，所以您不需要更新它们。

> 请注意，您不需要更新包的`index.ts`。它们是自动生成的。

### 新附加组件

非常欢迎新的附加组件！

- 在`packages/`下创建一个新文件夹，以您的附加组件名称命名。
- 在`scripts/packages.ts`中添加附加组件详细信息。
- 在该文件夹下创建`README.md`。
- 像对核心包一样添加功能。
- 提交并作为PR提交。

## 项目结构

### 单一仓库

我们使用单一仓库管理多个包

```
packages
  shared/         - 跨包共享工具
  core/           - 核心包
  firebase/       - Firebase附加组件
  [...addons]/    - 命名的附加组件
```

### 功能文件夹

一个功能文件夹通常包含这4个文件：

> 您可以在`packages/core/_template/`下找到模板

```bash
index.ts            # 功能源代码本身
demo.vue            # 文档演示
index.test.ts       # vitest单元测试
index.md            # 文档
```

对于`index.ts`，您应该使用名称导出功能。

```ts
// 正确做法
export { useMyFunction }

// 错误做法
export default useMyFunction
```

对于`index.md`，第一句话将作为功能列表中的简短介绍显示，所以尽量保持简短清晰。

```markdown
# useMyFunction

这将是介绍。详细描述...
```

阅读更多关于[指南](https://vueuse.org/guidelines)的信息。

## 代码风格

不用担心代码风格，只要您安装了开发依赖项。Git钩子将在提交时为您格式化和修复它们。

## 致谢

再次感谢您对本项目感兴趣！您太棒了！