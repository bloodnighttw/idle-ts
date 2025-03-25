export type JSXTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span" | "p" | "button" | "input" | "a";
export type RawChild = string | OUOElement;
export type RawChildren = RawChild[];
export type OUOHostElement = TextElemenet | DOMElement;
export type OUOElement = OUOHostElement | FunctionElement;

export interface BasicOUOElement {
    type: string | Function;
    props: {
        children: BasicOUOElement[];
        [key: string]: any;
    }
}

interface TextElemenet extends BasicOUOElement{
    type: "TEXT_ELEMENT";
    props: {
        nodeValue: string;
        children: [];
    }
}

interface DOMElement extends BasicOUOElement{
    type: JSXTags;
    props: {
        children: OUOElement[];
        [key: string]: any;
    };
}

interface FunctionElement extends BasicOUOElement{
    type: Function;
    props: {
        children: OUOElement[];
        [key: string]: any;
    };
}


export function createElement<T>(type:JSXTags | Function, props?:T | null, ...rawChildren: RawChildren) : OUOElement{

    const children: OUOElement[] = rawChildren.map(child => {

        if(typeof child === "string"){
            return {
                type: "TEXT_ELEMENT",
                props: {
                    nodeValue: child,
                    children: []
                }
            }
        }

        return child;
    })

    return {
        type,
        props: {
            ...props,
            children
        }
    }
}