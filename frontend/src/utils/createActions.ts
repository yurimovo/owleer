import { createAction } from "@reduxjs/toolkit";

export function CreateAsyncAction(type: string, args: any = {}): any {
  return {
    request: createAction(`${type}.REQUEST`, args),
    success: createAction(`${type}.SUCCESS`, args),
    error: createAction(`${type}.ERROR`, args),
  };
}
