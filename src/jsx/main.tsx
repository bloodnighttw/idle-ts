import {useState} from "@/lib/dom.ts";

export function WTF({name}:{name:string}) {
    return <div>{name}</div>
}

export function main() {
    const [t, setT] = useState(0);

  return <h1>
      <button onclick={()=> {
          setT(t+1)
      }}>{ t === 0 ? "zero" : "not zero"}</button>
  </h1>
}

export default main;