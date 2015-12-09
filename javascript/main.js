var SEED = 0;

$("#terrainControls").submit(function()
{
    this.submit();
    location.reload();    
});


function getUrlParams()
{
    // parse the url parameters
    var urlParams; // url params will be inside this object
    (window.onpopstate = function () {
        var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, " "));
        },
        query  = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query)){
            urlParams[decode(match[1])] = decode(match[2]);
        }
    })();
    return urlParams;
}


function main()
{
    window.onkeypress = handleKeyPress;

    var urlParams = getUrlParams();
    if (urlParams.seed){
        document.getElementById("seed").value = urlParams.seed;
    }
    if (urlParams.smoothness){
        document.getElementById("smoothness").value = urlParams.smoothness;
    }
    if (urlParams.detail_level){
        document.getElementById("detail_level").value = urlParams.detail_level;
    }
    if (urlParams.grids_per_side){
        document.getElementById("grids_per_side").value = urlParams.grids_per_side;
    }
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
        /*
        var preGrid = [
            [randomNormal(10, gridSize/4), randomNormal(10, gridSize/4)],
            [randomNormal(10, gridSize/4), randomNormal(10, gridSize/4)]
        ];
        */
        var preGrid = [
            [1,0.92,0.7,0.601,0.5],
            [0.71,0.8,0.81,0.47,0.19],
            [0.55,0.64,0.9,0.39,-0.1],
            [0.275,0.3,0.25,0.05,-0.33],
            [0,-0.11,-0.2,-0.35,-0.5]
        ]
     
        for(var i = 0; i < preGrid.length; i++)
        {
            for (var j = 0; j < preGrid.length; j++)
            {
                preGrid[i][j] *= 3;
            }
        }

        

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
