import * as THREE from 'three'
import Scene from './Scene'
import CustomMat from './CustomMat'
import GUI from 'lil-gui'
import Particles from './../Particles.js'

export default class Scene_2 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback, pointTex) {
        super()
        this.name = "scene2"
        this.gui = new GUI()
        this.renderer = renderer
        this.onclick = cameraControls.onclick
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.animations = scene.animations
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[3]
        this.cameraMixer.addEventListener( 'finished', function( e ) {
            console.log("scene 2 finished")
            // transition UI in 
            curr.onSceneIsDone()
            callback()
            
        } )
        this.dotTex = pointTex
        this.particles = new Particles("#ef4444", this.scene)
        // this.intersects = this.cameraControls.raycaster.intersectObject(this.scene, true);
        this.cardColors = ["#ef4444", "#f97316", "#eab308", "#0d9488", "#2563eb", "#d946ef"]
        
        // State / UI
        this.nextBtn = document.getElementById('next')
        this.nextBtn.addEventListener('click', e => {
            this.nextBtn.style.display = 'none'
            this.hasBeenCompleted = true
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
        })
        this.userHasClickedBox = false
        
        this.userClickedBox = document.getElementById('userClickedBox')
        this.userClickedBox.addEventListener('click', e => {
            this.userClickedBox.style.display = 'none'
            this.userClickedBox = true
            this.boxMixer.clipAction(this.boxFalling).paused = false
        })

        this.namesToBeOutlines = ["plane_box_1", "plane_box_2", "box_drag_drop"]
        this.lightPos = new THREE.Vector3(2, 5, 3)

        this.rugAnimation = scene.animations[0]
        this.boxFalling = scene.animations[1]
      
        let curr = this
        this.cameraMixer.addEventListener( 'finished', function( e ) {
            console.log("scene 2 is finised")
            curr.onSceneIsDone()
            callback()
        } )

        window.addEventListener('click', (e) => {
            this.cameraControls.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.cameraControls.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            console.log(this.cameraControls)
            if(!this.cameraControls.defaultCamera || !this.cameraControls.raycaster)return
            this.cameraControls.raycaster.setFromCamera(this.cameraControls.mouse, this.camera);
            let intersects = this.cameraControls.raycaster.intersectObject(this.scene, true)
            let filteredByMat = intersects.filter(e => e.object.material.type === "MeshBasicMaterial")
            console.log(filteredByMat[0].object.material.color)
            if(filteredByMat[0].object) this.particles.updateMatColor(filteredByMat[0].object.material.color)
            // update particle color
        })
        
    }
    
    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        // const helper = new THREE.CameraHelper( this.camera );
        // this.scene.add(helper)

        this.particles.init()
        this.scene.add(this.particles.group)
        this.particles.group.position.x = 10
        this.particles.group.position.z = -1
        this.particles.group.position.y = 2
        // this.particles.setPosition(15, 3, 0)
       
        this.userClickedBox.style.display = "block"

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

        this.isActive = true
        let toBeAdded = []
        this.scene.traverse(e => {
            if(e.isMesh) {
                // console.log("name", e.name)
                if(e.name === "box_drag_drop") {
                    console.log("found box drag and drop")
                    this.boxMixer = new THREE.AnimationMixer(e)
                    const nextBtn = this.nextBtn
                    this.boxMixer.addEventListener( 'finished', function( e ) {
                        nextBtn.style.display = "block"
                           
                    } )
                    let mat = new CustomMat({renderer: this.renderer, uniforms: {
                        color1: { value:  new THREE.Color('#18181b') }, // darker
                        color2: { value: new THREE.Color('#fdba74') },
                        color3: { value: e.material.color },
                        color4: { value: new THREE.Color('#94a3b8') },
                        color5: { value: new THREE.Color('#e2e8f0') },// lighter
                        noiseStep : {value : 1.0},
                        nbColors : { value: 3},
                        lightDirection : { value : light.position},
                        lightDirection2 : {value : light2.position}
                    }})
                    mat.init()
                    e.material = mat.get()
                }else if (e.name.includes("button")) {
                    e.material = new THREE.MeshBasicMaterial({color: 0xff0000})
                    let mesh = e.clone()
                    mesh.material = this.outlineMat
                    toBeAdded.push(mesh)

                } else if(e.name.includes("box")) {
                    let mat = new CustomMat({renderer: this.renderer, uniforms: {
                        color1: { value:  new THREE.Color('#18181b') }, // darker
                        color2: { value: new THREE.Color('#fdba74') },
                        color3: { value: e.material.color },
                        color4: { value: new THREE.Color('#94a3b8') },
                        color5: { value: new THREE.Color('#e2e8f0') },// lighter
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
                } else if(e.name.toLowerCase().includes('plane')){
                    // console.log(e.name)
                    let color = this.getRandomColor()
                    
                    e.material = new THREE.MeshBasicMaterial({color : new THREE.Color(this.getRandomColor())})
                    e.material.side = THREE.DoubleSide
                }

                } else {
                    let mat = new CustomMat({renderer: this.renderer, uniforms: {
                        color1: { value:  new THREE.Color('#18181b') }, // darker
                        color2: { value: new THREE.Color('#374151') },
                        color3: { value: new THREE.Color('#475569') },
                        color4: { value: new THREE.Color('#94a3b8') },
                        color5: { value: new THREE.Color('#e2e8f0') },// lighter
                        noiseStep : {value : 1.0},
                        nbColors : { value: 3},
                        lightDirection : { value : light.position},
                        lightDirection2 : {value : light2.position}
                    }})
                    mat.init()
                    e.material = mat.get()
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

        const boxAction = this.boxMixer.clipAction(this.boxFalling)
        boxAction.clampWhenFinished = true;
        boxAction.loop = THREE.LoopOnce
        boxAction.play()
        boxAction.paused = true

    }

    getRandomColor() {
        let colorIndex = Math.floor(Math.random() * this.cardColors.length)
        return this.cardColors[colorIndex]
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

    setSceneMaterials() {
        
    }

    
    update() {
        if(this.cameraMixer ) {
            this.cameraMixer.update(this.time.delta*0.001)
        }

        if(this.boxMixer && !this.boxMixer.clipAction(this.boxFalling).paused) {
            this.boxMixer.update(this.time.delta*0.001)
        }
        this.particles.update()

        // if (this.intersects.length > 0) {
	
        //     var object = this.intersects[0].object;
        //     console.log(object)
    
        //     object.material.color.set( Math.random() * 0xffffff );
    
        // }

        
        // this.updateParticles();

    }
}