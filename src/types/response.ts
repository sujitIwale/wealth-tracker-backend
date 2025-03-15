export enum ResponseStatus {
    'SUCCESS' = 'SUCCESS',
    'FAILED' = 'FAILED',
}
  
export type GenericResponse = {
    status: ResponseStatus;
    data: any;
    message?: string;
};
  