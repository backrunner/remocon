interface ResponseCreateOpts {
  ret?: number,
  message?: string,
}

interface SuccessResponseCreateOpts extends ResponseCreateOpts {
  data: unknown
}

class Response {
  static success(data?: unknown) {
    return new SuccessResponse({ data });
  }
  static error(message: string, ret?: number) {
    return new Response({
      message,
      ret: ret || 10000,
    });
  }
  ret: number;
  message: string;
  constructor({
    ret,
    message
  }: ResponseCreateOpts) {
    this.ret = ret || 0;
    this.message = message || '';
  }
}

class SuccessResponse extends Response {
  data: unknown;
  constructor({ data }: SuccessResponseCreateOpts) {
    super({
      ret: 0,
      message: '',
    });
    this.data = data;
  }
}

export default Response;
