import React, {useEffect} from 'react';
import {useEffect} from "react";

const ResultsPage = () => {

  const Results = () => {

  }
  useEffect((callback, dependencies) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`
      }
    };

    fetch('https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1', options)
      .then(res => res.json())
      .then(parsedResponse =>{
          console.log(parsedResponse.results)
          setMovies(parsedResponse.results)
      })
      .then(res => console.log(res))
      .catch(err => console.error(err));
  }, []);

  let displayMovies = movies.map(el => {
      return(
        <p></p>
      )
  })

  return (
    <div>
      <h2>Results</h2>
      {/*We want to see ALL no playing movies*/}
      {/*need http request for movies*/}
      {/*then we are going to build cards for the movies*/}
      {displayMovies}


    </div>

  );
};

export default ResultsPage;
