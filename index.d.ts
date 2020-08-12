export type FuncArrWithPromise = Array<() => Promise<any>>

export interface Config {
  limit?: number;
  exitWhenError?: boolean;
  success?: (data: any, index: number) => any;
  error?: (e: Error, index: number) => any;
}

export default function limiter(arr: FuncArrWithPromise, config?: Config): Promise<any>

// 兼容 commonjs 模块规范
declare module 'ajax-limiter' {
  export = limiter
}