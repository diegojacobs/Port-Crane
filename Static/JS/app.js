window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('canvas');
    var elements = [];
    var actions = ['trans', 'rotate', 'scale', 'shear'];
    var dimensions = ['x', 'y', 'z'];
    var objects3D = ["Boat", "Claw"];
    var actualAction = actions[0];
    var actualObject = objects3D[0];
    var engine = new BABYLON.Engine(canvas, true);
    var openDoorAudio = {};
    var closeDoorAudio = {};
    var doorIsOpen = false;
    var help = false;
    var shearX = 0;
    var shearY = 0;
    var shearZ = 0;
    var actualElement = false;
    var meshesColliderList = [];
    var plan2;
    var matPlan;
    var currentHoldingContainer;
    var readyToDrop = false;
    var holding = false;
    var containersWithShip = [];
    var toggleCamera = 1;
    var camera, camera2, camera3;

    engine.enableOfflineSupport = false;

    var createScene = function() {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.White();
        scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        scene.collisionsEnabled = true;


        camera = new BABYLON.ArcRotateCamera(
            "arcCam",
            BABYLON.Tools.ToRadians(90),
            BABYLON.Tools.ToRadians(90),
            20.0,
            BABYLON.Vector3.Zero(),
            scene
        );
        camera2 = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(-5.5, 2, -4.5), scene);
        camera2.rotation = new BABYLON.Vector3(0, 4.5, 0);
        camera2.parent = elements.filter(getBoat)[0];

        camera3 = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(-1, 9, 7.5), scene);
        camera3.rotation = new BABYLON.Vector3(0, 9.5, 0);



        camera.attachControl(canvas, true);
        camera.applyGravity = true;
        camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        camera.checkCollisions = true;
        camera.collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5)

        var light = new BABYLON.HemisphericLight(
            "HemisphericLight",
            new BABYLON.Vector3(0, 1, 0),
            scene
        );

        light.parent = camera;
        light.intensity = 2.0;
        BABYLON.SceneLoader.ImportMesh(
            "", "", "model/boat.babylon",
            scene,
            function(newMeshes) {
                newMeshes.forEach(
                    function(mesh) {
                        elements.push(mesh);
                    }
                );
            }
        );

        scene.registerBeforeRender(function() {});

        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("model/sky/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;

        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "model/water/heightMap.png", 512, 512, 32, -40, 10, scene, false);

        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("model/water/ground.jpg", scene);
        groundMaterial.diffuseTexture.uScale = 4;
        groundMaterial.diffuseTexture.vScale = 4;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = groundMaterial;

        // Water
        var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);

        var water = new BABYLON.WaterMaterial("water", scene);
        water.bumpTexture = new BABYLON.Texture("model/water/waterbump.png", scene);

        // Water properties
        water.windForce = -20;
        water.waveHeight = 0.3;
        water.windDirection = new BABYLON.Vector2(1, 1);
        water.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
        water.colorBlendFactor = 0.3;
        water.bumpHeight = 0.1;
        water.waveLength = 0.8;

        // Add skybox and ground to the reflection and refraction
        water.addToRenderList(skybox);
        water.addToRenderList(ground);

        // Assign the water material
        waterMesh.material = water;
        waterMesh.position.y = -2;

        scene.collisionsEnabled = true;
        camera.checkCollisions = true;

        ground.checkCollisions = true;
        return scene;
    }

    var scene = createScene();
    scene.actionManager = new BABYLON.ActionManager(scene);
    var rotate = function(mesh) {
        scene.actionManager.registerAction(new BABYLON.IncrementValueAction(BABYLON.ActionManager.OnEveryFrameTrigger, mesh, "rotation.y", 0.01));
    }

    var onKeyDown = function(evt) {


        //W
        if (evt.keyCode == 87) {
            var boat = elements.filter(getBoat)[0];
            var isle = elements.filter(getIsle)[0];
            var transVector = new BABYLON.Vector3(1, 0, 0);
            var transVectorContainer = new BABYLON.Vector3(1, 0, 0);

            translateElements(elements.filter(getBoat)[0], transVector);
            translateElements(camera2, transVector);

            for (var i = 0; i < containersWithShip.length; i++) {
                var container = containersWithShip[i];
                if (container.rotationX !== undefined) {
                    rotateElements(container, BABYLON.Axis.Y, -container.rotationX);
                    translateElements(container, transVectorContainer);
                    rotateElements(container, BABYLON.Axis.Y, container.rotationX);
                } else {
                    translateElements(container, transVectorContainer);
                }

            }
        }

        //S
        if (evt.keyCode == 83) {
            var transVector = new BABYLON.Vector3(-1, 0, 0);
            var boat = elements.filter(getBoat)[0];
            translateElements(boat, transVector);
            translateElements(camera2, transVector);

            var isle = elements.filter(getIsle)[0];
            var transVectorContainer = new BABYLON.Vector3(-1, 0, 0);
            for (var i = 0; i < containersWithShip.length; i++) {
                var container = containersWithShip[i];
                if (container.rotationX !== undefined) {
                    rotateElements(container, BABYLON.Axis.Y, -container.rotationX);
                    translateElements(container, transVectorContainer);
                    rotateElements(container, BABYLON.Axis.Y, container.rotationX);
                } else {
                    translateElements(container, transVectorContainer);
                }

            }
        }

        //A
        if (evt.keyCode == 65) {
            if (actualElement === true) {
                var crane = elements.filter(getCrane)[0];
                rotateElements(crane, BABYLON.Axis.Y, Math.PI / 12);
                var claw = elements.filter(getClaw)[0];
                if (holding && currentHoldingContainer !== undefined) {

                    currentHoldingContainer.position.x = claw.getAbsolutePosition().x;
                    currentHoldingContainer.position.y = claw.getAbsolutePosition().y - 1.8;
                    currentHoldingContainer.position.z = claw.getAbsolutePosition().z;
                    currentHoldingContainer.rotationX = 0;
                }
            } else {
                var isle = elements.filter(getIsle)[0];
                var boat = elements.filter(getBoat)[0];

                rotateElements(boat, BABYLON.Axis.Y, -Math.PI / 16);
                for (var i = 0; i < containersWithShip.length; i++) {
                    var container = containersWithShip[i];
                    rotateElements(container, BABYLON.Axis.Y, -Math.PI / 16);
                }
            }
        }

        //D
        if (evt.keyCode == 68) {
            if (actualElement === true) {
                var crane = elements.filter(getCrane)[0]
                rotateElements(crane, BABYLON.Axis.Y, -Math.PI / 12);

                if (holding && currentHoldingContainer !== undefined) {
                    var claw = elements.filter(getClaw)[0];
                    currentHoldingContainer.position.x = claw.getAbsolutePosition().x;
                    currentHoldingContainer.position.y = claw.getAbsolutePosition().y - 1.8;
                    currentHoldingContainer.position.z = claw.getAbsolutePosition().z;
                    currentHoldingContainer.rotationX = 0;
                }
            } else {
                var isle = elements.filter(getIsle)[0];
                var boat = elements.filter(getBoat)[0];
                rotateElements(boat, BABYLON.Axis.Y, Math.PI / 16);
                for (var i = 0; i < containersWithShip.length; i++) {
                    var container = containersWithShip[i];
                    rotateElements(container, BABYLON.Axis.Y, Math.PI / 16);
                }
            }
        }
        // o
        if (evt.keyCode === 76) {
            var claw = elements.filter(getClaw)[0];
            var rope = elements.filter(getRope)[0];
            var boat = elements.filter(getBoat)[0];

            var transVector = new BABYLON.Vector3(0, -0.5, 0);
            var transVector2 = new BABYLON.Vector3(0, -1, 0);
            translateElements(claw, transVector2);
            scaleElements(rope, dimensions[1], 1.1);
            translateElements(rope, transVector);
        }
        // l
        if (evt.keyCode === 79) {
            var claw = elements.filter(getClaw)[0];
            var rope = elements.filter(getRope)[0];
            var transVector = new BABYLON.Vector3(0, 0.6, 0);
            var transVector2 = new BABYLON.Vector3(0, 1, 0);
            translateElements(claw, transVector2);
            scaleElements(rope, dimensions[1], 0.9);
            translateElements(rope, transVector);
        }

        // spacebar
        if (evt.keyCode === 32) {
            if (holding) {
                var boatPosition = elements.filter(getClaw)[0].getAbsolutePosition();
                var x = currentHoldingContainer.absolutePosition.x;
                var y = currentHoldingContainer.absolutePosition.y;
                var z = currentHoldingContainer.absolutePosition.z;

                if ((x + 1 > boatPosition.x && x - 1 < boatPosition.x) || (x + 1 < boatPosition.x && x - 1 > boatPosition.x)) {
                    if ((y + 2 > boatPosition.y && y - 2 < boatPosition.y) || (y + 2 < boatPosition.y && y - 2 > boatPosition.y)) {
                        if ((z + 1 > boatPosition.z && z - 1 < boatPosition.z) || (z + 1 < boatPosition.y && z - 1 > boatPosition.z)) {
                            currentHoldingContainer.parent = elements.filter(getBoat)[0];
                            currentHoldingContainer.position.x = 5.5;
                            currentHoldingContainer.position.y = 1.5;
                            currentHoldingContainer.position.z = 0;
                        } else {
                            currentHoldingContainer.parent = {};
                        }
                    } else {
                        currentHoldingContainer.parent = {};
                    }
                } else {
                    currentHoldingContainer.parent = {};
                }

                currentHoldingContainer = {};
            } else {
                var containers = elements.filter(getContainers);
                var clawPosition = elements.filter(getClaw)[0].getAbsolutePosition();
                var container = {};
                for (var i = 0; i < containers.length; i++) {
                    var temp = containers[i];
                    var x = temp.absolutePosition.x;
                    var y = temp.absolutePosition.y;
                    var z = temp.absolutePosition.z;

                    if ((x + 1 > clawPosition.x && x - 1 < clawPosition.x) || (x + 1 < clawPosition.x && x - 1 > clawPosition.x)) {
                        if ((y + 2 > clawPosition.y && y - 2 < clawPosition.y) || (y + 2 < clawPosition.y && y - 2 > clawPosition.y)) {
                            if ((z + 1 > clawPosition.z && z - 1 < clawPosition.z) || (z + 1 < clawPosition.y && z - 1 > clawPosition.z)) {
                                console.log(temp);
                                temp.parent = elements.filter(getClaw)[0];
                                temp.position.x = 0;
                                temp.position.y = -1.8;
                                temp.position.z = 0;
                                rotateElements(temp, BABYLON.Axis.Y, -Math.PI / 2);

                                currentHoldingContainer = temp;
                            }
                        }
                    }
                }
            }

            holding = !holding;
        }

        // i
        if (evt.keyCode === 73) {
            var claw = elements.filter(getClaw)[0];
            var rope = elements.filter(getRope)[0];
            var rightBeam = elements.filter(getRightBeam)[0];
            var leftBeam = elements.filter(getLeftBeam)[0];

            if (rope.position.z <= -5 && rightBeam.position.z < 0) {
                var cylinder = elements.filter(getCylinder)[0];
                var transVector = new BABYLON.Vector3(0, 0, 2);
                var transVector2 = new BABYLON.Vector3(0, 0, -2);
                if (claw.rotationX !== undefined) {
                    translateElements(claw, transVector2);
                } else {
                    translateElements(claw, transVector2);
                }
                var transVector3 = new BABYLON.Vector3(0, 0, 0.1);
                translateElements(rightBeam, transVector3);
                translateElements(leftBeam, transVector3);

                translateElements(rope, transVector);
                translateElements(cylinder, transVector);
            }
        }

        // p
        if (evt.keyCode === 80) {
            var claw = elements.filter(getClaw)[0];
            var rope = elements.filter(getRope)[0];
            var cylinder = elements.filter(getCylinder)[0];
            var rightBeam = elements.filter(getRightBeam)[0];
            var leftBeam = elements.filter(getLeftBeam)[0];

            if (rightBeam.position.z > -6) {
                var transVector = new BABYLON.Vector3(0, 0, -2);
                var transVector2 = new BABYLON.Vector3(0, 0, 2);

                if (rope.position.z >= -31) {
                    if (claw.rotationX !== undefined) {
                        translateElements(claw, transVector2);
                    } else {
                        translateElements(claw, transVector2);
                    }

                    var transVector3 = new BABYLON.Vector3(0, 0, -0.1);
                    translateElements(rightBeam, transVector3);
                    translateElements(leftBeam, transVector3);

                    translateElements(rope, transVector);
                    translateElements(cylinder, transVector);
                }
            }
        }


        // k
        if (evt.keyCode === 75) {
            var crane = elements.filter(getCrane)[0];
            rotateElements(crane, BABYLON.Axis.Y, -Math.PI / 16);
        }

        // ñ ;
        if (evt.keyCode === 192 || evt.keyCode === 186) {
            var crane = elements.filter(getCrane)[0];
            rotateElements(crane, BABYLON.Axis.Y, Math.PI / 16);
        }

        // // ,
        // if (evt.keyCode === 188) {
        //     var claw = elements.filter(getClaw)[0];
        //     rotateElements(claw, BABYLON.Axis.Y, Math.PI / 16);
        // }

        // // .
        // if (evt.keyCode === 190) {
        //     var claw = elements.filter(getClaw)[0];
        //     rotateElements(claw, BABYLON.Axis.Y, -Math.PI / 16);
        // }

        //T
        if (evt.keyCode === 84) {
            //1 normal camera, 2 crane , 3 boat
            var canvas = document.getElementById('canvas');

            toggleCamera++;
            if (toggleCamera === 4) toggleCamera = 1;
            switch (toggleCamera) {
                case 1:
                    scene.activeCamera = camera;
                    camera.attachControl(canvas);
                    break;
                case 2:
                    scene.activeCamera = camera2;
                    camera2.attachControl(canvas);
                    break;
                case 3:
                    scene.activeCamera = camera3;
                    camera3.attachControl(canvas);
                    break;
            }


        }
        //help
        if (evt.keyCode == 72) {
            var helpBlock = document.getElementById('helpBlock');
            var canvas = document.getElementById('canvasBlock');

            if (help) {
                helpBlock.style.display = 'none';
                canvas.style.display = 'block';
            } else {
                helpBlock.style.display = 'block';
                canvas.style.display = 'none';
            }

            help = !help;
        }

        console.log(evt.keyCode);
    };

    var translateElements = function(element, vector) {
        element.translate(vector, 1.0, BABYLON.Space.LOCAL);
    };

    var rotateElements = function(element, vector, factor) {
        element.rotate(vector, factor, BABYLON.Space.LOCAL);
    };

    var scaleElements = function(element, dimension, factor) {
        switch (dimension) {
            // In x
            case dimensions[0]:
                element.scaling.x = element.scaling.x * factor;
                break;
                // In y
            case dimensions[1]:
                element.scaling.y = element.scaling.y * factor;
                break;
                // In z
            case dimensions[2]:
                element.scaling.z = element.scaling.z * factor;
                break;
        }
    };

    function getClaw(item) {
        return item.id === "Claw";
    }

    function getCrane(item) {
        return item.id === "Crane";
    }

    function getClaw(item) {
        return item.id === "Claw";
    }

    function getBoat(item) {
        return item.id === "Boat";
    }

    function getRope(item) {
        return item.id === "Rope";
    }

    function getContainers(item) {
        return item.id.includes("Container");
    }

    function getCylinder(item) {
        return item.id === "Cylinder3";
    }

    function getCraneCamera(item) {
        return item.id === "Box18";
    }

    function getBoatCamera(item) {
        return item.id === "Cylinder30";
    }

    function getIsle(item) {
        return item.id === "Isle";
    }

    function getLeftBeam(item) {
        return item.id === "Box24";
    }

    function getRightBeam(item) {
        return item.id === "Box38";
    }

    // On key up, reset the movement
    var onKeyUp = function(evt) {}

    // Register events with the right Babylon function
    BABYLON.Tools.RegisterTopRootEvents([{
        name: "keydown",
        handler: onKeyDown
    }, {
        name: "keyup",
        handler: onKeyUp
    }]);

    engine.runRenderLoop(function() {
        scene.render();
    });
});