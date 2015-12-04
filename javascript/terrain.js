

var H = 1.8; // this is the smoothness constant higher == smoother need some sort of keyboard control


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
    var i;
    var sum = 0.0;
    var distance = Math.max(Math.abs(values[0].x - values[1].x), Math.abs(values[0].y - values[1].y));
    var max = 0;
    var min = 1000;

    for (i = 0; i < values.length; i ++)
    {
        sum += grid [values[i].x] [values[i].y];
        if (grid [values[i].x] [values[i].y] > max)    { max = grid [values[i].x] [values[i].y]}
        if (grid [values[i].x] [values[i].y] < min)    { min = grid [values[i].x] [values[i].y]}
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
                bottom_left  = new Coordinate (start.x + (side_length * k), start.y + (side_length * j))
                top_left      = new Coordinate (bottom_left.x, bottom_left.y + side_length);
                top_right      = new Coordinate (bottom_left.x + side_length, bottom_left.y + side_length);
                bottom_right = new Coordinate (bottom_left.x + side_length, bottom_left.y);

                left_edge     =  new Coordinate (bottom_left.x,                 bottom_left.y + half_length);
                right_edge     =  new Coordinate (bottom_left.x + side_length, bottom_left.y + half_length);
                bottom_edge    =  new Coordinate (bottom_left.x + half_length, bottom_left.y);
                top_edge     =  new Coordinate (bottom_left.x + half_length, bottom_left.y + side_length);
                center         =  new Coordinate (bottom_left.x + half_length, bottom_left.y + half_length);

                /* Assign values of edge points */
                grid [left_edge.x] [left_edge.y]      =    variedAverage (grid, scale, [bottom_left, top_left]);
                grid [right_edge.x] [right_edge.y]      =     variedAverage (grid, scale, [bottom_right, top_right]);
                grid [top_edge.x] [top_edge.y]          =     variedAverage (grid, scale, [top_left, top_right]);
                grid [bottom_edge.x] [bottom_edge.y] =    variedAverage (grid, scale, [bottom_left, bottom_right]);

                grid [center.x] [center.y] = variedAverage (grid, scale, [bottom_left, top_left, top_right, bottom_right]);
            }

        }
    }

}






function generate()
{
    main();
}



function main()
{
    window.onkeypress = handleKeyPress;
    var i;
    var steps = 9;  /* Assign grid size here can handle up to 9 reasonably well  10 takes like 30 seconds, but loks great*/
    var gridSize = 2;

    for(i = 0; i < steps; i ++)
    {
        gridSize = ( 2 * gridSize ) - 1;
    }




    var start = new Coordinate(0, 0);

    /* create a grid */
    var Grid = new Array(gridSize);
    for(i = 0; i < gridSize; i++)
    {
        Grid[i] = new Array(gridSize)
    }

    /* Assign inital corner values. Should be randomly generated */
    Grid[0][0] = randomNormal(10, gridSize/4);
    Grid[0][gridSize-1] =randomNormal(10, gridSize/4);
    Grid[gridSize-1][0] = randomNormal(10, gridSize/16);
    Grid[gridSize-1][gridSize-1] = randomNormal(10, gridSize/16);

    /* 2.5 = maxHeight / 4 */
    BFHeights (start, (gridSize - 1), gridSize / 2, Grid, steps);
    //generateHeights(start, (gridSize - 1), gridSize / 2, Grid, steps);

    //gridToConsole(Grid);

    // prepare data for use by Three.js
    var geometry = prepareData(Grid);
    // render!
    render(geometry, gridSize);


}


