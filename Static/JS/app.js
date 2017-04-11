window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('canvas');
    var elements = [];
    var actions = ['trans', 'rotate', 'scale', 'shear'];
    var dimensions = ['x', 'y', 'z'];
    // 3: House, 0: Tree, 5: Door
    var objects3D = [1, 9, 5];
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

    engine.enableOfflineSupport = false; // Dont require a manifest file

    var createScene = function() {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.White();

        var camera = new BABYLON.ArcRotateCamera(
            "arcCam",
            BABYLON.Tools.ToRadians(90),
            BABYLON.Tools.ToRadians(90),
            20.0,
            BABYLON.Vector3.Zero(),
            scene
        );
        camera.attachControl(canvas, true);
        var light = new BABYLON.PointLight(
            "PointLight",
            new BABYLON.Vector3(0, 0, 0),
            scene
        );

        light.parent = camera;
        light.intensity = 1.5;
        BABYLON.SceneLoader.ImportMesh(
            "", "", "Model/boat.babylon",
            scene,
            function(newMeshes) {
                newMeshes.forEach(
                    function(mesh) {
                        elements.push(mesh);
                    }
                );
            }
        );
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        scene.fogDensity = 0.01;
        scene.registerBeforeRender(function() {});

        return scene;
    }

    var scene = createScene();
    scene.actionManager = new BABYLON.ActionManager(scene);
    var rotate = function(mesh) {
        scene.actionManager.registerAction(new BABYLON.IncrementValueAction(BABYLON.ActionManager.OnEveryFrameTrigger, mesh, "rotation.y", 0.01));
    }

    var onKeyDown = function(evt) {
        //help
        if (evt.keyCode == 57) {
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

    };

    var wireFrame = function(elements) {
        elements.forEach(function(e) {
            if (e.material != null) {
                e.material.wireframe = true;
            }
        });
    };

    var points = function(elements) {
        elements.forEach(function(e) {
            if (e.material != null) {
                e.material.pointsCloud = true;
                e.material.pointSize = 5;
            }
        });
    };

    var render = function(elements) {
        elements.forEach(function(e) {
            if (e.material != null) {
                e.material.pointsCloud = false;
                e.material.wireframe = false;
            }
        });
    };

    var translateElements = function(element, houseVector, treeGroundVector) {
        element.translate(houseVector, 1.0, BABYLON.Space.LOCAL);
    };

    var rotateElements = function(element, vector, factor) {
        var middle = getMiddlePosition(element);
        console.log(middle);
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

    var openDoor = function(element) {
        element.rotate(BABYLON.Axis.Y, -Math.PI / 4, BABYLON.Space.LOCAL);
    };

    var closeDoor = function(element) {
        element.rotate(BABYLON.Axis.Y, Math.PI / 4, BABYLON.Space.LOCAL);
    };

    var getMiddlePosition = function(mesh) {
        var boundingInfo = mesh.getBoundingInfo().boundingBox;
        console.log(boundingInfo);
        console.log(mesh);
        //(Ymax - Ymin)/2 + ymin
        return new BABYLON.Vector3(boundingInfo.minimumWorld.x + ((boundingInfo.maximumWorld.x - boundingInfo.minimumWorld.x) / 2),
            boundingInfo.minimumWorld.y + ((boundingInfo.maximumWorld.y - boundingInfo.minimumWorld.y) / 2),
            boundingInfo.minimumWorld.z + ((boundingInfo.maximumWorld.z - boundingInfo.minimumWorld.z) / 2));
    }

    // On key up, reset the movement
    var onKeyUp = function(evt) {};

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