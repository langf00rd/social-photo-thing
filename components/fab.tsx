import { PropsWithChildren } from "react";

export function ActionFAB(props: PropsWithChildren) {
  return <div className="fixed right-10 bottom-3 z-10">{props.children}</div>;
}
