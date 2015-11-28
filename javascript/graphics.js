var camera;

/* --Format Data-- 
	create a geometry object from vertex height grid
*/
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
			geometry.vertices.push( new THREE.Vector3( x, waterLevel(Grid[x][z]), z ),	
									new THREE.Vector3( x+1, waterLevel(Grid[x+1][z]), z ), 					
									new THREE.Vector3( x+1, waterLevel(Grid[x+1][z+1]), z+1 ) );
								
							
			
			/* add vertices for the upper-left triangle [pretty sure we need CCW coordinate order] */
			geometry.vertices.push( new THREE.Vector3( x, waterLevel(Grid[x][z]), z ),						
									new THREE.Vector3( x+1, waterLevel(Grid[x+1][z+1]), z+1 ),				
									new THREE.Vector3( x, waterLevel(Grid[x][z+1]), z+1 )  );					
						
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
	
	
	/* compute face normals so we can do lighting */
	geometry.computeFaceNormals();
	
	
	return geometry;
}




function waterLevel(height){
	if(height < -5)
	{
		return -5;
	}
	return height;
}



/* --Render-- */
function render(geometry, scale) {
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
	var material = new THREE.MeshPhongMaterial( {wireframe: false, color:0x444250, specular: 0xffffff, shininess: 1, side: THREE.DoubleSide }  );
	var mesh = new THREE.Mesh(geometry, material);
	mesh.scale.set(scale, scale, scale);
	/* create lights */
	//var lights = new THREE.Group();
	
	// The "sun"  This is just a random light add more take this one out, It doesn't matter
  	var sun = new THREE.DirectionalLight(0x888888, 1.5);
  	sun.position.set(-0.4, 1, -0.2);
  	//lights.add( sun );
	 
	var ambient = new THREE.AmbientLight(0x323232);
	
	scene.add(ambient);
	scene.add(sun);
	scene.add(mesh);
	
	var x = 0;
	
	var render = function () {    
    	requestAnimationFrame( render );
    	renderer.render(scene, camera);
		sun.position.set(Math.sin(x), Math.abs(Math.sin(x)), Math.cos(x));
		x+= 0.01;
  	};

  	render();
}















/* Controls */

function handleKeyPress(event)
{
  	var ch = getChar(event);
	if (cameraControl(camera, ch)) return;
}


function getChar(event) {
	if (event.which == null) {
		return String.fromCharCode(event.keyCode) // IE
	} else if (event.which!=0 && event.charCode!=0) {
		return String.fromCharCode(event.which)   // the rest
	} else {
		return null // special key
	}
}

function cameraControl(c, ch)
{
	var distance = c.position.length();
	var q, q2;
  
	switch (ch)
  	{
		/* movement in plane */
		case 'w':
			c.translateZ(-0.5);
			return true;
		case 'a':
			c.translateX(-0.5);
			return true;
		case 's':
			c.translateZ(0.5);
			return true;
		case 'd':
			c.translateX(0.5);
			return true;
		case 'W':
			c.translateZ(-2);
			return true;
		case 'A':
			c.translateX(-2);
			return true;
		case 'S':
			c.translateZ(2);
			return true;
		case 'D':
			c.translateX(2);
			return true;
			
		/* move up-down */
		case 'r':
			c.translateY(0.5);
			return true;
		case 'f':
			c.translateY(-0.5);
			return true;
			
		/* Look controls */
		case 'j':
			// need to do extrinsic rotation about world y axis, so multiply camera's quaternion
			// on left
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			return true;
		case 'l':
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  -5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			return true;
		case 'i':
			// intrinsic rotation about camera's x-axis
			c.rotateX(5 * Math.PI / 180);
			return true;
		case 'k':
			c.rotateX(-5 * Math.PI / 180);
			return true;
			
		/* Look at origin */
		case 'O':
			c.lookAt(new THREE.Vector3(0, 0, 0));
			return true;
			
		/* camera projection */
		case 'S':
			c.fov = Math.min(80, c.fov + 5);
			c.updateProjectionMatrix();
			return true;
		case 'W':
			c.fov = Math.max(5, c.fov  - 5);
			c.updateProjectionMatrix();
			return true;
	
		// Orbit
		case 'J':
			//this.orbitLeft(5, distance)
			c.translateZ(-distance);
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			c.translateZ(distance);
			return true;
		case 'L':
			//this.orbitRight(5, distance)  
			c.translateZ(-distance);
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  -5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			c.translateZ(distance);
			return true;
		case 'I':
			//this.orbitUp(5, distance)      
			c.translateZ(-distance);
			c.rotateX(-5 * Math.PI / 180);
			c.translateZ(distance);
			return true;
		case 'K':
			//this.orbitDown(5, distance)  
			c.translateZ(-distance);
			c.rotateX(5 * Math.PI / 180);
			c.translateZ(distance);
			return true;
	}
	return false;
}

