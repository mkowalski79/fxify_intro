import "./style.css";
import * as THREE from "three";
import glowVertexShader from "./shaders/glowvertexshader.glsl";
import glowFragmentShader from "./shaders/glowfragmentshader.glsl";

import * as dat from "dat.gui";
import {
  GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module'

import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  FilmPass
} from 'three/examples/jsm/postprocessing/FilmPass.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  Band
} from "./Band.js";


import {
  LcdDisplay
} from "./LcdDisplay.js";

const LCD_ASPECT = .7;



//global params
const parameters = {
  fov: 26,
  c: 0.32,
  p: 3.5,
  ambientLight: 0.75,
  directionLight: 0.75,
  aniSpeed: 0.035,
  filmPass: !true,
}


let composer = null;
const scene = new THREE.Scene();
const clock = new THREE.Clock();
const gui = new dat.GUI();
let bandList = []; //list of flying 'ribbons'
const filmPass = new FilmPass(.7, false);

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
texSun.repeat.set(3, 1);


const texMoon2 = new THREE.TextureLoader().load('./texture/mooncrest1.jpg');
texMoon2.wrapT = THREE.RepeatWrapping;
texMoon2.wrapS = THREE.RepeatWrapping;


const texMoon = new THREE.TextureLoader().load('./texture/moon.jpg');
texMoon.wrapT = THREE.RepeatWrapping;
texMoon.wrapS = THREE.RepeatWrapping;


const texSunBump = new THREE.TextureLoader().load('./texture/sun1_bump.png');
texSunBump.wrapT = THREE.RepeatWrapping;
texSunBump.wrapS = THREE.RepeatWrapping;
texSunBump.repeat.set(3, 1);


const texSunMain = new THREE.TextureLoader().load('./texture/moon.jpg');
texSunMain.wrapT = THREE.RepeatWrapping;
texSunMain.wrapS = THREE.RepeatWrapping;

const texSun1_2 = new THREE.TextureLoader().load('./texture/sun1_2.png');
texSun1_2.wrapT = THREE.RepeatWrapping;
texSun1_2.wrapS = THREE.RepeatWrapping;
texSun1_2.offset.set(.07, -.1);


const texSun1_3 = new THREE.TextureLoader().load('./texture/sun1_2.png');
texSun1_3.wrapT = THREE.RepeatWrapping;
texSun1_3.wrapS = THREE.RepeatWrapping;
texSun1_3.offset.set(-.07, .12);

const lcdDisplay = new LcdDisplay(LCD_ASPECT);

//Camera
let camera = null;
const aspect = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const matSun = new THREE.MeshLambertMaterial({
  color: 0xFFFFFF,
  map: texSun,
  emissiveMap: texSunMain,
  emissiveIntensity: .1,
  // bumpMap: texSunBump,
  side: THREE.DoubleSide,
  //transparent: true,
  //opacity: 1.0,
  //displacementMap: new THREE.TextureLoader().load('./texture/displacementMap.jpg'),
  //displacementScale: .1
});

const matSun1 = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  map: texSun1_2,
  transparent: true,
  side: THREE.FrontSide,
  opacity: .65,
  bumpMap: new THREE.TextureLoader().load('./texture/sun2_bump.jpg'),
  // opacity: .3,
  //displacementMap: new THREE.TextureLoader().load('./texture/displacementMap.jpg'),
  //displacementScale: .1
});

const matSun2 = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  map: texSun1_3,
  transparent: true,
  side: THREE.FrontSide,
  opacity: .65,
  bumpMap: new THREE.TextureLoader().load('./texture/sun2_bump.jpg'),

  //displacementMap: new THREE.TextureLoader().load('./texture/displacementMap.jpg'),
  //displacementScale: .1
});

const matMoon2 = new THREE.MeshStandardMaterial({
  color: 0xAAAAFF,
  map: texMoon2.clone(),
  //bumpMap: new THREE.TextureLoader().load('./texture/sun2_bump.jpg'),
  //bumpScale: 0.00001,
  transparent: false,
  side: THREE.FrontSide,
  //opacity: .65,

});
const matMoon = new THREE.MeshStandardMaterial({
  color: 0xAAAAFF,
  map: texMoon.clone(),
  transparent: false,
  side: THREE.FrontSide,
  //opacity: .65,
});
let rtTexture = new THREE.WebGLRenderTarget(512, 512);


//---------------------------------------------------------------------------------------
//-------------------------------------Light---------------------------------------------
//---------------------------------------------------------------------------------------

const ambientLight = new THREE.AmbientLight("#ffffff", parameters.ambientLight);
// -------------------------------------2)DirectionalLight-------------------------------------
const directionalLight = new THREE.DirectionalLight("#ffffff", parameters.directionLight);
directionalLight.position.set(0, 3.5, -4.5);

//------------------------------------GUI---------------------------------------------
// gui.add(ambientLight, "intensity").min(0).max(1).step(0.01).name("Ambient One");
// gui.add(directionalLight, "intensity").min(0).max(1).step(0.01).name("Directional Two");
// gui.add(directionalLight.position, "x").min(-8).max(8).step(0.02).name("X Dir");
// gui.add(directionalLight.position, "y").min(-8).max(8).step(0.02).name("Y Dir");
// gui.add(directionalLight.position, "z").min(-8).max(8).step(0.02).name("Z Dir");
gui.add(parameters, 'c').min(0.0).max(1.0).step(0.01).name("c").onChange((value) => {
  sunGlow.material.uniforms["c"].value = parameters.c;
});
gui.add(parameters, 'p').min(0.0).max(6.0).step(0.01).name("p").onChange((value) => {
  sunGlow.material.uniforms["p"].value = parameters.p;
});
// gui.add(camera.rotation, "x").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation X").onChange(function(value) { camera.rotation.x = value; });
// gui.add(camera.rotation, "y").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation y").onChange(function(value) { camera.rotation.y = value; });
// gui.add(camera.rotation, "z").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation z").onChange(function(value) { camera.rotation.z = value; });
// gui.add(camera.position, "z").min(-5).max(5).step(.05).name("position z").onChange(function(value) { camera.position.z = value; });
gui.add(parameters, "fov").min(10).max(200).step(2).name("fov").onChange(function (value) {
  camera.fov = value;
  camera.updateProjectionMatrix();
});
gui.add(parameters, "aniSpeed").min(0).max(0.1).step(0.005).name("speed");


const folder = gui.addFolder('PostProduction');
const mvGUI = folder.add(parameters, 'filmPass').name("Film Pass").listen();
mvGUI.onChange(function (value) {

  if (value === true) {
    filmPass.enabled = true;
  } else {
    filmPass.enabled = false;
  }
});
folder.open();


function circle() {
  let theta = 0;
  let radius = .011;

  const points = [];
  while (theta <= 360 * 2) {
    theta += ~~(Math.random() + 5);
    const deg = theta * Math.PI / 180.0
    let y = 0;
    let x = 1.0 * radius * Math.cos(deg) + .0;
    let z = 1.0 * radius * Math.sin(deg) + .0;

    //radius *= .9998;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}
let b1 = new Band(circle(), 0.0002, parameters.aniSpeed * 4);
b1.group.position.y += .001;
b1.group.position.z += .0;
b1.group.rotation.x = Math.PI / 3.5;
// b1.start();
scene.add(b1.group);


//Renderer
const canvas = document.querySelector(".draw"); //Select the canvas
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true, //true - transparent bg color (just like in HTML/CSS settings)
  antialias: true,
}); //add WeBGL Renderer

renderer.setSize(aspect.width, aspect.height); //Renderer size
renderer.setPixelRatio(window.devicePixelRatio);
renderer.clearColor = new THREE.Color('#000000');
//scene.background = new THREE.Color( 0xff0000 );

texSun.anisotropy = renderer.capabilities.getMaxAnisotropy();


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
    model = object.scene; //.children[0]; //sun
    if (object.cameras.length > 0)
      camera = object.cameras[0];
    camera.near = 0.001;
    camera.far = 100;
    // camera.frustumCulled = false;
    resizeWindow(null);
    //model.scale.set(10, 10, 10);
    // Ustawienie pozycji modelu
    //model.position.z = -5.0;
    // Inicjalizacja animacji
    mixer = new THREE.AnimationMixer(model);
    model.userData.mixer = mixer;
    // model.visible = false;


    phone = model.children[1]; //phone object
    phone.children[0].material.needsUpdate = true; //LCD display
    const matPhoneCase = new THREE.MeshPhongMaterial({
      color: 0x333333
    });
    matPhoneCase.reflectivity = .4;
    matPhoneCase.shininess = .9;

    const matLCD = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: rtTexture.texture
    });
    const matLCD1 = new THREE.MeshPhongMaterial({
      color: 0x404040
    });
    matLCD.reflectivity = .1;
    matLCD.shininess = .1;

    phone.children[1].material.needsUpdate = true; //phone case
    phone.children[0].material = matPhoneCase;
    phone.children[1].material = matLCD;
    const lcdGlow = matLCD1;
    //lcdGlow.side = THREE.FrontSide;
    //phone.children[0].material = materialGlow;

    const bands = model.children[2]; //bands

    for (let i = 0; i < bands.children.length; i++) {
      const spline = bands.children[i];
      spline.visible = false;
      const geo = spline.geometry;
      const points = [];
      let positions = geo.attributes.position.array;
      let ptCout = positions.length / 3;
      for (let i = 0; i < ptCout - 9; i++) {
        points.push(new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]));
      }
      const b2 = new Band(points, 0.00045);
      //  b2.group.position.y -= .01;
      // b2.group.position.z += .01;
      //b2.group.rotation.x = Math.PI/2;
      scene.add(b2.group);
      b2.start();
      b2.group.visible = false;
      
      console.log("start b2");
      bandList.push(b2);
    }
    bandList[2].group.position.y -= .006;
    bandList[2].group.position.x -= .005;
    bandList[2].group.rotation.z = Math.PI / 6;

    bandList[1].group.position.y += .002;
    bandList[1].group.position.z += .005;
    bandList[1].group.rotation.z = Math.PI *.8;

    bandList[0].group.position.x -= .003;
    bandList[0].group.position.y -= .003;
    bandList[0].group.rotation.z = +Math.PI *.2;
    

    sun = model.children[5]; //sun
    sun.geometry.clearGroups();
    sun.geometry.addGroup(0, Infinity, 0);
    sun.geometry.addGroup(0, Infinity, 1);
    sun.geometry.addGroup(0, Infinity, 2);
    const materials = [matSun, matSun1, matSun2]


    sun.material.needsUpdate = true;
    sun.material = materials; //matSun.clone();
    moon1 = model.children[9]; //moon 1
    moon1.material.needsUpdate = true;
    moon1.material = matMoon2.clone();
    moon1.material.map = moon1.material.map.clone();
    moon1.material.map.offset.x = .6; //move so there will be visible orange crest;

    moon2 = model.children[6]; //moon 2
    moon2.material.needsUpdate = true;
    moon2.material = matMoon2.clone();
    moon2.material.map = moon2.material.map.clone();
    moon2.material.map.offset.x = -.85; //move so there will be visible orange crest;

    moon3 = model.children[8]; //moon 3
    moon3.material = matMoon.clone();
    moon3.material.map = moon3.material.map.clone();
    moon3.material.needsUpdate = true;

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
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });

    sunGlow = model.children[7]; //sunGlow
    sunGlow.material = materialGlow;
    sunGlow.scale.multiplyScalar(1.23);
    sunGlow.visible = true;

    const matHand = new THREE.MeshPhongMaterial({
      color: 0x222222
    });
    matHand.reflectivity = .4;
    matHand.shininess = .4;

    hand = model.children[10]; //hand
    hand.material.needsUpdate = true;
    hand.frustumCulled = false;
    hand.material = matHand; //IMPORTANT so that hand is visible in close range

    if (object.animations.length > 0) {
      action = mixer.clipAction(object.animations[0]);
      //action.setLoop( THREE.LoopOnce );
      if (action)
        action.play(); // Rozpoczęcie animacji
    }
    scene.add(model);

    //responsive view, update view when window is resizing
    window.addEventListener("resize", resizeWindow);
    initComposer();
    animate();
  },


  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  // called when loading has errors
  function (error) {
    console.log('Error while loading glTF file');
  }
);

function resizeWindow(event) {
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

const stats = Stats()
document.body.appendChild(stats.dom)

//postproduction effects
function initComposer() {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  filmPass.uniforms.grayscale.value = .0;
  composer.addPass(filmPass);
  filmPass.enabled = parameters.filmPass;


  //glowing effect on the flying ribbons
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = .8;
  bloomPass.strength = 1.2;
  bloomPass.radius = .10;
  composer.addPass(bloomPass);
}


//------------------------------------------------------------------
//-----------------------Animate------------------------------------
//------------------------------------------------------------------
const animate = () => {
  window.requestAnimationFrame(animate);
  //const elapsedTime = clock.getElapsedTime();

  if (action !== null) {
    if (mixer.time + parameters.aniSpeed < action.getClip().duration) {
      mixer.update(parameters.aniSpeed)
      texSun1_3.offset.x += parameters.aniSpeed / 150.0;
      texSun1_3.offset.y -= parameters.aniSpeed / 100.0;
      texSun1_2.offset.x -= parameters.aniSpeed / 150.0;
      texSun1_2.offset.y += parameters.aniSpeed / 100.0;
      //b1.group.position.y+=0.0001;
      if (sun !== null) {
        //sun.rotation.y = elapsedTime * Math.PI / 100;
        // sun.material.map.offset.x += .0001;
        // sun.material.map.offset.y += .0001;
      }

      //phone is rotating, launching first ribbons
      if (mixer.time > .8) {
        bandList[0].update(2); //ribbon to the top left
        bandList[1].update(2); //ribbon to the top right
        bandList[2].update(2); //ribbon to the bottom right
      }
    } else { //reset, only in DEBUG mode
      mixer.time = 0;
      texSun1_2.offset.set(.07, -.1);
      texSun1_3.offset.set(-.07, .12);
      bandList.forEach(b => {
        b.start();
      });
    }
  }
  lcdDisplay.update(clock.getElapsedTime(), rtTexture, renderer, parameters.aniSpeed);

  renderer.setSize(aspect.width, aspect.height); //Renderer size
  renderer.setRenderTarget(null);
  composer.render();
  //renderer.render(scene, camera); //draw what the camera inside the scene captured
  stats.update()
};