import "./style.css";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import glowVertexShader from "./shaders/glowvertexshader.glsl";
import glowFragmentShader from "./shaders/glowfragmentshader.glsl";

import * as dat from "dat.gui";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import Stats from 'three/examples/jsm/libs/stats.module'


//global params
const parameters = {
  fov: 26,
  c: 0.32,
  p: 3.5,
  ambientLight: 0.4,
  aniSpeed: 0.02,
}



const scene = new THREE.Scene();
const clock = new THREE.Clock();
const gui = new dat.GUI();

//---------------------------------Objects/Materials----------------------

let hand = null;
let phone = null;
let sun = null;
let moon1 = null;
let moon2 = null;
let moon3 = null;
let sunGlow = null;

const texSun = new THREE.TextureLoader().load('./texture/sun1.jpg');
texSun.wrapT = THREE.RepeatWrapping;
texSun.wrapS = THREE.RepeatWrapping;


const texSunBump = new THREE.TextureLoader().load('./texture/sun1_bump.png');
texSunBump.wrapT = THREE.RepeatWrapping;
texSunBump.wrapS = THREE.RepeatWrapping;

const texSun1_2 = new THREE.TextureLoader().load('./texture/sun1_2.png');
texSun1_2.wrapT = THREE.RepeatWrapping;
texSun1_2.wrapS = THREE.RepeatWrapping;

const texSun1_3 = new THREE.TextureLoader().load('./texture/sun1_2.png');
texSun1_3.wrapT = THREE.RepeatWrapping;
texSun1_3.wrapS = THREE.RepeatWrapping;


//Camera
const aspect = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera(parameters.fov, aspect.width / aspect.height, .001, 100);
camera.position.z = 0.5;
camera.position.y = 0;
scene.add(camera);


//Mesh
// const material = new THREE.ShaderMaterial({
//   vertexShader, 
//   fragmentShader,
//   uniforms: {
//     globeTexture: {
//       value: texMap,
//       //value: new THREE.TextureLoader().load('./texture/color.jpg'),
//     },
//     u_time: {
//       value: clock.getElapsedTime()
//     }
//   } 
//   // color: 0x0f2222, 
// });


const materialSun = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  map: texSun,
  bumpMap: texSunBump,
  bumpScale: .02,
  side: THREE.DoubleSide,
  castShadow: false,
  receiveShadow: false,
  //transparent: true,
  //opacity: 1.0,
  //displacementMap: new THREE.TextureLoader().load('./texture/displacementMap.jpg'),
  //displacementScale: .1
});

const material1 = new THREE.MeshStandardMaterial({
  color: 0xAAAAFF,
  map: texSun1_2,
  transparent: true,
  side: THREE.FrontSide,
  opacity: .65,
  castShadow: false,
  receiveShadow: false,

  //bumpMap: new THREE.TextureLoader().load('./texture/sun2_bump.jpg'),
  // opacity: .3,
  //displacementMap: new THREE.TextureLoader().load('./texture/displacementMap.jpg'),
  //displacementScale: .1
});


const materialGlow = new THREE.ShaderMaterial({
  uniforms: {
    "c": {
      type: "f",
      value: parameters.c
    },
    "p": {
      type: "f",
      value: parameters.p
    },
    glowColor: {
      type: "c",
      value: new THREE.Color(0x004aff)
    },
    viewVector: {
      type: "v3",
      value: camera.position
    }
  },
  vertexShader: glowVertexShader,
  fragmentShader: glowFragmentShader,
  castShadow: false,
  receiveShadow: false,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
});

//---------------------------------------------------------------------------------------
//-------------------------------------Light---------------------------------------------
//---------------------------------------------------------------------------------------

const ambientLight = new THREE.AmbientLight("#ffffff", parameters.ambientLight);
gui
  .add(ambientLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Ambient One");
// -------------------------------------2)DirectionalLight-------------------------------------
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(0, 3.5, 3.5);

//------------------------------------GUI---------------------------------------------
gui.add(directionalLight, "intensity").min(0).max(1).step(0.01).name("Directional Two");
gui.add(directionalLight.position, "x").min(-8).max(8).step(0.02).name("X Dir");
gui.add(directionalLight.position, "y").min(-8).max(8).step(0.02).name("Y Dir");
gui.add(directionalLight.position, "z").min(-8).max(8).step(0.02).name("Z Dir");
gui.add(parameters, 'c').min(0.0).max(1.0).step(0.01).name("c").onChange(function (value) { sunGlow.material.uniforms["c"].value = parameters.c;});
gui.add(parameters, 'p').min(0.0).max(6.0).step(0.01).name("p").onChange(function (value) { sunGlow.material.uniforms["p"].value = parameters.p;});
gui.add(camera.rotation, "x").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation X").onChange(function(value) { camera.rotation.x = value; });
gui.add(camera.rotation, "y").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation y").onChange(function(value) { camera.rotation.y = value; });
gui.add(camera.rotation, "z").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation z").onChange(function(value) { camera.rotation.z = value; });
gui.add(camera.position, "z").min(-5).max(5).step(.05).name("position z").onChange(function(value) { camera.position.z = value; });
gui.add(parameters, "fov").min(18).max(200).step(2).name("fov").onChange(function(value) { camera.fov = value; camera.updateProjectionMatrix(); });
gui.add(parameters, "aniSpeed").min(0).max(0.1).step(0.005).name("speed");
// -------------------------------------Helpers------------------------------------
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);


//Renderer
const canvas = document.querySelector(".draw"); //Select the canvas
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
}); //add WeBGL Renderer
renderer.setSize(aspect.width, aspect.height); //Renderer size
renderer.setPixelRatio(window.devicePixelRatio);
renderer.clearColor = new THREE.Color('#ff0000');

texSun.anisotropy = renderer.capabilities.getMaxAnisotropy();

//responsive view, update view when window is resizing
window.addEventListener("resize", event => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});


scene.add(ambientLight);
scene.add(directionalLight);
const startTime = clock.getElapsedTime();

//*******************************ANIMATION****************************** */

let action = null;
let model = null;
let mixer = null;

// Loading of model from  .glTF file
//const loader = new FBXLoader();
const loader = new GLTFLoader();
loader.load('model/intro.glb', (object) => {
    model = object.scene;//.children[0]; //sun
    model.scale.set(10, 10, 10);
    // Ustawienie pozycji modelu
    //model.position.z = -5.0;
    // Inicjalizacja animacji
    mixer = new THREE.AnimationMixer(model);
    model.userData.mixer = mixer;

    let indx = 0;

    phone = model.children[indx]; //phone object
    phone.children[0].material.needsUpdate = true;  //LCD display
    const matPhoneCase = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });
    matPhoneCase.reflectivity = .4;
    matPhoneCase.shininess = .9;

    const matLCD = new THREE.MeshPhongMaterial({ color: 0x000000 });
    matLCD.reflectivity = 1.0;
    matLCD.shininess = 1.0;
    indx++;
    
    phone.children[1].material.needsUpdate = true;  //phone case
    phone.children[0].material = matPhoneCase;
    phone.children[1].material = matLCD;

    sun = model.children[indx + 1]; //sun
    sun.material.needsUpdate = true;
    //sun.material = materialSun;
    
    moon1 = model.children[indx + 2]; //moon1
    moon1.material.needsUpdate = true;
    //moon1.material = materialSun;
    
    moon2 = model.children[indx + 3]; //moon2
    moon2.material.needsUpdate = true;
    //moon2.material = materialSun;
    
    sunGlow = model.children[indx + 4]; //sunGlow
    sunGlow.material = materialGlow;
    sunGlow.scale.multiplyScalar(1.3);
    sunGlow.castShadow = false;
    sunGlow.receiveShadow = false;
    
    moon3 = model.children[indx + 5]; //moon3
    moon3.material.needsUpdate = true;
    //moon3.material = materialSun;

    const matHand = new THREE.MeshPhongMaterial({ color: 0x222222 });
    matHand.reflectivity = .4;
    matHand.shininess = .4;

    hand = model.children[indx + 6]; //moon3
    hand.material.needsUpdate = true;
    hand.frustumCulled = false;
    hand.material = matHand;  //IMPORTANT so that hand is visible in close range

    if(object.animations.length > 0) {
      action = mixer.clipAction(object.animations[0]);
      if(action) 
        action.play(); // Rozpoczęcie animacji
    } 
    scene.add(model);
  },
  // called while loading is progressing
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log( 'An error happened' );
  }
);

const stats = Stats()
document.body.appendChild(stats.dom)

//------------------------------------------------------------------
//-----------------------Animate------------------------------------
//------------------------------------------------------------------
const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  if (sun !== null) {
    //sun.rotation.y = elapsedTime * Math.PI / 100;
  }
  if (action !== null)  {
    mixer.update(parameters.aniSpeed)
    //if(mixer.animate[0].time > 7.7)
  }

  window.requestAnimationFrame(animate);
  renderer.render(scene, camera); //draw what the camera inside the scene captured
  stats.update()
};
animate();