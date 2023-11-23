import * as THREE from 'three'
import Scene from './Scene'
import GUI from 'lil-gui'
import CustomMat from './CustomMat'
import Particles from './../Particles.js'
import Pin from '../Pin'


const getRandomFloat = (min, max) => (Math.random() * (max - min) + min);
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export default class Scene_4 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene3"
        this.renderer = renderer
        this.gui = this.renderer.debug
        this.cameraControls = cameraControls
        this.mouse = this.cameraControls.mouse
        this.raycaster = this.cameraControls.raycaster
        this.mainScene = mainScene
        this.animations = scene.animations
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[0]
        let curr = this
        this.cameraMixer.addEventListener('finished', function (e) {
            console.log("scene 3 finished")
            // transition UI in 
            // curr.onSceneIsDone()
            // callback()
        })

        // objects
        this.nid = this.scene.getObjectByName('nid')
        this.eggs = this.scene.getObjectByName('nid_eggs')

        //lights
        this.light = new THREE.PointLight(0xffffff, 5, 100);
        this.light2 = new THREE.PointLight(0xffffff, 5, 100);

        this.cardsMat = this.cardColors.map(color => new THREE.MeshBasicMaterial({ color: color }))
        this.particles = []

        //sounds 
        this.ambientSound = new THREE.Audio(this.cameraControls.audioListener);
        this.joySound = new THREE.Audio(this.cameraControls.audioListener);
        this.sadSound = new THREE.Audio(this.cameraControls.audioListener);
        this.loveSound = new THREE.Audio(this.cameraControls.audioListener);
        this.angerSound = new THREE.Audio(this.cameraControls.audioListener);
     
        this.bird = this.scene.getObjectByName('Plane')
        console.log(this.bird)
        this.birdMoving = this.animations[11]
        this.birdMixer = new THREE.AnimationMixer(this.bird.parent)
    }

    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        this.isActive = true

        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce
        action.play()
        action.paused = true

        // console.log("bird moving", this.birdMoving.uuid, this.birdMixer)
        // const actionBird = this.birdMixer.clipAction(this.birdMoving);
        // actionBird.clampWhenFinished = true;
        // actionBird.loop = THREE.LoopRepeat
        // actionBird.play()
        //action.paused = true
       

        this.light.position.set(-5.06, 2.48, -10);
        const helper1 = new THREE.PointLightHelper(this.light, 0.1);
        this.scene.add(this.light, helper1)


        this.light2.position.set(0.9, 10, -1.92);
        const helper2 = new THREE.PointLightHelper(this.light2, 0.1);
        this.scene.add(this.light2, helper2)

        document.querySelector('.experience').addEventListener('click', (e) => { this.click(e) })

        this.setSceneMaterials()
        this.particles.forEach(particleSystem => this.scene.add(particleSystem.group))
        this.setupGui()

        this.setSounds()

        this.pinBox = new Pin({ x: -0.05, y: 0.2, z: -0.14 }, this.mouse, this.raycaster, this.camera, 0.07)
        this.pinBox.init()
        this.nid.add(this.pinBox.pin)
       
    }
    setupGui() {
        const scene4Folder = this.gui.addFolder("scene 4")
        const matFolder = scene4Folder.addFolder("toon settings")
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

    setSounds() {
        const audioLoader = new THREE.AudioLoader();

        audioLoader.load('/assets/sounds/scene4/fôret.mp3', (buffer) => {
            this.ambientSound.setBuffer(buffer);
            this.ambientSound.setLoop(true);
            this.ambientSound.setVolume(6);
            this.ambientSound.play();
        })

        audioLoader.load('/assets/sounds/card/ANGER.mp3', (buffer) => {
            this.angerSound.setBuffer(buffer);
            this.angerSound.setLoop(true);
            this.angerSound.setVolume(0.1);

        })

        audioLoader.load('/assets/sounds/card/JOY.mp3', (buffer) => {
            this.joySound.setBuffer(buffer);
            this.joySound.setLoop(true);
            this.joySound.setVolume(0.1);
        })

        audioLoader.load('/assets/sounds/card/SAD.mp3', (buffer) => {
            this.sadSound.setBuffer(buffer);
            this.sadSound.setLoop(true);
            this.sadSound.setVolume(0.1);
        })

        audioLoader.load('/assets/sounds/card/LOVE.mp3', (buffer) => {
            this.loveSound.setBuffer(buffer);
            this.loveSound.setLoop(true);
            this.loveSound.setVolume(0.1); // augmenter le volume quand la carte tombe et arrive
        })

    }

    setSceneMaterials() {
        let toBeAdded = []
        this.scene.traverse(e => {
            if (e.isMesh) {
                 if(e.name === "sky") {
                    e.material = new THREE.MeshBasicMaterial({transparent: true, color: e.material.color})
                } else if (e.name === "ground_mesh") {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#064e3b') }, // darker
                            color2: { value: new THREE.Color('#064e3b') },
                            color3: { value: new THREE.Color('#064e3b') },
                            color4: { value: new THREE.Color('#94a3b8') },
                            color5: { value: new THREE.Color('#e2e8f0') },// lighter
                            noiseStep: { value: 0.8 },
                            nbColors: { value: 2 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.light2.position }
                        }
                    })
                    mat.init()
                    e.material = mat.get()

                } else if (e.name === "ground_grass") {
                    e.visible = false
                } else if (e.name.includes("ground_boxes") || e.name === "nid") {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#18181b') }, // darker
                            color2: { value: e.material.color },
                            color3: { value: new THREE.Color('#fdba74') },
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
                }
                else if (e.name.includes("Maple") || e.name.includes("Pine")) {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#064100') }, // darker
                            color2: { value: new THREE.Color('#0B7600') },
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

                } else if (e.name.includes("card")) {
                    e.material = this.cardsMat[getRandomInt(this.cardsMat.length - 1)]
                    let particles = new Particles(e.material.color, this.scene)
                    particles.respawnAt(e.material.color, e.position, -1)
                    this.particles.push(particles)

                } else if (e.name.includes("nid_eggs")) {
                    e.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
                    let mesh = e.clone()
                    mesh.material = this.outlineMat
                    toBeAdded.push(mesh)
                }


            }
        })
        toBeAdded.forEach(e => this.scene.add(e))

    }

    click() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const modelIntersects = this.raycaster.intersectObjects([this.nid, this.eggs])

        if (modelIntersects.length) {

            if (modelIntersects[0].object.name === 'pin') {
                modelIntersects.shift()
            }

            if (modelIntersects[0].object.name === 'nid' || modelIntersects[0].object.name === 'nid_eggs') {
                this.joySound.play()
                this.sadSound.play()
                this.loveSound.play()
                this.angerSound.play()
                this.hasBeenCompleted = true
                this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
                document.querySelector('.generique').classList.add('active')
                this.pinBox.remove()
            }

        }
    }

    update() {
        if (this.cameraMixer) {
            this.cameraMixer.update(this.time.delta * 0.001)
        }
        if (this.pinBox) {
            this.pinBox.animate()
        }
        this.particles.forEach(particleSystem => particleSystem.update())

    }

}