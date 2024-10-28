import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from 'three.meshline';

const BAND_SIZE = .005;



class Band {
    constructor(points, size) {
      this.size = size;
      this.points = points;
      this.group = new THREE.Object3D();
      this.position = new THREE.Vector3();
      this.segments = 45;
      this.init();
    }
  
    init() {
      this.geometry = new THREE.BufferGeometry();
      const mat = new MeshLineMaterial({
        color: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
      });
      this.line = new MeshLine();
      this.mesh = new THREE.Mesh(this.line.geometry, mat);
      this.group.add(this.mesh);
      const verts = []
      for (let i = 0; i < this.segments; i++) {
        verts.push(new THREE.Vector3());
      }
      this.geometry.setFromPoints(verts);
      // this.light = new THREE.PointLight(0xb65a40, .1, 1);
      this.group.add(this.light);
      this.group.visible = false;
      this.line.setGeometry(this.geometry, pt => pt * this.size);
    }
  
    start() {
      this.indx = 0;
      this.group.visible = false;
    }
  
  
    toRadians(angle) {
      return angle * Math.PI / 180.0;
    }
  
    updatePosition() {
      // this.light.position.copy(this.position);
      this.line.advance(this.position);
    }
  
    update(steps) {
      
      if(!steps) 
        steps = 1;
      if(!this.group.visible)
        setTimeout(()=> {this.group.visible = true}, 300);
      this.position = this.points[this.indx];
      
      this.updatePosition();
      if(this.indx < this.points.length - steps) 
        this.indx+=steps;
      else
        this.indx = this.points.length-1;
    }
  }

  export {Band}