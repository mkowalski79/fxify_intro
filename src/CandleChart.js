import * as THREE from "three";

class CandleChart {
  constructor() {
    this.group = new THREE.Group();
    this.init();
    this.group.position.x = -this.bars.length;
    this.group.position.y = -6;
    this.group.position.z = 3;
  }
  shift(indx, val) {
    this.bars[indx].cube.position.y += val;
    this.bars[indx].cube1.position.y += val;
  }
  init() {
    this.bars = [
      new CandleBar(this.group, 1, 4, 5, new THREE.Vector2(1, 0)),
      new CandleBar(this.group, 2, 5, 6, new THREE.Vector2(2, 1)),
      new CandleBar(this.group, 0, 4, 5, new THREE.Vector2(3, 4)),
      new CandleBar(this.group, 1, 4, 5, new THREE.Vector2(4, 2)),
      new CandleBar(this.group, 1, 6, 7, new THREE.Vector2(5, 1)),
      new CandleBar(this.group, 2, 4, 6, new THREE.Vector2(6, 2)),
      new CandleBar(this.group, 1, 5, 6, new THREE.Vector2(7, 1)),
      new CandleBar(this.group, 2, 4, 5, new THREE.Vector2(8, 2)),
      new CandleBar(this.group, 1, 3, 6, new THREE.Vector2(9, 1)),
      new CandleBar(this.group, 1, 4, 5, new THREE.Vector2(10, 3)),
      new CandleBar(this.group, 1, 3, 6, new THREE.Vector2(11, 5)),
      new CandleBar(this.group, 1, 4, 5, new THREE.Vector2(12, 6)),
      new CandleBar(this.group, 1, 5, 6, new THREE.Vector2(13, 7)),
    ];
  }
}
class CandleBar {
  constructor(group, min, max, size, position) {

    this.group = group;
    this.min = min;
    this.size = size;
    this.max = max;
    this.position = position;
    this.init();
    this.group.visible = false;
  }

  init() {
    //creates volume of the candle
    const geometry = new THREE.BoxGeometry(1, (this.max - this.min), 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
    });
    //Applies material to BoxGeometry
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.x = this.position.x * 2;
    this.cube.position.y = this.position.y + (this.max - this.min) / 2 + this.min;
    this.group.add(this.cube);

    //creates volume of the candle
    const geometry1 = new THREE.BoxGeometry(.2, this.size, 1);
    this.cube1 = new THREE.Mesh(geometry1, material);
    this.cube1.position.x = this.position.x * 2;
    this.cube1.position.y = this.position.y + (this.size) / 2;
    this.group.add(this.cube1);

  }

}


export {
  CandleChart
}