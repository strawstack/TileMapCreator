class State {
    constructor() {
        this.p = {
            "rows": 16,
            "cols": 16,
            "cell": {
                "size": 25 // pixels
            },
            "grid": []
        };
    }
    copy() {
        let new_state = new State();
        new_state.p = {
            "rows": this.p.rows,
            "cols": this.p.cols,
            "cell": {
                "size": this.p.cell.size
            },
            "grid": this.p.grid.map((e) => e.cloneNode(false))
        }
        return new_state;
    }
}

/*
* Global state
*/
//let _state = new State();

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
function action_addGridCell(state, elem) {
    let new_state = state.copy();
    new_state.p.grid.push(elem);
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
        let cell = makeGridCell(new_state);
        new_state = action_addGridCell(new_state, cell);
    }
    return new_state;
}

/*
* Helper functions
*/
function makeGridCell(state) {
    let div = document.createElement("div");
    div.className = "grid-cell";
    div.style.height = state.p.cell.size + "px";
    div.style.width  = state.p.cell.size + "px";
    return div;
}

function renderState(state) {

    // Ref cell grid
    let grid = document.querySelector(".grid-cell-container");

    // Adjust rows
    grid.style.gridTemplateRows = `repeat(${state.p.rows}, ${state.p.cell.size + "px"})`;
    grid.style.gridTemplateColumns = `repeat(${state.p.cols}, ${state.p.cell.size + "px"})`;

    // Clear grid
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }

    // Place marker cells in grid
    for (let cell of state.p.grid) {
        grid.appendChild(cell);
    }

    // Set svg viewbox resolution
    let svg = document.querySelector("#svg");
    let h = state.p.rows * state.p.cell.size;
    let w = state.p.cols * state.p.cell.size;
    svg.setAttribute("viewBox", `0 0 ${h} ${w}`);
}

function main() {
    let state = new State();
    state = _action_populateGrid(state);
    renderState(state);
}

window.onload = main;
