export function WTF({name}:{name:string}) {
    return <div>{name}</div>
}

export function main() {
  return <h1>
      <div class="wtf">hello</div>
      <div>world</div>
      <div>
          happy happy happy!
        <div onClick={()=>console.log("clicked")}>
            This is the my react-clone library!
        </div>
          <button onclick={()=> {
              console.log("clicked");
          }}>clicked</button>
          <WTF name={"wtf"}/>
      </div>
  </h1>
}

export default main;