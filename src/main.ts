import {renderElement} from "@/lib/dom";
import Main from "@/jsx/main";
import {createElement} from "@/lib/ouo.ts";

const container = document.getElementById('root');
const root = createElement(Main);
renderElement(root,container)