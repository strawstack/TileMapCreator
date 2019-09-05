# TileMapCreator

A single file tile map creator that lets you copy SVG data on creation

# TODO

- [ ] Populate "grid-container" with the correct number of cells
    - [ ] Use CSS grids to position
    - [ ] On click add element to SVG underlay group at correct coordinate

- [ ] Design button in menu area

- [ ] Create one state object. Components should render based on this

- [ ] Menu area hovers left side of the screen, two columns of icon buttons
    - [ ] Button name appears on hover
- [ ] SVG grid in background
    - [ ] grid of squares with light-grey dotted lines
    - [ ] 64x64 off the start configurable to any size
    - [ ] grid and colored cells are diff group components

- [ ] Click places a tile
- [ ] Show hide gridlines option
- [ ] Color can be set with selector
- [ ] Most recent tiles placed are kept in an accessible area
- [ ] Copy HTML to clipboard button (copy the colored cell group to clipboard)
- [ ] Tiles can be textured with a 64 bit string of a 100x100 to 800x800 image
    - [ ] Menu button pops up window asking for string
    - [ ] Place new texture in recently used colors area
- [ ] Shift-click edits tile meta-data
- [ ] Mouse scroll zooms in and out
- [ ] Mouse pan scrolls view
- [ ] Specify voxel size
- [ ] Specify x and y dimensions
- [ ] Toggle on eraser
- [ ] Undo button
- [ ] One state object
- [ ] Event driven
