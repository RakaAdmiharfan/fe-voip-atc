import axios, { AxiosResponse } from "axios";

const url = "16.78.90.15"

// Fungsi utama untuk request API
const request = async (
  method: "get" | "post" | "put" | "patch" | "delete",
  api: string,
  data?: any,
  token?: string,
  isFormData: boolean = false
): Promise<AxiosResponse<any>> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return await axios({
      method,
      url: `${url}${api}`,
      data,
      headers,
    });
  } catch (error: any) {
    console.error(`API Error (${method.toUpperCase()} ${api}):`, error);
    throw error?.response || error;
  }
};

// Fungsi API yang bisa dipakai di project
export const post = (api: string, json: any) => request("post", api, json);
export const put = (api: string, json: any) => request("put", api, json);
export const get = (apiParams: string) => request("get", apiParams);
export const deleteWithAuthJson = (api: string, token: string) =>
  request("delete", api, undefined, token);
export const postWithAuth = (api: string, form: any, token: string) =>
  request("post", api, form, token, true);
export const postWithAuthJson = (api: string, json: any, token: string) =>
  request("post", api, json, token);
export const getWithAuth = (token: string, apiParams: string) =>
  request("get", apiParams, undefined, token);
export const patchWithAuthJson = (api: string, json: any, token: string) =>
  request("patch", api, json, token);
export const putWithAuthJson = (api: string, json: any, token: string) =>
  request("put", api, json, token);
