import * as THREE from 'three'
import Experience from './Experience.js'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'

export default class World
{
    constructor(_options = {})
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = _options.camera
        this.audioListenner = new THREE.AudioListener();
        this.churchMesh = null
        this.trainMesh = null
        this.treesMesh = null

        this.audioListenner.context.resume()
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setDummy()
            }
        })
    }

    setDummy()
    {
        console.log(this.resources.items.splineCamera.children[0].geometry)
        let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        let circle = new THREE.Line(this.resources.items.splineCamera.children[0].geometry, material);
        this.scene.add(circle)

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

    // const SoundControls = function () {

    //     this.master = listener.getMasterVolume();
    //     this.firstSphere = sound1.getVolume();
    //     this.secondSphere = sound2.getVolume();
    //     this.thirdSphere = sound3.getVolume();
    //     this.Ambient = sound4.getVolume();

    // };

  

    resize()
    {
    }

    update()
    {
        
    }

    destroy()
    {
    }
}