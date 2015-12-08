$('#terrainControls').submit(function () {
	main();
	return false;
});
var SEED = 0;


function main()
{
    window.onkeypress = handleKeyPress;
    
    /* Get values from form*/
    SEED = document.getElementById("seed").value;

        RNG_INSTANCE = new Rng(document.getElementById("seed").value);
    
    /* smoothness constant */
    H = document.getElementById("smoothness").value;
    /* level of detail 9 reasonably well*/
    var detail = document.getElementById("detail_level").value;
	/* number of grids stitched together (side length) */
	var numGridsSquared = document.getElementById("grids_per_side").value;
   
   var masterGrid;
   var gridSize = calcGridSize(detail);
    
    if (numGridsSquared == 0){
        var grid = createDoubleArr(gridSize);
        
        grid[0][0] = 0;
        grid[0][gridSize-1] = 0;
        grid[gridSize-1][0] = 0;
        grid[gridSize-1][gridSize-1] = 0;
        var half = Math.floor(gridSize/2);
        var quart = Math.floor(half/2);
        grid[half][half] = -15;
        grid[quart][quart] = 40;
        grid[half + quart][quart] = 100;
        grid[quart] [half+ quart] = 25;
        grid[half + quart] [half+ quart] = 35;
        
        var preGrid = [
            [0, 0],
            [0, 0]
        ];
        
        masterGrid = createGrid(detail, gridSize, null, preGrid);
    }else{
        // create many grids to make the landscape more interesting
        var grids = [];
        for (var i=0; i<numGridsSquared; i++){
            grids[i] = [];
            for (var j=0; j<numGridsSquared; j++){
                // create neighbors, only south and west will exist due to the
                // order these are being created.
                var neighbors = {
                    south : (j-1 >= 0) ? grids[i][j-1] : null,  // the condition is to not go out of bounds on the array
                    west  : (i-1 >= 0) ? grids[i-1][j] : null   // the condition is to not go out of bounds on the array
                };
                grids[i][j] = createGrid(detail, gridSize, neighbors, null);
            }
        }
    
        // put all the grids together into the master grid
        masterGrid = [];
        for (var i=0; i<numGridsSquared; i++)
        {
            var offset = i * gridSize;
            for (var j=0; j<gridSize; j++)
            {
                // each grid's edges are equal to their neighbors so skip it
                if (j == gridSize-1 && i != numGridsSquared-1)
                {
                    continue;
                }
    
                var mgIndex = masterGrid.length;
                masterGrid[mgIndex] = grids[i][0][j].slice(0, -1);
                for (var k=1; k<numGridsSquared; k++)
                {
                    // dont add the last bit of each strip because the borders of each edge are the same
                    var stripToAdd = (k != numGridsSquared-1) ? grids[i][k][j].slice(0, -1) : grids[i][k][j];
                    masterGrid[mgIndex] = masterGrid[mgIndex].concat(stripToAdd);
                }
            }
        }
    }
    
    
    


    // prepare data for use by Three.js
    var geometry = prepareData(masterGrid);
    // render!
    createScene(geometry,masterGrid.length);//gridSize);
}