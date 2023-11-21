import * as THREE from 'three'
import Scene from './Scene'
import CustomMat from './CustomMat'
import GUI from 'lil-gui'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'

export default class Scene_1 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene1"
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene

        // object
        this.radio = this.scene.getObjectByName('radio')
        this.lampe = this.scene.getObjectByName('desk_lamp')
        this.lamp_switch = this.scene.getObjectByName('desk_lamp_switch')
        this.tiroir = this.scene.getObjectByName('tiroir_desk')
        this.card = this.scene.getObjectByName('card')
        this.timbre = this.scene.getObjectByName('timbre1')
        this.timbre2 = this.scene.getObjectByName('timbre2')
        this.camera = scene.cameras[0]
        this.tiroir.add(this.timbre, this.timbre2)

        // Mixer 
        this.lampeMixer = new THREE.AnimationMixer(this.lamp_switch)
        this.tiroirMixer = new THREE.AnimationMixer(this.tiroir)
        this.cameraMixer = new THREE.AnimationMixer(this.camera)

        // Animation
        this.cameraMouvement = scene.animations[4]
        this.doorMovement = scene.animations[0]
        this.lampeMouvement = scene.animations[3]
        this.tiroirMouvement = scene.animations[2]

        let curr = this
        this.gui = new GUI()
        this.renderer = renderer
        this.raycaster = this.cameraControls.raycaster
        this.mouse = this.cameraControls.mouse
        this.audioListenner = new THREE.AudioListener();
        this.audioListenner.context.resume()
        this.radioSound = new THREE.PositionalAudio(this.audioListenner);
        this.cameraMixer.addEventListener('finished', function (e) {
            console.log("finished")
            // transition UI in 
            curr.onSceneIsDone()
            callback()

        })

        this.shouldPlayTransition = false
        this.delayAnimationTransition = 1000

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

        this.cameraEnterMovementIsDone = false
        
        // Toggling the openining of the drawer
        this.actionTiroir = this.tiroirMixer.clipAction(this.tiroirMouvement);
        this.actionTiroir.loop = THREE.LoopOnce
        this.tiroirOpen = false
        
        // lights 
        this.light = new THREE.PointLight(0xff0000, 10, 100);
        this.lampLight = new THREE.PointLight(0xffffff, 2, 100)
        this.deskLight = false
        
        // Action
        this.actionLampe = this.lampeMixer.clipAction(this.lampeMouvement);
        this.actionLampe.loop = THREE.LoopOnce
        this.lampeMixer.addEventListener('finished', (e) => {
            this.deskLight = !this.deskLight
            curr.setLights()
        })
    }

    init() {
        this.mainScene.add(this.scene)
        this.startBtn.style.display = "block"
        this.cameraControls.setDefaultCamera(this.camera)
        this.setupGui()
        this.isActive = true
       
        this.setLights(this.deskLight)
        const helper1 = new THREE.PointLightHelper(this.light, 0.1);
        this.scene.add(this.light, helper1)

        const helper2 = new THREE.PointLightHelper(this.lampLight, 0.1);
        this.scene.add(this.lampLight, helper2)

        document.querySelector('.experience').addEventListener('click', (e) => {this.click(e)})
        this.setSceneMaterial()

        let testLight = new THREE.AmbientLight(0xffffff);
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

        // audio
        this.camera.add(this.audioListenner)
        const helperRadio = new PositionalAudioHelper(this.radioSound)

        const audioLoader = new THREE.AudioLoader();

        audioLoader.load('assets/RadioSound.mp3', (buffer) => {
            this.radioSound.setBuffer(buffer);
            this.radioSound.setRefDistance(1);
        });

        this.radioSound.add(helperRadio);
        this.cubeRadio = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        )
        this.cubeRadio.position.set(1.2, 0.6, 7.8)
        this.cubeRadio.add(this.radioSound)
        this.cubeRadio.visible = false

        this.scene.add(this.cubeRadio)

        this.dragSetup()
    }

    setupGui() {
        const matFolder = this.gui.addFolder("toon settings")
        const lightFolder = matFolder.addFolder('light')
        const light1 = lightFolder.addFolder("light1")
        light1.add(this.light.position, 'x').min(-10).max(10).name('light x')
        light1.add(this.light.position, 'y').min(-10).max(10).name('light y')
        light1.add(this.light.position, 'z').min(-10).max(10).name('light z')

        const light2Folder = lightFolder.addFolder("light2")
        light2Folder.add(this.lampLight.position, 'x').min(-10).max(10).name('light x')
        light2Folder.add(this.lampLight.position, 'y').min(-10).max(10).name('light y')
        light2Folder.add(this.lampLight.position, 'z').min(-10).max(10).name('light z')

    }

    setSceneMaterial() {
        let toBeAdded = []
        this.scene.traverse(e => {
            if (e.isMesh) {
                if (e.name === 'door') {
                    this.doorMixer = new THREE.AnimationMixer(e)
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: e.material.color },
                            color2: { value: new THREE.Color('#991b1b') },
                            color3: { value: new THREE.Color('#18181b') },
                            color4: { value: new THREE.Color('#ffff00') },
                            color5: { value: new THREE.Color('#00ffff') },
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 3 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.lampLight.position },
                           
                        }
                    })
                    mat.init()
                    e.material = mat.get()
                    // console.log("mat", e.material)

                } else if (this.namesToBeOutlines.includes(e.name)) {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: e.material.color }, // darker
                            color2: { value: new THREE.Color('#ea580c') },
                            color3: { value: new THREE.Color('#f59e0b') },
                            color4: { value: new THREE.Color('#c2410c') },
                            color5: { value: new THREE.Color('#bae6fd') },// lighter
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 3 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.lampLight.position },
                        }
                    })
                    mat.init()
                    e.material = mat.get()

                    let mesh = e.clone()
                    mesh.material = this.outlineMat
                    toBeAdded.push(mesh)

                } else if (e.name.includes("contain")) {

                    e.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

                }
                else {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#1e293b') }, // darker
                            color2: { value: new THREE.Color('#eab308') },
                            color3: { value: new THREE.Color('#3b82f6') },
                            color4: { value: new THREE.Color('#2563eb') },
                            color5: { value: new THREE.Color('#1d4ed8') },// lighter
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 5 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.lampLight.position },
                        }
                    })
                    mat.init()
                    e.material = mat.get()

                }
            }
        })

        toBeAdded.forEach(e => this.scene.add(e))

    }

    dragSetup() {
        this.controls = new DragControls([this.card, this.timbre2], this.camera, this.mainRenderer.instance.domElement);
        this.controls.addEventListener('dragstart', () => {
            this.cameraControls.modes.debug.orbitControls.enabled = false
        });
        this.controls.addEventListener('dragend', () => {
            this.cameraControls.modes.debug.orbitControls.enabled = true

            if (this.card && this.timbre2) {
                const distance = this.card.position.distanceTo(this.timbre2.position)
                if (distance < .15) {
                    this.card.material.color.set(0xff0000)
                    this.tiroir.remove(this.timbre2)
                    this.hasBeenCompleted = true
                    this.cameraMixer.clipAction(this.cameraMouvement).isPaused = false;
                    this.transition.init()
                    setTimeout(() => {this.shouldPlayTransition = true}, this.delayAnimationTransition);
                }
                else {
                    this.card.material.color.set(0x00ff00)
                }
            }
        });
    }

    setLights() {
        // simulate lighting on/off by moving position
        if(this.deskLight) {
            this.light.position.set(3, 0.76, -0.92)
            this.lampLight.position.set(-5.68, 8.32, 2)
        } else {
            this.light.position.set(10, 0.76, 2.6)
            this.lampLight.position.set(1.04, 8.32, 2)
        }
    }

    click() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const modelIntersects = this.raycaster.intersectObjects([this.lampe, this.radio, this.tiroir])

        if (modelIntersects.length) {
            if (modelIntersects[0].object.name === 'desk_lamp') {

                this.actionLampe.stop()
                this.actionLampe.play()

                this.lampLight.visible = !this.lampLight.visible
                

            }
            if (modelIntersects[0].object.name === 'radio') {
                this.radioSound.play()
            }
            if (modelIntersects[0].object.name === 'tiroir_desk') {

                if (this.tiroirOpen) {
                    this.actionTiroir.paused = false;
                    this.actionTiroir.timeScale = -1; // Reverse the animation
                    this.actionTiroir.play();
                    this.tiroirOpen = false;
                } else {
                    this.actionTiroir.reset()
                    this.actionTiroir.timeScale = 1; // Play the animation as is
                    this.actionTiroir.clampWhenFinished = true
                    this.actionTiroir.play();
                    this.tiroirOpen = true;
                }

                this.actionTiroir.play()
            }
        }
    }

    onSceneIsDone() {
        this.isActive = false
        this.hasBeenCompleted = true
        document.querySelector('.experience').removeEventListener('click', (e) => {this.click(e)})


        // remove scene from main scene
        let toBeRemoved = null
        this.mainScene.traverse(e => {
            if (e.name === "Scene") {
                toBeRemoved = e
            }
        })
        this.mainScene.remove(toBeRemoved)

    }

    update() {
        if (this.isActive) {
            if (this.cameraMixer && this.userStarted && !this.cameraMixer.clipAction(this.cameraMouvement).isPaused) {
                this.cameraMixer.update(this.time.delta * 0.001)
                if (this.cameraMixer.clipAction(this.cameraMouvement).time > 8.4 && !this.cameraEnterMovementIsDone) {
                    this.cameraEnterMovementIsDone = true;
                    this.cameraMixer.clipAction(this.cameraMouvement).isPaused = true
                }
            }

            if (this.doorMixer && this.userStarted) {
                this.doorMixer.update(this.time.delta * 0.001)
                // if(this.doorMixer.clipAction(this.doorMovement).time > 
            }
            if (this.lampeMixer && this.userStarted) {
                this.lampeMixer.update(this.time.delta * 0.001)
            }
            if (this.tiroirMixer && this.userStarted) {
                this.tiroirMixer.update(this.time.delta * 0.001)
            }
        }

        if(this.shouldPlayTransition)  this.transition.play()
    }
}