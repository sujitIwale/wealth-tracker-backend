import { ResponseStatus } from '../types/response';

export class GenericResponse {
  status = ResponseStatus.SUCCESS;
  data = null;
  message = '';

  setStatus(status: ResponseStatus) {
    this.status = status;
  }

  setData(data: any) {
    this.data = data;
  }

  setMessage(message: string) {
    this.message = message;
  }
}
