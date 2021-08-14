# @remocon/core

Remocon 的核心程序，提供主要主要核心类 RemoconServer。

## 使用说明

包默认导出 `RemoconServer` 类，该类包含初始化和启动服务的 `listen` 方法，上层服务主要通过该类下的 `emitter` 属性获取信息。

注：`emitter` 是 Node 原生的 `EventEmitter`。
