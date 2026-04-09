import { useState, useEffect, useRef } from "react";
import protractorImg from "../assets/protractor.png"
import mapImg from "../assets/map.png"

export default function LandNavMiniGame({ onComplete }) {
  //grid sizes
  //const gridSize = 10;
  //Manually set grid to 7x10
  const gridCols = 7;
  const gridRows = 6;

  const cellSize = 100;
  const subGrid = 10; // 10x10 inside each cell

  // const subCellSize = cellSize / subGrid;
  // Moveable Map Ruler
  const [overlayOffset, setOverlayOffset] = useState({ x: 0, y: 0 });

  //map adjustments
  const mapWidth = gridCols * cellSize;
  const mapHeight = gridRows * cellSize;

  const subCellWidth = mapWidth / subGrid;
  const subCellHeight = mapHeight / subGrid;
  //zoom into a grid
  const [zoomedCell, setZoomedCell] = useState(null);

  const protractorSize = mapWidth / 1.5;

  const containerRef = useRef(null);

  const start = { x: 2, y: 2 };
  const target = { x: 7, y: 6 }; // hidden from player

  const [selected, setSelected] = useState(null);
  const [distanceGuess, setDistanceGuess] = useState("");
  const [azimuthGuess, setAzimuthGuess] = useState("");

  //Protractor position state
  const [protractorPos, setProtractorPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  //snap to startpoint
  useEffect(() => {
    setProtractorPos({
      x: start.x * cellSize + cellSize / 2 - protractorSize / 2,
      y: start.y * cellSize + cellSize / 2 - protractorSize / 2
    });
  }, []);

  //Keyboard listener
  useEffect(() => {
    function handleKey(e) {
      const step = 2;

      if (e.key === "ArrowUp") {
        setOverlayOffset(prev => ({ ...prev, y: prev.y - step }));
      }
      if (e.key === "ArrowDown") {
        setOverlayOffset(prev => ({ ...prev, y: prev.y + step }));
      }
      if (e.key === "ArrowLeft") {
        setOverlayOffset(prev => ({ ...prev, x: prev.x - step }));
      }
      if (e.key === "ArrowRight") {
        setOverlayOffset(prev => ({ ...prev, x: prev.x + step }));
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  //Option to show grid
  const [showGrid, setShowGrid] = useState(false);

  //Marker
  const [marker, setMarker] = useState(null);
// marker = { gridX, gridY, subX, subY }

  const globalX = marker
    ? marker.gridX * cellSize + (marker.subX / subGrid) * cellSize
    : 0;

  const globalY = marker
    ? marker.gridY * cellSize + (marker.subY / subGrid) * cellSize
    : 0;
  const [azimuth, setAzimuth] = useState(0);
  const [mousePos, setMousePos] = useState(null);


  // function handleMapClick(e) {
  //   const rect = containerRef.current.getBoundingClientRect();
  //
  //   const mouseX = e.clientX - rect.left;
  //   const mouseY = e.clientY - rect.top;
  //
  //   const x = Math.floor(mouseX / cellSize);
  //   const y = Math.floor(mouseY / cellSize);
  //
  //   setSelected({ x, y });
  //   setMarker({ x, y });
  // }

  function handleMapClick(e) {
    const rect = containerRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const x = Math.floor(mouseX / cellSize);
    const y = Math.floor(mouseY / cellSize);

    setZoomedCell({ x, y }); // ✅ zoom into this square
  }

  function toMGRS(marker) {
    if (!marker) return "";

    const { gridX, gridY, subX, subY } = marker;

    // Easting (left → right)
    const easting = gridX * 1000 + subX * 100;

    // Northing (bottom → top, so invert Y)
    const northing =
      (gridRows - gridY - 1) * 1000 + (subGrid - subY - 1) * 100;

    // Format to 4-digit style (truncate)
    const eStr = Math.floor(easting / 10).toString().padStart(4, "0");
    const nStr = Math.floor(northing / 10).toString().padStart(4, "0");

    return `${eStr} ${nStr}`;
  }

  function handleSubmit() {
    if (!selected) return;

    const dx = target.x - start.x;
    const dy = target.y - start.y;

    const trueDistance = Math.sqrt(dx * dx + dy * dy) * 100; // meters
    const trueAzimuth =
      (Math.atan2(dx, -dy) * (180 / Math.PI) + 360) % 360;

    const distanceError = Math.abs(trueDistance - distanceGuess);
    const azimuthError = Math.abs(trueAzimuth - azimuthGuess);

    const correct =
      distanceError < 100 && azimuthError < 15 &&
      selected.x === target.x && selected.y === target.y;

    onComplete({
      correct,
      trueDistance,
      trueAzimuth
    });
  }

  function handleMouseDown(e) {
    const rect = containerRef.current.getBoundingClientRect();

    setDragging(true);
    setDragOffset({
      x: e.clientX - rect.left - protractorPos.x,
      y: e.clientY - rect.top - protractorPos.y
    });
  }

  function handleMouseUp() {
    setDragging(false);
  }

  function handleMouseMove(e) {
    const rect = containerRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 🧭 azimuth calculation
    const startX = start.x * cellSize + cellSize / 2;
    const startY = start.y * cellSize + cellSize / 2;

    const dx = mouseX - startX;
    const dy = startY - mouseY;

    const angle = (Math.atan2(dx, dy) * (180 / Math.PI) + 360) % 360;
    setAzimuth(Math.round(angle));

    setMousePos({ x: mouseX, y: mouseY });

    // 📐 dragging logic
    if (dragging) {
      setProtractorPos({
        x: mouseX - dragOffset.x,
        y: mouseY - dragOffset.y
      });
    }
  }

  function renderMainGrid() {
    const cells = [];

    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => setZoomedCell({ x, y })}
            style={{
              width: cellSize,
              height: cellSize,
              border: "1.5px solid black",
              boxSizing: "border-box",
              cursor: "pointer"
            }}
          />
        );
      }
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1
        }}
      >
        {cells}
      </div>
    );
  }

  function renderZoomGrid() {
    const subGrid = 10;
    const subCellSize = (gridCols * cellSize) / subGrid;

    const cells = [];

    for (let y = 0; y < subGrid; y++) {
      for (let x = 0; x < subGrid; x++) {
        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => {
              console.log("Sub-cell:", x, y);
              setMarker({
                gridX: zoomedCell.x,
                gridY: zoomedCell.y,
                subX: x,
                subY: y
              });
            }}
            style = {{
              width: subCellWidth,
              height: subCellHeight,
              border: "1px solid black",
              boxSizing: "border-box"
            }}
          />
        );
      }
    }

    return (
      <div
        style={{
          position: "absolute",
          width: mapWidth,
          height: mapHeight,
          left: 0,
          top: 0,
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex: 2,
          //transform: `translate(${overlayOffset.x}px, ${overlayOffset.y}px)`
        }}
      >
        <button
          onClick={() => setZoomedCell(null)}
          style={{ position: "absolute", zIndex: 3, height: "50px", width: "50px", border: "3px solid red", borderRadius: "20px"}}
        >
          Back
        </button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${subGrid}, ${subCellWidth}px)`,
          }}
        >
          {cells}
        </div>
          {marker && marker.gridX === zoomedCell.x && marker.gridY === zoomedCell.y && (
            <div
              style={{
                position: "absolute",
                left: marker.subX * subCellWidth,
                top: marker.subY * subCellHeight,
                width: 8,
                height: 8,
                backgroundColor: "red",
                borderRadius: "50%",
                zIndex: 5
              }}
            />
          )}
        {/*//Rulers*/}
        <div
          style={{
            position: "absolute",
            transform: `translate(${overlayOffset.x}px, ${overlayOffset.y}px)`,
            zIndex: 4
          }}
        >
          <div
            // Right Ruler
            style={{
              position: "absolute",
              bottom: -(subCellHeight),
              left: 0,
              width: 30,
              height: mapHeight,
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "column",
              zIndex: 4
            }}
          >
            {[...Array(10)].map((_, i) => {
              const value = 10 - i;
              return (
                <div
                  key={i}
                  style={{
                    height: mapHeight,
                    borderTop: "3px solid black",
                    borderLeft: "3px solid black",
                    color: "black",
                    fontSize: "20px",
                    textAlign: "center"
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>
          {/* rulers here */}
          <div
            // Bottom Ruler
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: mapWidth,
              height: subCellHeight,
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "row",
              zIndex: 4
            }}
          >
            {[...Array(10)].map((_, i) => {
              const value = 10 - i;
              return(
                <div
                  key={i}
                  style={{
                    width: mapWidth,
                    borderLeft: "3px solid black",
                    borderBottom: "3px solid black",
                    //borderRight: "3px solid black",
                    color: "black",
                    fontSize: "20px",
                    textAlign: "left"
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>


        </div>

      </div>
    );
  }

  return (
    <div>
      <h2>🗺️ Land Navigation</h2>
      <p>Navigate to Rally Point at 9320 8450, estimate distance (m), and azimuth (°)</p>

      <div ref={containerRef}
        style={{position: "relative",
        width: gridCols * cellSize,
        height: gridRows * cellSize/1.5,
        objectFit:"cover",
        margin: "0 auto",}} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>

        {/* MAP LAYER */}
        <div
          style={{
            position: "absolute",
            width: gridCols * cellSize,
            height: mapHeight,
            top: 0,
            left: 0,
            zIndex: 0,
            border: "2px solid red",
            backgroundImage: `url(${mapImg})`,
            backgroundRepeat: "no-repeat",

            transition: "background-position 0.3s ease, background-size 0.3s ease",

            // 👇 THIS IS THE KEY
            backgroundSize: zoomedCell
              ? `${mapWidth * subGrid}px ${mapHeight * subGrid}px`
              : `${mapWidth}px ${mapHeight}px`,

            backgroundPosition: zoomedCell
              ? `-${zoomedCell.x * cellSize * subGrid}px -${zoomedCell.y * cellSize * subGrid}px`
              : "0 0"
          }}
        />
         {/*GRID LAYER*/}
        {!zoomedCell ? renderMainGrid() : renderZoomGrid()}



        {/* BACK AZIMUTH LINE */}
        {mousePos && (
          <div
            style={{
              position: "absolute",
              left: start.x * cellSize + cellSize /2,
              top: start.y * cellSize + cellSize /2,
              width: 2,
              height: 200,
              backgroundColor: "red",
              transform: `rotate(${azimuth}deg)`,
              transformOrigin: "top center",
              zIndex: 3
            }}
          />
        )}

        {/*/!* PROTRACTOR LAYER *!/*/}
        {/*<img*/}
        {/*  src={protractorImg}*/}
        {/*  onMouseDown={handleMouseDown}*/}
        {/*  style={{*/}
        {/*    position: "absolute",*/}
        {/*    left: protractorPos.x,*/}
        {/*    top: protractorPos.y,*/}
        {/*    width: gridCols * cellSize/1.5,*/}
        {/*    height: gridRows * cellSize/1.5,*/}
        {/*    opacity: 0.8,*/}
        {/*    zIndex: 2,*/}
        {/*    cursor: "grab"*/}
        {/*  }}*/}
        {/*/>*/}

        {/*MARKER*/}
        {marker && (
          <div
            style={{
              position: "absolute",
              left: globalX,
              top: globalY,
              width: 10,
              height: 10,
              backgroundColor: "red",
              borderRadius: "50%",
              zIndex: 5
            }}
          />
        )}
      </div>

      <div style={{ marginTop: "5px" }}>
        <input
          placeholder="Distance (meters)"
          value={distanceGuess}
          onChange={e => setDistanceGuess(Number(e.target.value))}
        />
        <p>Azimuth: {azimuth}°</p>
        <button onClick={() => setAzimuthGuess(azimuth)}>
          Set Azimuth
        </button>
        <p>Reset</p>
        <button onClick={() => setProtractorPos({
          x: start.x * cellSize + cellSize / 2 - protractorSize / 2,
          y: start.y * cellSize + cellSize / 2 - protractorSize / 2
        })}>Reset Protractor</button>
        <button onClick={() => setShowGrid(prev => !prev)}>
          Toggle Grid
        </button>
        <p>MGRS: {toMGRS(marker)}</p>
      </div>

      <button onClick={handleSubmit}>Confirm</button>
    </div>
  );
}
// console.log(mapImg)
