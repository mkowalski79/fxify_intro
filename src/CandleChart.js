import * as THREE from "three";

class CandleChart {
  constructor() {
    this.group = new THREE.Group();
    this.init();
    this.group.position.x = -this.bars.length;
    this.group.position.y = -6;
    this.group.position.z = 3;
  }
  init() {
    this.bars = [
      new CandleBar(this.group, 1, 5, 7, new THREE.Vector2(1, 0)),
      new CandleBar(this.group, 2, 7, 8, new THREE.Vector2(2, 1)),
      new CandleBar(this.group, 0, 4, 5, new THREE.Vector2(3, 3)),
      new CandleBar(this.group, 2, 4, 6, new THREE.Vector2(4, 2)),
      new CandleBar(this.group, 1, 6, 7, new THREE.Vector2(5, 1)),
      new CandleBar(this.group, 2, 6, 6, new THREE.Vector2(6, 2)),
      new CandleBar(this.group, 1, 6, 7, new THREE.Vector2(7, 2)),
      new CandleBar(this.group, 2, 3, 5, new THREE.Vector2(8, 3)),
      new CandleBar(this.group, 1, 3, 7, new THREE.Vector2(9, 2)),
      new CandleBar(this.group, 1, 3, 5, new THREE.Vector2(10, 3)),
      new CandleBar(this.group, 1, 3, 6, new THREE.Vector2(11, 5)),
      new CandleBar(this.group, 3, 7, 8, new THREE.Vector2(12, 7)),
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
      color: 0xffffff,
    });
    //Applies material to BoxGeometry
    let cube = new THREE.Mesh(geometry, material);
    cube.position.x = this.position.x * 2;
    cube.position.y = this.position.y + (this.max - this.min) / 2 + this.min;
    this.group.add(cube);

    //creates volume of the candle
    const geometry1 = new THREE.BoxGeometry(.2, this.size, 1);
    const cube1 = new THREE.Mesh(geometry1, material);
    cube1.position.x = this.position.x * 2;
    cube1.position.y = this.position.y + (this.size) / 2;
    this.group.add(cube1);

  }

}


export { CandleChart}