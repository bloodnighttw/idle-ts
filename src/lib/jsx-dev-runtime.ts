import {jsx, jsxs, Fragment} from "@/lib/jsx-runtime.ts";

// Dev version can include additional debugging information
function jsxDEV(type: any, props: any, _key: any, _isStaticChildren: boolean, _source: any, _self: any) {
    // Extract children from props
    const { children, ...otherProps } = props || {};

    // Handle different children types
    let childrenArray = [];
    if (children !== undefined && children !== null) {
        childrenArray = Array.isArray(children) ? children : [children];
    }

    // Call createElement with type, props, and children as separate arguments
    return jsx(type, otherProps, ...childrenArray);
}

export {jsx, jsxs, jsxDEV, Fragment}
