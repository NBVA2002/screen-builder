import {loadComps} from "comps";
import type {AppViewInstanceOptions} from "./AppViewInstance";
import {Root} from "react-dom/client";

loadComps();

export async function bootstrapAppAt<I>(
  appId: string,
  node: Element | null,
  root: Root,
  options: AppViewInstanceOptions<I> = {}
) {
  if (!node) {
    console.error("node must be not null.");
    return;
  }

  const { AppViewInstance } = await import("./AppViewInstance");
  return new AppViewInstance(appId, node, root, options);
}
