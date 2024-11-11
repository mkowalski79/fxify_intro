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
  c: 0.36,
  p: 3.0,
  ambientLight: 0.9,
  directionLight: 0.36,
  aniSpeed: 0.022,
  filmPass: !true,
}


let composer = null;
const scene = new THREE.Scene();
const clock = new THREE.Clock();
// const gui = new dat.GUI();

const bandList = new Map(); //list of flying 'ribbons'
const filmPass = new FilmPass(.7, false);

//---------------------------------Objects/Materials----------------------

let hand = null;
let phone = null;
let sun = null;
let moon1 = null;
let moon2 = null;
let moon3 = null;
let sunGlow = null;
let phoneGlow = null;

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
  side: THREE.FrontSide,
});

const matSun1 = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  map: texSun1_2,
  transparent: true,
  side: THREE.FrontSide,
  opacity: .65,
  bumpMap: new THREE.TextureLoader().load('./texture/sun2_bump.jpg'),
});

const matSun2 = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  map: texSun1_3,
  transparent: true,
  side: THREE.FrontSide,
  opacity: .65,
  bumpMap: new THREE.TextureLoader().load('./texture/sun2_bump.jpg'),
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
// gui.add(parameters, 'c').min(-5.0).max(1.0).step(0.01).name("c").onChange((value) => {
//   phoneGlow.material.uniforms["c"].value = parameters.c;
// });
// gui.add(parameters, 'p').min(-5.0).max(6.0).step(0.01).name("p").onChange((value) => {
//   phoneGlow.material.uniforms["p"].value = parameters.p;
// });
// gui.add(camera.rotation, "x").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation X").onChange(function(value) { camera.rotation.x = value; });
// gui.add(camera.rotation, "y").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation y").onChange(function(value) { camera.rotation.y = value; });
// gui.add(camera.rotation, "z").min(-Math.PI).max(Math.PI).step(Math.PI/100.0).name("rotation z").onChange(function(value) { camera.rotation.z = value; });
// gui.add(camera.position, "z").min(-5).max(5).step(.05).name("position z").onChange(function(value) { camera.position.z = value; });
// gui.add(parameters, "fov").min(10).max(200).step(2).name("fov").onChange(function (value) {
//   camera.fov = value;
//   camera.updateProjectionMatrix();
// });
// gui.add(parameters, "aniSpeed").min(0).max(0.1).step(0.005).name("speed");


// const folder = gui.addFolder('PostProduction');
// const mvGUI = folder.add(parameters, 'filmPass').name("Film Pass").listen();
// mvGUI.onChange(function (value) {

//   if (value === true) {
//     filmPass.enabled = true;
//   } else {
//     filmPass.enabled = false;
//   }
// });
// folder.open();

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

    const indices = new Map();
    model.children.forEach((c, indx) =>indices.set(c.name,indx));


    phone = model.children[indices.get('phone')]//.children[0]; //phone object
    phone.children[0].material.needsUpdate = true; //LCD display
    const matPhoneCase = new THREE.MeshPhongMaterial({  color: 0x888888, });

    const matLCD = new THREE.MeshLambertMaterial({
      color: 0xdddddd,
      map: rtTexture.texture
    });
    matLCD.map.wrapS = matLCD.map.wrapT = THREE.WrapAroundEnding;
    matLCD.map.repeat.set(1,-1);
  

    const bands = model.children[indices.get('Group001')]; //bands

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
      const b2 = new Band(points, 0.00035);
      //  b2.group.position.y -= .01;
      // b2.group.position.z += .01;
      //b2.group.rotation.x = Math.PI/2;
      scene.add(b2.group);
      b2.start();
      b2.group.visible = false;
      bandList.set(spline.name,b2);
    }
    bandList.get('Arc002').group.position.y -= .006;
    bandList.get('Arc002').group.position.x -= .005;
    bandList.get('Arc002').group.rotation.z = Math.PI / 6;

    bandList.get('Arc003').group.position.y += .002;
    bandList.get('Arc003').group.position.z += .005;
    bandList.get('Arc003').group.rotation.z = Math.PI *.8;

    bandList.get('Arc004').group.position.x -= .003;
    bandList.get('Arc004').group.position.y -= .003;
    bandList.get('Arc004').group.rotation.z = +Math.PI *.2;
    
    bandList.get('Arc005').group.position.x += .003;
    bandList.get('Arc005').group.position.y -= .005;
    bandList.get('Arc005').group.position.z -= .006;
    bandList.get('Arc005').group.rotation.z = +Math.PI *.35;
    
    bandList.get('Arc006').group.position.x += .000;
    bandList.get('Arc006').group.position.y -= .008;
    bandList.get('Arc006').group.position.z -= .005;
    bandList.get('Arc006').group.rotation.z = + Math.PI *.75;

    bandList.get('Arc007').group.position.x += .001;
    bandList.get('Arc007').group.position.y -= .001;
    bandList.get('Arc007').group.position.z -= .004;
    bandList.get('Arc007').group.rotation.z = + Math.PI*1.1;
    
    // bandList.get('Arc008').group.position.y -= .001;
    // bandList.get('Arc008').group.position.z -= .004;
     bandList.get('Arc008').group.rotation.z = + Math.PI*.15;
     bandList.get('Arc008').group.position.x -= .0026;
     bandList.get('Arc008').group.position.y -= .0022;
     bandList.get('Arc009').group.rotation.z = + Math.PI *.85;
     bandList.get('Arc009').group.position.x += .0026;
     bandList.get('Arc009').group.position.y -= .0022;
     bandList.get('Arc010').group.rotation.z = + Math.PI*1.15;
     bandList.get('Arc010').group.position.x += .0026;
     bandList.get('Arc010').group.position.y -= .001;


    bandList.get('Helix001').size =  0.00030/3;
    bandList.get('Helix001').segments = 40;
    bandList.get('Helix001').init();
    // bandList.get('Helix001').group.rotation.x =  -Math.PI/2.0;
    bandList.get('Helix001').group.rotation.y =  Math.PI/2;
    bandList.get('Helix001').group.rotation.z =  Math.PI/1.0;
    bandList.get('Helix001').group.position.x += .0005;
    bandList.get('Helix001').group.position.y -= .0014;
    bandList.get('Helix001').group.position.z += .024;
    bandList.get('Helix001').start();
    

    sun = model.children[indices.get('sun')]; //sun
    sun.geometry.clearGroups();
    sun.geometry.addGroup(0, Infinity, 0);
    sun.geometry.addGroup(0, Infinity, 1);
    sun.geometry.addGroup(0, Infinity, 2);
    const materials = [matSun, matSun1, matSun2]


    sun.material.needsUpdate = true;
    sun.material = materials; //matSun.clone();

    moon1 = model.children[indices.get('moon1')]; //moon 1
    moon1.material.needsUpdate = true;
    moon1.material = matMoon2.clone();
    moon1.material.map = moon1.material.map.clone();
    moon1.material.map.offset.x = .6; //move so there will be visible orange crest;

    moon2 = model.children[indices.get('moon2')]; //moon 2
    moon2.material.needsUpdate = true;
    moon2.material = matMoon2.clone();
    moon2.material.map = moon2.material.map.clone();
    moon2.material.map.offset.x = -.85; //move so there will be visible orange crest;

    moon3 = model.children[indices.get('moon3')]; //moon 3
    moon3.material = matMoon.clone();
    moon3.material.map = moon3.material.map.clone();
    moon3.material.needsUpdate = true;


    phone.children[0].material.needsUpdate = true; //phone case
    phone.children[0].material = matPhoneCase;
    
    phone.children[1].material = matLCD;

    const matGlowPhone = new THREE.ShaderMaterial({
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
          value: new THREE.Color(0xffffff)
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
      opacity: 0.1,
    });
    // phoneGlow = phone.children[0].children[0];//model.children[indices.get('phoneGlow')];
    phoneGlow = model.children[indices.get('phoneGlow')];
    phoneGlow.material = matGlowPhone.clone();
    //phoneGlow.scale.multiplyScalar(1.03);
    // phoneGlow.visible = false;
    // const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    // pointLight.position.set(phoneGlow.position);
    // phoneGlow.add(pointLight);


    sunGlow = model.children[indices.get('sunGlow')]; //sunGlow
    sunGlow.material = materialGlow;
    sunGlow.scale.multiplyScalar(1.23);
    sunGlow.visible = true;
    

    // const texSkin = new THREE.TextureLoader().load('./texture/hand_skin.jpg');
    // texSkin.wrapS =texSkin.wrapT = THREE.RepeatWrappingl
    // texSkin.repeat.set(1,1);
    const matHand = new THREE.MeshPhongMaterial({
      color: 0x222222,
      color: 0x000000,
      // map: texSkin,
      // bumpMap: texSkin,
      // bumpScale: 0.009,
    });
    matHand.reflectivity = .9;
    matHand.shininess = .9;

    hand = model.children[indices.get('Hand')]; //hand
    hand.material.needsUpdate = true;
    hand.frustumCulled = false;
    hand.material = matHand; //IMPORTANT so that hand is visible in close range

    if (object.animations.length > 0) {
      action = mixer.clipAction(object.animations[0]);
      action.setLoop( THREE.LoopOnce );
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
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  aspect.width = innerWidth;
  aspect.height = innerHeight;
}

//postproduction effects
function initComposer() {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  filmPass.uniforms.grayscale.value = .0;
  composer.addPass(filmPass);
  filmPass.enabled = parameters.filmPass;


  //glowing effect on the flying ribbons and LCD Screen
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = .67;
  bloomPass.strength = 1.5;
  bloomPass.radius = .2;
  composer.addPass(bloomPass);
}

const RIBBON_SPEED = 1;

//------------------------------------------------------------------
//-----------------------Animate------------------------------------
//------------------------------------------------------------------
const animate = () => {
  
  
  if (action !== null) {
    window.requestAnimationFrame(animate);
    
    if (mixer.time + parameters.aniSpeed < action.getClip().duration) {
      mixer.update(parameters.aniSpeed)
      
      // console.log(mixer.time);
      //phone is rotating, launching first ribbons
      
      if (mixer.time < 11) {
        texSun1_3.offset.x += parameters.aniSpeed / 150.0;
        texSun1_3.offset.y -= parameters.aniSpeed / 100.0;
        texSun1_2.offset.x -= parameters.aniSpeed / 150.0;
        texSun1_2.offset.y += parameters.aniSpeed / 100.0;
      }
      if (mixer.time > 10.0) {
        bandList.get('Arc008').update(RIBBON_SPEED); //ribbon to the top left
        bandList.get('Arc009').update(RIBBON_SPEED); //ribbon to the top left
        bandList.get('Arc010').update(RIBBON_SPEED); //ribbon to the top left
        bandList.get('Arc007').start();
        bandList.get('Helix001').update(RIBBON_SPEED*3);
      }
      // if (mixer.time > 9.0) {
      //   bandList.get('Helix001').update(RIBBON_SPEED*2);
      // }

      if (mixer.time > 3.0) {
        bandList.get('Arc005').update(RIBBON_SPEED); //ribbon to the top left
        bandList.get('Arc007').update(RIBBON_SPEED); //ribbon to the top left
      }
      
      if (mixer.time > .4) {
        bandList.get('Arc004').update(RIBBON_SPEED); //ribbon to the top left
        bandList.get('Arc003').update(RIBBON_SPEED); //ribbon to the top right
        bandList.get('Arc002').update(RIBBON_SPEED); //ribbon to the bottom right
      }
      lcdDisplay.update(mixer.time, rtTexture, renderer, parameters.aniSpeed);
      renderer.setSize(aspect.width, aspect.height); //Renderer size
    } else { 
      //reset, only in DEBUG mode
      // mixer.time = 0;
      // lcdDisplay.reset();
      // texSun1_2.offset.set(.07, -.1);
      // texSun1_3.offset.set(-.07, .12);
      // bandList.forEach(b => {
        //   b.start();
      // });
    }
  }
  
  renderer.setRenderTarget(null);
  renderer.clear();
  composer.render();
  //renderer.render(scene, camera); //draw what the camera inside the scene captured
};