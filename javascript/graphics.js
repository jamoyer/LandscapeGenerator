var camera;

/* --Format Data--
    create a geometry object from vertex height grid
*/
function prepareData(grid) {

    var gridSize = grid.length;

    /* create a geometry object to hold all vertices */
    var geometry = new THREE.Geometry();

    /* track the number of verices to easily create faces */
    var numVertices = 0;
    var before = Date.now();

    var index = 0;
    /* add vertices and faces for each square in the grid */
    for(var x = 0, xplus = 1; x < gridSize - 1 ; x=xplus, xplus++)
    {
        for(var z = 0, zplus = 1; z < gridSize - 1; z=zplus, zplus++)
        {
            // vertices
            var topRight = null;
            var topLeft  = null;
            var botRight = null;
            var botLeft  = null;

            // colors
            var topRightC = null;
            var topLeftC  = null;
            var botRightC = null;
            var botLeftC  = null;

            /*
             * Values are stored as chunks into the array like so:
             * [TopRight, BotRight, BotLeft, TopLeft, TopRight, BotLeft]
             *
             * To get already created vertices we can use this to our advantage.
             */
            if (z > 0)
            {
                // reuse what was just put in the array
                var botLeftInd  = index - 3; // lower square's top left
                var botRightInd = index - 2; // lower square's top right
                botLeft   = geometry.vertices[botLeftInd];
                botLeftC  = geometry.colors[botLeftInd];
                botRight  = geometry.vertices[botRightInd];
                botRightC = geometry.colors[botRightInd];
            }
            if (x > 0)
            {
                // reuse what was put into the array one full gridSize back
                var topLeftInd = index - (6 * (gridSize - 1)); // left square's top right
                var botLeftInd = topLeftInd + 1;               // left square's bottom right
                botLeft  = botLeft  || geometry.vertices[botLeftInd];
                botLeftC = botLeftC || geometry.colors[botLeftInd];
                topLeft  = geometry.vertices[topLeftInd];
                topLeftC = geometry.colors[topLeftInd];
            }

            // get heights
            var topRightH = grid[xplus][zplus];
            var topLeftH  = grid[x][zplus];
            var botRightH = grid[xplus][z];
            var botLeftH  = grid[x][z];

            // these values always must be created each iteration
            topRight  = new THREE.Vector3(xplus, topRightH, zplus);
            topRightC = getColor(topRightH);

            // these values must be created if they weren't before, use short circuit style
            topLeft   = topLeft   || new THREE.Vector3(x, topLeftH, zplus);
            topLeftC  = topLeftC  || getColor(topLeftH);

            botRight  = botRight  || new THREE.Vector3(xplus, botRightH, z);
            botRightC = botRightC || getColor(botRightH);

            botLeft   = botLeft   || new THREE.Vector3(x, botLeftH, z);
            botLeftC  = botLeftC  || getColor(botLeftH);

            /* add vertices for the lower-right triangle */
            geometry.vertices[index]=topRight;
            geometry.colors[index++]=topRightC;

            geometry.vertices[index]=botRight;
            geometry.colors[index++]=botRightC;

            geometry.vertices[index]=botLeft;
            geometry.colors[index++]=botLeftC;

            /* add vertices for the upper-left triangle [pretty sure we need CCW coordinate order] */

            geometry.vertices[index]=topLeft;
            geometry.colors[index++]=topLeftC;

            geometry.vertices[index]=topRight;
            geometry.colors[index++]=topRightC;

            geometry.vertices[index]=botLeft;
            geometry.colors[index++]=botLeftC;

            /* push face for lower-right triangle */
            var f1 = new THREE.Face3(numVertices, numVertices+1, numVertices+2);
            f1.vertexColors.push(topRightC);
            f1.vertexColors.push(botRightC);
            f1.vertexColors.push(botLeftC);

            geometry.faces.push( f1 );

            /* push face for upper-left triangle */
            var f2 = new THREE.Face3(numVertices+3, numVertices+4, numVertices+5 );
            f2.vertexColors.push(topLeftC);
            f2.vertexColors.push(topRightC);
            f2.vertexColors.push(botLeftC);
            geometry.faces.push( f2 );

            /* update the number of vertices that we have added once faces have been created */
            numVertices += 6;
        }
    }

    var after = Date.now();
    console.log("Time to create vertices:" + (after-before));

    /* remove duplicate vertices and update faces.  Better performance? */
    before = Date.now();
    //geometry.mergeVertices(geometry);
    after = Date.now();
    console.log("Time to merge vertices:" + (after-before));

    /* compute face normals so we can do lighting */
    before = Date.now();
    geometry.computeFaceNormals();
    after = Date.now();
    console.log("Time to compute face normals:" + (after-before));

    return geometry;
}

// only have one copy of each color for speed and memory optimization
var DEEP_WATER_COLOR = new THREE.Color(0x070099);
var MID_WATER_COLOR = new THREE.Color(0x004e6f);
var WATER_COLOR = new THREE.Color(0x129793);   // water color
var SAND_COLOR  = new THREE.Color(0xc2b280);   // sand color
var GRASS_COLOR = new THREE.Color(0x007B0C);   // grass color
var STONE_COLOR = new THREE.Color(0x444250);   // stone color

var WATER_COLORS;

function getWaterColor(depth)
{
    if (!WATER_COLORS)
    {
        var HSL = WATER_COLOR.getHSL();
        WATER_COLORS = [];
        for (var i=0; i<20; i++)
        {
            var color = new THREE.Color()
            color.copy(WATER_COLOR);
            color.offsetHSL(0, 0, -i * HSL.l * 0.1)
            WATER_COLORS[WATER_COLORS.length] = color;
        }
    }

    depth = Math.floor((Math.min(-depth, 70) / 70) * 19);
    return WATER_COLORS[depth];
}

function getColor(height)
{
    var rand = Math.abs(randomNormal(1, .25)) * height;
    if (rand < 0)
    {
        return getWaterColor(height);
    }
    else if(rand < 10)
    {
        return SAND_COLOR;
    }
    else if(rand < 70)
    {
        return GRASS_COLOR;
    }
    return STONE_COLOR;
}

var pauseSun = false;

/* --Render-- */
function createScene(geometry, size) {
    /* create the scene object */
    var scene = new THREE.Scene();

    /* create a camera looking at origin */
    camera = new THREE.PerspectiveCamera( 45, 1.5, 0.1, 1000 );
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 1;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    /* create a renderer for the canvas */
    var ourCanvas = document.getElementById('theCanvas');
    var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

    /* create a mesh from geometry object */
    var material = new THREE.MeshPhongMaterial(
    {
        vertexColors: THREE.VertexColors,
        wireframe: false,
        specular: 0x888888,
        shininess: 1
    });
    var terrain = new THREE.Mesh(geometry, material);
    var scale =  1 / size;
    terrain.scale.set(scale, scale, scale);
    terrain.position.set(-0.5, 0, -0.5);

    // Create Water
    geometry = new THREE.PlaneGeometry(1,1);
    geometry.translate(0, 0, 0);
    geometry.rotateX(Math.PI / 2);
    material = new THREE.MeshBasicMaterial(
    {
        transparent: true,
        opacity: 0.4,
        color: 0x0077be,
        side: THREE.DoubleSide
    });
    var water = new THREE.Mesh(geometry, material);

    /* create lights */
    // The "sun"  This is just a random light add more take this one out, It doesn't matter
    var sun = new THREE.DirectionalLight(0x888888, 1.5);
    sun.position.set(-0.4, 1, -0.2);

    var ambient = new THREE.AmbientLight(0x323232);

    scene.add(ambient);
    scene.add(sun);
    scene.add(terrain);
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
        if (!pauseSun)
        {
            x+= (yPos > -0.1) ? 0.015 : 0.1;
        }
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
        case ' ':
            pauseSun = !pauseSun;
            return true;
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
