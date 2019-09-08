# TileMapCreator

A single file tile map creator that lets you copy SVG data on creation

# TODO

- [x] Populate "grid-container" with the correct number of cells
    - [x] Use CSS grids to position
    - [x] On click add element to SVG underlay group at correct coordinate
- [x] Create one state object. Components should render based on this
- [x] SVG grid in background
    - [x] grid of squares with light-grey dotted lines
    - [x] 16x16 off the start configurable to any size
    - [x] grid and colored cells are diff group components
- [x] Click places a tile
- [x] One state object
- [x] Event driven

- [ ] Design buttons for menu area
- [ ] Render buttons from state
- [ ] Menu area hovers left side of the screen, two columns of icon buttons
    - [ ] Button name appears on hover
- [ ] Tiles can be textured with a 64 bit string of a 100x100 to 800x800 image
    - [ ] Menu button pops up window asking for string
    - [ ] Place new texture in recently used colors area
- [ ] Shift-click edits tile meta-data

- [ ] Mouse scroll zooms in and out
- [ ] Mouse pan scrolls view

# UI

- [ ] Current tile display
- [ ] Color selector
- [ ] Recent tiles

- [ ] Copy HTML to clipboard button (copy the colored cell group to clipboard)
- [ ] Specify voxel size
- [ ] Specify x and y dimensions

- [ ] Show/hide gridlines option
- [ ] Toggle on eraser
- [ ] Undo button
