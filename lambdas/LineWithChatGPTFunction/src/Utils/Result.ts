export class Result<T, E> {
    private value?: T;
    private error?: E;
  
    constructor(value?: T, error?: E) {
      if (value && error) {
        throw new Error('Cannot construct Result with both value and error');
      }
  
      this.value = value;
      this.error = error;
    }
  
    isOk(): boolean {
      return this.value !== undefined;
    }
  
    isError(): boolean {
      return this.error !== undefined;
    }
  
    getValue(): T {
      if (this.isOk()) {
        return this.value as T;
      }
      throw new Error('Cannot get value from error Result');
    }
  
    getError(): E {
      if (this.isError()) {
        return this.error as E;
      }
      throw new Error('Cannot get error from ok Result');
    }

    static ok<T>(value: T): Result<T, never> {
        return new Result<T, never>(value);
    }

    static fail<E>(error: E): Result<never, E> {
        return new Result<never, E>(undefined, error);
    }
  }
