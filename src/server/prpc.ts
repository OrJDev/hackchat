import { CustomResponse } from "@solidjs/router";

export const sendError = (error: string): CustomResponse<never> => {
  return { error } as any;
};
