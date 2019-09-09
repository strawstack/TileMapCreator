class State {
    constructor() {
        this.p = {
            "rows": 16,
            "cols": 16,
            "cell": {
                "size": 25, // pixels
                "color": "#777"
            },
            "grid": {},
            "mouse": {
                "target": undefined, // Element in focus on mousedown event
                "isDown": false
            },
            "showGrid": true,
            "erase": false
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
            "erase": this.p.erase
        }
        return new_state;
    }
}

/*
* Global state
*/
let _state = new State();
function getState() {
    return _state;
}
function pushState(state) {
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
function clickEvent(e) {
    let _state = getState();
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
        }
    }

    pushState(_state);
    renderState(_state);
}
function bindEventListeners(cell) {
    cell.addEventListener('click', (e) => clickEvent(e));
    cell.addEventListener('mousedown', (e) => {
        let _state = getState();
        _state.p.mouse.isDown = true;
        _state.p.mouse.target = e.target;
        pushState(_state);
    });
    cell.addEventListener('mouseup', (e) => {
        let _state = getState();
        if (e.target.isSameNode(_state.p.mouse.target)) {
            clickEvent(e);
        }
        _state.p.mouse.isDown = false;
        _state.p.mouse.target = undefined;
        pushState(_state);
    });
    cell.addEventListener('mousemove', (e) => {
        if (getState().p.mouse.isDown) {
            clickEvent(e);
        }
    });
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
}

function main(state) {

    state.p.cell.color = document.querySelector(".current-tile").value;
    document.querySelector(".current-tile").addEventListener('change', (e) => {
        let _state = getState();
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
        let text = document.querySelector(".svg-container").innerHTML;
        let input = document.querySelector(".export-container");
        input.value = text;
        input.select();
        document.execCommand("copy");
    });

    document.querySelector(".menu-button.hex").addEventListener('click', (e) => {
        let hex = prompt("Enter hex value", "34a45b");
        let color = "#" + hex;
        document.querySelector(".current-tile").value = color;
        let _state = getState();
        _state.p.cell.color = color;
        pushState(_state);
        renderState(_state);
    });

    document.querySelector(".update-button").addEventListener('click', (e) => {
        let rows = document.querySelector("#rows-input").value;
        let cols = document.querySelector("#cols-input").value;
        let size = document.querySelector("#size-input").value;
        let _state = getState();
        _state.p.rows = parseInt(rows);
        _state.p.cols = parseInt(cols);
        _state.p.cell.size = parseInt(size);
        pushState(_state);
        renderState(_state);
    });

    renderState(state);
}

window.onload = () => main(_state);
