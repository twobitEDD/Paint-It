var camera, scene, renderer, mouse = new THREE.Vector2();

var geometry, material, mesh;
var objects = [];

var mouselock, controls, pointerlock;
var player, enemy;

var controlsEnabled = false;
var ready = true;

// var sendData = new SendData();


if (Detector.webgl) {

    socket.on("start match", function(data) {
        console.log("start match");

        mouselock = new THREE.MouseLock();
        init(data);
        animate();
        socket.on("ready", function(){
            ready = true;
        });

    });


} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}


function init(data) {
    //camera
    camera = new THREE.PerspectiveCamera(75, (window.innerWidth / window.innerHeight), 1, 1000);

    //scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    //light
    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);





    //controls
    controls = new THREE.Controls(document);
    pointerlock.getObject().position.x = data.player.position.x;
    pointerlock.getObject().position.y = data.player.position.y;
    pointerlock.getObject().position.z = data.player.position.z;

    if (data.player.direction == 1) pointerlock.setOppositeDirection();

    //Player
    var p1 = {
        "p1": true,
        "player": data.player
    };
    player = new Player(p1);

    //Enemy
    var p2 = {
        "p1": false,
        "player": data.enemy
    };
    enemy = new Player(p2);



    // floor

    geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    geometry.rotateX(-Math.PI / 2);

    for (var i = 0, l = geometry.vertices.length; i < l; i++) {

        var vertex = geometry.vertices[i];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;

    }

    for (var i = 0, l = geometry.faces.length; i < l; i++) {

        var face = geometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

    }

    material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.VertexColors
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 400;
    mesh.rotation.x = Math.PI;
    scene.add(mesh);

    var axisHelper = new THREE.AxisHelper( 5 );
scene.add( axisHelper );

    // objects

    geometry = new THREE.BoxGeometry(20, 20, 20);

    for (var i = 0, l = geometry.faces.length; i < l; i++) {

        var face = geometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

    }



    // var mesh = new THREE.Mesh(geometry, material);
    // mesh.position.x = 0;
    // mesh.position.y = 10;
    // mesh.position.z = 100;
    // scene.add(mesh);
    // objects.push(mesh);

    for (var i = 0; i < 500; i++) {
        material = new THREE.MeshPhongMaterial({
            specular: 0xffffff,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.floor(Math.random() * 20 - 10) * 20;
        mesh.position.y = Math.floor(Math.random() * 20) * 20 + 10;
        mesh.position.z = Math.floor(Math.random() * 20 - 10) * 20;
        scene.add(mesh);

        material.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

        objects.push(mesh);

    }


    //renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    //resize
    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    if(ready){
        controls.update();
        player.update();
        socket.on("data", function(data) {
            enemy.update(data.player);
        });


        var data = {
            "player": {
                "position": {
                    "x": player.getPosition().x,
                    "y": player.getPosition().y,
                    "z": player.getPosition().z
                },
                "direction": {
                    "x": pointerlock.getDirection().x,
                    "y": pointerlock.getDirection().y,
                    "z": pointerlock.getDirection().z
                }
            }
        };

        socket.emit("data", data);
    }
    renderer.render(scene, camera);

}