# ajax-limiter

控制并发请求的最大数量。

有别于`Promise.all`，limiter中请求发送的形式类似于滑动窗口，可以在一个请求成功或失败后，立即对结果进行处理。这可以保证请求在规定的并发限制内（默认为10个）尽快完成，且无需等到请求完成就能对已经完成的请求做处理。

适用于，**当你想要尽快完成所有请求，又想控制并发数量的时候**。如浏览器中，你有500个请求需要发送，假设因为某些原因，同时发起的请求不能超过十个，否则服务器，或浏览器就会遇到错误，就很适合这种场景。

`Node`环境同样适用。

# Installation

```
npm i --save ajax-limiter
```

# Usage

```js
const limiter = require('ajax-limiter')
const axios = require('axios') // 发送请求

const requests = [] // 返回promise的函数的数组
for (let i = 0; i < 100; i ++) {
  requests.push(() => axios.get('http://localhost:8080'))
}

limiter(requests, {
  limit: 10, // 并发数量
  exitWhenError: false, 
  success (res, index) {},
  error (e, index) {}
}).then(data => {
  console.log(data) // 按顺序排列的结果
}).catch(e => {
  console.error(e) // 只有 exitWhenError: true 时才可能会执行到这里
})
```

# Configuration

类型声明如下:

```ts
type FuncArrWithPromise = Array<() => Promise<any>>

interface Config {
  limit?: number;
  exitWhenError?: boolean;
  success?: (data: any, index: number) => any;
  error?: (e: Error, index: number) => any;
}

function limiter(arr: FuncArrWithPromise, config?: Config): Promise<any>
```

## arr （required）

数组成员为函数，每个函数都返回一个Promise对象，如果返回值不是Promise对象，默认将被resolve

## config (optional)

| 字段 | 类型 | 默认值 | 说明 |
|-----|-------|:------:|-----|
| limit | Number | 10 | 最大并发数量，也就是滑动窗口的最大值 |
| exitWhenError | Boolean | false | 请求失败时退出，类似于`Promise.all`，默认不会退出 |
| success | Function, 参数(res, index) | 无 | 单个请求**成功**时的回调函数，返回值(如果有的话)将存入最终的结果数组 |
| error | Function, 参数(err, index) | 无 | 单个请求**失败**时的回调函数，返回值(如果有的话)将存入最终的结果数组 |

# Addtional Notes

测试覆盖率 100%，具体参见`src/test`目录和`package.json`