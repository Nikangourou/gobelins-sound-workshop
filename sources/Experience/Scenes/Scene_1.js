import * as THREE from 'three'
import Scene from './Scene'
import GUI from 'lil-gui'

export default class Scene_1 extends Scene {
    // isActive, hasBeenCompleted, time
    constructor(noiseTex, renderer) {
        super()
        this.renderer = renderer
       this.scene = new THREE.Group()
       this.mat = new THREE.MeshToonMaterial()
       this.outlineMat;
       this.gui = new GUI()
       this.customUniforms = {
        uTime: { value: 0 },
        color1: { value: new THREE.Color('#ff0000') },
        color2: { value: new THREE.Color('#0000ff') },
        color3: { value: new THREE.Color('#00ff00') },
        color4: { value: new THREE.Color('#ffff00') },
        color5: { value: new THREE.Color('#00ffff') },
        nbColors: { value: 2 },
        map: { value: noiseTex },
        lightDirection: { value: undefined },
        outlineColor: { value: new THREE.Color('#000000') },
        outlineWidth: { value: 0.05 }
       }
       this.guiSetup()
       this.geo = new THREE.TorusKnotGeometry( 3, 1, 10, 16 );
    
    }

    init() {
        this.setShaderMat()
        this.setOutlineMat()
        const testMesh = new THREE.Mesh(this.geo, this.mat ) 
        this.scene.add(testMesh)
        const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
        
        directionalLight.position.set(0.25, 2, - 2.25)
        this.scene.add(directionalLight)
        this.customUniforms.lightDirection.value = directionalLight.position


    }
    
    guiSetup () {
        const outlineFolder = this.gui.addFolder('outline')
        outlineFolder.addColor(this.customUniforms.outlineColor, 'value').name('outlineColor')
        outlineFolder.add(this.customUniforms.outlineWidth, 'value').min(0).max(0.1).step(0.001).name('outlineWidth')
        
        const lightFolder = this.gui.addFolder('light')
        // lightFolder.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
        // lightFolder.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
        
        const toonFolder = this.gui.addFolder('toon')
        toonFolder.add(this.customUniforms.nbColors, 'value').min(2).max(5).step(1).name('nbColors')
        toonFolder.addColor(this.customUniforms.color1, 'value').name('color1')
        toonFolder.addColor(this.customUniforms.color2, 'value').name('color2')
        toonFolder.addColor(this.customUniforms.color3, 'value').name('color3')
        toonFolder.addColor(this.customUniforms.color4, 'value').name('color4')
        toonFolder.addColor(this.customUniforms.color5, 'value').name('color5')
    }

    setOutlineMat() {
        this.outlineMat = new THREE.ShaderMaterial({
            uniforms: {
                outlineColor: this.customUniforms.outlineColor,
                outlineWidth: this.customUniforms.outlineWidth
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

     
        const meshOutline = new THREE.Mesh(this.geo, this.outlineMat)
        this.scene.add(meshOutline)
    }
    
    setShaderMat() {

        // this.mat.needsUpdate = true
        console.log("setshadermat")
        this.mat.needsUpdate = true

       this.mat.onBeforeCompile = (shader) => {
           console.log("on before compile", shader)

            shader.uniforms.color1 = this.customUniforms.color1
            shader.uniforms.color2 = this.customUniforms.color2
            shader.uniforms.color3 = this.customUniforms.color3
            shader.uniforms.color4 = this.customUniforms.color4
            shader.uniforms.color5 = this.customUniforms.color5
            shader.uniforms.nbColors = this.customUniforms.nbColors
            shader.uniforms.tex = this.customUniforms.map
            shader.uniforms.lightDirection = this.customUniforms.lightDirection
            shader.uniforms.outlineColor = new THREE.Color('#000000')
            shader.uniforms.outlineWidth = 0.05
            shader.uniforms.resolution = {value : new THREE.Vector2(this.renderer.config.width*this.renderer.config.pixelRatio, this.renderer.config.height*this.renderer.config.pixelRatio)}


            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                #include <common>
                varying vec3 vNormal2;
                varying vec2 vUv; 
                `
            )

            shader.vertexShader = shader.vertexShader.replace('void main() {', [
                'void main() {',
                'vNormal2 = normal;',
                'vUv = uv;'
        
            ].join('\n'));

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `
                            #include <common>
                            
                            uniform vec3 color1;
                            uniform vec3 color2;
                            uniform vec3 color3;
                            uniform vec3 color4;
                            uniform vec3 color5;
                            uniform int nbColors;
                            uniform vec3 lightDirection;
                            uniform sampler2D tex;
                            uniform vec2 resolution;
                            varying vec3 vNormal2;
                            varying vec2 vUv; 
                            `
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                #include <dithering_fragment>
                
                
                vec3 norm = normalize(vNormal2);
                vec3 lightDir = normalize(lightDirection);
                
                float intensity = max(0.0, dot(norm, lightDir));
                float th = 1. / float(nbColors);
                
                vec3 toonColor = color1 * step(0.0 * th, intensity) * (1.0 - step(1.0 * th, intensity)) 
                + color2 * step(1.0 * th, intensity) * (1.0 - step(2.0 * th, intensity))
                + color3 * step(2.0 * th, intensity) * (1.0 - step(3.0 * th, intensity))
                + color4 * step(3.0 * th, intensity) * (1.0 - step(4.0 * th, intensity))
                + color5 * step(4.0 * th, intensity);
                
                vec4 texColor = texture2D(tex, gl_FragCoord.xy/resolution.xy);                 
                gl_FragColor = vec4(toonColor, 1.0)*texColor;
                `
            )
                console.log(shader.fragmentShader)
            this.mat.userData = shader.fragmentShader
        }
    }

    update () {
        // console.log(this.mat.userData)
    }

}