import * as THREE from 'three'
import Experience from './Experience.js'
import Time from './Utils/Time.js'
import Scene_1 from './Scenes/Scene_1.js'
import Scene_2 from './Scenes/Scene_2.js'
import Scene_3 from './Scenes/Scene_3.js'
import Scene_4 from './Scenes/Scene_4.js'
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
        this.time = new Time()
        this.renderer = _options.renderer
        this.activeSceneIndex = 0
        this.orbitControls = this.experience.camera.modes.debug.orbitControls
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.init()
            }
        })
 
    }
    
    initEvent () {
        
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
        const scene_3 = new Scene_3(this.resources.items.scene_3, this.renderer, this.cameraControls, this.scene, () => this.onActiveSceneIsDone(this))
        const scene_4 = new Scene_4(this.resources.items.scene_4, this.renderer, this.cameraControls, this.scene,() => this.onActiveSceneIsDone(this))
        this.scenes = [scene_1, scene_2, scene_3, scene_4]

        this.activeSceneIndex = this.getSceneIdFromUrl()
        this.scenes[this.activeSceneIndex].init()

        console.log("at init", this.activeSceneIndex)

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

        if(this.scenes && this.activeSceneIndex !==0 && this.scenes[this.activeSceneIndex-1].transition.isPlaying ) this.scenes[this.activeSceneIndex-1].update()
        if(this.scenes) this.scenes[this.activeSceneIndex].update() // contineu update until trnasition is done

    }

    destroy()
    {
    }
}