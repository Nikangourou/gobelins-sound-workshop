
import * as THREE from 'three'
import Scene from './Scene'
import GUI from 'lil-gui'

export default class ShaderTestScene extends Scene {
    // isActive, hasBeenCompleted, time
    constructor(renderer, assets) {
        super()
       this.renderer = renderer
       this.scene = new THREE.Group()
       this.mat = new THREE.MeshToonMaterial()
       this.outlineMat;
       this.gui = new GUI()
       this.assets = assets
       this.name = "scene_1"
       
       this.customUniforms = {
        uTime: { value: 0 },
        map: { value: assets.paperTex },
        lightDirection: { value: new THREE.Vector3(0, 0, 5) },
        outlineColor: { value: new THREE.Color('#000000') },
        outlineWidth: { value: 0.05 }, 
       }
       this.guiSetup()
       this.geo = new THREE.TorusKnotGeometry( 6, 3,50, 16 );

    }

    init() {
        // test scene with 5 objects
        let materials = []
        this.assets[this.name].scene.traverse(child => {
            if(child.isMesh) {
                if(child.material.name.includes("dynamic")) {
                    console.log()
                    materials.push(child.material.name)
                }
            }
        })

        materials = [...new Set(materials)]
        let materialLibrary = {}
        materials.forEach(matName => {
            this.customUniforms[matName] = {}
            this.customUniforms[matName].color1 = { value: new THREE.Color('#ff0000') }
            this.customUniforms[matName].color2 = { value: new THREE.Color('#0000ff') }
            this.customUniforms[matName].color3 = { value: new THREE.Color('#00ff00') }
            this.customUniforms[matName].color4 = { value: new THREE.Color('#ffff00') }
            this.customUniforms[matName].color5 = { value: new THREE.Color('#00ffff') }
            this.customUniforms[matName].noiseStep = {value : 1.0}
            this.customUniforms[matName].nbColors = { value: 4 },
            
            this.createMatGui(matName)

            materialLibrary[matName] = this.createCustomToonMat(matName)
        })

        this.assets[this.name].scene.traverse(child => {
            if(child.isMesh) {
                if(child.material.name.includes("dynamic")) {
                    child.material = materialLibrary[child.material.name]
                }
                // child.castShadow = true
                // child.receiveShadow = true
            }
        })

        // create one gui per object
        this.scene.add(this.assets[this.name].scene)
    

        let testPlaneMat = new THREE.MeshStandardMaterial({color: 0xff0000})
        testPlaneMat.side = THREE.DoubleSide
        let testPlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), testPlaneMat)
        testPlane.receiveShadow = true;

        //this.scene.add(testPlane)

        this.setOutlineMat()
        // const testMesh = new THREE.Mesh(this.geo, this.createCustomToonMat("testMat") ) 
        // this.scene.add(testMesh)
        const directionalLight = new THREE.DirectionalLight('#ffffff', 5)
        directionalLight.position.set( this.customUniforms.lightDirection.value)
        const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );

        const testShadowObj = new THREE.Mesh(new THREE.BoxGeometry(1, 1), new THREE.MeshStandardMaterial())
        testShadowObj.position.z = 2;
        testShadowObj.castShadow = true

        this.scene.add(testShadowObj)
        
        const light = new THREE.PointLight( 0xff0000, 10, 100 );
        light.position.set( 0, 0, 5 );
        const helper1 = new THREE.PointLightHelper( light, 1 );
        this.scene.add(directionalLight, helper, light, helper1)

        light.castShadow = true;


        const lightFolder = this.gui.addFolder('light')

        lightFolder.add(this.customUniforms.lightDirection.value, 'x').min(- 5).max(5).step(0.001).name('lightX')
        lightFolder.add(this.customUniforms.lightDirection.value, 'y').min(- 5).max(5).step(0.001).name('lightY')
    }

    createCustomToonMat(matName) {
        const customToonMat = new THREE.MeshToonMaterial()
        customToonMat.needsUpdate = true
        customToonMat.onBeforeCompile = (shader) => {
            shader.uniforms.color1 = this.customUniforms[matName].color1
            shader.uniforms.color2 = this.customUniforms[matName].color2
            shader.uniforms.color3 = this.customUniforms[matName].color3
            shader.uniforms.color4 = this.customUniforms[matName].color4
            shader.uniforms.color5 = this.customUniforms[matName].color5
            shader.uniforms.nbColors = this.customUniforms[matName].nbColors
            shader.uniforms.tex = this.customUniforms.map
            shader.uniforms.lightDirection = this.customUniforms.lightDirection
            shader.uniforms.outlineColor = new THREE.Color('#000000')
            shader.uniforms.outlineWidth = 0.05
            shader.uniforms.resolution = {value : new THREE.Vector2(this.renderer.config.width*this.renderer.config.pixelRatio, this.renderer.config.height*this.renderer.config.pixelRatio)}
            shader.uniforms.noiseStep = this.customUniforms[matName].noiseStep

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                #include <common>
                varying vec3 vNormal2;
                varying vec2 vUv; 
                varying vec3 vPosition;
                varying vec3 vViewDir;
                `
            )

            shader.vertexShader = shader.vertexShader.replace('void main() {', [
                'void main() {',
                'vNormal2 = normal;',
                'vUv = uv;',
                'vPosition = position;',
                'vec4 modelPosition = modelMatrix * vec4(position, 1.0);',
                'vec4 viewPosition = viewMatrix * modelPosition;',
                'vViewDir = normalize(-viewPosition.xyz);'

        
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
                uniform float noiseStep;
                uniform vec2 resolution;
                varying vec3 vNormal2;
                varying vec2 vUv; 
                varying vec3 vPosition;
                varying vec3 vViewDir;

                float map(float value, float inMin, float inMax, float outMin, float outMax) {
                    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
                }

                float noise(vec2 n) {
                    const vec2 d = vec2(0.0, 1.0);
                    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
                    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
                }
                `
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                #include <dithering_fragment>
            
                vec3 norm = normalize(vNormal2);
                vec3 lightDir = normalize(lightDirection);
                
                float intensity = max(0.0, dot(norm, lightDir));
                float stepVal = 1. / float(nbColors);

                float rimDot = step(0.5,dot(vViewDir, vNormal2));
                
                
                vec2 uv1 = vec2( map(vUv.x, 0.0, 1.0, 0., stepVal), 0.5);
                vec2 noiseScale1 = vec2(noiseStep);
                vec2 uv2 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*2.0), 0.5);
                vec2 noiseScale2 = vec2(noiseStep*2.0);
                vec2 uv3 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*3.0), 0.5);
                vec2 noiseScale3 = vec2(noiseStep*3.0);
                vec2 uv4 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*4.0), 0.5);
                vec2 noiseScale4 = vec2(noiseStep*4.0);
                vec2 uv5 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*float(nbColors)), 0.5);
                vec2 noiseScale5 = vec2(noiseStep*5.0);
                
                // vec2 grainCoord = uv1 * step(0.0, intensity) * (1.0 - step(1.0 * stepVal, intensity)) 
                // + uv2 * step(1.0 * stepVal, intensity) * (1.0 - step(2.0 * stepVal, intensity))
                // + uv3 * step(2.0 * stepVal, intensity) * (1.0 - step(3.0 * stepVal, intensity))
                // + uv4 * step(3.0 * stepVal, intensity) * (1.0 - step(4.0 * stepVal, intensity))
                // + uv5 * step(4.0 * stepVal, intensity);
                
                vec2 noiseScale = noiseScale1 * step(0.0, intensity) * (1.0 - step(1.0 * stepVal, intensity)) 
                + noiseScale2 * step(1.0 * stepVal, intensity) * (1.0 - step(2.0 * stepVal, intensity))
                + noiseScale3 * step(2.0 * stepVal, intensity) * (1.0 - step(3.0 * stepVal, intensity))
                + noiseScale4 * step(3.0 * stepVal, intensity) * (1.0 - step(4.0 * stepVal, intensity))
                + noiseScale5 * step(4.0 * stepVal, intensity);
                
                // float noise = noise((vNormal2.xy + gl_FragCoord.xy) * noiseScale );  

                float noise1 = noise((vNormal2.xy + gl_FragCoord.xy) * noiseScale1 );  
                float noise2 = noise((vNormal2.xy + gl_FragCoord.xy) * noiseScale2 );  

                vec3 toonColor = color1 * step(0.0, intensity) * (1.0 - step(1.0 * stepVal, intensity))
                + color2 * step(1.0 * stepVal, intensity) * (1.0 - step(2.0 * stepVal, intensity))
                + color3 * step(2.0 * stepVal, intensity) * (1.0 - step(3.0 * stepVal, intensity))
                + color4 * step(3.0 * stepVal, intensity) * (1.0 - step(4.0 * stepVal, intensity))*noise2
                + color5 * step(4.0 * stepVal, intensity*noise1);

                //vec4 texColor = texture2D(tex, grainCoord);  // read in tex
                //float noise = noise((vNormal2.xy + vPosition.xy) * noiseScale );  
                //gl_FragColor = vec4(toonColor*rimDot, 1.0);
                gl_FragColor = vec4(toonColor, 1.0);
                `
            ) 

            // this.userData = shader.fragmentShader
        }

        return customToonMat
        
    }

    createMatGui(matName) {
        const matFolder = this.gui.addFolder(matName)
        const toonFolder = matFolder.addFolder('toon')
        toonFolder.add(this.customUniforms[matName].nbColors, 'value').min(2).max(5).step(1).name('nbColors')
        toonFolder.addColor(this.customUniforms[matName].color1, 'value').name('color1')
        toonFolder.addColor(this.customUniforms[matName].color2, 'value').name('color2')
        toonFolder.addColor(this.customUniforms[matName].color3, 'value').name('color3')
        toonFolder.addColor(this.customUniforms[matName].color4, 'value').name('color4')
        toonFolder.addColor(this.customUniforms[matName].color5, 'value').name('color5')
 
        const noiseFolder = matFolder.addFolder('noise')
        noiseFolder.add(this.customUniforms[matName].noiseStep, 'value').min(0.01).max(1.0).name('noiseStep')

    }
    
    guiSetup () {
        const outlineFolder = this.gui.addFolder('outline')
        outlineFolder.addColor(this.customUniforms.outlineColor, 'value').name('outlineColor')
        outlineFolder.add(this.customUniforms.outlineWidth, 'value').min(0).max(0.1).step(0.001).name('outlineWidth')
        
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

        // let outlined = []
        // this.assets[this.name].scene.traverse(child => {
        //     if(child.isMesh) {
        //         console.log("child", child)
        //         const meshCopy = child.clone()
        //         meshCopy.material = this.outlineMat
               
        //         outlined.push(meshCopy)
        //     }
        // })

        // console.log(outlined)

        // outlined.forEach(e => this.scene.add(e))
    }

    getSceneMaterials() {

    }
    

    update () {
        // console.log(this.mat.userData)
    }

}