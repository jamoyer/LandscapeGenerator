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
            /* add vertices for the lower-right triangle
            geometry.vertices.push( new THREE.Vector3( x, waterLevel(Grid[x][z]), z ),
                                    new THREE.Vector3( x+1, waterLevel(Grid[x+1][z]), z ),
                                    new THREE.Vector3( x+1, waterLevel(Grid[x+1][z+1]), z+1 ) );
            */
            geometry.vertices.push( new THREE.Vector3( x, waterLevel(Grid[x][z]), z ) );
            geometry.colors.push(getColor(Grid[x][z]));
            geometry.vertices.push( new THREE.Vector3( x+1, waterLevel(Grid[x+1][z]), z ) );
            geometry.colors.push(getColor(Grid[x+1][z]));
            geometry.vertices.push( new THREE.Vector3( x+1, waterLevel(Grid[x+1][z+1]), z+1 ) );
            geometry.colors.push(getColor(Grid[x+1][z+1]));


            /* add vertices for the upper-left triangle [pretty sure we need CCW coordinate order] */
            geometry.vertices.push( new THREE.Vector3( x, waterLevel(Grid[x][z]), z ) );
            geometry.colors.push(getColor(Grid[x][z]));
            geometry.vertices.push( new THREE.Vector3( x+1, waterLevel(Grid[x+1][z+1]), z+1 ) );
            geometry.colors.push(getColor(Grid[x+1][z+1]));
            geometry.vertices.push( new THREE.Vector3( x, waterLevel(Grid[x][z+1]), z+1 )  );
            geometry.colors.push(getColor(Grid[x][z+1]));

            /* push face for lower-right triangle */
            var f1 = new THREE.Face3(numVertices+0, numVertices+1, numVertices+2);
            f1.vertexColors.push(geometry.colors[numVertices + 0]);
            f1.vertexColors.push(geometry.colors[numVertices + 1]);
            f1.vertexColors.push(geometry.colors[numVertices + 2]);

            geometry.faces.push( f1 );

            /* push face for upper-left triangle */
            var f2 = new THREE.Face3(numVertices+3, numVertices+4, numVertices+5 );
            f2.vertexColors.push(geometry.colors[numVertices + 3]);
            f2.vertexColors.push(geometry.colors[numVertices + 4]);
            f2.vertexColors.push(geometry.colors[numVertices + 5]);
            geometry.faces.push( f2 );

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

    if(height < 0)
    {
        return height;
    }
    return height;
}

function getColor(height)
{
    var water_color = new THREE.Color(0x129793);
    var grass_color = new THREE.Color(0x007B0C);
    var sand_color = new THREE.Color(0xc2b280);
    var stone_color = new THREE.Color(0x444250);


    var rand = Math.abs(randomNormal(1, .15)) * height;
    if (rand < 0)
    {
        return water_color;
    }
    if(rand < 10)
    {
        return sand_color;
    }
    if(rand < 80)
    {
        return grass_color;
    }
    return stone_color

}




/* --Render-- */
function render(geometry, size) {
    /* create the scene object */
    var scene = new THREE.Scene();

    /* create a camera looking at origin */
      camera = new THREE.PerspectiveCamera( 45, 1.5, 0.1, 1000 );
      camera.position.x = 2;
      camera.position.y = 3;
      camera.position.z = 2;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      /* create a renderer for the canvas */
      var ourCanvas = document.getElementById('theCanvas');
      var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

    /* create a mesh from geometry object */
    var material = new THREE.MeshPhongMaterial( {vertexColors: THREE.VertexColors, wireframe: false, specular: 0x888888, shininess: 1, side: THREE.DoubleSide }  );
    var mesh = new THREE.Mesh(geometry, material);
    var scale =  1 / size;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(-0.5, 0, -0.5);



    // Create Water
    geometry = new THREE.PlaneGeometry(1,1);
    geometry.translate(0, 0, 0);
    geometry.rotateX(Math.PI / 2);
    material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.4, color: 0x0077be, side: THREE.DoubleSide} );
    var water = new THREE.Mesh(geometry, material);
    //water.position.set(-.5, 0, -.5);



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
    scene.add(water);

    var x = 0;

    var render = function () {
        requestAnimationFrame( render );
        renderer.render(scene, camera);
        // rotate about the y axis, never going below the horizon
        //sun.position.set(Math.sin(x), Math.abs(Math.sin(x)), Math.cos(x));
        
        // Rotate the sun to simulate night and day
        var yPos = Math.sin(x);
        sun.position.set(0, yPos, Math.cos(x));

        // rotate make night go much faster than day
        x+= (yPos > -0.1) ? 0.015 : 0.1;
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
            c.translateZ(-0.1);
            return true;
        case 'a':
            c.translateX(-0.1);
            return true;
        case 's':
            c.translateZ(0.1);
            return true;
        case 'd':
            c.translateX(0.1);
            return true;
        case 'W':
            c.translateZ(-.5);
            return true;
        case 'A':
            c.translateX(-.5);
            return true;
        case 'S':
            c.translateZ(.5);
            return true;
        case 'D':
            c.translateX(.5);
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

