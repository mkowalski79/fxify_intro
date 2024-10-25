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

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'; 
// import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';

import { Band } from "./Band.js";


//global params
const parameters = {
  fov: 26,
  c: 0.32,
  p: 3.5,
  ambientLight: 0.83,
  aniSpeed: 0.02,
  filmPass: !true,
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


const texMoon2 = new THREE.TextureLoader().load('./texture/mooncrest1.jpg');
texMoon2.wrapT = THREE.RepeatWrapping;
texMoon2.wrapS = THREE.RepeatWrapping;

const texMoon = new THREE.TextureLoader().load('./texture/moon.jpg');
texMoon.wrapT = THREE.RepeatWrapping;
texMoon.wrapS = THREE.RepeatWrapping;


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
const camera = new THREE.PerspectiveCamera(parameters.fov, aspect.width / aspect.height, .1, 100);
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


const matSun = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  map: texSun,
  // bumpMap: texSunBump,
  bumpScale: .2,
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

const matMoon2 = new THREE.MeshStandardMaterial({
  color: 0xAAAAFF,
  map: texMoon2,
  bumpMap: texMoon2,
  bumpScale: 0.001,
  transparent: false,
  side: THREE.FrontSide,
  //opacity: .65,
  castShadow: false,
  receiveShadow: false,

  // displacementMap: texMoon2,
  // displacementScale: .0001
});
const matMoon = new THREE.MeshStandardMaterial({
  color: 0xAAAAFF,
  map: texMoon,
  transparent: false,
  side: THREE.FrontSide,
  //opacity: .65,
  castShadow: false,
  receiveShadow: false,

  // displacementMap: texMoon,
  // displacementScale: .0001
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
const directionalLight = new THREE.DirectionalLight("#ffffff", .5);
directionalLight.position.set(0, 3.5, -6.5);

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
gui.add(parameters, "fov").min(10).max(200).step(2).name("fov").onChange(function(value) { camera.fov = value; camera.updateProjectionMatrix(); });
gui.add(parameters, "aniSpeed").min(0).max(0.1).step(0.005).name("speed");

const folder = gui.addFolder('PostProduction');
	const mvGUI = folder.add( parameters, 'filmPass' ).name("Film Pass").listen();
	mvGUI.onChange( function(value) { 
		
		if(value === true) {
      filmPass.enabled = true;
    }
    else {
      filmPass.enabled = false;
    }
	});
	folder.open();
// -------------------------------------Helpers------------------------------------
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);

function eight() {
  let theta = 0;
  let radius = .1;

  const points = [];
  while (theta < 360 * 10) {
    let z = .1;
    let x = radius * Math.sin(this.toRadians(theta)) + .02;
    let y = radius * Math.sin(2 * this.toRadians(theta)) / 2;
    theta += ~~(Math.random() + 5);
    radius *= .9998;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;

}
function circle() {
  let theta = 0;
  let radius = .125;

  const points = [];
  while (theta < 360 * 10) {
    let y = 0;
    let x = 1.0 * radius * Math.cos(this.toRadians(theta)) + .0;
    let z = 1.0 * radius * Math.sin(this.toRadians(theta)) + 0.0;

    theta += ~~(Math.random() + 5);
    //radius *= .9998;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}
const b1 = new Band(circle, 0.002, 0.07);
b1.group.position.y += .05;
b1.group.position.z += .02;
b1.group.rotation.x = Math.PI / 6;
scene.add(b1.group);

const b2 = new Band(eight, 0.004, 0.05);
b2.group.position.y -= .02;
b2.group.position.z += .02;
scene.add(b2.group);

//Renderer
const canvas = document.querySelector(".draw"); //Select the canvas
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,      //true - transparent bg color (just like in HTML/CSS settings)
  antialias: true,
}); //add WeBGL Renderer

renderer.setSize(aspect.width, aspect.height); //Renderer size
renderer.setPixelRatio(window.devicePixelRatio);
renderer.clearColor = new THREE.Color('#000000');
//scene.background = new THREE.Color( 0xff0000 );

texSun.anisotropy = renderer.capabilities.getMaxAnisotropy();

//responsive view, update view when window is resizing
window.addEventListener("resize", event => {
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});


scene.add(ambientLight);
scene.add(directionalLight);

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
    const matPhoneCase = new THREE.MeshPhongMaterial({ color: 0x333333 });
    matPhoneCase.reflectivity = .4;
    matPhoneCase.shininess = .9;

    const matLCD = new THREE.MeshPhongMaterial({ color: 0x404040 });
    matLCD.reflectivity = .1;
    matLCD.shininess = .1;
    indx++;
    
    phone.children[1].material.needsUpdate = true;  //phone case
    phone.children[0].material = matPhoneCase;
    phone.children[1].material = matLCD;
    const lcdGlow = materialGlow.clone();
    //lcdGlow.side = THREE.FrontSide;
    //phone.children[0].material = materialGlow;

    sun = model.children[indx + 1]; //sun
    sun.material.needsUpdate = true;
    sun.material = matMoon.clone();
    
    moon1 = model.children[indx + 5]; //moon 1
    moon1.material.needsUpdate = true;
    moon1.material = matMoon2.clone();
    moon1.material.map = moon1.material.map.clone();
    moon1.material.map.offset.x = .4;   //move so there will be visible orange crest;
    
    moon2 = model.children[indx + 2]; //moon 2
    moon2.material.needsUpdate = true;
    moon2.material = matMoon2.clone();
    moon2.material.map.offset.x = -.85;   //move so there will be visible orange crest;
    
    moon3 = model.children[indx + 4]; //moon 3
    moon3.material = matMoon.clone();
    moon3.material.needsUpdate = true;
    
    sunGlow = model.children[indx + 3]; //sunGlow
    sunGlow.material = materialGlow;
    sunGlow.scale.multiplyScalar(1.23);
    sunGlow.castShadow = false;
    sunGlow.receiveShadow = false;
    sunGlow.visible = true;

    const matHand = new THREE.MeshPhongMaterial({ color: 0x222222 });
    matHand.reflectivity = .4;
    matHand.shininess = .4;

    hand = model.children[indx + 6]; //moon3
    hand.material.needsUpdate = true;
    hand.frustumCulled = false;
    hand.material = matHand;  //IMPORTANT so that hand is visible in close range

    if(object.animations.length > 0) {
      action = mixer.clipAction(object.animations[0]);
      //action.setLoop( THREE.LoopOnce );
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
    console.log( 'Error while loading glTF file' );
  }
);

const stats = Stats()
document.body.appendChild(stats.dom)

const composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera ); 
composer.addPass( renderPass ); 
const filmPass = new FilmPass(
  .7,   // intensity
  false,  
);
filmPass.uniforms.grayscale.value = .0;
composer.addPass(filmPass);
filmPass.enabled = parameters.filmPass;

//composer.removePass(filmPass);


//glowing effect on the band
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = .2;
bloomPass.strength = 1.2;
bloomPass.radius = .10;
composer.addPass(bloomPass);

const cameraMoveY = 0.1;

//------------------------------------------------------------------
//-----------------------Animate------------------------------------
//------------------------------------------------------------------
const animate = () => {
  const elapsedTime = clock.getElapsedTime();
 
  if (action !== null)  {
    if(mixer.time + parameters.aniSpeed < action.getClip().duration) {
      mixer.update(parameters.aniSpeed)
      //b1.group.position.y+=0.0001;
      if (sun !== null) {
        //sun.rotation.y = elapsedTime * Math.PI / 100;
        // sun.material.map.offset.x += .0001;
        // sun.material.map.offset.y += .0001;
      }
      console.log(mixer.time);
      if(mixer.time > 9.1 && mixer.time) {
        // camera.position.y -= 0.00051;
        // camera.rotation.x -= 0.0001;
      }
    }
    else {
      // camera.position.y = 0.0;
      // camera.rotation.x = 0.0;
      mixer.time = 0;
  }
  }

  window.requestAnimationFrame(animate);
  composer.render();
  //renderer.render(scene, camera); //draw what the camera inside the scene captured
  stats.update()
};
animate();