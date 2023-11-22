import * as THREE from 'three'
import Scene from './Scene'
import GUI from 'lil-gui'
import CustomMat from './CustomMat'

export default class Scene_3 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene3"
        this.renderer = renderer
        this.gui = this.renderer.debug
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.animations = scene.animations
        this.scene = scene.scene
        this.camera = scene.cameras[0]

        // this.cameraMixer = new THREE.AnimationMixer(this.camera)
        // this.cameraMouvement = scene.animations[0]
        let curr = this
        // this.cameraMixer.addEventListener('finished', function (e) {
        //     console.log("scene 3 finished")
        //     // transition UI in 
        //     curr.onSceneIsDone()
        //     callback()

        // })
        this.nextBtn = document.getElementById('next')
        this.nextBtn.addEventListener('click', e => {
            this.nextBtn.style.display = 'none'
            this.hasBeenCompleted = true
            //this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
            
        })

        // animations 
        this.plane =  this.scene.getObjectByName('avion')
        this.planeMixer = new THREE.AnimationMixer(this.plane)
        this.planeMovement = this.animations[0]
        console.log(this.planeMovement)

        this.bird = this.scene.getObjectByName('Bird')
        this.birdMixer = new THREE.AnimationMixer(this.bird)
        this.birdFlying = this.animations[1]
        this.birdGroup = new THREE.Group()


        //lights

        this.light = new THREE.PointLight(0xff0000, 5, 100);
        this.light2 = new THREE.PointLight(0xff0000, 5, 100);


    }
    
    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        this.isActive = true
        // this.nextBtn.style.display = "block"

        const helper = new THREE.CameraHelper( this.camera );
        this.scene.add(helper)

        this.setSceneMaterials()
        
        this.light.position.set(10, 0.76, 2.6);
        const helper1 = new THREE.PointLightHelper(this.light, 0.1);
        this.scene.add(this.light, helper1)
        
        this.light2.position.set(1.04, 8.32, 2);
        const helper2 = new THREE.PointLightHelper(this.light2, 0.1);
        this.scene.add(this.light2, helper2)

        this.setupGui()

        


        const action = this.birdMixer.clipAction(this.birdFlying);
        //action.clampWhenFinished = true;
        action.loop = THREE.LoopRepeat
        action.play()
        // action.paused = true

        const planeAction = this.planeMixer.clipAction(this.planeMovement)
        planeAction.clampWhenFinished = true;
        planeAction.loop = THREE.LoopRepeat
        planeAction.play()
        // boxAction.paused = true


    }

    setupGui() {
        const scene3Folder = this.gui.addFolder("scene 3")
        const matFolder = scene3Folder.addFolder("toon settings")
        const lightFolder = matFolder.addFolder('light')
        const light1 = lightFolder.addFolder("light1")
        light1.add(this.light.position, 'x').min(-10).max(10).name('light x')
        light1.add(this.light.position, 'y').min(-10).max(10).name('light y')
        light1.add(this.light.position, 'z').min(-10).max(10).name('light z')

        const light2Folder = lightFolder.addFolder("light2")
        light2Folder.add(this.light2.position, 'x').min(-10).max(10).name('light x')
        light2Folder.add(this.light2.position, 'y').min(-10).max(10).name('light y')
        light2Folder.add(this.light2.position, 'z').min(-10).max(10).name('light z')

    }

    onSceneIsDone() {
        this.isActive = false
        this.hasBeenCompleted = true

        // remove scene from main scene
        let toBeRemoved = null
        this.mainScene.traverse(e => {
            if (e.name === "Scene") {
                toBeRemoved = e
            }
        })
        this.mainScene.remove(toBeRemoved)
    }

    setSceneMaterials() {
        let toBeAdded = []
        this.scene.traverse(e => {
            if (e.isMesh) {
                if(e.name === "avion") {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#18181b') }, // darker
                            color2: { value: e.material.color },
                            color3: { value: new THREE.Color('#fdba74') },
                            color4: { value: new THREE.Color('#94a3b8') },
                            color5: { value: new THREE.Color('#e2e8f0') },// lighter
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 4 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.light2.position }
                        }
                    })
                    mat.init()
                    e.material = mat.get()
                    // let mesh = e.clone()
                    // mesh.material = this.outlineMat
                    // toBeAdded.push(mesh)
                } else if(e.name === "sky") {
                    e.material = new THREE.MeshBasicMaterial({transparent: true, color: e.material.color})
                } else if( e.name ==="Bird") {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#6060bd') }, // darker purple
                            color2: { value: new THREE.Color(e.material.color) },
                            color3: { value: e.material.color },
                            color4: { value: new THREE.Color('#94a3b8') },
                            color5: { value: new THREE.Color('#e2e8f0') },// lighter
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 4 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.light2.position }
                        }
                    })
                    mat.init()
                    e.material = mat.get()

                }
                 
       
            }


        })
        toBeAdded.forEach(e => this.scene.add(e))

    }

    update() {
        if(this.birdMixer) {
            this.birdMixer.update(this.time.delta * 0.001)
        }

        if(this.planeMixer) {
            this.planeMixer.update(this.time.delta * 0.001)
        }

       
        // if (this.cameraMixer) {
        //     this.cameraMixer.update(this.time.delta * 0.001)
        // }


    }

}