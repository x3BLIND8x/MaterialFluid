import { createPortal } from "react-dom";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { appearanceClasses } from "./appearance";
import { cx } from "./utils";
import { useMaterialFluid } from "./provider";
export function Portal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { portalContainer } = useMaterialFluid();
  const appearance = appearanceClasses(className);
  return portalContainer
    ? createPortal(
        appearance
          ? Children.map(children, (child) => {
              if (!isValidElement(child)) return child;
              const element = child as ReactElement<{ className?: string }>;
              return cloneElement(element, {
                className: cx(element.props.className, appearance),
              });
            })
          : children,
        portalContainer,
      )
    : null;
}
