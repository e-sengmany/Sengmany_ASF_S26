import { useState } from "react";
import EventImage from "./EventImage.jsx";
import HuntMiniGame from "./HuntingMiniGame.jsx";
import LandNavMiniGame from "./LandNavMiniGame";

function gameLogic() {

  const [player, setPlayer] = useState({
    health: 100,
    food: 50,
    ammo: 10,
    distance: 0,
    day: 1,
    log: ["Your journey begins..."]
  });

  //player events
  const [action, setAction] = useState("default");

  //mini game expanded
  const [miniGameType, setMiniGameType] = useState(null);

  function logMessage(msg) {
    setPlayer(prev => ({
      ...prev,
      log: [msg, ...prev.log]
    }));
  }

  function travel() {
    setAction("travel");
    setPlayer(prev => {
      let newDistance = prev.distance + Math.floor(Math.random() * 20) + 10;
      let newFood = prev.food - 5;

      let updated = {
        ...prev,
        distance: newDistance,
        food: newFood,
        day: prev.day + 1
      };

      return applyRandomEvent(updated);
    });

    logMessage("You traveled forward.");
  }

  function rest() {
    setAction("rest");
    setPlayer(prev => ({
      ...prev,
      health: Math.min(prev.health + 10, 100),
      food: prev.food - 3,
      day: prev.day + 1
    }));

    logMessage("You rested and recovered health.");
  }

  function hunt() {
    setAction("hunt");
    setMiniGameType("hunt")
    logMessage("You begin a patrol engagement..")
    setPlayer(prev => {
      if (prev.ammo <= 0) {
        logMessage("No ammo to hunt!");
        return prev;
      }

      let foodGained = Math.floor(Math.random() * 15) + 5;

      return {
        ...prev,
        food: prev.food + foodGained,
        ammo: prev.ammo - 1,
        day: prev.day + 1
      };
    });

    logMessage("You went hunting.");
  }

  //Land nav game
  function navigate() {
    setAction("navigate");
    setMiniGameType("landnav");

    logMessage("You begin land navigation to the rally point..")
  }
  function handleLandNavComplete(result) {
    setMiniGameType(null);

    if (result.correct) {
      setPlayer(prev => ({
        ...prev,
        distance: prev.distance + 20,
        log: ["Navigation successful. Patrol continues.", ...prev.log]
      }));
    } else {
      setPlayer(prev => ({
        ...prev,
        distance: prev.distance + 40, // penalty
        log: ["You got lost! Extra distance added.", ...prev.log]
      }));
    }
  }

  function handleHuntComplete(score) {
    setMiniGameType(null);

    setPlayer(prev => {
      let foodGained = score * 5;

      return {
        ...prev,
        food: prev.food + foodGained,
        ammo: prev.ammo - 1,
        day: prev.day + 1,
        log: [`Engagement successful. Supplies gained: ${foodGained}`, ...prev.log]
      };
    });
  }

  function applyRandomEvent(player) {
    const roll = Math.random();

    if (roll < 0.3) {
      player.health -= 10;
      player.log = ["You got sick!", ...player.log];
      setAction("sick")
    } else if (roll < 0.6) {
      player.food += 10;
      player.log = ["You found extra food!", ...player.log];
      setAction("hunt")
    } else if (roll < 0.8) {
      player.ammo += 3;
      player.log = ["You found ammo!", ...player.log];
      setAction("travel")
    }

    return player;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <table style={{marginLeft: "auto", marginRight: "auto"}}>
        <thead>
        <tr>
          <th>Day: {player.day}</th>
          <th>Health: {player.health}</th>
          <th>Food: {player.food}</th>
          <th>Ammo: {player.ammo}</th>
          <th>Distance: {player.distance} miles</th>
        </tr>
        </thead>

      </table>
      {/*<EventImage action={action} />*/}
      {/*{isMiniGame ? (*/}
      {/*  <HuntMiniGame onComplete={handleMiniGameComplete} />*/}
      {/*) : (*/}
      {/*  <EventImage action={action} />*/}
      {/*)}*/}
      {miniGameType === "hunt" && (
        <HuntMiniGame onComplete={handleHuntComplete} />
      )}

      {miniGameType === "landnav" && (
        <LandNavMiniGame onComplete={handleLandNavComplete} />
      )}

      {!miniGameType && <EventImage action={action} />}
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>

      <div style={{ marginTop: "20px" }}>
        <button onClick={travel}>Travel</button>
        <button onClick={rest}>Rest</button>
        <button onClick={hunt}>Hunt</button>
        <button onClick={navigate}>Navigate</button>
      </div>

      <h3>Event Log</h3>
      <ul>
        {player.log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default gameLogic;
