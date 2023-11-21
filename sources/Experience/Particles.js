import * as THREE from 'three'
 
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min);

export default class Particles {
  constructor (color, scene) {
    this.scene = scene
    this.geo = new THREE.SphereGeometry(0.01, 8)
    this.mat = new THREE.MeshBasicMaterial({color: color})
    this.mat.needsUpdate = true
    this.obj = new THREE.Object3D()
    this.particleCount = 1500;
    this.group = new THREE.Group()
    this.particlesData = []
    this.particlesHasBeenInit
    
  }

  init() {
    this.particleSystem = new THREE.InstancedMesh(this.geo, this.mat, this.particleCount )
    this.generateParticlesData()
    
    for(let i = 0; i < this.particleCount; i++){
    

        this.obj.position.set(this.particlesData[i].x, this.particlesData[i].y, this.particlesData[i].z)
       
    
        this.obj.updateMatrix()
        this.particleSystem.setMatrixAt(i, this.obj.matrix)
    }

    this.particleSystem.instanceMatrix.needsUpdate = true
    this.group.add(this.particleSystem)
  }

  generateParticlesData() {
    for (let i = 0; i < this.particleCount; i++) {
        const time = getRandomFloat(0, 50);
        const factor = getRandomFloat(5, 15);
        const speed = getRandomFloat(0.001, 0.0015) / 2;
        const x = getRandomFloat(0, 1);
        const y = getRandomFloat(0,0.1);
        const z = getRandomFloat(0, 1);

        this.particlesData.push({ time, factor, speed, x, y, z });
    }
  }

  updateMatColor(color) {
    this.mat.color.set(color)
  }

  updatePosition(pos) {
    this.group.position.copy(pos)
  }

  update() {
    this.particlesData.forEach((particle, index) => {
        let { factor, speed, x, y, z } = particle;
    
        // Update the particle time
        const t = (particle.time += speed);
    
        // Update the particle position based on the time
        this.obj.position.set(
          x + Math.cos((t / 30) * factor) + (Math.sin(t * 1) * factor) / 30,
          y + Math.sin((t / 30) * factor) + (Math.cos(t * 2) * factor) / 30,
          z + Math.cos((t / 30) * factor) + (Math.sin(t * 3) * factor) / 30
        );
    
        // Derive an oscillating value for size and rotation
        const s = Math.cos(t);
        this.obj.scale.set(s, s, s);
        this.obj.rotation.set(s * 5, s * 5, s * 5);
        this.obj.updateMatrix();
    
        // And apply the matrix to the instanced item
        this.particleSystem.setMatrixAt(index, this.obj.matrix);
      });
      this.particleSystem.instanceMatrix.needsUpdate = true;
  }
 
  
}