class State {
    constructor() {
        this.p = {
            "rows": 16,
            "cols": 16,
            "cell": {
                "size": 25, // pixels
                "color": "#777777"
            },
            "grid": {},
            "mouse": {
                "target": undefined, // Element in focus on mousedown event
                "isDown": false
            },
            "showGrid": true,
            "erase": false,
            "recentTiles": []
        };
    }
    copyGrid() {
        let new_grid = {};
        for (let key in this.p.grid) {
            new_grid[key] = this.p.grid[key].cloneNode(false);
        }
        return new_grid;
    }
    copy() {
        let new_state = new State();
        new_state.p = {
            "rows": this.p.rows,
            "cols": this.p.cols,
            "cell": {
                "size": this.p.cell.size,
                "color": this.p.cell.color
            },
            "grid": this.copyGrid(),
            "mouse": {
                "target": this.p.mouse.target,
                "isDown": this.p.mouse.isDown
            },
            "showGrid": this.p.showGrid,
            "erase": this.p.erase,
            "recentTiles": this.p.recentTiles
        }
        return new_state;
    }
}

/*
* Global state
*/
let _state = new State();
let undo = [_state];
function getState() {
    return _state.copy();
}
function pushState(state) {
    state = state.copy();
    _state.p = state.p;
}

/*
* Actions
*/
function action_setCanvasSize(state, rows, cols) {
    let new_state = state.copy();
    new_state.p.rows = rows;
    new_state.p.cols = cols;
    new_state = _action_populateGrid(new_state);
    return new_state;
}
function action_setCellSize(state, size) {
    let new_state = state.copy();
    new_state.p.cell.size = size;
    new_state = _action_populateGrid(new_state);
    return new_state;
}
function action_addTile(state, tile) {
    let new_state = state.copy();
    let key = getKeyFromTile(tile);
    new_state.p.grid[key] = tile;
    return new_state;
}
function action_removeTile(state, tile) {
    let new_state = state.copy();
    let key = getKeyFromTile(tile);
    delete new_state.p.grid[key];
    return new_state;
}
function action_recentTile(state, tile) {
    let new_state = state.copy();
    let recentTiles = new_state.p.recentTiles;
    if (recentTiles.length >= 18) new_state.p.recentTiles.pop();

    // Only insert the tile if the previous one is a different color
    if (recentTiles.length > 0) {
        if (tile.getAttribute("fill") !== recentTiles[0].getAttribute("fill")) {
            new_state.p.recentTiles.unshift(tile.cloneNode(false));
        }
    } else {
        new_state.p.recentTiles.unshift(tile.cloneNode(false));
    }
    return new_state;
}
function _action_clearGrid(state) {
    let new_state = state.copy();
    new_state.p.grid = [];
    return new_state;
}
function _action_populateGrid(state) {
    let new_state = state.copy();
    _action_clearGrid(new_state);
    for (let i=0; i < new_state.p.rows * new_state.p.cols; i++) {
        let tile = makeTile(new_state);
        new_state = action_addTile(new_state, tile);
    }
    return new_state;
}

/*
* Helper functions
*/
function stateHasTile(state, tile) {
    return getKeyFromTile(tile) in state.p.grid;
}
function getKeyFromTile(tile) {
    let row = tile.dataset.row;
    let col = tile.dataset.col;
    return row + "-" + col;
}
function makeGridCell(state, row, col) {
    let div = document.createElement("div");
    div.className = "grid-cell";
    div.setAttribute("data-row", row);
    div.setAttribute("data-col", col);
    div.style.height = state.p.cell.size - 1 + "px"; // Subtract border of 1px
    div.style.width  = state.p.cell.size - 1 + "px";
    return div;
}
function makeRecentTile(tile) {
    let div = document.createElement("div");
    div.className = "recent-tile"
    div.style.background = tile.getAttribute("fill");
    return div;
}
function makeTile(state, row, col) {
    var n = "http://www.w3.org/2000/svg";
    let tile = document.createElementNS(n, "rect");
    tile.setAttributeNS(null, "data-row", row);
    tile.setAttributeNS(null, "data-col", col);
    tile.setAttributeNS(null, "x", col * state.p.cell.size);
    tile.setAttributeNS(null, "y", row * state.p.cell.size);
    tile.setAttributeNS(null, "width", state.p.cell.size);
    tile.setAttributeNS(null, "height", state.p.cell.size);
    tile.setAttributeNS(null, "fill", state.p.cell.color);
    return tile;
}
function RGBToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;
  return "#" + r + g + b;
}
function clickEvent(e, _state) {

    let row = e.target.dataset.row;
    let col = e.target.dataset.col;
    let tile = makeTile(_state, row, col);

    if (_state.p.erase) {
        // Erase the tile if it exists
        if (stateHasTile(_state, tile)) {
            _state = action_removeTile(_state, tile);
        }

    } else {
        // Add the tile if it does not exist
        if (!stateHasTile(_state, tile)) {
            _state = action_addTile(_state, tile);
            _state = action_recentTile(_state, tile);
        }
    }
    return _state;
}
function bindEventListeners(cell) {
    cell.addEventListener('mousedown', (e) => {
        let _state = getState();
        _state.p.mouse.isDown = true;
        _state.p.mouse.target = e.target;
        pushState(_state);
    });
    cell.addEventListener('mouseup', (e) => {
        let _state = getState();
        if (e.target.isSameNode(_state.p.mouse.target)) {
            let before_state = _state.copy();
            _state = clickEvent(e, _state);
            if (Object.keys(before_state.p.grid).length !== Object.keys(_state.p.grid).length) {
                before_state.p.mouse.isDown = false;
                before_state.p.mouse.target = undefined;
                _ = undoPush(before_state);
            }
        }
        _state.p.mouse.isDown = false;
        _state.p.mouse.target = undefined;
        pushState(_state);
        renderState(_state);
    });
    cell.addEventListener('mousemove', (e) => {
        let _state = getState();
        if (_state.p.mouse.isDown) {
            let before_state = _state.copy();
            _state = clickEvent(e, _state);
            if (Object.keys(before_state.p.grid).length !== Object.keys(_state.p.grid).length) {
                before_state.p.mouse.isDown = false;
                _ = undoPush(before_state);
            }
        }
        pushState(_state);
        renderState(_state);
    });
}
function undoPush(state) {
    undo.push(state);
    return state.copy();
}

function renderState(state) {

    // Ref cell grid
    const grid = document.querySelector(".grid-cell-container");
    const svg  = document.querySelector("#svg");

    // Adjust rows
    grid.style.gridTemplateRows = `repeat(${state.p.rows}, ${state.p.cell.size + "px"})`;
    grid.style.gridTemplateColumns = `repeat(${state.p.cols}, ${state.p.cell.size + "px"})`;

    // Clear grid
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }

    // Clear SVG
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    // Place grid
    for (let i=0; i < state.p.rows * state.p.cols; i++) {
        let cell = makeGridCell(state, Math.floor(i / state.p.cols), i % state.p.cols);
        bindEventListeners(cell);
        grid.appendChild(cell);
    }

    // Place tiles in svg
    for (let key in state.p.grid) {
        let tile = state.p.grid[key];
        // Update in-case grid dimensions or size change
        tile.setAttributeNS(null, "x", tile.dataset.col * state.p.cell.size);
        tile.setAttributeNS(null, "y", tile.dataset.row * state.p.cell.size);
        tile.setAttributeNS(null, "width", state.p.cell.size);
        tile.setAttributeNS(null, "height", state.p.cell.size);
        svg.appendChild(tile);
    }

    // Set svg viewbox resolution and size
    let h = state.p.rows * state.p.cell.size;
    let w = state.p.cols * state.p.cell.size;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);

    // Gridlines state
    document.querySelector(".grid-cell-container").style.opacity = (state.p.showGrid)?1:0;
    document.querySelector(".menu-button.erase").style.background = (state.p.erase)?"lightsalmon":"lightgrey";

    // Clear recent tiles
    let recent = document.querySelector(".recent-tiles");
    while (recent.firstChild) {
        recent.removeChild(recent.firstChild);
    }

    // Add recent tiles
    for (let tile of state.p.recentTiles) {
        let rt = makeRecentTile(tile);
        rt.addEventListener('click', (e) => {
            let c = rt.style.background.substring(4).split(",").map(x => parseInt(x));
            let color = RGBToHex(c[0], c[1], c[2]);
            document.querySelector(".current-tile").value = color;
            let _state = getState();
            _state.p.cell.color = color;
            pushState(_state);
            renderState(_state);
        });
        recent.appendChild(rt);
    }

    // Set current color
    document.querySelector(".current-tile").value = _state.p.cell.color;
}

function main(state) {

    state.p.cell.color = document.querySelector(".current-tile").value;
    document.querySelector(".current-tile").addEventListener('change', (e) => {
        let _state = getState();
        _state = undoPush(_state);
        _state.p.cell.color = e.target.value;
        pushState(_state);
        renderState(_state);
    });

    document.querySelector(".menu-button.gridlines").addEventListener('click', (e) => {
        let _state = getState();
        _state.p.showGrid = !_state.p.showGrid;
        pushState(_state);
        renderState(_state);
    });

    document.querySelector(".menu-button.erase").addEventListener('click', (e) => {
        let _state = getState();
        _state.p.erase = !_state.p.erase;
        pushState(_state);
        renderState(_state);
    });

    document.querySelector(".menu-button.export").addEventListener('click', (e) => {
        let text = document.querySelector("#svg").outerHTML;
        let input = document.querySelector(".export-container");
        input.value = text;
        input.select();
        document.execCommand("copy");
        alert("SVG tile map copied to clipboard!");
    });

    document.querySelector(".menu-button.hex").addEventListener('click', (e) => {
        let hex = prompt("Enter hex value", "34a45b");
        let color = "#" + hex;
        if (hex === null) color = "#777777";
        document.querySelector(".current-tile").value = color;
        let _state = getState();
        _state = undoPush(_state);
        _state.p.cell.color = color;
        pushState(_state);
        renderState(_state);
    });

    document.querySelector(".update-button").addEventListener('click', (e) => {
        let rows = document.querySelector("#rows-input").value;
        let cols = document.querySelector("#cols-input").value;
        let size = document.querySelector("#size-input").value;
        let _state = getState();
        _state = undoPush(_state);
        _state.p.rows = parseInt(rows);
        _state.p.cols = parseInt(cols);
        _state.p.cell.size = parseInt(size);
        pushState(_state);
        renderState(_state);
    });

    document.querySelector(".menu-button.undo").addEventListener('click', (e) => {
        if (undo.length > 1) {
            let new_state = undo.pop();
            pushState(new_state);
            renderState(new_state);
        }
    });

    renderState(state);
}

window.onload = () => main(_state);
