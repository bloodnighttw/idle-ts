import {jsx, jsxs, Fragment} from "@/lib/jsx-runtime.ts";

// Dev version can include additional debugging information
export function jsxDEV(type: any, props: any, _key: any) {
    return jsx(type, props, ...props.children);
}

export {jsxs, Fragment}
