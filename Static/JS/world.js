        var canvas = document.getElementById("world");
        var engine = new BABYLON.Engine(canvas, true);
        var createScene = function() {
            var scene = new BABYLON.Scene(engine);

            var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, true);

            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

            // Skybox
            var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.disableLighting = true;
            skybox.material = skyboxMaterial;

            // Ground
            var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
            groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
            groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 4;

            var ground = BABYLON.Mesh.CreateGround("ground", 512, 512, 32, scene, false);
            ground.position.y = -1;
            ground.material = groundMaterial;

            // Water
            var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);

            var water = new BABYLON.WaterMaterial("water", scene);
            water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);

            // Water properties
            water.windForce = -15;
            water.waveHeight = 1.3;
            water.windDirection = new BABYLON.Vector2(1, 1);
            water.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
            water.colorBlendFactor = 0.3;
            water.bumpHeight = 0.1;
            water.waveLength = 0.1;

            // Add skybox and ground to the reflection and refraction
            water.addToRenderList(skybox);
            water.addToRenderList(ground);

            // Assign the water material
            waterMesh.material = water;

            return scene;
        }

        var scene = createScene();
        engine.runRenderLoop(function() {
            scene.render();
        });
        // Resize
        window.addEventListener("resize", function() {
            engine.resize();
        });