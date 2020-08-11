/**
 * 控制并发请求的最大数量
 * @param {Array<function>} arr 一个返回Promise的函数的数组
 * @param config 其他配置
*/
function limiter(arr, config = {}) {
  const { limit = 10, exitWhenError = false, success, error } = config
  const { length: total } = arr;
  const result = []; // 保存结果
  let progress = 0; // 控制进度，表示当前位置
  let complete = 0; // 记录完成总数
  let exit = false; // 出错时退出

  return new Promise((resolve, reject) => {
    // 先连续调用n次，代表最大并发数量
    while (progress < limit) {
      next();
    }

    async function next() {
      const cur = progress++; // 记录当前索引index
      if (cur >= total || exit) return;

      try {
        const fn = arr[cur]
        const res = await Promise.resolve(fn());
        result[cur] = success && success(res, cur) || res; // 按顺序存起来
        if (complete + 1 < total) {
          next(); // 调用自身
        }
      } catch (e) {
        result[cur] = error && error(e, cur) || e;
        if (exitWhenError) {
          exit = true; // 未完成的请求不再继续发送
          reject(e);
        } else {
          next();
        }
      } finally {
        if (++complete >= total) {
          resolve(result)
        }
      }
    }
  });
}

module.exports = limiter
