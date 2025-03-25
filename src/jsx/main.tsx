import {useState} from "@/lib/dom.ts";
import "./ouo.css"
import OUO from "./vite.svg"

export function Counter() {
    const [state, setState] = useState(0);

    return <div>
        <div>
            {state.toString()}
        </div>
        <div class="button" onclick={()=>setState(state+1)}>
            click me
        </div>
    </div>
}

function main() {
  return <div>
      <img src={OUO}/>
      <div>Build with Typescript, Vite, and my React-clone Library.</div>
      <div>Below is a simple counter using useState and my library.</div>
      <div>see <a href="https://github.com/bloodnighttw/idle-ts">here</a> to see the source code.</div>
      <Counter/>
  </div>
}

export default main;