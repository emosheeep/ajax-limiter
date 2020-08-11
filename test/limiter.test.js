const limiter = require('../src/limiter')
const { random, times } = require('lodash')

// 生成固定数量的Promise函数数组，用来模拟真实的并发请求
function getPromises(n){
  return times(n, index => () => Promise.resolve(index))
}

describe('常规情况（并发数量limit: 10）', () => {
  it('50个请求按顺序拿到结果', () => {
    const arr = getPromises(50)
    return limiter(arr, {
      success (data, index) {
        expect(data).toBe(index)
      }
    }).then(data => {
      expect(data.length).toBe(50)
      data.forEach((item, index) => {
        expect(item).toBe(index)
      });
    })
  })
  it('自定义返回值', () => {
    const arr = getPromises(50)
    const result = [] // 暂时保存返回值，便于验证
    return limiter(arr, {
      success (data, index) {
        result[index] = data
        return `${data}-${index}`
      }
    }).then(data => {
      expect(data.length).toBe(50)
      data.forEach((item, index) => {
        expect(item).toBe(`${result[index]}-${index}`)
      })
    })
  })
})

describe('错误情况，混入失败的请求', () => {
  it('失败时退出（exitWhenError: true）', () => {
    const arr = getPromises(50)
    arr[10] = () => Promise.reject('error')
    return limiter(arr, {
      exitWhenError: true,
      error (e, index) {
        expect(e).toBe('error')
        expect(index).toBe(10)
      }
    }).catch(e => {
      expect(e).toBe('error')
    })
  })
  it('失败时不退出（exitWhenError: false）', () => {
    const arr = getPromises(50)
    // 随机替换10个错误，每隔五个替换一个
    const indexes = times(10, i => random(i * 5, i * 5 + 4))
    indexes.forEach(index => {
      arr[index] = () => Promise.reject(new Error(index))
    })
    return limiter(arr, {
      error(e, index) {
        expect(e.message).toBe(index.toString())
      }
    }).then(data => {
      expect(data.length).toBe(50)
      indexes.forEach(index => {
        // 验证指定位置被替换的Error是否按顺序排列在结果中
        expect(data[index] instanceof Error).toBeTruthy()
        expect(data[index].message == index).toBeTruthy()
      })
    })
  })
  it('自定义返回值', () => {
    const arr = getPromises(50)
    // 随机替换10个错误，每隔五个替换一个
    const indexes = times(10, i => random(i * 5, i * 5 + 4))
    indexes.forEach(index => {
      arr[index] = () => Promise.reject(new Error(index))
    })
    const result = [] // 暂时保存返回值，便于验证
    return limiter(arr, {
      error (e, index) {
        expect(e instanceof Error).toBeTruthy()
        result[index] = e
        return e.message
      }
    }).then(data => {
      expect(data.length).toBe(50)
      result.forEach((item, index) => {
        expect(item.message).toBe(data[index])
      })
    })
  })
})

describe('参数错误，数组内数据不满足条件', () => {
  it('非函数', () => {
    const arr = [1, 1, 3]
    return limiter(arr).then(data => {
      expect(data.length).toBe(3)
      data.forEach(item => {
        expect(item instanceof Error).toBeTruthy()
      })
    })
  })
  it('返回不是Promise，直接resolve', () => {
    const arr = [() => 1, () => new Error()]
    return limiter(arr).then(data => {
      expect(data.length).toBe(2)
      expect(data[0]).toBe(1)
      expect(data[1] instanceof Error).toBeTruthy()
    })
  })
})