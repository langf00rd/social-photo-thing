import { PropsWithChildren } from "react";

export function ActionFAB(props: PropsWithChildren) {
  return <div className="fixed right-10 bottom-6 z-10">{props.children}</div>;
}
