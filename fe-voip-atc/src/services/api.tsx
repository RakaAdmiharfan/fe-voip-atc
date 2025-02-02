import axios, { AxiosResponse } from "axios";

const url = process.env.NEXT_PUBLIC_API_URL;

export const post = async (
  api: string,
  json: any
): Promise<AxiosResponse<any, any>> => {
  return await axios.post(url + api, json, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const put = async (
  api: string,
  json: any
): Promise<AxiosResponse<any, any>> => {
  return await axios.put(url + api, json, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const postWithAuth = async (
  api: string,
  form: any,
  token: string
): Promise<AxiosResponse<any, any>> => {
  return await axios.post(url + api, form, {
    headers: {
      // Accept: "multipart/form-data",
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + token,
    },
  });
};

export const postWithAuthJson = async (
  api: string,
  json: any,
  token: string
): Promise<AxiosResponse<any, any>> => {
  return await axios.post(url + api, json, {
    headers: {
      // Accept: "multipart/form-data",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const get = async (
  apiParams: string
): Promise<AxiosResponse<any, any>> => {
  return await axios.get(url + apiParams);
};

export const getWithAuth = async (
  token: string | undefined,
  apiParams: string
): Promise<AxiosResponse<any, any>> => {
  return await axios.get(url + apiParams, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420",
      Authorization: "Bearer " + token,
    },
  });
};

export const patchWithAuthJson = async (
  api: string,
  json: any,
  token: string
): Promise<AxiosResponse<any, any>> => {
  return await axios.patch(url + api, json, {
    headers: {
      // Accept: "multipart/form-data",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const putWithAuthJson = async (
  api: string,
  json: any,
  token: string
): Promise<AxiosResponse<any, any>> => {
  return await axios.put(url + api, json, {
    headers: {
      // Accept: "multipart/form-data",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const deleteWithAuthJson = async (
  api: string,
  token: string
): Promise<AxiosResponse<any, any>> => {
  return await axios.delete(url + api, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};
