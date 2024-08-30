import {useCallback, useEffect, useState} from "react";
import {hookToStateComp} from "../generators/hookToComp";
import {CanvasContainerID} from "lowcoder-sdk";
import {useResizeDetector} from "react-resize-detector";

enum ScreenTypes {
  Mobile = 'mobile', Tablet = 'tablet', Desktop = 'desktop',
}

type ScreenType = typeof ScreenTypes[keyof typeof ScreenTypes]

type ScreenInfo = {
  width?: number; height?: number; deviceType?: ScreenType; isDesktop?: boolean; isTablet?: boolean; isMobile?: boolean;
}

export function useScreenInfo() {
  const updateScreenInfo = useCallback(() => {
    setScreenInfo(getScreenInfo());
  }, [])

  const {ref} = useResizeDetector({onResize: updateScreenInfo});

  const getDeviceType = () => {
    if ((document.getElementById(CanvasContainerID)?.offsetWidth ?? window.innerWidth) < 768) return ScreenTypes.Mobile;
    if ((document.getElementById(CanvasContainerID)?.offsetWidth ?? window.innerWidth) < 889) return ScreenTypes.Tablet;
    return ScreenTypes.Desktop;
  }
  const getFlagsByDeviceType = (deviceType: ScreenType) => {
    const flags = {
      isMobile: false, isTablet: false, isDesktop: false,
    };
    if (deviceType === ScreenTypes.Mobile) {
      return {...flags, isMobile: true};
    }
    if (deviceType === ScreenTypes.Tablet) {
      return {...flags, isTablet: true};
    }
    return {...flags, isDesktop: true};
  }

  const getScreenInfo = useCallback(() => {
    const innerWidth = document.getElementById(CanvasContainerID)?.offsetWidth ?? window.innerWidth;
    const innerHeight = document.getElementById(CanvasContainerID)?.scrollHeight ?? window.innerHeight;
    const deviceType = getDeviceType();
    const flags = getFlagsByDeviceType(deviceType);

    return {
      width: innerWidth, height: innerHeight, deviceType, ...flags
    };
  }, [])

  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({});

  useEffect(() => {
    ref.current = document.getElementById(CanvasContainerID);
    window.addEventListener('resize', updateScreenInfo);
    updateScreenInfo();
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, [updateScreenInfo])

  return screenInfo;
}

export const ScreenInfoHookComp = hookToStateComp(useScreenInfo);
