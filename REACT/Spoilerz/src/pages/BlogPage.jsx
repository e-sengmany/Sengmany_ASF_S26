import BlogHeader from "../component/BlogHeader.jsx";
import PostContainer from "../component/PostContainer.jsx";
import {comments} from "../utils/fakeData.js";

const BlogPage = () =>{

  const theStyles = {
    border: "2px orangered solid",
    margin: "10px auto"

  }
  return(
    <div style={{border: "purple 5px solid"}}>
  <h1 style={theStyles}>I am the Blog Page</h1>
  <BlogHeader/>
  <PostContainer comments={comments}/>
      </div>
)
}

export default BlogPage;
