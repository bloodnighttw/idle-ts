import {jsx, jsxs, Fragment} from "@/lib/jsx-runtime.ts";

// Dev version can include additional debugging information
function jsxDEV(type: any, props: any, _key: any) {
    return jsx(type, props, ...props.children);
}

export {jsx, jsxs, jsxDEV, Fragment}
