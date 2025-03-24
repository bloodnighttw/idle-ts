import {BasicOUOElement, OUOElement} from "@/lib/ouo.ts";

type DOM = HTMLElement | Text;

interface Fiber extends BasicOUOElement{
    dom?: DOM;
    parent?: Fiber;
    child?: Fiber;
    sibling?: Fiber;
}

/* The loop will run when idle */

let nextUnitOfWork: Fiber | null = null;
let wipRoot: Fiber | null = null;

function commitRoot(){
    commitWork(wipRoot!.child!);
    wipRoot = null;
}

function commitWork(fiber?: Fiber){
    if(!fiber){
        return;
    }

    const domParent = fiber.parent?.dom!;
    domParent.appendChild(fiber.dom!);

    commitWork(fiber.child!);
    commitWork(fiber.sibling!);
}



function fiberLoop(deadline:IdleDeadline){
    let shouldYield = false;
    while ( nextUnitOfWork && !shouldYield ){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    // update the dom
    if(!nextUnitOfWork && wipRoot){
        commitRoot();
    }

    requestIdleCallback(fiberLoop);
}

// start the loop
requestIdleCallback(fiberLoop);

function performUnitOfWork(fiber: Fiber){

    if(!fiber.dom){
        fiber.dom = createDom(fiber);
    }

    const children = fiber.props.children;
    let prevSibling: Fiber | null = null;

    for(let index = 0 ; index < children.length; index++){
        const element = children[index];

        const newFiber: Fiber = {
            ...element,
            parent: fiber
        }

        if(index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling!.sibling = newFiber;
        }

        prevSibling = newFiber;
    }

    // find the next unit of work

    // 1. If there is a child, return the child
    if(fiber.child){
        return fiber.child;
    }

    // 2. If there is a sibling, return next sibling
    let ptr: Fiber | undefined = fiber;
    while(ptr){
        if(ptr.sibling){
            return ptr.sibling;
        }
        // 3. If there is a parent, return the parent's sibling
        ptr = ptr.parent;
    }

    return null;
}

/* The loop will run when idle */


const isProperty = (key: string) => key !== "children";

function createDom(element:BasicOUOElement): DOM {

    if(element.type === "TEXT_ELEMENT"){
        return document.createTextNode(element.props.nodeValue);
    }

    const domElement = document.createElement(element.type);

    Object.keys(element.props)
        .filter(isProperty)
        .forEach((key) => {
            (domElement as any)[key] = element.props[key];
        })

    return domElement;
}


export function renderElement(element:OUOElement, parent:HTMLElement | null){

    wipRoot = {
        type: "ROOT_ELEMENT",
        dom: parent!,
        props: {
            children: [element]
        }
    }

    nextUnitOfWork = wipRoot;
}
