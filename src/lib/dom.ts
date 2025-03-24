import {BasicOUOElement, OUOElement} from "@/lib/ouo.ts";

type DOM = HTMLElement | Text;

interface Fiber extends BasicOUOElement{
    dom?: DOM;
    parent?: Fiber | null;
    child?: Fiber | null;
    sibling?: Fiber | null;
    alternate?: Fiber | null;
    hook?: any[];
    effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
}

interface HostFiber extends Fiber{
    type: string;
}

interface FunctionFiber extends Fiber{
    type: Function;
}

/* The loop will run when idle */

let nextUnitOfWork: Fiber | null = null;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Fiber[] | null = null;
const longestTimeToRun = 5;

function commitRoot(){
    console.log("commit start")
    console.log("current",currentRoot);
    console.log("wip",wipRoot);
    deletions!.forEach(commitWork);
    commitWork(wipRoot!.child!);
    currentRoot = wipRoot;
    wipRoot = null;
    console.log("commit done")
}

function commitDeletion(fiber: Fiber, parentDom?: DOM){
    if(fiber.dom){
        fiber.dom.parentNode?.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child!, parentDom);
    }
}

function commitWork(fiber?: Fiber){
    if(!fiber){
        return;
    }

    let domParentFiber = fiber.parent;
    while(!domParentFiber?.dom){
        domParentFiber = domParentFiber?.parent;
    }

    const domParent = domParentFiber!.dom;

    if(fiber.effectTag === "PLACEMENT" && fiber.dom){
        domParent.appendChild(fiber.dom);
    } else if(fiber.effectTag === "UPDATE" && fiber.dom){
        // update the dom
        updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
    } else if(fiber.effectTag === "DELETION"){
        commitDeletion(fiber, domParent);
    }


    commitWork(fiber.child!);
    commitWork(fiber.sibling!);
}

const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" && !isEvent(key);
const isNew = (prev: any, next: any) => (key: string) => prev[key] !== next[key];
const isGone = (_prev: any, next: any) => (key: string) => !(key in next);

interface Props{
    [key: string]: any;
}

function updateDom(dom: DOM, prevProps: Props, nextProps: Props){

    // remove old or changed properties
    Object.keys(dom)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach((key) => {
            (dom as any)[key] = "";
        })

    // remove old event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key => !(key in nextProps) || isNew(prevProps, nextProps)(key)
        )
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[key]);
        })

    // set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((key) => {
            (dom as any)[key] = nextProps[key];
        })

    // add new event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[key]);
        })

}

function fiberLoop(timestamp: number){

    while ( nextUnitOfWork && (performance.now() - timestamp ) < longestTimeToRun){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    // update the dom
    if(!nextUnitOfWork && wipRoot){
        commitRoot();
    }

    requestAnimationFrame(fiberLoop);
}

// start the loop
// note: the original tutorial uses requestIdleCallback,
// but it is not supported in all browsers(like safari)
// and react also not using it.
// ( react uses a scheduler package based on requestAnimationFrame to handle this)
requestAnimationFrame(fiberLoop);

function updateHostComponent(fiber: HostFiber){

    if(!fiber.dom){
        fiber.dom = createDom(fiber);
    }

    reconcileFiber(fiber);
}

let wipFiber: Fiber | null = null;
let hookIndex = 0;

function updateFunctionComponent(fiber: FunctionFiber){

    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hook = []

    const children = [fiber.type(fiber.props)];
    reconcileFiber(fiber, children);
}

export function useState<T>(initial: T): [T, (newState: T) => void]{
    const oldHook:{
        state: T,
        queue: T[]
    } | undefined = wipFiber?.alternate?.hook?.[hookIndex];
    const hook: {
        state: T,
        queue: T[]
    } = {
        state: oldHook?.state ?? initial,
        queue: []
    }

    const actions = oldHook?.queue ?? [];
    actions.forEach(value => {
        console.log("wtf")
        hook.state = value;
    })

    const setState = (value: T) => {
        console.log("setState", value)
        hook.queue.push(value);
        // @ts-ignore
        wipRoot = {
            dom: currentRoot!.dom!,
            props: currentRoot!.props!,
            alternate: currentRoot!,
        }
        nextUnitOfWork = wipRoot;
        deletions = [];
    }

    wipFiber?.hook?.push(hook);
    hookIndex++;



    return [hook.state, setState]
}


function performUnitOfWork(fiber: Fiber){

    if(fiber.type instanceof Function){
        updateFunctionComponent(fiber as FunctionFiber);
    } else {
        updateHostComponent(fiber as HostFiber);
    }

    // 1. If there is a child, return the child
    if(fiber.child){
        return fiber.child;
    }

    // 2. If there is a sibling, return next sibling
    let ptr: Fiber | undefined | null = fiber;
    while(ptr){
        if(ptr.sibling){
            return ptr.sibling;
        }
        // 3. If there is a parent, return the parent's sibling
        ptr = ptr.parent;
    }

    return null;
}

function reconcileFiber(wipFiber: Fiber, children?: BasicOUOElement[]){
    let oldFiber = wipFiber.alternate?.child;
    children = children ?? wipFiber.props.children;
    let prevSibling: Fiber | null = null;

    for(let index = 0 ; index < children.length || oldFiber; index++){
        const element = children[index];
        let newFiber: Fiber | null = null;

        const sameType = oldFiber &&
            element &&
            element.type === oldFiber.type;

        // update old fiber with new props
        if(sameType){
            // @ts-ignore
            newFiber = {
                type: oldFiber!.type,
                dom: oldFiber!.dom,
                props: element.props,
                alternate: oldFiber,
                parent: wipFiber,
                effectTag: "UPDATE",
            }
        }

        // generate a new fiber
        if(element && !sameType){
            newFiber = {
                type: element.type,
                props: element.props,
                dom: undefined,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }

        // delete old fiber
        if(oldFiber && !sameType){
            oldFiber.effectTag = "DELETION";
            deletions!.push(oldFiber);
        }

        if(oldFiber){
            oldFiber = oldFiber.sibling
        }

        console.log("ouo",index,prevSibling, newFiber)
        if(index === 0) {
            wipFiber.child = newFiber;
        } else {
            prevSibling!.sibling = newFiber;
        }

        prevSibling = newFiber;
    }
}

/* The loop will run when idle */

function createDom(element:HostFiber): DOM {

    if(element.type === "TEXT_ELEMENT"){
        return document.createTextNode(element.props.nodeValue);
    }

    const domElement = document.createElement(element.type);

    // add properties
    Object.keys(element.props)
        .filter(isProperty)
        .forEach((key) => {
            (domElement as any)[key] = element.props[key];
        })

    // add event listeners
    Object.keys(element.props)
        .filter(isEvent)
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            domElement.addEventListener(eventType, element.props[key]);
        })

    return domElement;
}


export function renderElement(element:OUOElement , parent:HTMLElement | null){

    wipRoot = {
        type: "ROOT_ELEMENT",
        dom: parent!,
        props: {
            children: [element]
        },
        alternate: currentRoot
    }

    deletions = [];
    nextUnitOfWork = wipRoot;
}
