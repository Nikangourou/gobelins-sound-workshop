import * as THREE from 'three'
import Scene from './Scene'
import CustomMat from './CustomMat'
import GUI from 'lil-gui'

export default class Scene_1 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene1"
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[2]
        this.doorMovement = scene.animations[0]
        let curr = this
        this.gui = new GUI()
        this.renderer = renderer
        this.nextBtn = document.getElementById('next')
        this.cameraMixer.addEventListener( 'finished', function( e ) {
            console.log("finised")
            // transition UI in 
            curr.onSceneIsDone()
            callback()
            
        } )

        this.namesToBeOutlines = ["desk", "bag", "radio", "commode", "tabletop_high", 'library', "lamp", "box", "old_chair", "Flame", "Chair"]
        

        this.lightPos = new THREE.Vector3(2, 5, 3)
        this.userStarted = false;
        this.startBtn = document.querySelector('button')
        this.startBtn.addEventListener('click', e => {
            this.userStarted = true;
            this.doorMixer.clipAction(this.doorMovement).paused = false;
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
            e.target.style.display = 'none';
        })

        this.nextBtn.addEventListener('click', e => {
            this.nextBtn.style.display = 'none'
            this.hasBeenCompleted = true
            this.cameraMixer.clipAction(this.cameraMouvement).isPaused = false;
        })

        this.cameraEnterMovementIsDone = false
        
    } 
    
    init() {
        this.mainScene.add(this.scene)
        this.startBtn.style.display = "block"
        this.cameraControls.setDefaultCamera(this.camera)
        // const helper = new THREE.CameraHelper( this.camera );
        // this.scene.add(helper)
        this.isActive = true
        const light = new THREE.PointLight( 0xff0000, 10, 100 );
        light.position.set( 10, 0.76, 2.6 );
        const helper1 = new THREE.PointLightHelper( light, 0.1 );
        this.scene.add(light, helper1)
        
        const light2 = new THREE.PointLight( 0xff0000, 10, 100 );
        light2.position.set( 1.04, 8.32, 2 );
        const helper2 = new THREE.PointLightHelper( light2, 0.1 );
        this.scene.add(light2, helper2)

        const matFolder = this.gui.addFolder("toon settings")
        const lightFolder = matFolder.addFolder('light')
        const light1 = lightFolder.addFolder("light1")
        light1.add(light.position, 'x').min(-10).max(10).name('light x')
        light1.add(light.position, 'y').min(-10).max(10).name('light y')
        light1.add(light.position, 'z').min(-10).max(10).name('light z')
       
        const light2Folder = lightFolder.addFolder("light2")
        light2Folder.add(light2.position, 'x').min(-10).max(10).name('light x')
        light2Folder.add(light2.position, 'y').min(-10).max(10).name('light y')
        light2Folder.add(light2.position, 'z').min(-10).max(10).name('light z')

        let toBeAdded = []
        this.scene.traverse(e => {
            if(e.isMesh) {
                if(e.name === 'door') {
                    this.doorMixer = new THREE.AnimationMixer(e)
                    let mat = new CustomMat({renderer: this.renderer, uniforms: {
                        color1: {value :  e.material.color  },
                        color2:  { value: new THREE.Color('#991b1b') },
                        color3: { value: new THREE.Color('#18181b') },
                        color4: { value: new THREE.Color('#ffff00') },
                        color5: { value: new THREE.Color('#00ffff') },
                        noiseStep : {value : 1.0},
                        nbColors : { value: 3},
                        lightDirection : { value : light.position},
                        lightDirection2 : {value : light2.position}
                    }})
                    mat.init()
                    e.material = mat.get()
                    // console.log("mat", e.material)
            
                }  else if(this.namesToBeOutlines.includes(e.name)) {
                    let mat = new CustomMat({renderer: this.renderer, uniforms: {
                        color1: { value: e.material.color }, // darker
                        color2: { value: new THREE.Color('#ea580c') },
                        color3: { value: new THREE.Color('#f59e0b') },
                        color4: { value: new THREE.Color('#c2410c') },
                        color5: { value: new THREE.Color('#bae6fd') },// lighter
                        noiseStep : {value : 1.0},
                        nbColors : { value: 3},
                        lightDirection : { value : light.position},
                        lightDirection2 : {value : light2.position}
                    }})
                    mat.init()
                    e.material = mat.get()
                    
                    let mesh = e.clone()
                    mesh.material = this.outlineMat
                    toBeAdded.push(mesh)

                } else if (e.name.includes("contain")) {
                   
                    e.material = new THREE.MeshBasicMaterial({color: 0x00ff00})

                }
                else {
                    let mat = new CustomMat({renderer: this.renderer, uniforms: {
                        color1: { value: new THREE.Color('#1e293b') }, // darker
                        color2: { value: new THREE.Color('#eab308') },
                        color3: { value: new THREE.Color('#3b82f6') },
                        color4: { value: new THREE.Color('#2563eb') },
                        color5: { value: new THREE.Color('#1d4ed8') },// lighter
                        noiseStep : {value : 1.0},
                        nbColors : { value: 5},
                        lightDirection : { value : light.position},
                        lightDirection2 : {value : light2.position}
                    }})
                    mat.init()
                    e.material = mat.get()
                
                } 
            }
        })

        toBeAdded.forEach(e => this.scene.add(e))
        
        let testLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(testLight)
        
        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce
        action.play()
        action.paused = true
        

        // door
        const openingDoorAnimation = this.doorMixer.clipAction(this.doorMovement)
        openingDoorAnimation.clampWhenFinished = true;
        openingDoorAnimation.loop = THREE.LoopOnce
        openingDoorAnimation.play()
        openingDoorAnimation.paused = true


    }

    onSceneIsDone() {
        this.isActive = false
        this.hasBeenCompleted = true
        
        // remove scene from main scene
        let toBeRemoved = null
        this.mainScene.traverse(e => {
            if(e.name === "Scene") {
                toBeRemoved = e
            }
        })
        this.mainScene.remove(toBeRemoved)
       
    }
    
    update() {
        if(this.isActive) {
            if(this.cameraMixer && this.userStarted && !this.cameraMixer.clipAction(this.cameraMouvement).isPaused) {
                this.cameraMixer.update(this.time.delta*0.001)
                if(this.cameraMixer.clipAction(this.cameraMouvement).time > 8.4 && !this.cameraEnterMovementIsDone) {
                    this.cameraEnterMovementIsDone = true;
                    this.cameraMixer.clipAction(this.cameraMouvement).isPaused = true
                    this.nextBtn.style.display = 'block'
                }
            }

            if(this.doorMixer && this.userStarted  ) {
                this.doorMixer.update(this.time.delta*0.001)
                // if(this.doorMixer.clipAction(this.doorMovement).time > 
            }
        }
    }
}