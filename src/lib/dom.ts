import {OUOElement} from "@/lib/ouo.ts";

export function renderElement(element:OUOElement, parent:HTMLElement | null){

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
