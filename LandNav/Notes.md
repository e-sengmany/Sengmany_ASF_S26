# Notes so I dont forget

** double tilde on both side sof text will strikethrough

## 27 APR 26
- Need to think where the project is at currently.
- What can it do right now?
  - Users will get a lane with 5 points
  - ~~They can plot the code on a grid (map not input yet)~~
  - Once finished plotting, they can shoot azimuths to get to the next point (going in order)
  - Once in the vicinity of the point a zoomed in searchbox will open and they can pick a technique to find their point

- Questions to answer:
  - What happens when all points are found?
  - Does it reinforce baseline knowledge of land nav?

- What I need to add (not in order)
  - ~~map graphics~~
  - fine tune coordinates
  - user pop up on completion
  - file that holds several different lanes.
  - Make a springboot project and transfer my current files


## 28 APR 26
-Issues found
  - There seems to be too much leniency when in vicinity of the point on the main map. Causes the search to begin outside of the intended radius. So the user can search and never find the point because it is actually much further than the search box.
- need to fine tune the movement. currently the distance is done with map units. Meaning if the user wants to move one grid square it requires 20 map units. How can I make this more accurate to an actual map.
- Need to adjust the current layout of the map grids. i could do an overlay that goes over the current. Which can could make grid box over every 5x5 square.


## 29 APR 26
- Maybe add an easting and northing label to help reinforce that in the user.

- Should the user prompt the search function, instead of it being a pop up?


## 30 APR 26
- Maybe add a patrol simulation setting that has them receive a makeshift OPORD that has OBJ locations. Will require them to pull OBJ GRID and maybe an ORP grid from it. Then they will be designated the pointman and will have to navigate to that point.
- Have form that they have to fill out using the OPORD and that form will serve as their land nav points.
-
