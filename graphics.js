// --Format Data-- \\
function prepareData(Grid) {
	
	var gridSize = Grid.length;
	
	/* create a geometry object to hold all vertices */
	var geometry = new THREE.Geometry();
	
	/* track the number of verices to easily create faces */
	var numVertices = 0;
	
	/* add vertices and faces for each square in the grid */
	for(var x = 0; x < gridSize -1 ; x++)
	{
		for(var z = 0; z < gridSize - 1; z++)
		{
			/* add vertices for the lower-right triangle */
			geometry.vertices.push( new THREE.Vector3( x, Grid[x][z], z ),	
									new THREE.Vector3( x+1, Grid[x+1][z], z ), 					
									new THREE.Vector3( x+1, Grid[x+1][z+1], z+1 ) );				
			
			/* add vertices for the upper-left triangle [pretty sure we need CCW coordinate order] */
			geometry.vertices.push( new THREE.Vector3( x, Grid[x][z], z ),						
									new THREE.Vector3( x+1, Grid[x+1][z+1], z+1 ),				
									new THREE.Vector3( x, Grid[x][z+1], z+1 )  );					
						
			/* push face for lower-right triangle */
			geometry.faces.push( new THREE.Face3( numVertices+0, numVertices+1, numVertices+2 ) );
				
			/* push face for upper-left triangle */
			geometry.faces.push( new THREE.Face3( numVertices+3, numVertices+4, numVertices+5 ) );
							
			/* update the number of vertices that we have added once faces have been created */
			numVertices += 6;
		}
	}
	
	
	/* remove duplicate vertices and update faces.  Better performance? */
	geometry.mergeVertices(geometry); 
	
	
	/* signal that vertices and faces need updating */
	// not sure this is needed since no rendering has been done yet
	//geometry.verticesNeedUpdate = true; 
	//geometry.elementsNeedUpdate = true; 
	
	//geometry.computeBoundingSphere();
	
	return geometry;
}


// --Render-- \\
function render(geometry) {
	/* create the scene object */
	var scene = new THREE.Scene();
	
	/* create a camera looking at origin */
  	camera = new THREE.PerspectiveCamera( 45, 1.5, 0.1, 1000 );
  	camera.position.x = 17;
  	camera.position.y = 17;
  	camera.position.z = 25;
  	camera.lookAt(new THREE.Vector3(9, 0, 9));
  
  	/* create a renderer for the canvas */
  	var ourCanvas = document.getElementById('theCanvas');
  	var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
	  
	/* create a mesh from geometry object */
	var material = new THREE.MeshPhongMaterial( {wireframe: true, color:0xffffff, specular: 0x0d0d26, shininess: 1, side: THREE.DoubleSide }  );
	var mesh = new THREE.Mesh(geometry, material);
	
	/* create lights */
	//var lights = new THREE.Group();
	
	// The "sun"  This is just a random light add more take this one out, It doesn't matter
  	var sun = new THREE.DirectionalLight(0xffffff, 1.5);
  	sun.position.set(0, 1, 0);
  	//lights.add( sun );
	 
	var ambient = new THREE.AmbientLight(0x444444);
	
	scene.add(ambient);
	scene.add(sun);
	scene.add(mesh);
	
	
	var render = function () {    
    	requestAnimationFrame( render );
    	renderer.render(scene, camera);
  	};

  	render();
}