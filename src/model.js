// VRM Model Handler
function VRMModel(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.vrm = null;
    this.clock = new THREE.Clock();
    this.isAnimating = false;
    this.blinkTimer = 0;
    this.blinkInterval = 3;
    this.headTiltTimer = 0;
    this.headTiltInterval = 5;
    this.init();
}

VRMModel.prototype.init = function() {
    try {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        var aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 20);
        this.camera.position.set(0, 1.5, 3);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.setupLighting();
        this.loadVRMModel();
        this.animate();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    } catch (error) {
        console.error('Failed to initialize VRM model:', error);
        this.showError('Failed to initialize 3D model. Please refresh the page.');
    }
};

VRMModel.prototype.setupLighting = function() {
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 2);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    var fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-1, 1, -1);
    this.scene.add(fillLight);
};

VRMModel.prototype.loadVRMModel = function() {
    if (typeof VRMLoaderPlugin === 'undefined') {
        this.createFallbackCube();
        return;
    }
    var loader = new THREE.GLTFLoader();
    var plugin = new VRMLoaderPlugin();
    loader.register(plugin);
    var self = this;
    loader.load(
        '/model.vrm',
        function(gltf) {
            self.vrm = gltf.userData.vrm;
            self.scene.add(self.vrm.scene);
            self.vrm.scene.position.set(0, 0, 0);
            self.vrm.scene.scale.setScalar(1);
            self.setupIdlePose();
            document.getElementById('loading').classList.add('hidden');
        },
        undefined,
        function(error) {
            self.createFallbackCube();
        }
    );
};

VRMModel.prototype.createFallbackCube = function() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0x667eea, transparent: true, opacity: 0.8 });
    this.fallbackCube = new THREE.Mesh(geometry, material);
    this.fallbackCube.position.set(0, 0, 0);
    this.scene.add(this.fallbackCube);
    document.getElementById('loading').classList.add('hidden');
};

VRMModel.prototype.setupIdlePose = function() {
    if (!this.vrm) return;
    this.setExpression('Neutral', 1.0);
    if (this.vrm.humanoid) {
        var head = this.vrm.humanoid.getBoneNode('head');
        if (head) head.rotation.set(0, 0, 0.1);
    }
};

VRMModel.prototype.setExpression = function(expressionName, weight) {
    if (!this.vrm || !this.vrm.expressionManager) return;
    var em = this.vrm.expressionManager;
    em.setValue('Neutral', 0);
    em.setValue('Happy', 0);
    em.setValue('Angry', 0);
    em.setValue('Sad', 0);
    em.setValue('Relaxed', 0);
    em.setValue('Surprised', 0);
    em.setValue('Wink', 0);
    em.setValue('WinkRight', 0);
    em.setValue('Blink', 0);
    em.setValue(expressionName, weight);
};

VRMModel.prototype.triggerHeadTilt = function() {
    if (this.vrm && this.vrm.humanoid && !this.isAnimating) {
        var head = this.vrm.humanoid.getBoneNode('head');
        if (head) this.animateHeadTilt(head);
    } else if (this.fallbackCube) {
        this.animateFallbackCube();
    }
};

VRMModel.prototype.animateHeadTilt = function(head) {
    var self = this;
    this.isAnimating = true;
    var originalRotation = head.rotation.z;
    var tiltDirection = Math.random() > 0.5 ? 1 : -1;
    var tiltAmount = 0.2 * tiltDirection;
    var duration = 1000;
    var startTime = Date.now();
    function animateTilt() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        head.rotation.z = originalRotation + (tiltAmount * easeProgress);
        if (progress < 1) {
            requestAnimationFrame(animateTilt);
        } else {
            setTimeout(function() {
                var returnStartTime = Date.now();
                function returnAnimate() {
                    var returnElapsed = Date.now() - returnStartTime;
                    var returnProgress = Math.min(returnElapsed / duration, 1);
                    var returnEaseProgress = returnProgress < 0.5 ? 2 * returnProgress * returnProgress : 1 - Math.pow(-2 * returnProgress + 2, 2) / 2;
                    head.rotation.z = originalRotation + (tiltAmount * (1 - returnEaseProgress));
                    if (returnProgress < 1) {
                        requestAnimationFrame(returnAnimate);
                    } else {
                        self.isAnimating = false;
                    }
                }
                returnAnimate();
            }, 500);
        }
    }
    animateTilt();
};

VRMModel.prototype.animateFallbackCube = function() {
    if (this.isAnimating) return;
    var self = this;
    this.isAnimating = true;
    var originalRotation = this.fallbackCube.rotation.z;
    var tiltDirection = Math.random() > 0.5 ? 1 : -1;
    var tiltAmount = 0.5 * tiltDirection;
    var duration = 1000;
    var startTime = Date.now();
    function animateTilt() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        self.fallbackCube.rotation.z = originalRotation + (tiltAmount * easeProgress);
        if (progress < 1) {
            requestAnimationFrame(animateTilt);
        } else {
            setTimeout(function() {
                var returnStartTime = Date.now();
                function returnAnimate() {
                    var returnElapsed = Date.now() - returnStartTime;
                    var returnProgress = Math.min(returnElapsed / duration, 1);
                    var returnEaseProgress = returnProgress < 0.5 ? 2 * returnProgress * returnProgress : 1 - Math.pow(-2 * returnProgress + 2, 2) / 2;
                    self.fallbackCube.rotation.z = originalRotation + (tiltAmount * (1 - returnEaseProgress));
                    if (returnProgress < 1) {
                        requestAnimationFrame(returnAnimate);
                    } else {
                        self.isAnimating = false;
                    }
                }
                returnAnimate();
            }, 500);
        }
    }
    animateTilt();
};

VRMModel.prototype.triggerBlink = function() {
    if (this.vrm && this.vrm.expressionManager && !this.isAnimating) {
        var self = this;
        this.isAnimating = true;
        this.setExpression('Blink', 1.0);
        setTimeout(function() {
            self.setExpression('Neutral', 1.0);
            self.isAnimating = false;
        }, 200);
    }
};

VRMModel.prototype.triggerSmile = function() {
    if (this.vrm && this.vrm.expressionManager && !this.isAnimating) {
        var self = this;
        this.isAnimating = true;
        this.setExpression('Happy', 1.0);
        setTimeout(function() {
            self.setExpression('Neutral', 1.0);
            self.isAnimating = false;
        }, 2000);
    } else if (this.fallbackCube) {
        var self = this;
        this.isAnimating = true;
        var originalColor = this.fallbackCube.material.color.getHex();
        this.fallbackCube.material.color.setHex(0xff6b6b);
        setTimeout(function() {
            self.fallbackCube.material.color.setHex(originalColor);
            self.isAnimating = false;
        }, 2000);
    }
};

VRMModel.prototype.triggerSpeaking = function() {
    if (this.vrm && this.vrm.expressionManager && !this.isAnimating) {
        var self = this;
        this.isAnimating = true;
        var mouthOpen = false;
        var speakInterval = setInterval(function() {
            if (mouthOpen) {
                self.setExpression('Neutral', 1.0);
                mouthOpen = false;
            } else {
                self.setExpression('Relaxed', 0.3);
                mouthOpen = true;
            }
        }, 150);
        setTimeout(function() {
            clearInterval(speakInterval);
            self.setExpression('Neutral', 1.0);
            self.isAnimating = false;
        }, 3000);
    } else if (this.fallbackCube) {
        var self = this;
        this.isAnimating = true;
        var originalScale = this.fallbackCube.scale.x;
        var speakInterval = setInterval(function() {
            self.fallbackCube.scale.setScalar(originalScale + 0.1);
            setTimeout(function() {
                self.fallbackCube.scale.setScalar(originalScale);
            }, 75);
        }, 150);
        setTimeout(function() {
            clearInterval(speakInterval);
            self.fallbackCube.scale.setScalar(originalScale);
            self.isAnimating = false;
        }, 3000);
    }
};

VRMModel.prototype.animate = function() {
    var self = this;
    requestAnimationFrame(function() { self.animate(); });
    var delta = this.clock.getDelta();
    if (this.vrm) {
        this.vrm.update(delta);
        this.blinkTimer += delta;
        this.headTiltTimer += delta;
        if (this.blinkTimer >= this.blinkInterval) {
            this.triggerBlink();
            this.blinkTimer = 0;
            this.blinkInterval = 2 + Math.random() * 4;
        }
        if (this.headTiltTimer >= this.headTiltInterval) {
            this.triggerHeadTilt();
            this.headTiltTimer = 0;
            this.headTiltInterval = 4 + Math.random() * 6;
        }
    } else if (this.fallbackCube) {
        this.fallbackCube.rotation.y += 0.01;
        this.blinkTimer += delta;
        this.headTiltTimer += delta;
        if (this.blinkTimer >= this.blinkInterval) {
            this.fallbackCube.material.opacity = 0.3;
            setTimeout(function() {
                self.fallbackCube.material.opacity = 0.8;
            }, 200);
            this.blinkTimer = 0;
            this.blinkInterval = 2 + Math.random() * 4;
        }
        if (this.headTiltTimer >= this.headTiltInterval) {
            this.triggerHeadTilt();
            this.headTiltTimer = 0;
            this.headTiltInterval = 4 + Math.random() * 6;
        }
    }
    if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
    }
};

VRMModel.prototype.onWindowResize = function() {
    if (!this.camera || !this.renderer) return;
    var aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
};

VRMModel.prototype.speak = function() { this.triggerSpeaking(); };
VRMModel.prototype.smile = function() { this.triggerSmile(); };
VRMModel.prototype.blink = function() { this.triggerBlink(); };
VRMModel.prototype.tiltHead = function() { this.triggerHeadTilt(); };
VRMModel.prototype.reactToResponse = function() {
    this.smile();
    var self = this;
    setTimeout(function() { self.tiltHead(); }, 500);
    setTimeout(function() { self.speak(); }, 1000);
};
VRMModel.prototype.showError = function(message) {
    var loading = document.getElementById('loading');
    loading.innerHTML = '<p style="color: #ff6b6b; margin-bottom: 10px;">' + message + '</p>' +
        '<button onclick="location.reload()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;">Refresh Page</button>';
};

window.VRMModel = VRMModel; 