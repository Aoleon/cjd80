declare module "react-day-picker" {
  import type { ComponentType } from "react";

  export interface DayPickerComponents {
    IconLeft?: ComponentType<JSX.IntrinsicElements["svg"]>;
    IconRight?: ComponentType<JSX.IntrinsicElements["svg"]>;
    [key: string]: ComponentType<any> | undefined;
  }

  export interface DayPickerProps extends JSX.IntrinsicElements["div"] {
    className?: string;
    classNames?: Record<string, string>;
    components?: DayPickerComponents;
    showOutsideDays?: boolean;
    [key: string]: unknown;
  }

  export const DayPicker: ComponentType<DayPickerProps>;
}
