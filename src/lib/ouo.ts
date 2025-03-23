export type JSXTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span" | "p" | "button" | "input" | "a";
type rawChild = string | OUOElement;

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

export type OUOElement = TextElemenet | DOMElement;

export function createElement<T>(type:JSXTags, props?:T, ...rawChildren: rawChild[]) : OUOElement{

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

function renderElement(element:OUOElement, parent:HTMLElement | null){

    if(!parent){
        console.error("Parent is not defined");
        return;
    }

    if(!element){
        console.error("Element should not be undefined!!!!");
        return;
    }


    if(element.type === "TEXT_ELEMENT"){
        const node = document.createTextNode(element.props.nodeValue);
        parent.appendChild(node);
        return;
    }

    const domElement: HTMLElement = document.createElement(element.type);
    parent.appendChild(domElement);

    const isProperty = (key: string) => key !== "children";


    element.props ? Object.keys(element.props)
        .filter(isProperty)
        .forEach((key) => {
            (domElement as any)[key] = element.props[key];
        }) : 0

    for(let key in element.props){
        if(key === "children") continue;

        domElement.setAttribute(key, element.props[key]);
    }

    element.props.children.forEach((child)=>{
        renderElement(child, domElement);
    })

    parent.appendChild(domElement);

}




export const OUO = {
    createElement,
    renderElement,
}

export default OUO;