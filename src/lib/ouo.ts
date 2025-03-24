export type JSXTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span" | "p" | "button" | "input" | "a";
export type RawChild = string | OUOElement;
export type RawChildren = RawChild[];
export type OUOElement = TextElemenet | DOMElement;

interface TextElemenet {
    type: "TEXT_ELEMENT";
    props: {
        nodeValue: string;
    }
}

interface DOMElement {
    type: JSXTags;
    props: {
        nodeValue?: string;
        children: OUOElement[];
        [key: string]: any;
    };
}


export function createElement<T>(type:JSXTags, props?:T, ...rawChildren: RawChildren) : OUOElement{

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

