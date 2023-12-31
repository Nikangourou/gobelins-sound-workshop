import Time from "../Utils/Time";
import * as THREE from 'three'
import CustomMat from './CustomMat'
import Transition from './../Transition'

export default class Scene {
    constructor(scene) {
        this.isActive = false;
        this.hasBeenCompleted = false;
        this.transition = new Transition()
        this.time = new Time()
        this.cardColors = ["#dc2626", "#fb7185", "#fbbf24", "#1d4ed8"]
        this.cardEmotions = ['angry', 'love', 'joy', 'sad' ]
        this.outlineMat = new THREE.ShaderMaterial({
            uniforms: {
                outlineColor: { value: new THREE.Color('#000000') },
                outlineWidth: {value : 0.005}
            },
            side: THREE.BackSide,
            vertexShader: `
            uniform float outlineWidth;
            void main() {
                vec3 pos = position;
                pos += normal * outlineWidth;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
            }`,
            fragmentShader: `
        
            uniform vec3 outlineColor;
        
            void main() {
                gl_FragColor = vec4( outlineColor, 1.0 );
            }`
        })
    
    }

    init() {
        this.isActive = true
    }

    onNext() {
        this.isActive = false
        // reset Time to zero
        // stop timeline

    }

    restart() {

    }

    loadSceneAssets() {
        
    }
}