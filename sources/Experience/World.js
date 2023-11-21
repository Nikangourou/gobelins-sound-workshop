import * as THREE from 'three'
import Experience from './Experience.js'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'
import Time from './Utils/Time.js'
import Scene_1 from './Scenes/Scene_1.js'
import Scene_2 from './Scenes/Scene_2.js'
import Scene_3 from './Scenes/Scene_3.js'
import ShaderTestScene from './Scenes/ShaderTestScene.js'

export default class World
{
    constructor(_options = {})
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.cameraControls = _options.camera
        this.camera = _options.camera.defaultCamera
        this.audioListenner = new THREE.AudioListener();
        this.churchMesh = null
        this.trainMesh = null
        this.treesMesh = null
        this.time = new Time()
        this.renderer = _options.renderer
        this.activeSceneIndex = 0
        this.audioListenner.context.resume()

        this.orbitControls = this.experience.camera.modes.debug.orbitControls
   
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.init()
                // this.setDummy()
                
            }
        })

        
        
    }
    
    initEvent () {
        
    }
    
    
    
    setDummy()
    {
        
        //debug spline path
        // console.log(this.resources.items.splineCamera.children[0].geometry)
        let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        let circle = new THREE.Line(this.resources.items.splineCamera.children[0].geometry, material);
        this.scene.add(circle)
        
        // attach camera / use blender camera as main
        
        let testMesh = new THREE.Mesh(new THREE.SphereGeometry(1),new  THREE.MeshNormalMaterial())
        this.scene.add(testMesh)
        
        this.mixer = new THREE.AnimationMixer(testMesh)
        const animation = this.resources.items.testScene.animations[0]
        const action = this.mixer.clipAction(animation);
        action.play()
        
        const geoCone = new THREE.ConeGeometry( 1, 3, 16 ); 
        const testMesh2 = new THREE.Mesh(geoCone,new THREE.MeshNormalMaterial())
        this.scene.add(testMesh2)
        this.coneMixer = new THREE.AnimationMixer(testMesh2)
        const animCone = this.resources.items.testScene.animations[1]
        const coneAction = this.coneMixer.clipAction(animCone);
        coneAction.play()
        
        var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
        this.scene.add( ambientLight );
        
        
        const normalMat = new THREE.MeshNormalMaterial()
        console.log(this.resources.items.testScene)
        this.resources.items.testScene.scene.traverse(child => {
            child.material = normalMat
            if(child.name === "church") {
                
                this.churchMesh = child
                child.material = new THREE.MeshBasicMaterial({color: 0x00ff00})
            }
            
            if(child.name === "train") {
                this.trainMesh = child
                child.material = new THREE.MeshBasicMaterial({color: 0xff0000})
            }
            if(child.name === "trees") {
                this.treesMesh = child 
                child.material = new THREE.MeshBasicMaterial({color: 0x0000ff})        
            }
            
        })
        
        this.scene.add(this.trainMesh, this.treesMesh, this.churchMesh )
        
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.01, 0.01, 0.01),
            new THREE.MeshNormalMaterial()
            )
            
            
            // audio
            
            this.camera.add(this.audioListenner)
            
            const birdSound = new THREE.PositionalAudio( this.audioListenner );
            const trainSound = new THREE.PositionalAudio( this.audioListenner );
            
            const helperBirds = new PositionalAudioHelper( birdSound )
            const helperTrain = new PositionalAudioHelper( trainSound )
            
            const audioLoader = new THREE.AudioLoader();
            
            audioLoader.load( 'assets/birds.wav', function( buffer ) {
                birdSound.setBuffer( buffer );
                birdSound.setRefDistance( 10 );
                birdSound.play();
            }); 
            
            audioLoader.load( 'assets/train.wav', function( buffer ) {
                trainSound.setBuffer( buffer );
                trainSound.setRefDistance( 2 );
                trainSound.play();
            }); 

            birdSound.add( helperBirds );
            trainSound.add( helperTrain );
            
            //console.log(trainSound)
            
            this.treesMesh.add(birdSound)
            this.trainMesh.add(trainSound)
            
            
    }

    onActiveSceneIsDone (currContext) {
        let prevScene = currContext.scenes[currContext.activeSceneIndex]
        let nextScene = currContext.scenes[currContext.activeSceneIndex+1]
        if( currContext.activeSceneIndex < currContext.scenes.length -1) {
            // update UI on completed
            if(prevScene.hasBeenCompleted) {
                document.getElementById(prevScene.name).classList.remove('beforeComplete')
            }
            currContext.activeSceneIndex += 1
            nextScene.init()
        }
    }

    onSceneSelect(sceneIndex) {
        
        // goTo 
        const targetScene = this.scenes[sceneIndex]
        this.activeSceneIndex = sceneIndex

        // quit prev scene

        //enter desired scene
        targetScene.init()
    }

    getSceneIdFromUrl() {
        const urlParts = document.URL.split('#');
        let sceneId = 0
        if(urlParts[1] ===  "debug")  return sceneId
        if(urlParts.length > 1) {
            const sceneName = urlParts[1].split('')
            sceneId = sceneName[sceneName.length - 1] - 1
        }

        return sceneId
    }
        
    init()
    {
        const scene_1 = new Scene_1(this.resources.items.scene_1, this.renderer, this.cameraControls, this.scene,() => this.onActiveSceneIsDone(this))
        const scene_2 = new Scene_2(this.resources.items.scene_2, this.renderer, this.cameraControls, this.scene,() => this.onActiveSceneIsDone(this), this.resources.items.dotTex)
        const scene_3 = new Scene_3(this.resources.items.scene_3, this.renderer, this.cameraControls, this.scene,() => this.onActiveSceneIsDone(this))
        this.scenes = [scene_1, scene_2, scene_3]

        this.activeSceneIndex = this.getSceneIdFromUrl()
        this.scenes[this.activeSceneIndex].init()

        // test shader scene 1
        // this.scene1 = new Scene_1(this.resources.items.noiseTex, this.renderer)
        // this.scene.add(this.scene1.scene)
        // this.scene1.init()

        // test shader scene 1
        // this.shaderTestScene = new ShaderTestScene(this.renderer, this.resources.items)
        // this.scene.add(this.shaderTestScene.scene)
        // this.shaderTestScene.init()
        
        //helpers
        const axesHelper = new THREE.AxesHelper( 5 );
        this.scene.add( axesHelper );
    }

    resize()
    {
    }

    update()
    {


        if(this.scenes && this.activeSceneIndex !==0 ) this.scenes[this.activeSceneIndex-1].update()
        if(this.scenes) this.scenes[this.activeSceneIndex].update() // contineu update until trnasition is done

    }

    destroy()
    {
    }
}