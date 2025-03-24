import {useState} from "@/lib/dom.ts";

export function WTF({name}:{name:string}) {
    return <div>{name}</div>
}

export function main() {
    const [t, setT] = useState(0);

  return <h1>
      <div>{t.toString()}</div>
      <button onclick={()=> {
          setT(t+1)
      }}>clicked</button>
  </h1>
}

export default main;