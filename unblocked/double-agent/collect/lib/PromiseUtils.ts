export function createPromise<T = any>(
  timeoutMillis?: number,
  timeoutMessage?: string,
): IResolvablePromise<T> {
  const response: IResolvablePromise<T> = {
    isResolved: false,
  };
  // get parent stack
  const error = new Error(timeoutMessage || 'Timeout waiting for promise');

  response.promise = new Promise((resolve, reject) => {
    response.resolve = (...args) => {
      if (response.isResolved) return;
      response.isResolved = true;
      clearTimeout(response.timeout);
      resolve(...args);
    };
    response.reject = err => {
      if (response.isResolved) return;
      response.isResolved = true;
      clearTimeout(response.timeout);
      reject(err);
    };
    if (timeoutMillis !== undefined && timeoutMillis !== null) {
      response.timeout = setTimeout(() => response.reject(error), timeoutMillis).unref();
    }
  });
  // bind `then` and `catch` to implement the same interface as Promise
  (response as any).then = response.promise.then.bind(response.promise);
  (response as any).catch = response.promise.catch.bind(response.promise);
  return response;
}

export interface IResolvablePromise<T = any> {
  isResolved: boolean;
  promise?: Promise<T>;
  resolve?: (value?: T | PromiseLike<T>) => void;
  reject?: (reason?: any) => void;
  timeout?: NodeJS.Timeout;
}
