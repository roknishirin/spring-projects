import * as THREE from './lib/three.module.js';
import {OrbitControls} from './lib/OrbitControls.js';
import {OBJLoader} from './lib/OBJLoader.js';
import { MTLLoader } from './lib/MTLLoader.js';

// globals?
let spheres = [];
let diamonds = [];
let Tori = [];

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

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
        light.position.set(-1, 2, 4);
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
        mtlLoader.load('./loaders/ship/ship.mtl', (mtl) => {
          mtl.preload();
        //   mtl.materials.Material.side = THREE.DoubleSide;
          objLoader.setMaterials(mtl);
          objLoader.load('./loaders/ship/ship.obj', (root) => {
            root.position.set(0, 3, 2);
            root.scale.set(2,2,2);
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

    /* ------------------------------------ Capsule ------------------------------------ */
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

    const Torus = [
        makeTorus(15, 1, 100, 100, 0xffff00, 0, 1, -30)
    ];


    // material for naother shape
    // const loader = new THREE.TextureLoader();

    // const material = new THREE.MeshBasicMaterial({
    //     map: loader.load('./img/metal.jpg'),
    // });


    

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

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();