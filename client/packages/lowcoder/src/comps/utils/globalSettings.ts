import type { CommonSettingResponseData } from "api/commonSettingApi";
import React from "react";

interface GlobalSettings {
  orgCommonSettings?: CommonSettingResponseData;
  isViewMode?: boolean;
  applicationId?: string;
}

let globalSettings: GlobalSettings = {};

export function clearGlobalSettings() {
  globalSettings = {};
}

export function setGlobalSettings(patch: GlobalSettings) {
  Object.assign(globalSettings, patch);
}

export function getGlobalSettings() {
  return globalSettings;
}

export const OrgCommonSettingsContext = React.createContext<CommonSettingResponseData | undefined>({});