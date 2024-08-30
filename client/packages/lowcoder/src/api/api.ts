import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { REQUEST_TIMEOUT_MS, SERVER_HOST } from "constants/apiConstants";
import {
  apiFailureResponseInterceptor,
  apiRequestInterceptor,
  apiSuccessResponseInterceptor,
} from "api/apiUtils";
import { API_REQUEST_HEADERS } from "constants/apiConstants";
import { sdkConfig } from "constants/sdkConfig";
import _ from "lodash";

let axiosIns: AxiosInstance | null = null;
let haveApiKey = false;

declare global {
  interface Window {
    LOWCODER_API_KEY: string;
  }
}

function getAxiosInstance() {
  if (axiosIns && (haveApiKey || !localStorage.getItem("LOWCODER_API_KEY"))) {
    return axiosIns;
  }

  const apiRequestConfig: AxiosRequestConfig = {
    baseURL: `${_.trimEnd(sdkConfig.baseURL || SERVER_HOST, "/")}/api/`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      ...API_REQUEST_HEADERS,
      ...(localStorage.getItem("LOWCODER_API_KEY")) && {Authorization: `Bearer ${localStorage.getItem("LOWCODER_API_KEY")}`}
    },
    withCredentials: true,
  };

  if (localStorage.getItem("LOWCODER_API_KEY")) {
    haveApiKey = true
  }

  const axiosInstance: AxiosInstance = axios.create(apiRequestConfig);
  axiosInstance.interceptors.request.use(apiRequestInterceptor);
  axiosInstance.interceptors.response.use(
    apiSuccessResponseInterceptor,
    apiFailureResponseInterceptor
  );

  axiosIns = axiosInstance;

  return axiosIns;
}

class Api {
  static get(url: string, queryParams?: any, config: Partial<AxiosRequestConfig> = {}) {
    return getAxiosInstance().request({
      url,
      method: "GET",
      params: queryParams,
      ...config,
    });
  }

  static post(
    url: string,
    body?: any,
    queryParams?: any,
    config: Partial<AxiosRequestConfig> = {}
  ) {
    return getAxiosInstance().request({
      method: "POST",
      url,
      data: body,
      params: queryParams,
      ...config,
    });
  }

  static put(url: string, body?: any, queryParams?: any, config: Partial<AxiosRequestConfig> = {}) {
    return getAxiosInstance().request({
      method: "PUT",
      url,
      params: queryParams,
      data: body,
      ...config,
    });
  }

  static patch(
    url: string,
    body?: any,
    queryParams?: any,
    config: Partial<AxiosRequestConfig> = {}
  ) {
    return getAxiosInstance().request({
      method: "PATCH",
      url,
      data: body,
      params: queryParams,
      ...config,
    });
  }

  static delete(url: string, queryParams?: any, config: Partial<AxiosRequestConfig> = {}) {
    return getAxiosInstance().request({
      method: "DELETE",
      url,
      params: queryParams,
      ...config,
    });
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE";

export default Api;
