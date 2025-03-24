import {renderElement} from "@/lib/dom";
import app from "@/jsx/main";

const container = document.getElementById('root');

const vdom = app();

console.log("vdom",vdom)

renderElement(vdom,container)