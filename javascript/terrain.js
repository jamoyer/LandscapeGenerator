// print heights to console [useless for large grids]
function gridToConsole(grid)
{
    var str = "";
    var gridSize = grid.length;

    for(var i = 0; i < gridSize; i++)
    {
        for(var k = 0; k < gridSize; k++)
        {
            str += Math.round(grid[i][k]) + "\t";
        }

        str = "";
    }
}


function Coordinate (x, y)
{
    this.x = x;
    this.y = y;
}



/* Average grid heights and add a randomly distributed normal centered at 0 */
function variedAverage (grid, variation_scale, values)
{
    var sum = 0.0;

    for (var i = 0; i < values.length; i ++)
    {
        sum += grid [values[i].x] [values[i].y];
    }

    var random = randomNormal(0, .33);
    var avg = sum / values.length;

    // create scaling factor height_scale to make high peaks more rough and beaches and the ocean more smooth
    // basically more height = more rough
    // height_level is between 0 and 1
    var height_level = (avg + grid.length / 2) / grid.length;

    var height_scale;
    if(height_level > .8)
    {
        height_scale = 1;
    }
    else
    {
        // scaling equation
        // source: https://docs.google.com/a/iastate.edu/spreadsheets/d/1Ra9ffuAv2Db9lx1uYCne1lHRfD4ETJUAm6id9wkY7jI/edit?usp=sharing
        // height_scale = 3.366*height_level^3 - 1.952*height_level^2 + 0.353*height_level + 0.248
        height_scale = (((3.366 * height_level) - 1.952) * height_level + 0.353) * height_level + 0.248;
    }
    return avg + (random * variation_scale * height_scale);
}

/* Recursively generate height values for 2D terrain array

    Grid side length must be of the sequence 2, 3, 5, 9, 17, 33, 65 ...
    otherwise the recursion will fail at some point
    A(n+1) =  [2 * A(n)] - 1

    O = 4 known corner points
    0 = 4 new edge points and one new center point to assign

half_length         [ start.x , (start.y + sideLength) ]
    |                |
    v                v

    -    -            O     0     O   <-- [ (start.x + sideLength) , (start.y + sideLength) ]
    |    |
    -    |            0     0     0
         |
         -            O     0     O   <-- [ (start.x + sideLength) , start.y ]

        ^            ^
        |            |
side_length      [ start.x, start.y ] <-- bottom_left



     I usually use camelCasing instead of under_scores but thought I'd try something new.
     Do whatever you want I don't have a problem with either


     THis is Depth First, this creates some line problems... try bredth first
 */
function generateHeights (bottom_left, side_length, scale, grid)
{
    /* Calculate values */
    var d = Math.pow(0.5, H/2) * scale; //scale factor
    var half_length = side_length / 2;    //0-indexed 3*3 grid has values 0,1,2 middle value is 1 = side_length / 2
                                        // 9*9 0,1,2,3,4,5,6,7,8


    /* Create Coordinates to reference corner points */
    var top_left      = new Coordinate (bottom_left.x, bottom_left.y + side_length);
    var top_right      = new Coordinate (bottom_left.x + side_length, bottom_left.y + side_length);
    var bottom_right = new Coordinate (bottom_left.x + side_length, bottom_left.y);


    /* Create Coordinates to reference edge and center pionts */
    var left_edge     =  new Coordinate (bottom_left.x,                 bottom_left.y + half_length);
    var right_edge     =  new Coordinate (bottom_left.x + side_length, bottom_left.y + half_length);
    var bottom_edge    =  new Coordinate (bottom_left.x + half_length, bottom_left.y);
    var top_edge     =  new Coordinate (bottom_left.x + half_length, bottom_left.y + side_length);
    var center         =  new Coordinate (bottom_left.x + half_length, bottom_left.y + half_length);

    /* Assign values of edge points */
    grid [left_edge.x] [left_edge.y]      =    variedAverage (grid, d, [bottom_left, top_left]);
    grid [right_edge.x] [right_edge.y]      =     variedAverage (grid, d, [bottom_right, top_right]);
    grid [top_edge.x] [top_edge.y]          =     variedAverage (grid, d, [top_left, top_right]);
    grid [bottom_edge.x] [bottom_edge.y] =    variedAverage (grid, d, [bottom_left, bottom_right]);

    /* Assign values of the center */
    grid [center.x] [center.y] = variedAverage (grid, d, [bottom_left, top_left, top_right, bottom_right]);

    /* Recurse until edge points are only one unit away from corner points */
    if(half_length > 1)
    {
        grid = generateHeights (bottom_left, half_length, d, grid);
        grid = generateHeights (left_edge, half_length, d, grid);
        grid = generateHeights (bottom_edge, half_length, d, grid);
        grid = generateHeights (center, half_length, d, grid);
    }

    return grid;
};

/* prevent sharp edges by defining heights bredth first */
function BFHeights(start, grid_length, scale, grid, steps)
{

    var half_length = side_length / 2;

    var bottom_left, top_left, top_right, bottom_right;
    var left_edge, right_edge, bottom_edge, top_edge, center;

    var side_length;
    var side_lengths_at_level;

    for (var i = 0; i < steps; i ++)
    {
        scale = Math.pow(0.5, H/2) * scale;
        side_lengths_at_level = Math.pow(2,i);
        side_length = grid_length / side_lengths_at_level;
        half_length = side_length / 2;

        for(var k = 0; k < side_lengths_at_level; k++){
            for(var j = 0; j < side_lengths_at_level; j++){
                // get the 4 points bounding this chunk
                bottom_left  = new Coordinate (start.x + (side_length * k), start.y + (side_length * j));
                top_left     = new Coordinate (bottom_left.x,               bottom_left.y + side_length);
                top_right    = new Coordinate (bottom_left.x + side_length, bottom_left.y + side_length);
                bottom_right = new Coordinate (bottom_left.x + side_length, bottom_left.y);

                // get the center points of all the sides of this chunk and the exact center point itself
                left_edge    = new Coordinate (bottom_left.x,               bottom_left.y + half_length);
                right_edge   = new Coordinate (bottom_left.x + side_length, bottom_left.y + half_length);
                bottom_edge  = new Coordinate (bottom_left.x + half_length, bottom_left.y);
                top_edge     = new Coordinate (bottom_left.x + half_length, bottom_left.y + side_length);
                center       = new Coordinate (bottom_left.x + half_length, bottom_left.y + half_length);

                // Assign values to all side centers and the actual center
                // Do not assign values if a value already exists, which happens when this is a border with a neighbor grid
                grid [left_edge.x] [left_edge.y]     = grid [left_edge.x] [left_edge.y]     || variedAverage (grid, scale, [bottom_left, top_left]);
                grid [right_edge.x] [right_edge.y]   = grid [right_edge.x] [right_edge.y]   || variedAverage (grid, scale, [bottom_right, top_right]);
                grid [top_edge.x] [top_edge.y]       = grid [top_edge.x] [top_edge.y]       || variedAverage (grid, scale, [top_left, top_right]);
                grid [bottom_edge.x] [bottom_edge.y] = grid [bottom_edge.x] [bottom_edge.y] || variedAverage (grid, scale, [bottom_left, bottom_right]);
                grid [center.x] [center.y]           = grid [center.x] [center.y]           || variedAverage (grid, scale, [bottom_left, top_left, top_right, bottom_right]);
            }
        }

        // I don't think this has the effect of smoothing like we thought it might.
        // Rescale each point on the grid slightly to remove the grid-like appearance
/*        for(var k = 0; k < side_lengths_at_level; k++){
            for(var j = 0; j < side_lengths_at_level; j++){
                var xPos = start.x + side_length * k;
                var yPos = start.y + side_length * j;
                var point = new Coordinate(xPos, yPos);

                // rescale each grid position by a small random scaling factor
                grid[xPos][yPos] = variedAverage(grid, scale * 0.25, [point, point]);
            }
        }*/
    }
}

function calcGridSize(steps)
{
    // gridSize = 2 * prevGridSize - 1 requires a loop calculating every grid size
    // gridSize = 2^(i+1) - (2^i - 1) is equivalent but does not require loop
    var base = Math.pow(2, steps);
    return 2 * base - (base - 1);
}

function createDoubleArr(gridSize)
{
    var grid = new Array(gridSize);

    for(var i = 0; i < gridSize; i++)
    {
        grid[i] = new Array(gridSize)
    }

    return grid;
}

function createGrid(steps, gridSize, neighbors, preGrid)
{
    var start = new Coordinate(0, 0);
    var grid = createDoubleArr(gridSize);

    if (!preGrid){
        if (neighbors)
        {
            if (neighbors.east)
            {
                // if the east neighbor exists, make the east border match the neighbor's west
                grid[gridSize-1] = neighbors.east[0];
            }

            if (neighbors.west)
            {
                // if the west neighbor exists, make the west border match the neighbor's east
                grid[0] = neighbors.west[gridSize-1];
            }

            if (neighbors.north)
            {
                // if the north neighbor exists, make the north border match the neighbor's south
                for (var i=0; i<gridSize; i++)
                {
                    grid[i][gridSize-1] = neighbors.north[i][0];
                }
            }

            if (neighbors.south)
            {
                // if the south neighbor exists, make the south border match the neighbor's north
                for (var i=0; i<gridSize; i++)
                {
                    grid[i][0] = neighbors.south[i][gridSize-1];
                }
            }
        }

        // set the corners that are still not set yet
        /* Assign inital corner values. Should be randomly generated */
        grid[0][0]                      = grid[0][0]                    || randomNormal(10, gridSize/4);
        grid[0][gridSize-1]             = grid[0][gridSize-1]           || randomNormal(10, gridSize/4);
        grid[gridSize-1][0]             = grid[gridSize-1][0]           || randomNormal(10, gridSize/4);
        grid[gridSize-1][gridSize-1]    = grid[gridSize-1][gridSize-1]  || randomNormal(10, gridSize/4);
    }else{
        var scale = (gridSize-1) / (preGrid.length - 1);
        for(var i = 0; i < preGrid.length; i ++)
        {
            for(var j = 0; j < preGrid.length; j ++)
            {
                grid[Math.floor(i * scale)][Math.floor(j * scale)] = preGrid[i][j];
            }
        }
    }

    var before = Date.now();
    /* 2.5 = maxHeight / 4 */
    BFHeights (start, (gridSize - 1), gridSize / 2, grid, steps);
    var after = Date.now();
    console.log("Time to generate heights:" + (after-before));

    //gridToConsole(grid);

    return grid;
}
