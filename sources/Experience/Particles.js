import * as THREE from 'three'
 
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min);

export default class Particles {
  constructor (color, scene) {
    this.scene = scene
    this.geo = new THREE.SphereGeometry(0.01, 8)
    this.mat = new THREE.MeshBasicMaterial({color: color})
    this.mat.needsUpdate = true
    this.obj = new THREE.Object3D()
    this.particleCount = 100;
    this.group = new THREE.Group()
    this.particlesData = []
    this.shouldAnimate = false
    this.dir = 1
    this.axis = 'z'
  }

  init() {
    this.particleSystem = new THREE.InstancedMesh(this.geo, this.mat, this.particleCount )
    this.generateParticlesData()
    this.particleSystem.matrix.identity()
    
    for(let i = 0; i < this.particleCount; i++){
        this.obj.position.set(0, 0, 0)
        this.obj.updateMatrix()
        this.particleSystem.setMatrixAt(i, this.obj.matrix)
    }

    this.particleSystem.instanceMatrix.needsUpdate = true
    this.group.add(this.particleSystem)
  }

  generateParticlesData() {
    for (let i = 0; i < this.particleCount; i++) {
        let time = getRandomFloat(0, 50);
        const factor = 0.9
        const speed = getRandomFloat(1, 3) ;
        const initScale =  getRandomFloat(1, 3);
        let currScale = initScale

        const startPos = new THREE.Vector3(getRandomFloat(-0.1, 0.1), getRandomFloat(-0.1, 0.1), 0) // *dir
        let currPos = startPos
        const targetPos = currPos.clone()
        targetPos[this.axis] = this.dir*getRandomFloat(0.2, 2)

        this.particlesData.push({ time, factor, speed, targetPos, currPos, startPos, initScale, currScale });
    }
  }

  updateMatColor(color) {
    this.mat.color.set(color)
  }

  updatePosition(pos) {
    this.group.position.copy(pos)
  }

  respawnAt(color, position, dir) {
    // empty prev
    this.particlesData = []
    this.group.children = []
    this.dir = dir ? dir : Math.sign(position.z)
    this.updateMatColor(color)
    this.updatePosition(position)
    this.init()
  }

  updateOnY() {
    this.particlesData.forEach((particle, index) => {
      let { factor, speed, targetPos, currPos, currScale, startPos, time } = particle;
      currPos.y = currPos.y - (targetPos.z - currPos.y)*0.0007*speed
      

       if(Math.abs(currPos.y) > Math.abs(targetPos.z)) {
        currPos.y = 0
        time = getRandomFloat(0, 50);
      }
      
     
      // Update the particle time
      const t = (time += speed);
      
      this.obj.matrix.identity()
  
      this.obj.position.copy(currPos)
      // Derive an oscillating value for size and rotation
      const s = Math.cos(t);
      this.obj.scale.set(s, s, s);
      // this.obj.rotation.set(s * 5, s * 5, s * 5);
      this.obj.updateMatrix();
  
      // And apply the matrix to the instanced item
      this.particleSystem.setMatrixAt(index, this.obj.matrix);
    });
    this.particleSystem.instanceMatrix.needsUpdate = true;
  }

  update() {
    this.particlesData.forEach((particle, index) => {
        let { factor, speed, targetPos, currPos, currScale, startPos, time } = particle;
        currPos.z = currPos.z - (targetPos.z - currPos.z)*0.0007*speed
        

         if(Math.abs(currPos.z) > Math.abs(targetPos.z)) {
          currPos.z = 0
          time = getRandomFloat(0, 50);
        }
        
       
        // Update the particle time
        const t = (time += speed);
        
        this.obj.matrix.identity()
    
        this.obj.position.copy(currPos)
        // Derive an oscillating value for size and rotation
        const s = Math.cos(t);
        this.obj.scale.set(s, s, s);
        // this.obj.rotation.set(s * 5, s * 5, s * 5);
        this.obj.updateMatrix();
    
        // And apply the matrix to the instanced item
        this.particleSystem.setMatrixAt(index, this.obj.matrix);
      });
      this.particleSystem.instanceMatrix.needsUpdate = true;
      
  }
 
  
}