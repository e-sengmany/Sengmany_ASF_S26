import React, { useEffect, useMemo, useRef, useState } from "react";
import mapImg from "../assets/newMap.png";
import protractorImg from "../assets/protractor.png";
export default function LandNavGame() {
  const MAP_WIDTH = 400;
  const MAP_HEIGHT = 400;
  const CELL_SIZE = 2;
  const POINT_COUNT = 5;
  const TARGET_TOLERANCE = 10;
  const SEARCH_TOLERANCE = 5;
  const GRID_INTERVAL = 20;
  const MAJOR_BOX_SIZE = GRID_INTERVAL * CELL_SIZE * 5;
  const PLOT_ZOOM_SCALE = 3;
  const PLOT_ZOOM_MAP_UNITS = GRID_INTERVAL * 5;
  const PLOT_ZOOM_PIXEL_SIZE = MAJOR_BOX_SIZE * PLOT_ZOOM_SCALE;

  //Zoomed in point plotting.
  const [isPlotZoomOpen, setIsPlotZoomOpen] = useState(false);
  const [zoomedPlotCell, setZoomedPlotCell] = useState(null);
  const [zoomPlotPoint, setZoomPlotPoint] = useState(null);

  const [zoomProtractorPos, setZoomProtractorPos] = useState({
    x: 150,
    y: 150,
  });
  const MINOR_CELLS_PER_MAJOR_BOX = 10;
  const MINOR_GRID_SIZE = MAJOR_BOX_SIZE / MINOR_CELLS_PER_MAJOR_BOX;

  const MAJOR_BOX_COUNT_X = MAP_WIDTH / (GRID_INTERVAL * 5);
  const MAJOR_BOX_COUNT_Y = MAP_HEIGHT / (GRID_INTERVAL * 5);

  const METERS_PER_MAP_UNIT = 10;

  const majorXLabels = Array.from(
    { length: MAJOR_BOX_COUNT_X + 1 },
    (_, i) => i
  );

  const majorYLabels = Array.from(
    { length: MAJOR_BOX_COUNT_Y + 1 },
    (_, i) => i
  );

  const MAP_PIXEL_WIDTH = MAP_WIDTH * CELL_SIZE;
  const MAP_PIXEL_HEIGHT = MAP_HEIGHT * CELL_SIZE;
  const OVERLAY_WIDTH = MAP_PIXEL_WIDTH * 0.8;
  const OVERLAY_HEIGHT = MAP_PIXEL_HEIGHT * 0.8;
  const MAP_LEFT_OFFSET = 30;
  const MAP_TOP_OFFSET = 10;
  const SEARCH_CANVAS_WIDTH = OVERLAY_WIDTH - 20;
  const SEARCH_CANVAS_HEIGHT = OVERLAY_HEIGHT - 60;
  const SEARCH_REVEAL_RADIUS_CELLS = 2;
  const SEARCH_ICON_RADIUS_UNITS = 3;

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
  const [zoomFoundPoint, setZoomFoundPoint] = useState(null);
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [searchCell, setSearchCell] = useState(null);
  const [searchPattern, setSearchPattern] = useState("box");
  const [searchPath, setSearchPath] = useState([]);
  const [searchMarker, setSearchMarker] = useState(null);
  const [isSearchAnimating, setIsSearchAnimating] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchVisitedCells, setSearchVisitedCells] = useState([]);
  const [pendingFoundTarget, setPendingFoundTarget] = useState(null);
  const searchAnimationRef = useRef(null);


  const currentTarget = useMemo(() => {
    return session.targetPoints[currentTargetIndex] || null;
  }, [session.targetPoints, currentTargetIndex]);

  useEffect(() => {
    createNewSession();
    return () => cancelSearchAnimation();
  }, []);

  useEffect(() => {
    if (!isPlotZoomOpen) return;

    function handleKeyDown(event) {
      const moveAmount = event.shiftKey ? 10 : 2;

      setZoomProtractorPos((prev) => {
        if (event.key === "ArrowUp") return { ...prev, y: prev.y - moveAmount };
        if (event.key === "ArrowDown") return { ...prev, y: prev.y + moveAmount };
        if (event.key === "ArrowLeft") return { ...prev, x: prev.x - moveAmount };
        if (event.key === "ArrowRight") return { ...prev, x: prev.x + moveAmount };

        return prev;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlotZoomOpen]);

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

  function cancelSearchAnimation() {
    if (searchAnimationRef.current !== null) {
      cancelAnimationFrame(searchAnimationRef.current);
      searchAnimationRef.current = null;
    }
  }

  function resetSearchState() {
    cancelSearchAnimation();
    setSearchCenter(null);
    setSearchCell(null);
    setSearchPath([]);
    setSearchMarker(null);
    setSearchAttempts(0);
    setSearchResult(null);
    setIsSearchAnimating(false);
    setSearchPattern("box");
    setSearchVisitedCells([]);
    setZoomFoundPoint(null);
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
    setPendingFoundTarget(null);
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

  function getMajorPlotCell(point) {
    const cellX = Math.floor(point.x / PLOT_ZOOM_MAP_UNITS);
    const cellY = Math.floor(point.y / PLOT_ZOOM_MAP_UNITS);

    return {
      cellX,
      cellY,
      startX: cellX * PLOT_ZOOM_MAP_UNITS,
      endX: cellX * PLOT_ZOOM_MAP_UNITS + PLOT_ZOOM_MAP_UNITS,
      startY: cellY * PLOT_ZOOM_MAP_UNITS,
      endY: cellY * PLOT_ZOOM_MAP_UNITS + PLOT_ZOOM_MAP_UNITS,
    };
  }

  function closePlotZoom() {
    setIsPlotZoomOpen(false);
    setZoomedPlotCell(null);
    setZoomPlotPoint(null);
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

  function toOverlayPoint(point, cell = searchCell) {
    if (!cell || !point) return { x: 0, y: 0 };
    return {
      x: ((point.x - cell.startX) / GRID_INTERVAL) * SEARCH_CANVAS_WIDTH,
      y: ((cell.endY - point.y) / GRID_INTERVAL) * SEARCH_CANVAS_HEIGHT,
    };
  }

  function markVisitedCellsAroundPoint(point, radius = SEARCH_REVEAL_RADIUS_CELLS, cell = searchCell) {
    if (!cell || !point) return;

    const localX = Math.floor(point.x - cell.startX);
    const localY = Math.floor(point.y - cell.startY);
    const newKeys = new Set();

    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const x = localX + dx;
        const y = localY + dy;
        if (x < 0 || y < 0 || x >= GRID_INTERVAL || y >= GRID_INTERVAL) continue;
        newKeys.add(`${x}-${y}`);
      }
    }

    if (newKeys.size === 0) return;

    setSearchVisitedCells((prev) => {
      const merged = new Set(prev);
      newKeys.forEach((key) => merged.add(key));
      return Array.from(merged);
    });
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

  function isNearPoint(playerPos, targetPos) {
    const dx = playerPos.x - targetPos.x;
    const dy = playerPos.y - targetPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist <= TARGET_TOLERANCE;
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
      const clickedPoint = { x: boundedX, y: boundedY };

      setZoomedPlotCell(getMajorPlotCell(clickedPoint));
      setZoomPlotPoint(null);
      setZoomProtractorPos({
        x: PLOT_ZOOM_PIXEL_SIZE / 2 - 110,
        y: PLOT_ZOOM_PIXEL_SIZE / 2 - 110,
      });
      setIsPlotZoomOpen(true);
      setMessage(`Zoomed in. Plot ${getPlotLabel(selectedPointToPlot)} and confirm.`);
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
    const distanceMeters = Number(selectedDistance);
    const distance = distanceMeters / METERS_PER_MAP_UNIT;

    if (Number.isNaN(azimuth) || Number.isNaN(distanceMeters) || distanceMeters <= 0) {
      setMessage("Enter a valid azimuth and distance in meters.");
      return;
    }

    const startPos = { x: player.x, y: player.y };
    const endPos = moveByAzimuth(player.x, player.y, azimuth, distance);

    setPlayer((prev) => ({
      ...prev,
      routeHistory: [
        ...prev.routeHistory,
        { from: startPos, to: endPos, azimuth, distance, distanceMeters },
      ],
    }));

    animateMovement(startPos, endPos, 1000, (finalPos) => {
      if (!currentTarget) return;

      if (isNearPoint(finalPos, currentTarget)) {
        const cell = getGridCell(finalPos);
        const marker = clampPointToSearchCell({ x: finalPos.x, y: finalPos.y }, cell);
        setGamePhase("searching");
        setSearchCenter({ x: finalPos.x, y: finalPos.y });
        setSearchCell(cell);
        setSearchMarker(marker);
        setSearchPath([]);
        setSearchAttempts(0);
        setSearchResult(null);
        setSearchVisitedCells([]);
        setZoomFoundPoint(null);
        markVisitedCellsAroundPoint(marker, SEARCH_REVEAL_RADIUS_CELLS, cell);
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
    // setSearchVisitedCells([]);
    markVisitedCellsAroundPoint(clamped, SEARCH_REVEAL_RADIUS_CELLS, searchCell);
    setMessage("Search position updated. Select a technique and run search.");
  }

  function runSearchTechnique() {
    if (!searchMarker || !searchCell || !currentTarget || isSearchAnimating) return;

    cancelSearchAnimation();
    setZoomFoundPoint(null);
    const path = buildSelectedSearchPath(searchPattern, searchMarker, searchCell);
    setSearchPath(path);
    setIsSearchAnimating(true);
    setSearchResult(null);
    // setSearchVisitedCells([]);
    markVisitedCellsAroundPoint(path[0], SEARCH_REVEAL_RADIUS_CELLS, searchCell);

    const finishFound = () => {
      const updatedTargets = session.targetPoints.map((target, targetIndex) =>
        targetIndex === currentTargetIndex ? { ...target, found: true } : target
      );

      setSession((prev) => ({
        ...prev,
        targetPoints: updatedTargets,
      }));

      cancelSearchAnimation();
      setIsSearchAnimating(false);
      setSearchAttempts((prev) => prev + 1);
      setSearchResult("found");
      setPendingFoundTarget({
        id: currentTarget.id,
        isFinal: currentTargetIndex === POINT_COUNT - 1,
      });
      setMessage(`Point ${currentTarget.id} found. Confirm to continue.`);
    };

    const finishNotFound = () => {
      setIsSearchAnimating(false);
      setSearchAttempts((prev) => prev + 1);
      setSearchResult("not_found");
      setMessage("Search complete. Point not found. Reposition and try another technique.");
    };

    function animateSegment(segmentIndex) {
      if (segmentIndex >= path.length - 1) {
        finishNotFound();
        return;
      }

      const startPoint = path[segmentIndex];
      const endPoint = path[segmentIndex + 1];
      const segmentDistance = distanceBetween(startPoint, endPoint);
      const duration = Math.max(220, segmentDistance * 140);
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPoint = {
          x: startPoint.x + (endPoint.x - startPoint.x) * progress,
          y: startPoint.y + (endPoint.y - startPoint.y) * progress,
        };

        setSearchMarker(currentPoint);
        markVisitedCellsAroundPoint(currentPoint, SEARCH_REVEAL_RADIUS_CELLS, searchCell);

        if (searchPointFound(currentPoint, currentTarget)) {
          setZoomFoundPoint({
            x: currentTarget.x,
            y: currentTarget.y,
            id: currentTarget.id,
          });

          setSearchResult("found");
          setIsSearchAnimating(false);
          cancelSearchAnimation();
          finishFound();
          return;
        }

        if (progress < 1) {
          searchAnimationRef.current = requestAnimationFrame(step);
        } else {
          animateSegment(segmentIndex + 1);
        }
      }

      searchAnimationRef.current = requestAnimationFrame(step);
    }

    animateSegment(0);
  }


  function acknowledgeFoundPoint() {
    if (!pendingFoundTarget) return;

    const { id, isFinal } = pendingFoundTarget;
    setPendingFoundTarget(null);
    resetSearchState();

    if (isFinal) {
      setGamePhase("complete");
      setMessage(`Point ${id} found. Lane complete.`);
    } else {
      setCurrentTargetIndex((prev) => prev + 1);
      setGamePhase("navigating");
      setMessage(`Point ${id} found. Move to Point ${id + 1}.`);
    }
  }

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", fontFamily: "Arial, sans-serif", position: "relative" }}>

      {pendingFoundTarget && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              border: "2px solid black",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              padding: "20px",
              width: "320px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Point Found</h3>
            <p>
              You found Point {pendingFoundTarget.id}.
            </p>
            <button
              onClick={acknowledgeFoundPoint}
              style={{ width: "100%", padding: "10px" }}
            >
              {pendingFoundTarget.isFinal ? "Complete Lane" : "Continue"}
            </button>
          </div>
        </div>
      )}

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
          {majorXLabels.map((value) => (
            <div
              key={`major-x-${value}`}
              style={{
                position: "absolute",
                left: MAP_LEFT_OFFSET + value * MAJOR_BOX_SIZE - 10,
                top: -4,
                width: 20,
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "bold",
                zIndex: 10,
              }}
            >
              {String(value).padStart(2, "")}
            </div>
          ))}
          {majorYLabels.map((value) => (
            <div
              key={`major-y-${value}`}
              style={{
                position: "absolute",
                left: MAP_LEFT_OFFSET - 28,
                top: MAP_TOP_OFFSET + MAP_PIXEL_HEIGHT - value * MAJOR_BOX_SIZE - 8,
                width: 24,
                textAlign: "right",
                fontSize: "14px",
                fontWeight: "bold",
                zIndex: 10,
              }}
            >
              {String(value).padStart(2, "")}
            </div>
          ))}
          {/*MAIN MAP */}
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
              linear-gradient(to right, rgba(0,0,0,0.6) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.6) 1px, transparent 1px),
                url(${mapImg})
              `,
              backgroundSize: `
              ${MINOR_GRID_SIZE}px ${MINOR_GRID_SIZE}px,
              ${MINOR_GRID_SIZE}px ${MINOR_GRID_SIZE}px,
              100% 100%
              `,
              backgroundPosition: "0 0, 0 0, 0 0",
              backgroundRepeat: "repeat, repeat, no-repeat",
              // backgroundSize: `${GRID_INTERVAL * CELL_SIZE}px ${GRID_INTERVAL * CELL_SIZE}px`,
              cursor: gamePhase === "plotting" ? "crosshair" : "default",
              overflow: "hidden",
            }}
          >

            {/* 5x5 major grid overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
                backgroundImage: `
        linear-gradient(to right, black 4px, transparent 4px),
        linear-gradient(to bottom, black 4px, transparent 4px)
      `,
                backgroundSize: `${MAJOR_BOX_SIZE}px ${MAJOR_BOX_SIZE}px`,
              }}
            />
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
            {/*player icon*/}
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

          {isPlotZoomOpen && zoomedPlotCell && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: MAP_LEFT_OFFSET,
                  top: MAP_TOP_OFFSET,
                  width: MAP_PIXEL_WIDTH,
                  height: MAP_PIXEL_HEIGHT,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  zIndex: 25,
                }}
              />

              <div
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const localX = event.clientX - rect.left;
                  const localY = event.clientY - rect.top;

                  const mapX =
                    zoomedPlotCell.startX +
                    (localX / PLOT_ZOOM_PIXEL_SIZE) * PLOT_ZOOM_MAP_UNITS;

                  const mapY =
                    zoomedPlotCell.endY -
                    (localY / PLOT_ZOOM_PIXEL_SIZE) * PLOT_ZOOM_MAP_UNITS;

                  setZoomPlotPoint({
                    x: Math.max(0, Math.min(MAP_WIDTH, Math.round(mapX))),
                    y: Math.max(0, Math.min(MAP_HEIGHT, Math.round(mapY))),
                  });
                }}
                style={{
                  position: "absolute",
                  left: MAP_LEFT_OFFSET + (MAP_PIXEL_WIDTH - PLOT_ZOOM_PIXEL_SIZE) / 2,
                  top: MAP_TOP_OFFSET + (MAP_PIXEL_HEIGHT - PLOT_ZOOM_PIXEL_SIZE) / 2,
                  width: PLOT_ZOOM_PIXEL_SIZE,
                  height: PLOT_ZOOM_PIXEL_SIZE,
                  border: "3px solid black",
                  backgroundColor: "white",
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.45) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.45) 1px, transparent 1px),
                    url(${mapImg})
                  `,
                  backgroundSize: `
                    ${MINOR_GRID_SIZE * PLOT_ZOOM_SCALE}px ${MINOR_GRID_SIZE * PLOT_ZOOM_SCALE}px,
                    ${MINOR_GRID_SIZE * PLOT_ZOOM_SCALE}px ${MINOR_GRID_SIZE * PLOT_ZOOM_SCALE}px,
                    ${MAP_PIXEL_WIDTH * PLOT_ZOOM_SCALE}px ${MAP_PIXEL_HEIGHT * PLOT_ZOOM_SCALE}px
                  `,
                  backgroundPosition: `
                    0 0,
                    0 0,
                    -${zoomedPlotCell.startX * CELL_SIZE * PLOT_ZOOM_SCALE}px
                    -${(MAP_HEIGHT - zoomedPlotCell.endY) * CELL_SIZE * PLOT_ZOOM_SCALE}px
                  `,
                  backgroundRepeat: "repeat, repeat, no-repeat",
                  overflow: "hidden",
                  cursor: "crosshair",
                  zIndex: 30,
                }}
              >
                <img
                  src={protractorImg}
                  alt="Protractor"
                  style={{
                    position: "absolute",
                    left: zoomProtractorPos.x,
                    top: zoomProtractorPos.y,
                    width: 2100,
                    transform: "translate(-57%, -57%)",
                    opacity: 0.75,
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                />

                {zoomPlotPoint && (() => {
                  const markerX =
                    ((zoomPlotPoint.x - zoomedPlotCell.startX) / PLOT_ZOOM_MAP_UNITS) *
                    PLOT_ZOOM_PIXEL_SIZE;

                  const markerY =
                    ((zoomedPlotCell.endY - zoomPlotPoint.y) / PLOT_ZOOM_MAP_UNITS) *
                    PLOT_ZOOM_PIXEL_SIZE;

                  return (
                    <div
                      style={{
                        position: "absolute",
                        left: markerX - 6,
                        top: markerY - 6,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: POINT_COLORS[selectedPointToPlot] || "red",
                        border: "2px solid black",
                        boxShadow: "0 0 6px white",
                        zIndex: 4,
                        pointerEvents: "none",
                      }}
                    />
                  );
                })()}

                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    bottom: 10,
                    right: 10,
                    display: "flex",
                    gap: "10px",
                    zIndex: 5,
                  }}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      closePlotZoom();
                      setMessage("Zoom plotting cancelled.");
                    }}
                    style={{ flex: 1, padding: "10px" }}
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!zoomPlotPoint}
                    onClick={(event) => {
                      event.stopPropagation();

                      if (!zoomPlotPoint) return;

                      const newPlot = {
                        key: selectedPointToPlot,
                        x: zoomPlotPoint.x,
                        y: zoomPlotPoint.y,
                      };

                      setPlottedPoints((prev) => {
                        const filtered = prev.filter((p) => p.key !== selectedPointToPlot);
                        return [...filtered, newPlot];
                      });

                      closePlotZoom();
                      setMessage(`Plotted ${getPlotLabel(selectedPointToPlot)}. Select the next point to plot.`);
                    }}
                    style={{ flex: 1, padding: "10px" }}
                  >
                    Confirm Plot
                  </button>
                </div>
              </div>
            </>
          )}

          {gamePhase === "searching" && searchCell && !isPlotZoomOpen && (
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
                    backgroundColor: "#9d9d9d",
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.35) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.35) 1px, transparent 1px),
                      url(${mapImg})
                    `,
                    backgroundSize: `
                      ${SEARCH_CANVAS_WIDTH / GRID_INTERVAL}px ${SEARCH_CANVAS_HEIGHT / GRID_INTERVAL}px,
                      ${SEARCH_CANVAS_WIDTH / GRID_INTERVAL}px ${SEARCH_CANVAS_HEIGHT / GRID_INTERVAL}px,
                      ${MAP_PIXEL_WIDTH * (SEARCH_CANVAS_WIDTH / (GRID_INTERVAL * CELL_SIZE))}px
                      ${MAP_PIXEL_HEIGHT * (SEARCH_CANVAS_HEIGHT / (GRID_INTERVAL * CELL_SIZE))}px
                    `,
                    backgroundPosition: `
                      0 0,
                      0 0,
                      -${searchCell.startX * CELL_SIZE * (SEARCH_CANVAS_WIDTH / (GRID_INTERVAL * CELL_SIZE))}px
                      -${(MAP_HEIGHT - searchCell.endY - 1) * CELL_SIZE * (SEARCH_CANVAS_HEIGHT / (GRID_INTERVAL * CELL_SIZE))}px
                    `,
                    backgroundRepeat: "repeat, repeat, no-repeat",
                  }}
                >
                  {Array.from({ length: GRID_INTERVAL * GRID_INTERVAL }).map((_, index) => {
                    const cellX = index % GRID_INTERVAL;
                    const cellY = Math.floor(index / GRID_INTERVAL);
                    const key = `${cellX}-${cellY}`;

                    if (searchVisitedCells.includes(key)) return null;

                    return (
                      <div
                        key={key}
                        style={{
                          position: "absolute",
                          left: cellX * (SEARCH_CANVAS_WIDTH / GRID_INTERVAL),
                          top: (GRID_INTERVAL - 1 - cellY) * (SEARCH_CANVAS_HEIGHT / GRID_INTERVAL),
                          width: SEARCH_CANVAS_WIDTH / GRID_INTERVAL,
                          height: SEARCH_CANVAS_HEIGHT / GRID_INTERVAL,
                          backgroundColor: "rgba(80,80,80,0.45)",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      />
                    );
                  })}

                  {searchPath.map((point, index) => {
                    if (index === 0) return null;
                    const prev = searchPath[index - 1];
                    const startPoint = toOverlayPoint(prev, searchCell);
                    const endPoint = toOverlayPoint(point, searchCell);
                    const length = Math.sqrt((endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2);
                    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * (180 / Math.PI);

                    return (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          left: startPoint.x,
                          top: startPoint.y,
                          width: length,
                          height: 2,
                          backgroundColor: "rgba(220, 40, 40, 0.65)",
                          transformOrigin: "0 0",
                          transform: `rotate(${angle}deg)`,
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                      />
                    );
                  })}
                  {zoomFoundPoint && searchCell && (() => {
                    const foundPoint = toOverlayPoint(zoomFoundPoint, searchCell);

                    return (
                      <>
                        <div
                          style={{
                            position: "absolute",
                            left: foundPoint.x - 12,
                            top: foundPoint.y - 12,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            border: "2px solid gold",
                            boxShadow: "0 0 12px gold",
                            zIndex: 7,
                            pointerEvents: "none",
                          }}
                        />

                        <div
                          style={{
                            position: "absolute",
                            left: foundPoint.x - 6,
                            top: foundPoint.y - 6,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "gold",
                            border: "2px solid black",
                            zIndex: 8,
                            pointerEvents: "none",
                          }}
                        />
                      </>
                    );
                  })()}
                  {searchMarker && (() => {
                    const markerPoint = toOverlayPoint(searchMarker, searchCell);
                    const circleWidth = (SEARCH_ICON_RADIUS_UNITS * 2 / GRID_INTERVAL) * SEARCH_CANVAS_WIDTH;
                    const circleHeight = (SEARCH_ICON_RADIUS_UNITS * 2 / GRID_INTERVAL) * SEARCH_CANVAS_HEIGHT;
                    return (
                      <>
                        <div
                          style={{
                            position: "absolute",
                            left: markerPoint.x - circleWidth / 2,
                            top: markerPoint.y - circleHeight / 2,
                            width: circleWidth,
                            height: circleHeight,
                            borderRadius: "50%",
                            border: "2px dashed orange",
                            backgroundColor: "rgba(255,165,0,0.10)",
                            zIndex: 3,
                            pointerEvents: "none",
                          }}
                        />

                        <div
                          style={{
                            position: "absolute",
                            left: markerPoint.x,
                            top: markerPoint.y,
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
                      </>
                    );
                  })()}
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
            placeholder="Distance in meters"
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
            <p>The orange circle moves with your search icon, and cleared boxes show where the search has already covered.</p>
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
                <p style={{ margin: 0 }}>Distance: {route.distanceMeters} meters</p>
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
