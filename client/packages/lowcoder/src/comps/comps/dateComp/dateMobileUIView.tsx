import styled from "styled-components";
import { DateTimeStyleType } from "comps/controls/styleControlConstants";
import { getMobileStyle } from "comps/comps/dateComp/dateCompUtil";
import dayjs from "dayjs";
import { DATE_FORMAT, DATE_TIME_FORMAT, DateParser } from "util/dateTimeUtils";
import { trans } from "i18n";
import React from "react";
import { DataUIViewProps } from "comps/comps/dateComp/dateUIView";
import { default as SwapRightOutlined } from "@ant-design/icons/SwapRightOutlined"
import { DateRangeUIViewProps } from "comps/comps/dateComp/dateRangeUIView";
import { DateCompViewProps } from "comps/comps/dateComp/dateComp";
import {useModalContainer} from "@lowcoder-ee/comps/hooks/modalComp";

const handleClick = async (
  params: Pick<
    DateCompViewProps,
    "showTime" | "minDate" | "maxDate" | "disabledTime" | "onFocus" | "onBlur"
  > & {
    value: dayjs.Dayjs | null;
    onChange: (value: dayjs.Dayjs | null) => void;
    getContainer: () => HTMLElement;
  }
) => {
  const MobileDatePicker = (await import("antd-mobile/es/components/date-picker")).default;

  const min = dayjs(params.minDate, DateParser, true);
  const max = dayjs(params.maxDate, DateParser, true);

  const { disabledHours, disabledMinutes, disabledSeconds } = params.disabledTime();

  MobileDatePicker.prompt({
    getContainer: params.getContainer,
    mouseWheel: true,
    cancelText: trans("cancel"),
    confirmText: trans("ok"),
    destroyOnClose: true,
    closeOnMaskClick: true,
    min: min.isValid() ? min.toDate() : undefined,
    max: max.isValid() ? max.toDate() : undefined,
    precision: params.showTime ? "second" : "day",
    defaultValue: params.value ? params.value.toDate() : undefined,
    filter: {
      hour: (val) => !disabledHours().includes(val),
      minute: (val, { date }) => !disabledMinutes(date.getHours()).includes(val),
      second: (val, { date }) => !disabledSeconds(date.getHours(), date.getMinutes()).includes(val),
    },
    onConfirm: (value) => {
      const time = dayjs(value);
      params.onChange(time);
    },
    onClose: params.onBlur,
  });

  params.onFocus();
};

const MobileView = styled.div<{
  $style: DateTimeStyleType;
}>`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #d7d9e0;
  ${(props) => props.$style && getMobileStyle(props.$style)}
`;

const DateItem = styled.div`
  overflow: hidden;
  white-space: nowrap;
  flex-grow: 1;
  display: flex;
  justify-content: center;
`;

export const DateMobileUIView = (props: DataUIViewProps) => {
  const getContainer = useModalContainer();

  return (<MobileView ref={props.viewRef} $style={props.$style} onClick={() => handleClick({...props, getContainer})}>
      <DateItem>
        {props.value
          ? props.value.format(props.format || (props.showTime ? DATE_TIME_FORMAT : DATE_FORMAT))
          : props.placeholder ?? trans("date.placeholder")}
      </DateItem>
      {props.suffixIcon}
    </MobileView>
  );
}

export const DateRangeMobileUIView = (props: DateRangeUIViewProps) => {
  const getContainer = useModalContainer();

  return (
    <MobileView ref={props.viewRef} $style={props.$style}>
      <DateItem
        onClick={() =>
          handleClick({
            ...props,
            value: props.start,
            onChange: (value) => props.onChange(value, props.end),
            getContainer
          })
        }
      >
        {props.start
          ? props.start.format(props.format || (props.showTime ? DATE_TIME_FORMAT : DATE_FORMAT))
          : trans("date.startDate")}
      </DateItem>
      <SwapRightOutlined/>
      <DateItem
        onClick={() =>
          handleClick({
            ...props,
            value: props.end,
            onChange: (value) => props.onChange(props.start, value),
            getContainer
          })
        }
      >
        {props.end
          ? props.end.format(props.format || (props.showTime ? DATE_TIME_FORMAT : DATE_FORMAT))
          : trans("date.endDate")}
      </DateItem>
      {props.suffixIcon}
    </MobileView>
  );
}