import React from 'react';
import {useNavigate} from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Landing</h2>

      {/*Want to display all movies currently in theatres*/}
      <button onClick={() => navigate("/results")}>
        Now Playing
      </button>
    </div>
  );
};

export default LandingPage;
