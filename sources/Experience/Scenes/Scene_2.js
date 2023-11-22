import * as THREE from 'three'
import Scene from './Scene'
import CustomMat from './CustomMat'
import Pin from '../Pin'
import Particles from './../Particles.js'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'

export default class Scene_2 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene2"
        this.renderer = renderer
        this.gui = this.renderer.debug
        this.cameraControls = cameraControls
        this.raycaster = cameraControls.raycaster
        this.mouse = this.cameraControls.mouse
        this.raycaster = this.cameraControls.raycaster
        this.mainScene = mainScene
        this.animations = scene.animations
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[3]
        this.particles = new Particles("#ef4444", this.scene)

        this.namesToBeOutlines = ["plane_box_1", "plane_box_2", "box_drag_drop"]
        this.lightPos = new THREE.Vector3(2, 5, 3)

        this.rugAnimation = scene.animations[0]
        this.boxFalling = scene.animations[1]

        this.delayAnimationTransition = 22000
        this.shouldPlayTransition = false
        // State / UI
        this.nextBtn = document.getElementById('next')
        this.userHasClickedBox = false
        this.ambientSound = new THREE.Audio(this.cameraControls.audioListener);
        this.buttonSound = new THREE.Audio(this.cameraControls.audioListener);
        this.boxFallingSound = new THREE.Audio(this.cameraControls.audioListener);

        //objects 
        this.boxToBeRemoved = this.scene.getObjectByName('box_drag_drop')
        this.boxMixer = new THREE.AnimationMixer(this.boxToBeRemoved)

        let curr = this
        this.cameraMixer.addEventListener('finished', function (e) {
            console.log("scene 2 is finised")
            curr.onSceneIsDone()

            callback()
        })

        this.light = new THREE.PointLight(0xff0000, 5, 100);
        this.light2 = new THREE.PointLight(0xff0000, 5, 100);

    }

    init() {
        this.mainScene.add(this.scene)
        this.isActive = true
        // const helper = new THREE.CameraHelper( this.camera );
        // this.scene.add(helper)
        this.scene.add(this.cameraControls.dummyCamera, this.cameraControls.groupToAnimateOnMousemove)
        this.cameraControls.setDefaultCamera(this.camera)

        this.setSceneMaterials()

        this.particles.group.position.x = 10
        this.particles.group.position.z = -1
        this.particles.group.position.y = 2

        // this.userClickedBox.style.display = "block"

        this.light.position.set(10, 0.76, 2.6);
        const helper1 = new THREE.PointLightHelper(this.light, 0.1);
        this.scene.add(this.light, helper1)


        this.light2.position.set(1.04, 8.32, 2);
        const helper2 = new THREE.PointLightHelper(this.light2, 0.1);
        this.scene.add(this.light2, helper2)

        this.setupGui()

        let testLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(testLight)

        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce
        action.play()
        action.paused = true

        const boxAction = this.boxMixer.clipAction(this.boxFalling)
        boxAction.clampWhenFinished = true;
        boxAction.loop = THREE.LoopOnce
        boxAction.play()
        boxAction.paused = true

        document.querySelector('.experience').addEventListener('click', (e) => { this.click(e) })

        this.setSounds()

        // Pin
        // this.pinBox = new Pin({ x: 0.2, y: 0, z: -0.1}, this.mouse, this.raycaster, this.camera)
        this.pinBox = new Pin({ x: 17.5, y: 1, z: 0.5}, this.mouse, this.raycaster, this.camera)
        this.pinBox.init()
        this.scene.add(this.pinBox.pin)

        this.pinButton = new Pin({ x: 17.3, y: 0.85, z: 0.57}, this.mouse, this.raycaster, this.camera)
        this.pinButton.init()
        this.scene.add(this.pinButton.pin)
    }

    setSounds() {
        console.log(this.cameraControls.audioListener)
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('/assets/sounds/scene2/ambient.mp3', (buffer) => {
            this.ambientSound.setBuffer(buffer);
            this.ambientSound.setLoop(true);
            this.ambientSound.setVolume(0.5);
            this.ambientSound.play();
        })

        audioLoader.load('/assets/sounds/scene2/bouton.wav', (buffer) => {
            this.buttonSound.setBuffer(buffer);
            this.buttonSound.setLoop(false);
            this.buttonSound.setVolume(1);
        })

        audioLoader.load('/assets/sounds/scene2/colis1.mp3', (buffer) => {
            this.boxFallingSound.setBuffer(buffer);
            this.boxFallingSound.setLoop(false);
            this.boxFallingSound.setVolume(1);
        })

    }

    setupGui() {
        const scene2Folder = this.gui.addFolder("scene 2")
        const matFolder = scene2Folder.addFolder("toon settings")
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

    getRandomColor() {
        let colorIndex = Math.floor(Math.random() * this.cardColors.length)
        return this.cardColors[colorIndex]
    }

    click(e) {
        if (!this.particles.shouldAnimate) {
            this.scene.add(this.particles.group)
            this.particles.init()
            this.particles.shouldAnimate = true
        }

        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        if (!this.cameraControls.defaultCamera || !this.raycaster) return
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObject(this.scene, true)
        if(intersects[0].object.name === 'pin') {
            intersects.shift()
        }
        let filteredByMat = intersects.filter(e => e.object.material.type === "MeshBasicMaterial")

        if (filteredByMat.length === 0) return
        if (filteredByMat[0].object.name === "box_drag_drop") {
            this.boxFallingSound.play()
            this.userClickedBox = true
            this.boxMixer.clipAction(this.boxFalling).paused = false
            this.pinBox.remove()
        } else if (filteredByMat[0].object.name.includes("button")) {
            this.buttonSound.play();
            this.hasBeenCompleted = true
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
            this.transition.init()
            this.pinButton.remove()
            setTimeout(() => { this.shouldPlayTransition = true }, this.delayAnimationTransition);
        } else if (filteredByMat[0].object) {
            this.particles.respawnAt(filteredByMat[0].object.material.color, filteredByMat[0].object.position)
            // this.particles.updateMatColor(filteredByMat[0].object.material.color)
            // this.particles.updatePosition(filteredByMat[0].object.position)
            // update with direction 
        }

    }

    onSceneIsDone() {
        this.ambientSound.stop();
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
                if (e.name.includes("button")) {

                    e.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
                    let mesh = e.clone()
                    mesh.material = this.outlineMat
                    toBeAdded.push(mesh)
                } else if (e.name === "box_drag_drop") {
                    e.material = new THREE.MeshBasicMaterial({ color: e.material.color })
                } else if (e.name.includes("box")) {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#18181b') }, // darker
                            color2: { value: new THREE.Color('#fdba74') },
                            color3: { value: e.material.color },
                            color4: { value: new THREE.Color('#94a3b8') },
                            color5: { value: new THREE.Color('#e2e8f0') },// lighter
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 3 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.light2.position }
                        }
                    })
                    mat.init()
                    e.material = mat.get()
                    let mesh = e.clone()
                    mesh.material = this.outlineMat
                    toBeAdded.push(mesh)
                } else if (e.name.toLowerCase().includes('plane')) {
                    e.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.getRandomColor()) })
                    e.material.side = THREE.DoubleSide
                }

            } else {
                let mat = new CustomMat({
                    renderer: this.renderer, uniforms: {
                        color1: { value: new THREE.Color('#18181b') }, // darker
                        color2: { value: new THREE.Color('#374151') },
                        color3: { value: new THREE.Color('#475569') },
                        color4: { value: new THREE.Color('#94a3b8') },
                        color5: { value: new THREE.Color('#e2e8f0') },// lighter
                        noiseStep: { value: 1.0 },
                        nbColors: { value: 3 },
                        lightDirection: { value: this.light.position },
                        lightDirection2: { value: this.light2.position }
                    }
                })
                mat.init()
                e.material = mat.get()
            }


        })
        toBeAdded.forEach(e => this.scene.add(e))

    }


    update() {
        if (this.cameraMixer) {
            this.cameraMixer.update(this.time.delta * 0.001)
        }

        if (this.boxMixer && !this.boxMixer.clipAction(this.boxFalling).paused) {
            this.boxMixer.update(this.time.delta * 0.001)
        }

        if(this.pinBox){
            this.pinBox.animate()
        }
        if(this.pinButton){
            this.pinButton.animate()
        }
        if (this.particles.shouldAnimate) this.particles.update()
        if(this.shouldPlayTransition)  this.transition.play()
    }
}