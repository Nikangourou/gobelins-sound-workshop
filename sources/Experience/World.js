import * as THREE from 'three'
import Experience from './Experience.js'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'
import Time from './Utils/Time.js'
import Intro from "./Scenes/Intro.js"

export default class World
{
    constructor(_options = {})
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = _options.camera.instance
        this.audioListenner = new THREE.AudioListener();
        this.churchMesh = null
        this.trainMesh = null
        this.treesMesh = null
        this.time = new Time()

        // scenes 
        // this.intro = new Intro({model : this.resources.intro})

        this.audioListenner.context.resume()
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                // this.setDummy()
                this.init()
            }
        })
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

        this.camera.instance.add(this.audioListenner)
        
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

    init()
    {
        console.log( this.resources.items.intro)
        console.log(this.camera)
        let testLight = new THREE.AmbientLight( 0xffffff );
  
        this.scene.add(testLight)

        this.scene.add(this.resources.items.intro.scene)
        // this.resources.items.intro.scene.traverse(child => {
        // })

        let cameraMixer = new THREE.AnimationMixer(this.camera)
        const cameraAnimation = this.resources.items.intro.animations[0]
        const action = cameraMixer.clipAction(cameraAnimation);
        // action.time = 0;
        console.log(action)
        // set action timeScale to 0
        action.play()
        
        // set camera to frame on of animation clip
        
    }


  

    resize()
    {
    }

    update()
    {
        // console.log(this.time)
        if(this.mixer) {
            this.mixer.update(this.time.delta*0.001)
            // console.log(this.mixer.time)
        }

        if( this.coneMixer) {
            this.coneMixer.update(this.time.delta*0.001)
        }

        if(this.cameraMixer) {
            this.cameraMixer.update(this.time.delta*0.001)
        }
        
    }

    destroy()
    {
    }
}