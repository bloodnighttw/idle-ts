import {useState} from "@/lib/dom.ts";

export function main() {
    const [t, setT] = useState(0);

  return <div>
      <div>{t.toString()}</div>
      <button onclick={()=> {
          setT(t+1)
      }}>{ t % 2 === 0 ? "increase + 1" : "increase with 1"}</button>
  </div>
}

export default main;