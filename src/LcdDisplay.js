import * as THREE from "three";
import {CandleChart} from "./CandleChart.js";
// import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

let LCD_ASPECT = 2.5;
const SHFITING_BAR_SPEED = 0.02;
const BG_TEX = "./texture/gradient_bg_lcd.png";
// const BG_TEX = "./texture/phone_screen.png";
class LcdDisplay {
    constructor(aspect) {

        this.sceneRTT = new THREE.Scene();
        this.sceneRTT.background = new THREE.Color( 0x000000 );
        const hd = window.innerHeight;
        this.cameraRTT = new THREE.OrthographicCamera(-hd / 50, hd / 50, hd / 50, -hd / 50, 0, 10);
        this.cameraRTT.position.z = 10;
        this.cameraRTT.position.y = 0;

        LCD_ASPECT = aspect;
        this.scale = 1.0;
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load(BG_TEX),
            transparent: true,
            opacity: 0.13,
        });

        
        const geometry = new THREE.TorusGeometry( 10, .2, 36, 64 );
        const geometry1 = new THREE.PlaneGeometry(hd / 25, hd / 25);
        const material1 = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(BG_TEX),
        });
        this.plane = new THREE.Mesh(geometry1, material1);
        this.plane.position.z = 0;
        this.sceneRTT.add(this.plane);


        this.circle = new THREE.Mesh(geometry, material.clone());
        this.circle.position.z = 2;
        this.circle.material.map.offset.y = .25;
        this.circle.material.map.wrapS = this.circle.material.map.wrapT = THREE.RepeatWrapping;
        this.circle.material.map.repeat.set(1,-1);
        this.sceneRTT.add(this.circle);

        this.circle2 = new THREE.Mesh(geometry.clone(), material.clone());
        this.circle2.material.map.wrapS = this.circle2.material.map.wrapT = THREE.RepeatWrapping;
        this.circle2.material.map.repeat.set(1.0, -1.0);
        this.circle2.scale.multiplyScalar(1.03);
        this.circle2.position.z = 1;
        this.circle2.visible = false;
        //this.sceneRTT.add(this.circle2);


        this.chart = new CandleChart();
        this.chart.group.scale.y = LCD_ASPECT;
        //this.chart.group.visible = false;

        this.circle.scale.y = LCD_ASPECT;
        this.circle2.scale.y = LCD_ASPECT;
        // this.plane.scale.y = LCD_ASPECT;
        this.sceneRTT.add(this.chart.group);


        //rects:

        this.cubeGroup = new THREE.Group();
        this.cubesLeft = [];
        this.cubesRight = [];
        this.startPosL = [];
        this.endPosL = [];
        this.startPosR = [];
        this.endPosR = [];
        this.shift = [0, 0, 0];

        const offsetY = -7;
        const startingDist = 6 //7;
        const colorGradientPairs = [0xeeeeee,0xe1e1fc, 0xb9fafb];
        for (let i = 0; i < 3; i++) {
            // const geometry = new RoundedBoxGeometry(6 - i * 2, 1, 1, .9,35);
            const geometry = new THREE.BoxGeometry(6 - i * 2, 1, 1);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
            });
            const material2 = new THREE.MeshBasicMaterial({
                color: 0xffffff,
            });

            let cube = new THREE.Mesh(geometry, material);
            cube.position.z = 2;
            const cube2 = cube.clone();
            cube2.material = material2;
            this.endPosR.push(-(6 - i * 2) / 2 - .5);
            this.startPosR.push(-5 + (6 - i * 2) / 2 - 1 - startingDist);

            cube.position.x = -5 + (6 - i * 2) / 2 - 1 - startingDist;

            cube.position.y = 10 - (i * 2 + 1) + offsetY;

            cube.material.color.setHex(colorGradientPairs[ i]);
            cube2.material.color.setHex(colorGradientPairs[2 - i]);
            this.cubesRight.push(cube);
            this.cubesLeft.push(cube2);
            cube.scale.multiplyScalar(.8);
            cube2.scale.multiplyScalar(.8);
            
            //cube2.position.x = -(6-i*2)/2 - 1 - startingDist;
            this.endPosL.push((6 - i * 2) / 2 - 1 + 1.5);
            this.startPosL.push(5 - (6 - i * 2) / 2 - 1 + 1 + startingDist);
            
            cube2.position.x = 5 - (6 - i * 2) / 2 - 1 + 1 + startingDist;
            cube2.position.y = 6 - (-i * 2 + 1) + offsetY;
            
            this.sceneRTT.add(cube);
            this.sceneRTT.add(cube2);
            this.cubeGroup.add(cube);
            this.cubeGroup.add(cube2);

        }
        this.startTime1 = 2.1;
        this.startTime2 = 4.0 + this.startTime1;
        this.cubeGroup.visible = false;
        this.sceneRTT.add(this.cubeGroup);
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
        this.scale *= .995;

        this.chart.group.position.y = -(6 * this.scale);
        if (this.scale < .3)
            this.circle2.visible = true;

        if(this.move-- > 0){
            this.chart.shift(0,SHFITING_BAR_SPEED);
            this.chart.shift(1,SHFITING_BAR_SPEED);
            this.chart.shift(2,SHFITING_BAR_SPEED);
            this.chart.shift(4,SHFITING_BAR_SPEED);

            this.chart.shift(5,-SHFITING_BAR_SPEED);
            this.chart.shift(6,-SHFITING_BAR_SPEED);
            this.chart.shift(7,-SHFITING_BAR_SPEED);
            this.chart.shift(8,-SHFITING_BAR_SPEED);
            this.chart.shift(10,-SHFITING_BAR_SPEED);
            this.chart.shift(11,-SHFITING_BAR_SPEED);
            this.chart.shift(12,-SHFITING_BAR_SPEED);
    }
        if (this.startTime2 > tm) return;
        this.cubeGroup.visible = true;
        for (let i = 0; i < 3; i++) {
            if (this.shift[i] < 1.0) {
                if ((i > 0 && this.shift[i - 1] > .5) || i == 0) {
                    if(i > 1) this.chart.group.visible = false;
                    this.cubesLeft[2 - i].position.x = (this.endPosL[2 - i] - this.startPosL[2 - i]) * this.shift[i] + this.startPosL[2 - i];
                    this.cubesRight[i].position.x = (this.endPosR[i] - this.startPosR[i]) * this.shift[i] + this.startPosR[i];
                    this.shift[i] += 0.02;
                }
            }
        }
        // if (this.shift[2] >= 1.0) this.circle.visible = false;
    }
}

export {
    LcdDisplay
}