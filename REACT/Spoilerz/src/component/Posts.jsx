
import Replies from "./Replies.jsx";

const Posts = ({reply}) =>{
  let {src, alt, content, date} = reply;
  const theStyles = {
    border: "2px white solid",
    margin: "10px auto"
  }
  return(
    <div style={theStyles}>
      <img src={src} alt={alt} />
      <p> Date: {date}</p>
      <p>Post Content: {content}
      </p>
      <div>
        <button>Like</button>
        <button>Dislike</button>
      </div>
      <div>
        {<button>REPLY</button> }
      </div>
      {/*<div>*/}
      {/*  <Replies/>*/}
      {/*  <Replies/>*/}
      {/*  <Replies/>*/}
      {/*</div>*/}
    </div>

  )
}

export default Posts;
