import * as THREE from 'three'
import Scene from './Scene'
import GUI from 'lil-gui'
import CustomMat from './CustomMat'

const getRandomFloat = (min, max) => (Math.random() * (max - min) + min);

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
        this.raycaster = this.cameraControls.raycaster
       

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
        
        this.bird = this.scene.getObjectByName('Bird')
        this.birdMixer = new THREE.AnimationMixer(this.bird)
        this.birdMixer2 = new THREE.AnimationMixer(this.bird)
        this.birdFlying = this.animations[2]
        this.birdMoving = this.animations[1]
        this.birdShouldCatchCard = false

        this.cloudMesh = this.scene.getObjectByName('cloud')
        this.cloudCount = 40
        this.obj = new THREE.Object3D()
        //setup gui
        this.cloudRangeX = new THREE.Vector2(-14, 14)
        this.cloudRangeY = new THREE.Vector2(-1, 16)
        this.cloudRangeZ = new THREE.Vector2(-10, 10)
        this.cloudsData = []
        
        //lights
        this.light = new THREE.PointLight(0xffffff, 5, 100);
        this.light2 = new THREE.PointLight(0xffffff, 5, 100);
        
        console.log(this.animations)
        this.thresholdYEnd = -13
        this.thresholdYStart = 11
    }
    
    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        this.isActive = true
        // this.nextBtn.style.display = "block"

        const helper = new THREE.CameraHelper( this.camera );
        this.scene.add(helper)

        this.setSceneMaterials()
        
        this.light.position.set(3.08, -10, 2.6);
        const helper1 = new THREE.PointLightHelper(this.light, 0.1);
        this.scene.add(this.light, helper1)
        
        this.light2.position.set(10, 0, 2);
        const helper2 = new THREE.PointLightHelper(this.light2, 0.1);
        this.scene.add(this.light2, helper2)

        this.setupGui()
        
        const action = this.birdMixer.clipAction(this.birdFlying);
        //action.clampWhenFinished = true;
        action.loop = THREE.LoopRepeat
        action.play()
        // action.paused = true
        const birdMovingAction =  this.birdMixer2.clipAction(this.birdMoving);
        birdMovingAction.loop = THREE.LoopOnce
        birdMovingAction.play()
        

        const planeAction = this.planeMixer.clipAction(this.planeMovement)
        planeAction.clampWhenFinished = true;
        planeAction.loop = THREE.LoopRepeat
        planeAction.play()
        // boxAction.paused = true
        this.makeClouds()

        document.querySelector('.experience').addEventListener('click', (e) => {this.click(e)})
        
        // this.setSounds()


    }

    setSounds() {

    }

    makeClouds() {
        this.clouds = new THREE.InstancedMesh(this.cloudMesh.geometry, this.cloudMesh.material, 40 )
        this.clouds.name = "clouds"
 
    
        for(let i = 0; i < this.cloudCount; i++){
            let currCloud = {
                startPosition : new THREE.Vector3(getRandomFloat(-6, 14), getRandomFloat(11, -13), getRandomFloat(-3, 13)),
                life: getRandomFloat(3, 5),
                scale : getRandomFloat(0.5, 2), 
                speed : getRandomFloat(0.1, 0.5),
            }
            this.cloudsData.push(currCloud)

            this.obj.position.copy(currCloud.startPosition)
            this.obj.scale.set(currCloud.scale, currCloud.scale, currCloud.scale)

            this.obj.updateMatrix()
            this.clouds.setMatrixAt(i, this.obj.matrix)
        }

        this.clouds.instanceMatrix.needsUpdate = true
        this.scene.add(this.clouds)
  
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

        const cloudFolder = scene3Folder.addFolder("cloud settings")
        cloudFolder.add(this.cloudRangeX, 'x').min(-20).max(20).name("range X low").onChange(e => {
            this.resetClouds()
        })
        cloudFolder.add(this.cloudRangeY, 'x').min(-20).max(20).name("range Y low").onChange(e => {
            this.resetClouds()
        })
        cloudFolder.add(this.cloudRangeZ, 'x').min(-20).max(20).name("range Z low").onChange(e => {
            this.resetClouds()
        })
        cloudFolder.add(this.cloudRangeX, 'y').min(-20).max(20).name("range X high").onChange(e => {
            this.resetClouds()
        })
        cloudFolder.add(this.cloudRangeY, 'y').min(-20).max(20).name("range Y high").onChange(e => {
            this.resetClouds()
        })
        cloudFolder.add(this.cloudRangeZ, 'y').min(-20).max(20).name("range Z high").onChange(e => {
            this.resetClouds()
        })

    }

    resetClouds() {
        this.scene.remove(this.scene.getObjectByName('clouds'))
        this.makeClouds()

    }

    moveClouds(d) {
        this.cloudsData.forEach((e, i) => {
            //update Y position t*
            let currCloud = this.cloudsData[i]
            currCloud.life -= d // retrieve time from life
           
            this.obj.position.y = (this.thresholdYEnd - currCloud.startPosition.y) * currCloud.life
            // if beyond threshold, respawn start threshold aka at the left of the camera
            if(currCloud.life < 0) {
                this.obj.position.y = this.thresholdYStart
                currCloud.life = getRandomFloat(3, 5);
            }
            if(i === 0) {
                console.log(this.obj.position.y, "yPosition")
                console.log(currCloud.life, "cloud life")
            } 
            this.clouds.setMatrixAt(i, this.obj.matrix);
        })
        this.clouds.instanceMatrix.needsUpdate = true;
        
    }

    click(e) {
        this.cameraControls.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.cameraControls.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        if (!this.cameraControls.defaultCamera || ! this.raycaster) return
        this.raycaster.setFromCamera(this.cameraControls.mouse, this.camera);
        let intersects =  this.raycaster.intersectObject(this.scene, true)
        if(intersects.length === 0) return
  
        if(intersects.map(e => e.object.name).includes("main_card")) {
            this.birdShouldCatchCard = true
        }
       
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
                console.log(e.name)
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

        if(this.birdMixer2 && this.birdShouldCatchCard) {
            this.birdMixer2.update(this.time.delta * 0.001)
        }

        if(this.planeMixer) {
            this.planeMixer.update(this.time.delta * 0.001)
        }

        this.moveClouds(this.time.delta * 0.001)



    }

}