// GET Character from ReadyPlayerMe
// https://models.readyplayer.me/--READYPLAYERME--.glb?morphTargets=ARKit&lod=1&textureFormat=webp

// On Document Loaded - Start Game //
document.addEventListener("DOMContentLoaded", startGame);

// Global BabylonJS Variables
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { stencil: false }, true);
const scene = createScene(engine, canvas);
const camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(-90), BABYLON.Tools.ToRadians(65), 6, BABYLON.Vector3.Zero(), scene);
const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, 0, 0), scene);
const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight, true);

let hdrTexture;
let hdrRotation = 0;

let idle1, idle2, idle3;
let talking1, talking2, talking3, talking4;
let dance1, dance2, dance3, dance4;
let salute;
let observer1, observer2, observer3;
let currentAnimation;
let talking;
const animationOffset = 50;

// Player
let player;
const modelName = "player";

// Morph Targets
let leftEye, rightEye;
const morphMultiplier_1 = 0.65;
const morphMultiplier_2 = 1;

let paused = false;
let timer = 0;

let music, sfx1, speech, dance;
let myAnalyser;
let triggerDanceAfterSpeech = false;

// startAvatar Function 
let disableButton = false;
function startAvatar() {
    talking = false;
    camera.attachControl(canvas, true);
    playSounds();
    timer = 0;

    setTimeout(() => {
        startTimeline();
    }, 400);
}

// Create Scene
function createScene(engine, canvas) {
    // Set Canvas & Engine //
    canvas = document.getElementById("renderCanvas");
    engine.clear(new BABYLON.Color3(0, 0, 0), true, true);
    var scene = new BABYLON.Scene(engine);
    return scene;
}

let starteffect;

// SFX Using HTML Audio to prevent Silence switch on mobile devices
sfx1 = document.createElement("audio");
sfx1.preload = "auto";
sfx1.src = "./resources/sounds/sfx.mp3";

// Start Game
function startGame() {

    // Set Canvas & Engine
    const toRender = function () {
        scene.render();
    }
    engine.runRenderLoop(toRender);
    engine.clear(new BABYLON.Color3(0, 0, 0), true, true);

    // Setup Sounds 
    music = new BABYLON.Sound("Music", "./resources/sounds/music.mp3", scene, null, {
        loop: true,
        volume: 0.3
    });

    speech = new BABYLON.Sound("speech", "./resources/sounds/start.wav", scene, null, {
        volume: 3.0
    });

    speech.onended = function () {
        console.log("End Speech");
        talking = false;
        setIdleAnimObservers();
        setTimeout(() => {
            if (timelineInterval)
                clearInterval(timelineInterval);
        }, 1000);
        music.setVolume(0.5, 1);
        scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnimation, 0.7, idle1, 0.7, false, 0.02, 0, idle1.duration, 0.8));

        // Enable buttons after intro
        const musicToggleBtn = document.getElementById("musicToggleBtn");
        const danceBtn = document.getElementById("danceBtn");
        if (musicToggleBtn) musicToggleBtn.removeAttribute("disabled");
        if (danceBtn) danceBtn.removeAttribute("disabled");

        // Show Client Card

        const clientCardContainer = document.getElementById("client-card-container");
        if (clientCardContainer.style.visibility === "hidden") {
            clientCardContainer.style.visibility = "visible";
            clientCardContainer.classList.add("fadeIn");
            clientCardContainer.classList.remove("fadeOut");
        }

    };

    // Add Speech Sound to a SoundTrack to get the analiser data
    const speechTrack = new BABYLON.SoundTrack(scene);
    speechTrack.addSound(speech);

    // Audio Analyser
    myAnalyser = new BABYLON.Analyser(scene);
    speechTrack.connectToAnalyser(myAnalyser);
    myAnalyser.FFT_SIZE = 64;
    myAnalyser.SMOOTHING = 0.03;
    // myAnalyser.drawDebugCanvas();

    // Stop All Animations Init
    BABYLON.SceneLoader.OnPluginActivatedObservable.add(function (plugin) {
        currentPluginName = plugin.name;
        if (plugin.name === "gltf" && plugin instanceof BABYLON.GLTFFileLoader) {
            plugin.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE;
        }
    });

    // Glow Layer
    // var gl = new BABYLON.GlowLayer("glow", scene, {
    //     mainTextureFixedSize: 256,
    //     blurKernelSize: 128
    // });
    // gl.intensity = 0.7;

    // Create Camera
    createCamera();

    // Hemispheric Light
    hemiLight.intensity = 0.15;

    // Directional Light
    dirLight.intensity = 1.75;
    dirLight.position = new BABYLON.Vector3(0, 30, 10);
    dirLight.direction = new BABYLON.Vector3(-2, -7, -5);
    dirLight.shadowMinZ = -100;
    dirLight.shadowMaxZ = 100;

    // Create Lights Transform Node
    const lightsNode = new BABYLON.TransformNode("_Lights_", scene);
    hemiLight.parent = lightsNode;
    dirLight.parent = lightsNode;

    // Setup Lighting & Import Models
    setLighting();
    importBaseModel("base.glb");
    importAnimationsAndModel(modelName + ".glb");

}

// Create ArcRotateCamera
function createCamera() {
    camera.position.z = 10;
    camera.setTarget(new BABYLON.Vector3(0, 1.25, 0));
    camera.allowUpsideDown = false;
    camera.panningSensibility = 0;
    camera.lowerRadiusLimit = 1.5;
    camera.upperRadiusLimit = 16;
    camera.lowerBetaLimit = 0.75;
    camera.upperBetaLimit = Math.PI / 2;
    camera.panningSensibility = 0;
    camera.pinchDeltaPercentage = 0.00060;
    camera.wheelPrecision = 60;
    camera.useBouncingBehavior = false;
    camera.alpha = 1.57;
    camera.beta = 1.42;
    camera.radius = 15;
}

async function importBaseModel(model) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "./resources/models/", model, scene);

    const lightingTextureCache = {};

    result.meshes.forEach((mesh) => {
        const meshName = mesh.name;
        const { material } = mesh;

        mesh.isPickable = false;

        if (!meshName.includes("Sphere")) {
            mesh.freezeWorldMatrix();
            mesh.doNotSyncBoundingInfo = true;
        }

        if (meshName.includes("Base")) {

            if (meshName.includes("Base_primitive0")) {
                material.albedoColor = new BABYLON.Color3(0.99, 0.99, 0.99);
                material.metallic = 0.6;
                material.roughness = 0.6;
                material.specular = new BABYLON.Color3(0, 0, 0);
                material.specularColor = new BABYLON.Color3(0, 0, 0);
                mesh.receiveShadows = true;
            }
            if (meshName.includes("Base_primitive1")) {
                material.roughness = 0.3;
                mesh.receiveShadows = true;
            }
        }

        if (meshName.includes("TV")) {
            material.lightmapTexture = null;
        }
    });
}


// Setup Animations & Player
var animationsGLB = [];

// Import Animations and Model
async function importAnimationsAndModel(model) {
    const animationPromises = [
        importAnimations("feminine/idle/M_Standing_Idle_Variations_001.glb"),
        importAnimations("feminine/idle/M_Standing_Idle_001.glb"),
        importAnimations("feminine/idle/M_Standing_Idle_Variations_003.glb"),
        importAnimations("feminine/expression/M_Standing_Expressions_013.glb"),
        importAnimations("feminine/expression/M_Talking_Variations_005.glb"),
        importAnimations("feminine/expression/M_Talking_Variations_006.glb"),
        importAnimations("feminine/expression/M_Talking_Variations_007.glb"),
        importAnimations("feminine/expression/M_Talking_Variations_008.glb"),
        importAnimations("feminine/dance/M_Dances_004.glb"),
        importAnimations("feminine/dance/M_Dances_003.glb"),
        importAnimations("feminine/dance/M_Dances_006.glb"),
        importAnimations("feminine/dance/M_Dances_008.glb"),
    ];

    await Promise.all(animationPromises);
    importModel(model);
}

// Import Animations
function importAnimations(animation) {
    return BABYLON.SceneLoader.ImportMeshAsync(null, "./resources/models/animations/" + animation, null, scene)
        .then((result) => {
            result.meshes.forEach(element => {
                if (element) {
                    element.dispose();
                }
            });
            animationsGLB.push(result.animationGroups[0]);
        });
}

// Import Model
function importModel(model) {
    return BABYLON.SceneLoader.ImportMeshAsync(null, "./resources/models/" + model, null, scene)
        .then((result) => {
            const player = result.meshes[0];
            player.name = "_Character_";
            shadowGenerator.addShadowCaster(result.meshes[0]);

            const modelTransformNodes = player.getChildTransformNodes();

            animationsGLB.forEach((animation) => {
                const modelAnimationGroup = animation.clone(model.replace(".glb", "_") + animation.name, (oldTarget) => {
                    return modelTransformNodes.find((node) => node.name === oldTarget.name);
                });
                animation.dispose();
            });

            // Clean Imported Animations
            animationsGLB = [];

            // Setup Idle Anims
            const modelName = model.substring(model.lastIndexOf("/") + 1).replace(".glb", "");
            idle1 = scene.getAnimationGroupByName(modelName + "_M_Standing_Idle_Variations_001");
            idle2 = scene.getAnimationGroupByName(modelName + "_M_Standing_Idle_001");
            idle3 = scene.getAnimationGroupByName(modelName + "_M_Standing_Idle_Variations_003");

            talking1 = scene.getAnimationGroupByName(modelName + "_M_Talking_Variations_006");
            talking2 = scene.getAnimationGroupByName(modelName + "_M_Talking_Variations_005");
            talking3 = scene.getAnimationGroupByName(modelName + "_M_Talking_Variations_007");
            talking4 = scene.getAnimationGroupByName(modelName + "_M_Talking_Variations_008");
            salute = scene.getAnimationGroupByName(modelName + "_M_Standing_Expressions_013");

            dance1 = scene.getAnimationGroupByName(modelName + "_M_Dances_004");
            dance2 = scene.getAnimationGroupByName(modelName + "_M_Dances_003");
            dance3 = scene.getAnimationGroupByName(modelName + "_M_Dances_006");
            dance4 = scene.getAnimationGroupByName(modelName + "_M_Dances_008");

            // Current Anim
            currentAnimation = idle1;
            idle1.play(false);

            setIdleAnimObservers();

            setReflections();
            setShadows();
            currentAnimation = scene.animationGroups[0];
            showButtonHide();


            leftEye = scene.getMeshByName("Wolf3D_Head").morphTargetManager.getTarget(50);
            rightEye = scene.getMeshByName("Wolf3D_Head").morphTargetManager.getTarget(51);

            //console.log(scene.getMeshByName("Wolf3D_Head").morphTargetManager);

            // Setup Init Jaw Forward
            scene.getMeshByName("Wolf3D_Head").morphTargetManager.getTarget(9).influence = 0.4;

            // Animate Face Morphs
            animateFaceMorphs();
        });
}


// Animate Eyes
function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

// Animate Face Morphs using intervals
function animateFaceMorphs() {

    const mesh = scene.getMeshByName("Wolf3D_Head");

    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    // Animate Eyes
    const animateEyes = async () => {
        const randomNumber = getRandomNumber(1, 2);
        if (randomNumber === 1) {
            leftEye.influence = 1;
            rightEye.influence = 1;
            await wait(100);
            leftEye.influence = 0;
            rightEye.influence = 0;
            const randomNumber2 = getRandomNumber(1, 2);
            if (randomNumber2 === 1) {
                await wait(100);
                leftEye.influence = 1;
                rightEye.influence = 1;
                await wait(100);
                leftEye.influence = 0;
                rightEye.influence = 0;
            }
        }
    };

    // animateMorphTarget registerBeforeRender
    const animateMorphTarget = (targetIndex, initialValue, targetValue, numSteps) => {
        let currentStep = 0;
        const morphTarget = mesh.morphTargetManager.getTarget(targetIndex);

        const animationCallback = () => {
            currentStep++;
            const t = currentStep / numSteps;
            morphTarget.influence = BABYLON.Scalar.Lerp(initialValue, targetValue, t);
            if (currentStep >= numSteps) {
                scene.unregisterBeforeRender(animationCallback);
            }
        };

        scene.registerBeforeRender(animationCallback);
    };

    // Brows
    const animateBrow = () => {
        const random = Math.random() * 0.8;
        const initialValue = mesh.morphTargetManager.getTarget(2).influence;
        const targetValue = random;
        animateMorphTarget(2, initialValue, targetValue, 15);
        animateMorphTarget(3, initialValue, targetValue, 15);
        animateMorphTarget(4, initialValue, targetValue, 15);
    };

    // Smile
    const animateSmile = () => {
        const random = Math.random() * 0.18 + 0.02;
        const initialValue = mesh.morphTargetManager.getTarget(47).influence;
        const targetValue = random;
        animateMorphTarget(47, initialValue, targetValue, 30);
        animateMorphTarget(48, initialValue, targetValue, 30);
    };

    // Mouth Left / Right
    const animateMouthLeftRight = () => {
        const random1 = Math.random() * 0.7;
        const randomLeftOrRight = getRandomNumber(0, 1);
        const targetIndex = randomLeftOrRight === 1 ? 22 : 21;
        const initialValue = mesh.morphTargetManager.getTarget(targetIndex).influence;
        const targetValue = random1;
        animateMorphTarget(targetIndex, initialValue, targetValue, 90);
    };

    // Nose
    const animateNose = () => {
        const random = Math.random() * 0.7;
        const initialValue = mesh.morphTargetManager.getTarget(17).influence;
        const targetValue = random;
        animateMorphTarget(17, initialValue, targetValue, 60);
        animateMorphTarget(18, initialValue, targetValue, 60);
    };

    // Jaw Forward
    const animateJawForward = () => {
        const random = Math.random() * 0.5;
        const initialValue = mesh.morphTargetManager.getTarget(9).influence;
        const targetValue = random;
        animateMorphTarget(9, initialValue, targetValue, 60);
    };

    // Cheeks
    const animateCheeks = () => {
        const random = Math.random() * 1;
        const initialValue = mesh.morphTargetManager.getTarget(32).influence;
        const targetValue = random;
        animateMorphTarget(32, initialValue, targetValue, 60);
        animateMorphTarget(33, initialValue, targetValue, 60);
    };

    setInterval(animateEyes, 800);
    setInterval(animateBrow, 1200);
    setInterval(animateSmile, 2000);
    setInterval(animateMouthLeftRight, 1500);
    setInterval(animateNose, 1000);
    setInterval(animateJawForward, 2000);
    setInterval(animateCheeks, 1200);
}

// Setup Idle Animation OnEnd Observers
function setIdleAnimObservers() {
    observer1 = idle1.onAnimationEndObservable.add(function () {
        scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(idle1, 0.8, idle2, 0.8, false, 0.02));
    });
    observer2 = idle2.onAnimationEndObservable.add(function () {
        scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(idle2, 0.8, idle3, 0.8, false, 0.02));
    });
    observer3 = idle3.onAnimationEndObservable.add(function () {
        scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(idle3, 0.8, idle1, 0.8, false, 0.02));
    });
}

// Remove Idle Animation OnEnd Observers
function removeAnimObservers() {
    idle1.onAnimationEndObservable.remove(observer1);
    idle2.onAnimationEndObservable.remove(observer2);
    idle3.onAnimationEndObservable.remove(observer3);
    idle1.stop();
    idle2.stop();
    idle3.stop();
}

// Play Sounds
function playSounds() {    
    if (speech && speech.isPlaying) {
        speech.stop();
        speech.currentTime = 0;
    }
    if (music && !music.isPlaying) {
        music.volume = 0.5;
        music.play();
    }
}



// Animation Blending
function* animationBlending(fromAnim, fromAnimSpeedRatio, toAnim, toAnimSpeedRatio, repeat, speed, toAnimFrameIn, toAnimFrameOut, maxWeight) {
    if (!toAnimFrameIn)
        toAnimFrameIn = 0;
    if (!toAnimFrameOut)
        toAnimFrameOut = toAnim.duration;
    if (!maxWeight)
        maxWeight = 1;

    let currentWeight = 1;
    let newWeight = 0;
    fromAnim.stop();
    toAnim.start(repeat, toAnimSpeedRatio, toAnimFrameIn, toAnimFrameOut, false)
    fromAnim.speedRatio = fromAnimSpeedRatio;
    toAnim.speedRatio = toAnimSpeedRatio;
    while (newWeight < maxWeight) {
        newWeight += speed;
        currentWeight -= speed;
        toAnim.setWeightForAllAnimatables(newWeight);
        fromAnim.setWeightForAllAnimatables(currentWeight);
        yield;
    }
    currentAnimation = toAnim;
}

let isDancing = false;
let stopDanceRequested = false;
let currentDanceObserver = null;
let currentDanceAnim = null;
let danceTimeoutId = null;
let restoreMusicGlob = false;

function stopDance() {
    if (!isDancing || stopDanceRequested) return;
    stopDanceRequested = true;

    // Change UI immediately back to normal while we fade out
    const danceBtn = document.getElementById('danceBtn');
    if (danceBtn) {
        danceBtn.innerText = "Dance";
        danceBtn.classList.remove('stop-dance');
    }
    const musicBtn2 = document.getElementById('musicToggleBtn');
    if (musicBtn2) musicBtn2.disabled = false;

    if (danceTimeoutId) {
        clearTimeout(danceTimeoutId);
        danceTimeoutId = null;
        finishDanceSequence();
        return;
    }

    if (currentDanceAnim && currentDanceObserver) {
        currentDanceAnim.onAnimationEndObservable.remove(currentDanceObserver);
        currentDanceObserver = null;
    }

    finishDanceSequence();
}

function finishDanceSequence() {
    isDancing = false;
    stopDanceRequested = false;

    const danceBtn = document.getElementById('danceBtn');
    if (danceBtn) {
        danceBtn.innerText = "Dance";
        danceBtn.classList.remove('stop-dance');
    }
    const musicBtn2 = document.getElementById('musicToggleBtn');
    if (musicBtn2) musicBtn2.disabled = false;
    updateBtnState("Send", ICON_SEND, false);

    if (dance && dance.isPlaying) {
        dance.setVolume(0, 1.5);
        setTimeout(() => {
            dance.stop();
            if (restoreMusicGlob && music) {
                music.setVolume(0.5, 2.0);
            }
        }, 1500);
    } else if (restoreMusicGlob && music) {
        music.setVolume(0.5, 2.0);
    }

    setIdleAnimObservers();
    scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnimation, 1, idle1, 1, false, 0.02, 0, idle1.duration, 4));
}

// Play Dance Animation
function playDance() {
    if (talking || isDancing) return;

    isDancing = true;
    stopDanceRequested = false;

    const danceBtn = document.getElementById('danceBtn');
    if (danceBtn) {
        danceBtn.innerText = "Stop Dance";
        danceBtn.classList.add('stop-dance');
    }
    const musicBtnEl = document.getElementById('musicToggleBtn');
    if (musicBtnEl) musicBtnEl.disabled = true;
    updateBtnState("Dancing...", '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px; margin-right: 8px;"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"/><path d="M12 6a1 1 0 0 0-1 1v5a1 1 0 0 0 .29.71l3 3a1 1 0 0 0 1.42-1.42L13 11.59V7A1 1 0 0 0 12 6Z"/></svg>', true);

    if (!dance) {
        dance = new BABYLON.Sound("Music", "./resources/sounds/dance.mp3", scene, null, {
            volume: 0.5
        });
    }

    restoreMusicGlob = false;
    const musicBtn = document.getElementById('musicToggleBtn');
    if (musicBtn && !musicBtn.classList.contains('muted') && music) {
        restoreMusicGlob = true;
        music.setVolume(0, 1.5); // Fade out normal music over 1.5 seconds
    }

    danceTimeoutId = setTimeout(() => {
        danceTimeoutId = null;
        if (stopDanceRequested) return;

        if (dance) {
            dance.setVolume(0);
            if (!dance.isPlaying) dance.play();
            dance.setVolume(0.5, 1.0); // Fade in over 1 second
        }

        removeAnimObservers();

        const baseSequence = [dance1, dance2, dance3, dance4];
        let sequence = [];
        for (let round = 0; round < 2; round++) {
            const shuffled = [...baseSequence];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            sequence = sequence.concat(shuffled);
        }

        let currentIndex = 0;

        const playNext = () => {
            if (stopDanceRequested) return;

            if (currentIndex >= sequence.length) {
                finishDanceSequence();
                return;
            }

            const nextDance = sequence[currentIndex];
            currentDanceAnim = nextDance;
            scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnimation, 1.0, nextDance, 1.0, false, 0.02, 50, nextDance.duration, 4));

            currentDanceObserver = nextDance.onAnimationEndObservable.add(() => {
                nextDance.onAnimationEndObservable.remove(currentDanceObserver);
                currentDanceObserver = null;
                currentIndex++;
                playNext();
            });
        };

        playNext();
    }, restoreMusicGlob ? 1500 : 0);
}


// Start Timeline
let timelineInterval;
function startTimeline() {
    clearInterval(timelineInterval);

    // Step 1 - Camera Animation
    const animationDuration = 250;
    camera.alpha = 1.57;
    camera.beta = 1.42;
    BABYLON.Animation.CreateAndStartAnimation("cameraAnim", camera, "radius", 50, animationDuration, 15, 2.4, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE, undefined, () => {
        camera.useAutoRotationBehavior = true;
        camera.autoRotationBehavior.idleRotationSpeed = 0.025;
    });

    // Clear Timer
    let timer = 0;

    // Time Interval
    timelineInterval = setInterval(() => {
        timer++;

        // console.log("Timer: " + timer);
        if (timer === 1) {
            // Remove Idle Animation Observers
            removeAnimObservers();
            // Idle to Salute Anim
            scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnimation, 1.0, salute, 1.0, false, 0.015, 0, salute.duration - animationOffset, 1));

        }

        // Start Speech after 3 seconds
        if (timer === 3) {
            // Start Speech
            setTimeout(() => {
                if (!talking) {
                    speech.volume = 1;
                    talking = true;
                    speech.play();
                }
            }, 200);



            // RegisterBeforeRender Morph Target Mouth
            scene.registerBeforeRender(function () {
                const workingArray = myAnalyser.getByteFrequencyData();
                let jawValue = 0;

                if (talking) {
                    // console.log("Frequency: " + workingArray[5] / 512);
                    jawValue = workingArray[5] / 512 * morphMultiplier_1;
                }

                scene.getMeshByName("Wolf3D_Head").morphTargetManager.getTarget(16).influence = jawValue * 2;
                scene.getMeshByName("Wolf3D_Head").morphTargetManager.getTarget(34).influence = jawValue;
                scene.getMeshByName("Wolf3D_Teeth").morphTargetManager.getTarget(34).influence = jawValue;
            });
        }

        // Check Talking Animations -- Start after 3 sec.
        if (talking && speech.isPlaying && timer >= 3 && !currentAnimation.isPlaying) {
            let newTalkingAnim;
            do {
                const random2 = Math.floor(Math.random() * 3) + 1;
                if (random2 === 1)
                    newTalkingAnim = talking1;
                else if (random2 === 2)
                    newTalkingAnim = talking2;
                else if (random2 === 3)
                    newTalkingAnim = talking3;
            } while (newTalkingAnim === currentAnimation);
            scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnimation, 0.8, newTalkingAnim, 0.8, false, 0.02, animationOffset, newTalkingAnim.duration - animationOffset, 0.75));
        }
    }, 1000);
}

// Environment Lighting
function setLighting() {
    hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./resources/env/environment_19.env", scene);
    hdrTexture.rotationY = BABYLON.Tools.ToRadians(hdrRotation);
    hdrSkybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 1024 }, scene);
    const hdrSkyboxMaterial = new BABYLON.PBRMaterial("skybox", scene);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone();
    hdrSkyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    hdrSkyboxMaterial.microSurface = 0.5;
    hdrSkyboxMaterial.disableLighting = true;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;
}

// Set Shadows
function setShadows() {
    scene.meshes.forEach(function (mesh) {
        if (mesh.name != "skybox"
            && mesh.name != "ground") {
            shadowGenerator.darkness = 0.4;
            shadowGenerator.bias = 0.001;
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.filteringQuality = 1;
        }
    });
}

// Set Reflections
function setReflections() {
    scene.materials.forEach(function (material) {
        if (material.name != "skybox") {
            material.reflectionTexture = hdrTexture;
            material.reflectionTexture.level = 0.9;
            material.environmentIntensity = 0.9;
            material.disableLighting = false;
        }
    });
}

// Show START DEMO BUTTON
function showButtonHide() {
    setTimeout(() => {
        let loadingText = document.getElementById('loadingText');
        const loaderSpan = document.querySelector('span.loader');
        const startBtn = document.getElementById("startBtn");

        // Beautifully fade out the loader
        if (loaderSpan) {
            loaderSpan.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

            setTimeout(() => {
                loaderSpan.style.visibility = "hidden";
            }, 500);
        }

        // Animated text update
        if (loadingText) {
            setTimeout(() => {
                loadingText.remove();
                loadingText = document.createElement("p");
                loadingText.id = "loadingText";
                const startHeader = document.querySelector(".start-header");
                if (startHeader) {
                    startHeader.appendChild(loadingText);
                }
                loadingText.style.animation = "fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
                loadingText.style.visibility = "visible";
                loadingText.textContent = 'Loading Complete';
                loadingText.style.color = "#1a73e8";
                loadingText.style.fontWeight = "700";
            }, 1000);
        }

        // Session Button Entry
        setTimeout(() => {
            if (startBtn) {
                startBtn.style.animation = "fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both";
                startBtn.style.visibility = "visible";
                startBtn.style.display = "inline-flex"; // Ensure visible

            }
        }, 400);

        // Initialize Vanta for the final background transition
        starteffect = VANTA.WAVES({
            el: "#loadingDiv",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x1a73e8,
            shininess: 35.00,
            waveHeight: 15.00,
            waveSpeed: 0.8
        });
    }, 1200);

    setPostProcessing();

    setTimeout(() => {
        optimizeScene();
    }, 2000);
}



// Hide Loading View
function hideLoadingView() {
    // Unlock Audio Engine
    BABYLON.Engine.audioEngine.unlock();
    document.getElementById("startBtn").classList.add("fadeOut");
    document.getElementById("startBtn").classList.remove("fadeIn");
    document.getElementById("loadingDiv").classList.add("fadeOut");
    setTimeout(() => {
        document.getElementById("loadingDiv").style.display = "none";
        document.getElementById("startBtn").style.visibility = "hidden";
        document.getElementById("startBtn").classList.remove("fadeIn");
        document.getElementById("startBtn").classList.remove("fadeOut");
        const loadingDiv = document.getElementById("loadingDiv");
        if (loadingDiv) loadingDiv.remove();
        starteffect.destroy();
    }, 400);
    startAvatar();
}

// Optimizer
function optimizeScene() {
    scene.skipPointerMovePicking = true;
    scene.autoClear = false; // Color buffer
    scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
    scene.getAnimationRatio();
    scene.blockfreeActiveMeshesAndRenderingGroups = true;
    // Hardware Scaling
    const options = new BABYLON.SceneOptimizerOptions(30, 500);
    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));
    const optimizer = new BABYLON.SceneOptimizer(scene, options);
    optimizer.start();
}

// Post Processing
function setPostProcessing() {
    //return;
    const pipeline = new BABYLON.DefaultRenderingPipeline(
        "defaultPipeline", // The name of the pipeline
        false, // Do you want the pipeline to use HDR texture?
        scene, // The scene instance
        [scene.activeCamera] // The list of cameras to be attached to
    );
    pipeline.imageProcessing.exposure = 1.02; // 1 by default
    pipeline.samples = 4;
    pipeline.bloomEnabled = false;
}

// Resize Window
window.addEventListener("resize", function () {
    engine.resize();
});

///////////////////////////////////////////////////////////////

// Start Game
function starting(mp3url) {

    speech = new BABYLON.Sound("speech", mp3url, scene, function () {
    });

    speech.setVolume(3.0);

    speech.onended = function () {
        console.log("End Speech");
        talking = false;

        if (typeof triggerDanceAfterSpeech !== 'undefined' && triggerDanceAfterSpeech) {
            triggerDanceAfterSpeech = false;
            playDance();
            setTimeout(() => {
                if (timelineInterval) clearInterval(timelineInterval);
            }, 1000);
            return;
        }

        music.setVolume(0.5, 1);
        setIdleAnimObservers();
        updateBtnState("Send", ICON_SEND, false);
        setTimeout(() => {
            if (timelineInterval)
                clearInterval(timelineInterval);
        }, 1000);
        scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnimation, 0.7, idle1, 0.7, false, 0.02, 0, idle1.duration, 0.8));
    };

    // Add Speech Sound to a SoundTrack to get the analiser data
    const speechTrack = new BABYLON.SoundTrack(scene);
    speechTrack.addSound(speech);

    // Audio Analyser
    myAnalyser = new BABYLON.Analyser(scene);
    speechTrack.connectToAnalyser(myAnalyser);
    myAnalyser.FFT_SIZE = 64;
    myAnalyser.SMOOTHING = 0.03;
    // myAnalyser.drawDebugCanvas();


}


function startTimelineTalk() {
    clearInterval(timelineInterval);
    // Clear Timer
    let timer = 0;
    // Time Interval
    timelineInterval = setInterval(() => {
        timer++;
        // Start Speech after 1 seconds
        if (timer === 1) {
            // Remove Idle Animation Observers
            removeAnimObservers();
            // Start Speech

            if (!talking) {
                speech.volume = 3.0;
                talking = true;
                speech.play();
            }

            // RegisterBeforeRender Morph Target Mouth
            scene.registerBeforeRender(function () {
                const workingArray = myAnalyser.getByteFrequencyData();
                let jawValue = 0;

                if (talking) {
                    // console.log("Frequency: " + workingArray[5] / 512);
                    jawValue = workingArray[5] / 512 * morphMultiplier_1;
                }

                scene.getMeshByName("Wolf3D_Head").morphTargetManager.getTarget(16).influence = jawValue * 2;
                scene.getMeshByName("Wolf3D_Head").morphTargetManager.getTarget(34).influence = jawValue;
                scene.getMeshByName("Wolf3D_Teeth").morphTargetManager.getTarget(34).influence = jawValue;
            });
        }

        // Check Talking Animations -- Start after 1 sec.
        if (talking && speech.isPlaying && timer >= 1 && !currentAnimation.isPlaying) {
            let newTalkingAnim;
            do {
                const random2 = Math.floor(Math.random() * 4) + 1;
                if (random2 === 1)
                    newTalkingAnim = talking1;
                else if (random2 === 2)
                    newTalkingAnim = talking2;
                else if (random2 === 3)
                    newTalkingAnim = talking3;
                else if (random2 === 4)
                    newTalkingAnim = talking4;
            } while (newTalkingAnim === currentAnimation);
            scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnimation, 0.8, newTalkingAnim, 0.8, false, 0.02, animationOffset, newTalkingAnim.duration - animationOffset, 0.75));
        }
    }, 1000);
}

let db;
const dbName = "tts-audio-store";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = e => {
            db = e.target.result;
            db.createObjectStore("audios");
        };
        request.onsuccess = e => {
            db = e.target.result;
            resolve();
        };
        request.onerror = reject;
    });
}

function saveToIndexedDB(key, blob) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("audios", "readwrite");
        tx.objectStore("audios").put(blob, key);
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

function getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("audios", "readonly");
        const req = tx.objectStore("audios").get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

const actionbtn = document.getElementById("convertBtn");
const micbtn = document.getElementById("micBtn");

// Button state icons
const ICON_SEND = `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px; margin-right: 8px;"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
const ICON_PROCESSING = `<svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-right: 8px;"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"/></svg>`;
const ICON_TALKING = `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px; margin-right: 8px;"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;

function updateBtnState(text, iconHtml, isDisabled) {
    if (actionbtn) {
        actionbtn.disabled = isDisabled;
        actionbtn.innerHTML = `${iconHtml} <span id="sendBtnText">${text}</span>`;
    }
    if (micbtn) {
        micbtn.disabled = isDisabled;
    }
}

actionbtn.addEventListener("click", async () => {
    const text = document.getElementById("speaktest").value;
    if (!text) {
        console.log("No text to convert");
        return;
    }

    updateBtnState("Processing...", ICON_PROCESSING, true);
    await openDB();

    // 1. Send text to backend TTS API
    const res = await fetch("http://localhost:3000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: "en", slow: false })
    });

    if (!res.ok) {
        console.error("TTS failed");
        return;
    }

    const blob = await res.blob();

    // 2. Save MP3 to IndexedDB
    await saveToIndexedDB("lastAudio", blob);

    // 3. Retrieve MP3 and create URL
    const savedBlob = await getFromIndexedDB("lastAudio");
    const mp3url = URL.createObjectURL(savedBlob);

    const messages = document.getElementById('chat-messages');

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    setTimeout(() => {
        music.setVolume(0.3, 0.5);
        starting(mp3url);
        updateBtnState("Talking...", ICON_TALKING, true);
        talking = false;
        camera.attachControl(canvas, true);
        sfx1.play();
        playSounds();
        timer = 0;
        fetch("http://localhost:3000/ai-text")
            .then(res => res.json())
            .then(data => {
                addMessage(data.aiText, 'bot');
                if (data.shouldDance) {
                    triggerDanceAfterSpeech = true;
                }
            });
    }, 1000);

    setTimeout(() => {
        startTimelineTalk();
    }, 400);

});



