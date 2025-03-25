import {useState} from "@/lib/dom.ts";

export function WTF() {
    const [state, setState] = useState(0);

    return <div onclick={()=>setState(state+1)}>{state.toString()}</div>
}

export function main() {
    const [t, setT] = useState(0);
    let random = Math.random();

  return <div>
      <div>{t.toString()}</div>
      <button onclick={()=> {
          setT(t+1)
      }}>{ t % 2 === 0 ? "increase + 1" : "increase with 1"}</button>
      <hr/>
        <WTF/>
      <p>{random.toString()}</p>
  </div>
}

export default main;