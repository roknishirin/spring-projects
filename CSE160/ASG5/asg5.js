import * as THREE from './lib/three.module.js';
import {OrbitControls} from './lib/OrbitControls.js';
import {OBJLoader} from './lib/OBJLoader.js';
import { MTLLoader } from './lib/MTLLoader.js';
import {PickHelper} from './lib/pickhelper.js';

// globals?
let spheres = [];
let diamonds = [];
let Tori = [];
let screens = [];
let pickPos = {x: 0, y: 0};	
let pickHelper;
let renderTarget;
let sonicCamera;


function setUpMouseEvents(){
	window.addEventListener('mousemove', setPickPosition);
	window.addEventListener('mouseout', clearPickPosition);
	window.addEventListener('mouseleave', clearPickPosition);
}

function getCanvasRelativePosition(event) {
	const canvas = document.querySelector('#c');
	const rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left) * canvas.width  / rect.width,
		y: (event.clientY - rect.top ) * canvas.height / rect.height,
	};
}

function setPickPosition(event) {
	const canvas = document.querySelector('#c');
	const pos = getCanvasRelativePosition(event);
	pickPos.x = (pos.x / canvas.width ) *  2 - 1;
	pickPos.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
	pickPos.x = -1000000000;
	pickPos.y = -1000000000;
}

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.shadowMap.enabled = true;

    clearPickPosition();
	setUpMouseEvents();
	pickHelper = new PickHelper();

    // set up render target
	renderTarget = new THREE.WebGLRenderTarget(2000, 2000);
	sonicCamera = new THREE.PerspectiveCamera(75, 1.0, 10, 8600);
	sonicCamera.position.set(210, 50, -3500);
	sonicCamera.lookAt(29, 50, 40);

    /* ------------------------------------ Perspective Camera ------------------------------------ */
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);
    // camera.position.z = 2;

    /* ------------------------------------ Scene ------------------------------------ */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('grey');

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, -10, 4);
        scene.add(light);
    }

    /* ------------------------------------ Box Geometry ------------------------------------ */
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    /* ------------------------------------ Orbit Controls ------------------------------------ */
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    /* ------------------------------------ Ground ------------------------------------ */
    {
        const planeSize = 10;
    
        const loader = new THREE.TextureLoader();
        const texture = loader.load('./img/asphalt.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);
    
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        // scene.add(mesh);
    }


    /* ------------------------------------ Sky Box ------------------------------------ */
    // sky DELETE LATER
    {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 0.6;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            './img/sonic.jpg',
            () => {
            const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
            rt.fromEquirectangularTexture(renderer, texture);
            scene.background = rt.texture;
            });
    }

    /* ------------------------------------ Light ------------------------------------ */
    /* --- directional light --- */
    {
        const color = 0xFFFFFF;
        const intensity = 0.8;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    /* --- ambient light --- */
    {
        const ambient_color = 0x010706;
        const ambient_intensity = .5;
        const ambient_light = new THREE.AmbientLight(ambient_color, ambient_intensity);
        scene.add(ambient_light);
    }

    // /* --- point light --- */
    {
        const point_color = 0xFFFFFF;
        const point_intensity = 2;
        const point_light = new THREE.PointLight(point_color, point_intensity);
        point_light.castShadow = true;
        point_light.position.set(0, 1, 0);
        scene.add(point_light);
      }


    /* ------------------------------------ OBJECT ------------------------------------ */
    {
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();
        mtlLoader.load('./loaders/sonic/sonic.mtl', (mtl) => {
          mtl.preload();
        //   mtl.materials.Material.side = THREE.DoubleSide;
          objLoader.setMaterials(mtl);
          objLoader.load('./loaders/sonic/sonic.obj', (root) => {
            root.position.set(0, -2, 1);
            root.scale.set(4,4,4);
            root.rotateY(3.14159);
            scene.add(root);
          });
        });
    }

    /* ------------------------------------ cubes ------------------------------------ */
    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});
    
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    
        cube.position.x = x;
    
        return cube;
      }

    // adding colored-cubes
    const cubes = [
        // makeInstance(geometry, 0x44aa88,  0),
        // makeInstance(geometry, 0x8844aa, -2),
        // makeInstance(geometry, 0xaa8844,  2),
    ];

    /* ------------------------------------ Cube ------------------------------------ */
    // const loader = new THREE.TextureLoader();

    // const material = new THREE.MeshBasicMaterial({
    //     map: loader.load('./img/yarn.jpg'),
    // });

    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    // cubes.push(cube); 


    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
    }


    /* ------------------------------------ Sphere ------------------------------------ */


    function makeSphere(radius, width, height, color, x, y, z) {

        const sphereRadius = radius;
        const sphereWidthDivisions = width;
        const sphereHeightDivisions = height;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const sphereMat = new THREE.MeshPhongMaterial({color});
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.position.set(x, y, z);
        sphereMesh.castShadow = true;
        sphereMesh.receiveShadow = true;
        scene.add(sphereMesh);
        spheres.push(sphereMesh);

        return sphereMesh;
    }

    const sphere = [
        makeSphere(1.2, 32, 16, 0x4a6484, 0, -2, -5),
        makeSphere(1.2, 32, 16, 0x4a6484, 0, -2, 5),
        makeSphere(1.2, 32, 16, 0x4a6484, 5, -2, 0),
        makeSphere(1.2, 32, 16, 0x4a6484, -5, -2, 0)
    ];


    /* ------------------------------------ Diamond ------------------------------------ */

    function makeDiamond(radius, color, x, y, z) {
        const diaRadius = radius;
        const detail = 0;
        const diaGeo = new THREE.OctahedronGeometry(diaRadius, detail);
        const diaMat = new THREE.MeshPhongMaterial({color});
        const diaMesh = new THREE.Mesh(diaGeo,diaMat);
        diaMesh.position.set(-diaRadius + x, diaRadius + y, z);
        diaMesh.castShadow = true;
        diaMesh.receiveShadow = true;
        scene.add(diaMesh);
        diamonds.push(diaMesh);

        return diaMesh;
    }

    const diamond = [
        makeDiamond(1, 0x87a5bc, 1, -5, -10),
        makeDiamond(1, 0x87a5bc, 8.07, -5, -7.07),
        makeDiamond(1, 0x87a5bc, 11, -5, 0),
        makeDiamond(1, 0x87a5bc, 8.07, -5, 7.07),
        makeDiamond(1, 0x87a5bc, 1, -5, 10),
        makeDiamond(1, 0x87a5bc, -6.07, -5, 7.07),
        makeDiamond(1, 0x87a5bc, -9, -5, 0),
        makeDiamond(1, 0x87a5bc, -6.07, -5, -7.07)
    ];

    /* ------------------------------------ Torus ------------------------------------ */
    function makeTorus(radius, length, capsegments, radsegments, color, x, y, z) {
        const capRadius = radius;
        const caplength = length;
        const capcapsegments = capsegments;
        const capradsegments = radsegments;
        const capGeo = new THREE.TorusGeometry(capRadius, caplength, capradsegments, capcapsegments);
        const capMat = new THREE.MeshPhongMaterial({color});
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.set(x, y, z);
        capMesh.castShadow = true;
        capMesh.receiveShadow = true;
        scene.add(capMesh);
        Tori.push(capMesh);

        return capMesh;
    }

    function getRandomRadius() {
        // Generate a random radius between 10 and 20
        return Math.floor(Math.random() * (20 - 10 + 1) + 10);
    }

    const Torus = [
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 0, 1, -30),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 0, 18, -80),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -10, 4, 40),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 60, 33, -20),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -70, 33, -20),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -50, 20, -30),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 10, 5, 70), 
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -20, 45, 50),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -5, 55, -10),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 40, 8, -45),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -60, 2, 20),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 25, 40, 0), 
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 60, -50, -50),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -10, -70, -20),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 40, -90, -90),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -30, -100, 100),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 90, -110, -130),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, 20, -90, 150),
        makeTorus(getRandomRadius(), 1, 100, 100, 0xffff00, -20, -70, 10),
    ];


    // material for naother shape
    // const loader = new THREE.TextureLoader();

    // const material = new THREE.MeshBasicMaterial({
    //     map: loader.load('./img/metal.jpg'),
    // });

    /* ------------------------------------ Screen ------------------------------------ */
    const loader = new THREE.TextureLoader();
    function makeScreen(width, height, depth, color, material, x, y, z, name) {
        const Screenwidth = width;
        const Screenheight = height;
        const ScreenDepth = depth;
        const ScGeo  = new THREE.BoxGeometry(Screenwidth, Screenheight, ScreenDepth);
        const Scmaterial = new THREE.MeshBasicMaterial( {color} );  
        const OGmaterial = material;
        const ScMesh = new THREE.Mesh( ScGeo, OGmaterial ); 
        ScMesh.position.set(x, y, z);
        ScMesh.castShadow = true;
        ScMesh.receiveShadow = false;
        ScMesh.name = name;
        scene.add(ScMesh);
        screens.push(ScMesh);
        return ScMesh;
    }

    var screenmaterial_1 = [
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({map: loader.load('./img/fast.jpg'), fog:false}),
		new THREE.MeshPhongMaterial({map: loader.load('./img/fast.jpg'), fog:false})
	];

    var screenmaterial_2 = [
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({color: 0x222324}),
		new THREE.MeshPhongMaterial({map: loader.load('./img/greenhill.jpg'), fog:false}),
		new THREE.MeshPhongMaterial({map: loader.load('./img/greenhill.jpg'), fog:false})
	];

    const Screen = [
        makeScreen(4, 3, .2, 0x222324, screenmaterial_1, -10, 1, 0, "themesong"),
        makeScreen(4, 3, .2, 0x222324, screenmaterial_2, 10, 1, 0, "greenhill"),
    ];


    /* ------------------------------------ Fog ------------------------------------ */

    {
    const color = 0xFFFFFF;  // white
    const near = 20;
    const far = 150;
    scene.fog = new THREE.Fog(color, near, far);

    }

    /* ------------------------------------ movement ------------------------------------ */
    function render(time) {
        time *= 0.001;
    
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }

        spheres.forEach((sphere, ndx) => {
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (1)*Math.PI/180);
            sphere.position.applyQuaternion(quaternion);
        });

        diamonds.forEach((diamond, ndx) => {
            diamond.rotation.x = time;
            diamond.rotation.y = time;
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (1) * Math.PI / 180);
            diamond.position.applyQuaternion(quaternion);
        });

        // object picking
        pickHelper.pick(pickPos, scene, camera, time);
        
        // draw render target scene to render target
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, sonicCamera);
        renderer.setRenderTarget(null);

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();