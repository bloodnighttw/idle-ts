import {OUO} from "@/lib/ouo";
import app from "@/jsx/main";

const container = document.getElementById('root');

console.log("vdom",app())


OUO.renderElement(app(),container)