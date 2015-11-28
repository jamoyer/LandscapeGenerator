

var H = 1.5; // this is the smoothness constant higher == smoother need some sort of keyboard control


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
		console.log(str);
		console.log();
		str = "";
	}
}


function Coordinate (x, y)
{
	this.x = x;
	this.y = y;
}



/* Potentially replace both of the height calculation functions   - NOT CURRENTLY USED - */
function variedAverage (grid, variation_scale, values)
{
	var i;
	var sum = 0;
	
	for (i = 0; i < values.length; i ++)
	{
		sum += grid [values[i].x] [values[i].y];
	}
	
	var avg = sum / values.length;
	
	var random = Math.random(); /* need to actually get this */
	
	return avg + (random * variation_scale);
}

/* */



/* Recursively generate height values for 2D terrain array

	Grid side length must be of the sequence 2, 3, 5, 9, 17, 33, 65 ...
	otherwise the recursion will fail at some point

	O = 4 known corner points
	0 = 4 new edge points and one new center point to assign
 
half_length	 	[ start.x , (start.y + sideLength) ]
	|				|
	v				v
				
	-	-			O     0     O   <-- [ (start.x + sideLength) , (start.y + sideLength) ]
	|	|
	-	|			0     0     0
		|
		-			O     0     O   <-- [ (start.x + sideLength) , start.y ]
					
		^			^
		|			|
side_length 	 [ start.x, start.y ] <-- bottom_left


 
 	I usually use camelCasing instead of under_scores but thought I'd try something new.  
 	Do whatever you want I don't have a problem with either
 */
function generateHeights (bottom_left, side_length, scale, grid) 
{	
	/* Calculate values */
	var d = Math.pow(0.5, H/2) * scale; //scale factor
	var half_length = side_length / 2;	//0-indexed 3*3 grid has values 0,1,2 middle value is 1 = 3 = side_length / 2
	
	
	/* Create Coordinates to reference corner points */
	var top_left 	 = new Coordinate (bottom_left.x, bottom_left.y + side_length);
	var top_right 	 = new Coordinate (bottom_left.x + side_length, bottom_left.y + side_length);
	var bottom_right = new Coordinate (bottom_left.x + side_length, bottom_left.y);
	
	/* Create Coordinates to reference edge and center pionts */
	var left_edge 	=  new Coordinate (bottom_left.x, bottom_left.y + half_length);
	var right_edge 	=  new Coordinate (bottom_left.x + side_length, bottom_left.y + half_length);
	var bottom_edge	=  new Coordinate (bottom_left.x + half_length, bottom_left.y);
	var top_edge 	=  new Coordinate (bottom_left.x + half_length, bottom_left.y + side_length);
	var center 		=  new Coordinate (bottom_left.x + half_length, bottom_left.y + half_length);
	
	/* Assign values of edge points */
	grid [left_edge.x] [left_edge.y] 	 =	variedAverage (grid, d, [bottom_left, top_left]);
	grid [right_edge.x] [right_edge.y] 	 = 	variedAverage (grid, d, [bottom_right, top_right]);
	grid [top_edge.x] [top_edge.y] 		 = 	variedAverage (grid, d, [top_left, top_right]);
	grid [bottom_edge.x] [bottom_edge.y] =	variedAverage (grid, d, [bottom_left, bottom_right]);
	
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



function main()
{
	var i, k;
	var gridSize = 17;  /* Assign grid size here */
	
	var start = new Coordinate(0, 0);
	
	/* create a grid */
	var Grid = new Array(gridSize);
	for(i = 0; i < gridSize; i++)
	{
		Grid[i] = new Array(gridSize)
	}
	
	/* Assign inital corner values. Should be randomly generated */
	Grid[0][0] = 0;
	Grid[0][gridSize-1] = 0;
	Grid[gridSize-1][0] = 0;
	Grid[gridSize-1][gridSize-1] = 0;
	
	/* 2.5 = maxHeight / 4 */
	generateHeights (start, (gridSize - 1), gridSize/3, Grid);  
	
	gridToConsole(Grid);
	
	// prepare data for use by Three.js
	var geometry = prepareData(Grid);
	// render!
	render(geometry);
	

}


