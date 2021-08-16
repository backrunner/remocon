# @remocon/client

## 使用方式

### Step.1 安装

```bash
npm install @remocon/client -S
```

### Step.2 引入到你的项目

```js
import Remocon from '@remocon/client';

const remocon = new Remocon({
  project: {
    name: 'PROJECT_NAME',
    version: 'PROJECT_VERSION',
  },
  host: 'localhost:8600',
  https: false,
  overwriteConsole: false,  // 启用后会介入所有console方法
});
```

## 许可证

MIT
