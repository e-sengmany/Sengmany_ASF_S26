import React, { useEffect, useMemo, useState } from "react";

export default function LandNavGame() {
  const MAP_WIDTH = 400;
  const MAP_HEIGHT = 400;
  const CELL_SIZE = 2;
  const POINT_COUNT = 5;
  const TARGET_TOLERANCE = 15;
  const SEARCH_TOLERANCE = 6;
  const GRID_INTERVAL = 20;

  const MAP_PIXEL_WIDTH = MAP_WIDTH * CELL_SIZE;
  const MAP_PIXEL_HEIGHT = MAP_HEIGHT * CELL_SIZE;
  const OVERLAY_WIDTH = MAP_PIXEL_WIDTH * 0.8;
  const OVERLAY_HEIGHT = MAP_PIXEL_HEIGHT * 0.8;
  const MAP_LEFT_OFFSET = 30;
  const MAP_TOP_OFFSET = 10;

  const POINT_COLORS = {
    start: "#00cc66",
    "point-1": "#ff3333",
    "point-2": "#ff9900",
    "point-3": "#3399ff",
    "point-4": "#cc33ff",
    "point-5": "#ffff00",
  };

  const CARDINAL_DIRECTIONS = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315,
  };

  const [gamePhase, setGamePhase] = useState("plotting");
  const [session, setSession] = useState({ startPoint: null, targetPoints: [] });
  const [player, setPlayer] = useState({ x: 0, y: 0, routeHistory: [] });
  const [plottedPoints, setPlottedPoints] = useState([]);
  const [selectedPointToPlot, setSelectedPointToPlot] = useState("start");
  const [selectedAzimuth, setSelectedAzimuth] = useState("");
  const [selectedDistance, setSelectedDistance] = useState("");
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [message, setMessage] = useState("Plot the start point and all 5 target points.");

  const [mousePos, setMousePos] = useState(null);
  const [visualAzimuth, setVisualAzimuth] = useState(null);

  const [searchCenter, setSearchCenter] = useState(null);
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [searchCell, setSearchCell] = useState(null);
  const [searchPattern, setSearchPattern] = useState("box");
  const [searchPath, setSearchPath] = useState([]);
  const [searchMarker, setSearchMarker] = useState(null);
  const [isSearchAnimating, setIsSearchAnimating] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const xLabels = Array.from(
    { length: MAP_WIDTH / GRID_INTERVAL + 1 },
    (_, i) => i * GRID_INTERVAL
  );
  const yLabels = Array.from(
    { length: MAP_HEIGHT / GRID_INTERVAL + 1 },
    (_, i) => i * GRID_INTERVAL
  );

  const currentTarget = useMemo(() => {
    return session.targetPoints[currentTargetIndex] || null;
  }, [session.targetPoints, currentTargetIndex]);

  useEffect(() => {
    createNewSession();
  }, []);

  function randomPoint(min = 20, maxX = MAP_WIDTH - 20, maxY = MAP_HEIGHT - 20) {
    return {
      x: Math.floor(Math.random() * (maxX - min + 1)) + min,
      y: Math.floor(Math.random() * (maxY - min + 1)) + min,
    };
  }

  function distanceBetween(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function generateUniquePoints() {
    const points = [];

    while (points.length < POINT_COUNT + 1) {
      const candidate = randomPoint();
      const tooClose = points.some((p) => distanceBetween(p, candidate) < 40);
      if (!tooClose) points.push(candidate);
    }

    return {
      startPoint: points[0],
      targetPoints: points.slice(1).map((point, index) => ({
        id: index + 1,
        x: point.x,
        y: point.y,
        found: false,
      })),
    };
  }

  function resetSearchState() {
    setSearchCenter(null);
    setSearchCell(null);
    setSearchPath([]);
    setSearchMarker(null);
    setSearchAttempts(0);
    setSearchResult(null);
    setIsSearchAnimating(false);
    setSearchPattern("box");
  }

  function createNewSession() {
    const newSession = generateUniquePoints();

    setSession(newSession);
    setPlayer({
      x: newSession.startPoint.x,
      y: newSession.startPoint.y,
      routeHistory: [],
    });
    setPlottedPoints([]);
    setSelectedPointToPlot("start");
    setSelectedAzimuth("");
    setSelectedDistance("");
    setCurrentTargetIndex(0);
    setGamePhase("plotting");
    setMousePos(null);
    setVisualAzimuth(null);
    resetSearchState();
    setMessage("Plot the start point and all 5 target points.");
  }

  function formatCoordinate(point) {
    if (!point) return "";
    return `${String(Math.round(point.x)).padStart(3, "0")}${String(Math.round(point.y)).padStart(3, "0")}`;
  }

  function toScreenY(y) {
    return (MAP_HEIGHT - y) * CELL_SIZE;
  }

  function toScreenX(x) {
    return x * CELL_SIZE;
  }

  function calculateAzimuth(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return (angle + 360) % 360;
  }

  function getGridCell(point) {
    const cellX = Math.floor(point.x / GRID_INTERVAL);
    const cellY = Math.floor(point.y / GRID_INTERVAL);

    return {
      cellX,
      cellY,
      startX: cellX * GRID_INTERVAL,
      endX: cellX * GRID_INTERVAL + GRID_INTERVAL - 1,
      startY: cellY * GRID_INTERVAL,
      endY: cellY * GRID_INTERVAL + GRID_INTERVAL - 1,
    };
  }

  function clampPointToSearchCell(point, cell) {
    if (!cell) return point;
    return {
      x: Math.max(cell.startX, Math.min(cell.endX, point.x)),
      y: Math.max(cell.startY, Math.min(cell.endY, point.y)),
    };
  }

  function clampPathToSearchCell(path, cell) {
    return path.map((point) => clampPointToSearchCell(point, cell));
  }

  function buildBoxSearchPath(start, step = 3, legs = 8) {
    const path = [{ x: start.x, y: start.y }];
    let x = start.x;
    let y = start.y;
    const directions = [
      { dx: 0, dy: step },
      { dx: step, dy: 0 },
      { dx: 0, dy: -step },
      { dx: -step, dy: 0 },
    ];
    let distanceMultiplier = 1;

    for (let i = 0; i < legs; i++) {
      const dir = directions[i % 4];
      const moveDist = step * distanceMultiplier;
      x += Math.sign(dir.dx) * moveDist;
      y += Math.sign(dir.dy) * moveDist;
      path.push({ x, y });
      if (i % 2 === 1) distanceMultiplier++;
    }

    return path;
  }

  function buildCloverSearchPath(start, radius = 8) {
    return [
      { x: start.x, y: start.y },
      { x: start.x, y: start.y + radius },
      { x: start.x, y: start.y },
      { x: start.x + radius, y: start.y },
      { x: start.x, y: start.y },
      { x: start.x, y: start.y - radius },
      { x: start.x, y: start.y },
      { x: start.x - radius, y: start.y },
      { x: start.x, y: start.y },
    ];
  }

  function buildCircleSearchPath(start, radius = 8, points = 16) {
    const path = [{ x: start.x, y: start.y }];
    for (let i = 0; i <= points; i++) {
      const angle = (2 * Math.PI * i) / points;
      path.push({
        x: start.x + Math.cos(angle) * radius,
        y: start.y + Math.sin(angle) * radius,
      });
    }
    return path;
  }

  function buildSelectedSearchPath(pattern, startPoint, cell) {
    let rawPath = [];
    if (pattern === "box") rawPath = buildBoxSearchPath(startPoint, 3, 8);
    else if (pattern === "clover") rawPath = buildCloverSearchPath(startPoint, 8);
    else if (pattern === "circle") rawPath = buildCircleSearchPath(startPoint, 8, 16);
    return clampPathToSearchCell(rawPath, cell);
  }

  function searchPointFound(point, target) {
    const dx = point.x - target.x;
    const dy = point.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= SEARCH_TOLERANCE;
  }

  function isNearPoint(playerPos, targetPos, distanceMoved) {
    const dx = playerPos.x - targetPos.x;
    const dy = playerPos.y - targetPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dynamicTolerance = Math.max(TARGET_TOLERANCE, distanceMoved * 0.15);
    return dist <= dynamicTolerance;
  }

  function moveByAzimuth(x, y, azimuthDeg, distance) {
    const radians = (azimuthDeg * Math.PI) / 180;
    const dx = Math.sin(radians) * distance;
    const dy = -Math.cos(radians) * distance;
    return {
      x: Math.max(0, Math.min(MAP_WIDTH, x + dx)),
      y: Math.max(0, Math.min(MAP_HEIGHT, y + dy)),
    };
  }

  function getPlotLabel(key) {
    if (key === "start") return "Start";
    return key.replace("point-", "Point ");
  }

  function handleMapClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = Math.round((event.clientX - rect.left) / CELL_SIZE);
    const rawY = Math.round((event.clientY - rect.top) / CELL_SIZE);
    const clickY = MAP_HEIGHT - rawY;

    const boundedX = Math.max(0, Math.min(MAP_WIDTH, clickX));
    const boundedY = Math.max(0, Math.min(MAP_HEIGHT, clickY));

    if (gamePhase === "plotting") {
      const newPlot = {
        key: selectedPointToPlot,
        x: boundedX,
        y: boundedY,
      };

      setPlottedPoints((prev) => {
        const filtered = prev.filter((p) => p.key !== selectedPointToPlot);
        return [...filtered, newPlot];
      });

      setMessage(`Plotted ${selectedPointToPlot}. Select the next point to plot.`);
      return;
    }

    if (gamePhase === "navigating") {
      const clickedPoint = { x: boundedX, y: boundedY };
      const azimuth = calculateAzimuth({ x: player.x, y: player.y }, clickedPoint);
      setSelectedAzimuth(Math.round(azimuth).toString());
      setMessage(`Visual azimuth set to ${Math.round(azimuth)}°.`);
    }
  }

  function handleMapMouseMove(event) {
    if (gamePhase !== "navigating") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const rawX = (event.clientX - rect.left) / CELL_SIZE;
    const rawY = (event.clientY - rect.top) / CELL_SIZE;
    const x = rawX;
    const y = MAP_HEIGHT - rawY;
    const point = { x, y };

    setMousePos(point);
    setVisualAzimuth(calculateAzimuth({ x: player.x, y: player.y }, point));
  }

  function handleMapMouseLeave() {
    setMousePos(null);
    setVisualAzimuth(null);
  }

  function handleBeginNavigation() {
    const requiredKeys = ["start", ...session.targetPoints.map((p) => `point-${p.id}`)];
    const plottedKeys = plottedPoints.map((p) => p.key);
    const allPlotted = requiredKeys.every((key) => plottedKeys.includes(key));

    if (!allPlotted) {
      setMessage("You must plot the start point and all 5 target points first.");
      return;
    }

    setGamePhase("navigating");
    setMessage("Navigation started. Enter azimuth and distance to move toward Point 1.");
  }

  function animateMovement(start, end, duration = 1000, onComplete) {
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentX = start.x + (end.x - start.x) * progress;
      const currentY = start.y + (end.y - start.y) * progress;

      setPlayer((prev) => ({ ...prev, x: currentX, y: currentY }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setPlayer((prev) => ({ ...prev, x: end.x, y: end.y }));
        if (onComplete) onComplete(end);
      }
    }

    requestAnimationFrame(animate);
  }

  function handleConfirmRoute() {
    if (gamePhase !== "navigating") return;

    const azimuth = Number(selectedAzimuth);
    const distance = Number(selectedDistance);

    if (Number.isNaN(azimuth) || Number.isNaN(distance) || distance <= 0) {
      setMessage("Enter a valid azimuth and distance.");
      return;
    }

    const startPos = { x: player.x, y: player.y };
    const endPos = moveByAzimuth(player.x, player.y, azimuth, distance);

    setPlayer((prev) => ({
      ...prev,
      routeHistory: [
        ...prev.routeHistory,
        { from: startPos, to: endPos, azimuth, distance },
      ],
    }));

    animateMovement(startPos, endPos, 1000, (finalPos) => {
      if (!currentTarget) return;

      if (isNearPoint(finalPos, currentTarget, distance)) {
        const cell = getGridCell(finalPos);
        const marker = clampPointToSearchCell({ x: finalPos.x, y: finalPos.y }, cell);
        setGamePhase("searching");
        setSearchCenter({ x: finalPos.x, y: finalPos.y });
        setSearchCell(cell);
        setSearchMarker(marker);
        setSearchPath([]);
        setSearchAttempts(0);
        setSearchResult(null);
        setMessage("You are in the search area. Select a technique and run the search.");
      } else {
        setMessage("You are not at the target yet.");
      }
    });

    setSelectedAzimuth("");
    setSelectedDistance("");
  }

  function handleZoomReposition(event) {
    if (!searchCell || isSearchAnimating) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const usableWidth = rect.width;
    const usableHeight = rect.height;

    const mapX = searchCell.startX + (localX / usableWidth) * GRID_INTERVAL;
    const mapY = searchCell.endY - (localY / usableHeight) * GRID_INTERVAL;
    const clamped = clampPointToSearchCell({ x: mapX, y: mapY }, searchCell);

    setSearchMarker(clamped);
    setSearchPath([]);
    setSearchResult(null);
    setMessage("Search position updated. Select a technique and run search.");
  }

  function runSearchTechnique() {
    if (!searchMarker || !searchCell || !currentTarget || isSearchAnimating) return;

    const path = buildSelectedSearchPath(searchPattern, searchMarker, searchCell);
    setSearchPath(path);
    setIsSearchAnimating(true);
    setSearchResult(null);

    let index = 0;

    function stepThroughPath() {
      if (index >= path.length) {
        setIsSearchAnimating(false);
        setSearchAttempts((prev) => prev + 1);
        setSearchResult("not_found");
        setMessage("Search complete. Point not found. Reposition and try another technique.");
        return;
      }

      const point = path[index];
      setSearchMarker(point);

      if (searchPointFound(point, currentTarget)) {
        const updatedTargets = session.targetPoints.map((target, targetIndex) =>
          targetIndex === currentTargetIndex ? { ...target, found: true } : target
        );

        setSession((prev) => ({
          ...prev,
          targetPoints: updatedTargets,
        }));

        setIsSearchAnimating(false);
        setSearchAttempts((prev) => prev + 1);
        setSearchResult("found");

        if (currentTargetIndex === POINT_COUNT - 1) {
          setGamePhase("complete");
          resetSearchState();
          setMessage(`Point ${currentTarget.id} found. Lane complete.`);
        } else {
          setCurrentTargetIndex((prev) => prev + 1);
          setGamePhase("navigating");
          resetSearchState();
          setMessage(`Point ${currentTarget.id} found. Move to Point ${currentTarget.id + 1}.`);
        }

        return;
      }

      index += 1;
      setTimeout(stepThroughPath, 180);
    }

    stepThroughPath();
  }

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", fontFamily: "Arial, sans-serif", position: "relative" }}>
      <div style={{ width: "260px" }}>
        <h2>Land Nav Game</h2>
        <p><strong>Phase:</strong> {gamePhase}</p>
        <p>{message}</p>

        <hr />

        <h3>Mission Coordinates</h3>
        <p>
          <strong>Start:</strong>{" "}
          {session.startPoint ? formatCoordinate(session.startPoint) : "Loading..."}
        </p>

        {session.targetPoints.map((point) => (
          <p key={point.id}>
            <strong>Point {point.id}:</strong> {formatCoordinate(point)} {point.found ? "✅" : ""}
          </p>
        ))}

        <hr />

        <h3>Plotting Controls</h3>
        <select
          value={selectedPointToPlot}
          onChange={(e) => setSelectedPointToPlot(e.target.value)}
          disabled={gamePhase !== "plotting"}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        >
          <option value="start">Start</option>
          {session.targetPoints.map((point) => (
            <option key={point.id} value={`point-${point.id}`}>
              Point {point.id}
            </option>
          ))}
        </select>

        <button
          onClick={handleBeginNavigation}
          disabled={gamePhase !== "plotting"}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        >
          Begin Navigation
        </button>

        <button onClick={createNewSession} style={{ width: "100%", padding: "10px" }}>
          New Lane
        </button>
      </div>

      <div>
        <h3>Map</h3>
        <div
          style={{
            position: "relative",
            width: MAP_PIXEL_WIDTH + 40,
            height: MAP_PIXEL_HEIGHT + 40,
          }}
        >
          {xLabels.map((value) => (
            <div
              key={`x-top-${value}`}
              style={{
                position: "absolute",
                left: MAP_LEFT_OFFSET + value * CELL_SIZE - 10,
                top: 0,
                width: 20,
                textAlign: "center",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              {String(value).padStart(3, "0").slice(0, 2)}
            </div>
          ))}

          {yLabels.map((value) => {
            const flippedY = MAP_HEIGHT - value;
            return (
              <div
                key={`y-left-${value}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: MAP_TOP_OFFSET + flippedY * CELL_SIZE - 6,
                  width: 28,
                  textAlign: "right",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                {String(value).padStart(3, "0").slice(0, 2)}
              </div>
            );
          })}

          <div
            onClick={handleMapClick}
            onMouseMove={handleMapMouseMove}
            onMouseLeave={handleMapMouseLeave}
            style={{
              position: "absolute",
              left: MAP_LEFT_OFFSET,
              top: MAP_TOP_OFFSET,
              width: MAP_PIXEL_WIDTH,
              height: MAP_PIXEL_HEIGHT,
              border: "2px solid black",
              backgroundImage: `
                linear-gradient(to right, #ddd 1px, transparent 1px),
                linear-gradient(to bottom, #ddd 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_INTERVAL * CELL_SIZE}px ${GRID_INTERVAL * CELL_SIZE}px`,
              cursor: gamePhase === "plotting" ? "crosshair" : "default",
              overflow: "hidden",
            }}
          >
            {gamePhase === "searching" && searchCenter && (
              <div
                style={{
                  position: "absolute",
                  left: searchCenter.x * CELL_SIZE - 25 * CELL_SIZE,
                  top: toScreenY(searchCenter.y) - 25 * CELL_SIZE,
                  width: 50 * CELL_SIZE,
                  height: 50 * CELL_SIZE,
                  borderRadius: "50%",
                  border: "2px dashed orange",
                  backgroundColor: "rgba(255,165,0,0.08)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            )}

            {gamePhase === "searching" && searchCell && (
              <div
                style={{
                  position: "absolute",
                  left: searchCell.startX * CELL_SIZE,
                  top: toScreenY(searchCell.endY + 1),
                  width: GRID_INTERVAL * CELL_SIZE,
                  height: GRID_INTERVAL * CELL_SIZE,
                  border: "2px solid orange",
                  backgroundColor: "rgba(255,165,0,0.08)",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />
            )}

            {player.routeHistory.map((route, index) => {
              const x1 = route.from.x * CELL_SIZE;
              const y1 = toScreenY(route.from.y);
              const x2 = route.to.x * CELL_SIZE;
              const y2 = toScreenY(route.to.y);
              const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

              return (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: x1,
                    top: y1,
                    width: length,
                    height: 2,
                    backgroundColor: "red",
                    transformOrigin: "0 0",
                    transform: `rotate(${angle}deg)`,
                  }}
                />
              );
            })}

            {plottedPoints.map((plot) => (
              <React.Fragment key={plot.key}>
                <div
                  title={getPlotLabel(plot.key)}
                  style={{
                    position: "absolute",
                    left: plot.x * CELL_SIZE - 5,
                    top: toScreenY(plot.y) - 5,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: POINT_COLORS[plot.key] || "black",
                    border: "2px solid black",
                    boxShadow: "0 0 3px rgba(0,0,0,0.6)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: plot.x * CELL_SIZE + 6,
                    top: toScreenY(plot.y) - 6,
                    fontSize: "10px",
                    color: "black",
                    pointerEvents: "none",
                  }}
                >
                  {getPlotLabel(plot.key)}
                </div>
              </React.Fragment>
            ))}

            {gamePhase === "navigating" && mousePos && (
              <div
                style={{
                  position: "absolute",
                  left: toScreenX(player.x),
                  top: toScreenY(player.y),
                  width: Math.sqrt(
                    (toScreenX(mousePos.x) - toScreenX(player.x)) ** 2 +
                    (toScreenY(mousePos.y) - toScreenY(player.y)) ** 2
                  ),
                  height: 2,
                  backgroundColor: "limegreen",
                  transformOrigin: "0 0",
                  transform: `rotate(${Math.atan2(
                    toScreenY(mousePos.y) - toScreenY(player.y),
                    toScreenX(mousePos.x) - toScreenX(player.x)
                  ) * (180 / Math.PI)}deg)`,
                  pointerEvents: "none",
                  zIndex: 4,
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                left: player.x * CELL_SIZE,
                top: toScreenY(player.y),
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "12px solid green",
                transform: "translate(-50%, -100%)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            />
          </div>

          {gamePhase === "searching" && searchCell && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: MAP_LEFT_OFFSET,
                  top: MAP_TOP_OFFSET,
                  width: MAP_PIXEL_WIDTH,
                  height: MAP_PIXEL_HEIGHT,
                  backgroundColor: "rgba(0,0,0,0.25)",
                  zIndex: 15,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: MAP_LEFT_OFFSET + (MAP_PIXEL_WIDTH - OVERLAY_WIDTH) / 2,
                  top: MAP_TOP_OFFSET + (MAP_PIXEL_HEIGHT - OVERLAY_HEIGHT) / 2,
                  width: OVERLAY_WIDTH,
                  height: OVERLAY_HEIGHT,
                  backgroundColor: "rgba(255,255,255,0.96)",
                  border: "3px solid black",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <strong>Search Grid</strong>
                  <button
                    onClick={() => {
                      setGamePhase("navigating");
                      resetSearchState();
                      setMessage("Exited search view.");
                    }}
                  >
                    Close
                  </button>
                </div>

                <div
                  onClick={handleZoomReposition}
                  style={{
                    position: "relative",
                    flex: 1,
                    border: "2px solid black",
                    backgroundImage: `
                      linear-gradient(to right, #ccc 1px, transparent 1px),
                      linear-gradient(to bottom, #ccc 1px, transparent 1px)
                    `,
                    backgroundSize: `${(OVERLAY_WIDTH - 20) / GRID_INTERVAL}px ${(OVERLAY_HEIGHT - 60) / GRID_INTERVAL}px`,
                    cursor: isSearchAnimating ? "default" : "crosshair",
                    overflow: "hidden",
                  }}
                >
                  {searchPath.map((point, index) => {
                    if (index === 0) return null;
                    const prev = searchPath[index - 1];
                    const x1 = ((prev.x - searchCell.startX) / GRID_INTERVAL) * (OVERLAY_WIDTH - 20);
                    const y1 = ((searchCell.endY - prev.y) / GRID_INTERVAL) * (OVERLAY_HEIGHT - 60);
                    const x2 = ((point.x - searchCell.startX) / GRID_INTERVAL) * (OVERLAY_WIDTH - 20);
                    const y2 = ((searchCell.endY - point.y) / GRID_INTERVAL) * (OVERLAY_HEIGHT - 60);
                    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

                    return (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          left: x1,
                          top: y1,
                          width: length,
                          height: 2,
                          backgroundColor: "red",
                          transformOrigin: "0 0",
                          transform: `rotate(${angle}deg)`,
                          zIndex: 2,
                        }}
                      />
                    );
                  })}

                  {searchMarker && (
                    <div
                      style={{
                        position: "absolute",
                        left: ((searchMarker.x - searchCell.startX) / GRID_INTERVAL) * (OVERLAY_WIDTH - 20),
                        top: ((searchCell.endY - searchMarker.y) / GRID_INTERVAL) * (OVERLAY_HEIGHT - 60),
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderBottom: "16px solid green",
                        transform: "translate(-50%, -100%)",
                        zIndex: 5,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ width: "260px" }}>
        <h3>Navigation</h3>

        <p>
          <strong>Current Position:</strong>{" "}
          {formatCoordinate({ x: Math.round(player.x), y: Math.round(player.y) })}
        </p>

        <p>
          <strong>Current Target:</strong>{" "}
          {currentTarget ? `Point ${currentTarget.id}` : "None"}
        </p>

        <p>
          <strong>Target Found:</strong>{" "}
          {currentTarget ? (currentTarget.found ? "Yes" : "No") : "N/A"}
        </p>

        <div style={{ marginBottom: "10px" }}>
          <label><strong>Azimuth</strong></label>
          <input
            type="number"
            value={selectedAzimuth}
            onChange={(e) => setSelectedAzimuth(e.target.value)}
            placeholder="0-360"
            disabled={gamePhase !== "navigating"}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <button
          onClick={() => {
            if (visualAzimuth !== null) {
              setSelectedAzimuth(Math.round(visualAzimuth).toString());
            }
          }}
          disabled={gamePhase !== "navigating" || visualAzimuth === null}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        >
          Use Visual Azimuth
        </button>

        <div style={{ marginBottom: "10px" }}>
          <label><strong>Distance</strong></label>
          <input
            type="number"
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(e.target.value)}
            placeholder="Distance in map units"
            disabled={gamePhase !== "navigating"}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <button
          onClick={handleConfirmRoute}
          disabled={gamePhase !== "navigating"}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          Confirm Route
        </button>

        <hr />

        <p>
          <strong>Visual Azimuth:</strong>{" "}
          {visualAzimuth !== null ? `${Math.round(visualAzimuth)}°` : "Move mouse over map"}
        </p>

        <h3>Cardinal Reference</h3>
        {Object.entries(CARDINAL_DIRECTIONS).map(([dir, deg]) => (
          <p key={dir} style={{ margin: "4px 0" }}>
            <strong>{dir}</strong>: {deg}°
          </p>
        ))}

        <hr />

        {gamePhase === "searching" && (
          <div style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
            <p><strong>Search Phase Active</strong></p>
            <p>Click inside the zoomed square to reposition. Then select a technique and run it.</p>
            <p>Search Attempts: {searchAttempts}</p>

            <div style={{ marginBottom: "10px" }}>
              <label><strong>Search Technique</strong></label>
              <select
                value={searchPattern}
                onChange={(e) => setSearchPattern(e.target.value)}
                disabled={isSearchAnimating}
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              >
                <option value="box">Box</option>
                <option value="clover">Clover</option>
                <option value="circle">Circle</option>
              </select>
            </div>

            <button
              onClick={runSearchTechnique}
              disabled={isSearchAnimating || !searchMarker}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            >
              {isSearchAnimating ? "Searching..." : "Run Search Technique"}
            </button>

            <p style={{ margin: 0 }}>
              <strong>Result:</strong>{" "}
              {searchResult === "found"
                ? "Point found"
                : searchResult === "not_found"
                  ? "Not found"
                  : "Ready"}
            </p>
          </div>
        )}

        <h3>Route History</h3>
        <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
          {player.routeHistory.length === 0 ? (
            <p>No movement yet.</p>
          ) : (
            player.routeHistory.map((route, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <p style={{ margin: 0 }}><strong>Leg {index + 1}</strong></p>
                <p style={{ margin: 0 }}>Azimuth: {route.azimuth}°</p>
                <p style={{ margin: 0 }}>Distance: {route.distance}</p>
                <p style={{ margin: 0 }}>
                  From: {formatCoordinate({ x: Math.round(route.from.x), y: Math.round(route.from.y) })}
                </p>
                <p style={{ margin: 0 }}>
                  To: {formatCoordinate({ x: Math.round(route.to.x), y: Math.round(route.to.y) })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
