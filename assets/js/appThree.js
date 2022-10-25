import * as THREE from '../lib/three.js';
import {GLTFLoader} from '../lib/addons/GLTFLoader.js';
import {RGBELoader} from '../lib/addons/RGBELoader.js';

class SceneInit {
    constructor() {

        // this.gui = new dat.GUI()
        //
        this.canvas = document.querySelector('.webgl');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.renderer.setPixelRatio(window.devicePixelRatio || 1);

        this.clock = new THREE.Clock();
        this.valueProg = 0;
        this.duration = 0;

        this.gltfLoader();
        this.rgbLoader();

    }


    //Light

    light() {
        // const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3)
        // directionalLight.position.x = -1.5508174896240234;
        // directionalLight.position.y = 0.5929127335548401;
        // directionalLight.position.z = 0.0056471205316483974;

        const ambiant = new THREE.AmbientLight(0x404040); // soft white ambiant
        this.scene.add(ambiant)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.x = this.camera.position.x;
        directionalLight.position.y = this.camera.position.y;
        directionalLight.position.z = this.camera.position.z;

        // directionalLight.lookAt(this.camera.target);

        directionalLight.updateMatrix();
        directionalLight.updateMatrixWorld();

        console.log(directionalLight)
        this.scene.add(directionalLight);


        // this.gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)

    }

    rgbLoader() {
        this.rgb = new RGBELoader();
        this.rgb.load('../../static/models/light.hdr', (texture) => {
            const gen = new THREE.PMREMGenerator(this.renderer)
            const envMap = gen.fromEquirectangular(texture).texture
            this.scene.environment = envMap
            // this.scene.background = 0xa2a9b3

            texture.dispose()
            gen.dispose()
        });
    }

    gltfLoader() {
        this.scene = new THREE.Scene();

        this.loader = new GLTFLoader();
        this.loader.load('../../static/models/scene.glb', (gltf) => {
            this.scene.add(gltf.scene);
            this.camera = gltf.cameras[0];
            this.light();
            console.log(this.camera)

            this.mixer = new THREE.AnimationMixer(gltf.scene);
            let action = this.mixer.clipAction(gltf.animations[1]);
            action.play();

            this.duration = gltf.animations[0].duration;

            this.scene.add(gltf.scene);

            this.resize();
            window.addEventListener('resize', this.resize);

            window.addEventListener('scroll', () => {
                requestAnimationFrame(this.render(window.scrollY));
            });

            this.clock.start();
            // this.controls();

            this.render()
        });
    }

    resize() {
        const {innerWidth, innerHeight} = window;

        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;

        this.camera.aspectRatio = innerWidth / innerHeight;
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
        this.render();
    }

    // mapRange(progress, minIn, maxIn, minOut, maxOut) {
    //     progress = (progress > maxIn) ? maxIn : progress;
    //     progress = (progress < minIn) ? minIn : progress;
    //     let res = minOut + (progress - minIn) * (maxOut - minOut) / (maxIn - minIn);
    //     return res;
    // }
    //
    // progressValue(progress) {
    //
    //     this.valueProg = progress * this.duration;
    // }

    controls() {
        const controls = new OrbitControls(this.camera, this.canvas)
        controls.target.set(0, 1, 0)
        controls.enableDamping = true
    }

    render(e) {
        this.mixer.setTime(e / 80);
        this.renderer.render(this.scene, this.camera)
    }
}

new SceneInit();


