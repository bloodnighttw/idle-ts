import {BasicOUOElement, OUOElement} from "@/lib/ouo.ts";

/* ===========================================
 * Type Definitions
 * ===========================================
 */

// the dom element type we use
type DOM = HTMLElement | Text;

interface Fiber extends BasicOUOElement{
    dom?: DOM;
    parent?: Fiber | null;
    // children fiber
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

interface Props{
    [key: string]: any;
}

/* ===========================================
 * Global Variables
 * ===========================================
 */

// the next unit of work
let nextUnitOfWork: Fiber | null = null;
// the current root of the fiber tree
let currentRoot: Fiber | null = null;
// the wip root of the fiber tree
let wipRoot: Fiber | null = null;
// the fiber to delete
let deletions: Fiber[] | null = null;
// the longest time to process unit of work
const longestTimeToRun = 5;


let wipFiber: Fiber | null = null;
let hookIndex = 0;

/* ===========================================
 * The Fiber Loop
 * ===========================================
 */

function fiberLoop(timestamp: number){

    while ( nextUnitOfWork && (performance.now() - timestamp ) < longestTimeToRun){
        nextUnitOfWork && console.log("work" ,nextUnitOfWork);
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    // if all the work is done, commit the root
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


/* ===========================================
 * Perform Unit of Work Functions
 * we run it in the loop to avoid blocking the
 * main thread.
 * ===========================================
 */
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

/* ===========================================
 * Commit Changes Functions
 * we do crud operation on the real dom with
 * these functions.
 * ===========================================
 */

// commit the change from wip root vdom to real dom
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

// commit the deletion from real dom
function commitDeletion(fiber: Fiber, parentDom?: DOM){
    if(fiber.dom){
        fiber.dom.parentNode?.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child!, parentDom);
    }
}

// commit the change from wip vdom to real dom
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


/* ===========================================
 * Reconcile Fiber
 * ===========================================
 */
function reconcileFiber(wipFiber: Fiber, children?: BasicOUOElement[]){
    let oldFiber = wipFiber.alternate?.child;
    children = children ?? wipFiber.props.children;
    let prevSibling: Fiber | null = null;

    for(let index = 0 ; index < children.length || oldFiber; index++, oldFiber = oldFiber?.sibling){
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

        if(index === 0) {
            wipFiber.child = newFiber;
        } else {
            prevSibling!.sibling = newFiber;
        }

        prevSibling = newFiber;
    }
}


/* ===========================================
 * Helper Functions
 * ===========================================
 */
const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" && !isEvent(key);
const isNew = (prev: any, next: any) => (key: string) => prev[key] !== next[key];
const isGone = (_prev: any, next: any) => (key: string) => !(key in next);

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

function updateHostComponent(fiber: HostFiber){

    if(!fiber.dom){
        fiber.dom = createDom(fiber);
    }

    reconcileFiber(fiber);
}

function updateFunctionComponent(fiber: FunctionFiber){

    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hook = []

    const children = [fiber.type(fiber.props)];
    reconcileFiber(fiber, children);
}

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

/* ===========================================
 * Render Functions
 * we use this function to begin the rendering
 * process.
 * ===========================================
 */
export function renderElement(element:OUOElement , parent:HTMLElement | null){

    wipRoot = {
        type: "ROOT_ELEMENT",
        dom: parent!,
        props: {
            children: [element]
        },
    }

    deletions = [];
    nextUnitOfWork = wipRoot;
}

/* ===========================================
 * useState
 * ===========================================
 */
export function useState<T>(initial: T): [T, (newState: T) => void]{

    const oldHook:{ state: T } | undefined = wipFiber?.alternate?.hook?.[hookIndex];
    const hook: {
        state: T,
    } = {
        state: oldHook?.state ?? initial,
    }

    const setState = (value: T) => {
        console.log("setState",value)
        hook.state = value;
        wipRoot = {
            type: "ROOT_ELEMENT",
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
