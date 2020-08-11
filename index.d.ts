export type FuncArrWithPromise = Array<() => Promise<any>>

export interface Config {
  limit?: number;
  exitWhenError?: boolean;
  success?: (data: any, index: number) => any;
  error?: (e: Error, index: number) => any;
}

export default function(arr: FuncArrWithPromise, config?: Config): Promise<any>