import * as THREE from "three";
import * as GSAP from "gsap";
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import glowVertexShader from "./shaders/glowvertexshader.glsl";
import glowFragmentShader from "./shaders/glowfragmentshader.glsl";

const BAND_SIZE = .005;



class Band {
    constructor(fun, size, speed) {
      this.size = size;
      this.speed = speed;
      this.getPoints = fun;
      this.group = new THREE.Object3D();
      this.position = new THREE.Vector3();
      this.segments = 65;
      this.init();
      this.spawn();
    }
  
    init() {
      this.geometry = new THREE.BufferGeometry();
      const mat = new MeshLineMaterial({
        color: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
        wireframe: !true,
      });
      this.line = new MeshLine();
      this.mesh = new THREE.Mesh(this.line.geometry, mat);
      this.group.add(this.mesh);
      const verts = []
      for (let i = 0; i < this.segments; i++) {
        verts.push(new THREE.Vector3());
      }
      this.geometry.setFromPoints(verts);
      this.light = new THREE.PointLight(0xb65a40, .1, 1);
      this.group.add(this.light);
    }
  
    spawn() {
      const {
        position,
        line
      } = this;
      const wayPoints = this.getPoints();
    //   this.geometry.attributes.position.array.forEach(
    //     v => v.copy(wayPoints[0])
    //   );
      this.position.copy(wayPoints[0]);
      this.light.position.copy(wayPoints[0]);
      line.setGeometry(this.geometry, p => p * this.size);
      this.startPath(wayPoints);
    }
  
  
    toRadians(angle) {
      return angle * Math.PI / 180.0;
    }
  
    updatePosition() {
      const {
        position
      } = this;
      this.light.position.copy(position);
      this.line.advance(position);
    }
  
    startPath(waypoints) {
      const {
        position
      } = this;
      this.timeline = new GSAP.TimelineMax({
        onComplete: () => {
          GSAP.TweenMax.to(this.position, 1, {
            onUpdate: this.updatePosition.bind(this),
          });
        }
      });
      waypoints.forEach((pos, idx) => {
        this.timeline.to(this.position, this.speed, {
          x: pos.x,
          y: pos.y,
          z: pos.z,
          onUpdate: this.updatePosition.bind(this),
          ease: GSAP.Linear.easeNone
        });
  
  
        if (idx === 0) {
          this.timeline.to(this.light, 0.2, {
            power: 1.5 * 4 * Math.PI
          });
        }
  
        if (idx === waypoints.length - 1) {
          this.timeline.to(this.light, 0.4, {
            power: 0.1 * 4 * Math.PI
          }, '-=0.45');
        }
  
      });
    }
  }

  export {Band}