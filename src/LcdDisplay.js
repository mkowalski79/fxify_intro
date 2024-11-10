import * as THREE from "three";
import {CandleChart} from "./CandleChart.js";
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

let LCD_ASPECT = .1;
const BG_TEX = "./texture/gradient_bg_lcd.png";
class LcdDisplay {
    constructor(aspect) {

        this.sceneRTT = new THREE.Scene();
        this.sceneRTT.background = new THREE.Color( 0x000000 );
        const hd = window.innerHeight;
        this.cameraRTT = new THREE.OrthographicCamera(-hd / 50, hd / 50, hd / 50, -hd / 50, 0, 10);
        this.cameraRTT.position.z = 10;
        this.cameraRTT.position.y = 0;
        this.inc = 0.01;

        LCD_ASPECT = aspect;
        this.scale = 1.0;

        
        const geometry = new THREE.TorusGeometry( 14, .4, 64, 64 );
        const geometry1 = new THREE.PlaneGeometry(hd / 25, hd / 25);
        const matPlane = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(BG_TEX),
            color: 0xffffff,
        });
        const matCircle = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(BG_TEX),
            color: 0xffffff,
            transparent: true,
            opacity: .7,
        });
        this.plane = new THREE.Mesh(geometry1, matPlane);
        this.sceneRTT.add(this.plane);


        this.circle = new THREE.Mesh(geometry, matCircle.clone());
        this.circle.position.z = 2;
        this.circle.position.y = 0;
        this.circle.material.map.offset.y = .25;
        // this.circle.material.map.wrapS = this.circle.material.map.wrapT = THREE.RepeatWrapping;
        // this.circle.material.map.repeat.set(1,-1);
        this.sceneRTT.add(this.circle);
        
        this.circle2 = new THREE.Mesh(geometry.clone(), new THREE.MeshBasicMaterial({
            color: 0xeeeeee,
            transparent: true,
            opacity: .1
        }));
        //this.circle2.material.map.wrapS = this.circle2.material.map.wrapT = THREE.RepeatWrapping;
        // this.circle2.material.map.offset.y=1.0;
        //this.circle2.material.map.repeat.y = -1.0;
        //this.circle2.scale.multiplyScalar(1.05);
        this.circle2.position.z = 1;
        this.circle2.visible = false;
        this.sceneRTT.add(this.circle2);
        
        
        this.chart = new CandleChart();
        this.chart.group.scale.y = LCD_ASPECT;
        //this.chart.group.visible = false;
        
        this.circle.scale.y = LCD_ASPECT;
        this.circle2.scale.y = LCD_ASPECT;
        
        this.sceneRTT.add(this.chart.group);


        //rects:

        this.logo = new THREE.Group();
        this.logo2 = new THREE.Group();
        this.cubesLeft = [];
        this.cubesRight = [];
        this.startPosL = [];
        this.endPosL = [];
        this.startPosR = [];
        this.endPosR = [];
        this.shift = [0, 0, 0];

        const offsetY = -7;
        const startingDist = 5 //7;
        const colorGradientPairs = [0x60a4e1,0x70afe6, 0x84bbec];
        const colorGradientPairs2 = [0x68a9e3,0x84bbea, 0xa5cef2];
        for (let i = 0; i < 3; i++) {
            // const geometry = new RoundedBoxGeometry(6 - i * 2, 1, 1, .9,35);
            const geometry = new THREE.BoxGeometry((6 - i * 2)*2, 2, 1);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
            });
            const material2 = new THREE.MeshBasicMaterial({
                color: 0xdddddd,
            });

            let cube = new THREE.Mesh(geometry, material);
            cube.position.z = 2;
            const cube2 = cube.clone();
            cube2.material = material2.clone();
            this.endPosR.push(-(9 - i * 3) / 2 - .5);
            this.startPosR.push(-7 + (6 - i * 2) / 2 - 1 - startingDist);

            cube.position.x = this.startPosR.at(-1);

            cube.position.y = 8.6 -( (-i * 1.2 + 1) )*2 + offsetY;

            cube.material.color.setHex(colorGradientPairs2[ i]);
            cube2.material.color.setHex(colorGradientPairs[2 - i]);
            this.cubesRight.push(cube);
            this.cubesLeft.push(cube2);
            cube.scale.multiplyScalar(.8);
            cube2.scale.multiplyScalar(.8);
            
            //cube2.position.x = -(6-i*2)/2 - 1 - startingDist;
            this.endPosL.push((10 - i * 3) / 2 - 1 + 1.5);
            this.startPosL.push(8 - (6 - i * 2) / 2 + startingDist);
            
            cube2.position.x = this.startPosL.at(-1);
            cube2.position.y = 13.4 - ((i * 1.2 + 1))*2 + offsetY;
            
            this.logo.add(cube);
            this.logo.add(cube2);

            const cubeGlow = cube.clone();
            cubeGlow.position.x = this.endPosR.at(-1);
            const cubeGlow2 = cube2.clone();
            cubeGlow.position.z -= 1;
            cubeGlow2.position.x = this.endPosL.at(-1);
            cubeGlow.material = material2;
            cubeGlow2.material = material2;

            cubeGlow.position.x -= .1;
            cubeGlow2.position.x += .05;

            cubeGlow2.position.z -= 1;
            cubeGlow.scale.multiplyScalar(1.1);
            cubeGlow2.scale.multiplyScalar(1.1);

            this.logo2.add(cubeGlow);
            this.logo2.add(cubeGlow2);

        }
        this.startTime1 = 1.1;
        this.startTime2 = 3.0 + this.startTime1;
        
        this.logo.position.y = -1.8;
        this.logo2.position.y = -1.8;
        
        this.logo.visible = false;
        this.logo2.visible = false;
        this.sceneRTT.add(this.logo);
        this.sceneRTT.add(this.logo2);
        this.move = 120;

    }

    update(tm, bufferTexture, renderer) {


        renderer.setRenderTarget( bufferTexture );
        renderer.render( this.sceneRTT, this.cameraRTT );
        if (this.startTime1 > tm ) return;
        if(this.startTime2 > tm) 
            this.chart.group.visible = true;

        //charts
        this.chart.group.scale.x = (this.scale);
        this.chart.group.scale.y = (this.scale);
        this.chart.group.position.x = -((this.chart.bars.length + 1) * this.scale);
        this.scale *= .992;

        this.chart.group.position.y = -(6 * this.scale);
        if (this.scale < .3)
            this.circle2.visible = true;

        if(this.move-- > 0){
            this.chart.shift(0,0.015);
            this.chart.shift(1,0.015);
            this.chart.shift(2,0.015);
            this.chart.shift(4,0.015);

            this.chart.shift(5,-0.015);
            this.chart.shift(6,-0.015);
            this.chart.shift(7,-0.015);
            this.chart.shift(8,-0.015);
            this.chart.shift(10,-0.015);
            this.chart.shift(11,-0.015);
            this.chart.shift(12,-0.015);
    }
        if (this.startTime2 > tm) return;
        this.logo.visible = true;
        for (let i = 0; i < 3; i++) {
            if (this.shift[i] < 1.0) {
                if ((i > 0 && this.shift[i - 1] > .4) || i == 0) {
                    if(i > 1) this.chart.group.visible = false;
                    this.cubesLeft[ i].position.x = (this.endPosL[i] - this.startPosL[i]) * this.shift[i] + this.startPosL[i];
                    this.cubesRight[2 - i].position.x = (this.endPosR[2 - i] - this.startPosR[2 - i]) * this.shift[i] + this.startPosR[2 - i];
                    this.shift[i] += this.inc;
                    this.inc*=1.01;
                    //this.circle2.visible = false;
                }
            }
        }
        if (this.shift[2] >= 1.0) {
            this.circle2.material.opacity += 0.01;
            if(this.circle.material.opacity > 0.1)
                this.circle.material.opacity -= 0.01;
            this.logo2.visible = true;

        }
    }
}

export {
    LcdDisplay
}