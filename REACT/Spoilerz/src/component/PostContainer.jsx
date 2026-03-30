import Posts from "./Posts.jsx";


const PostContainer = ({comments}) =>{
  // Array.map() returns a NEW array
  let results = comments.map((post) =>{
    return <Posts reply={post}/>
  })
  return(
    <div style={{border:"3px Blue solid"}}>
      <h1> I am the Post Container</h1>
      {results}
    </div>
  )
}

export default PostContainer;
