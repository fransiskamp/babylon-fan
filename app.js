const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
  var scene = new BABYLON.Scene(engine);
  
  // Camera setup
  var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 8, new BABYLON.Vector3(0, 2, 0), scene);
  camera.attachControl(canvas, true);
  
  // Light
  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  
  // Materials
  var mainMaterial = new BABYLON.StandardMaterial("mainMaterial", scene);
  mainMaterial.diffuseColor = new BABYLON.Color3(0.73, 0.53, 1);
  
  // Base (trapezoid shape)
  var baseShape = [
      new BABYLON.Vector3(-0.7, 0, -0.4),
      new BABYLON.Vector3(0.7, 0, -0.4),
      new BABYLON.Vector3(0.5, 0, 0.4),
      new BABYLON.Vector3(-0.5, 0, 0.4)
  ];
  var baseExtrusion = 0.2;
  var base = BABYLON.MeshBuilder.ExtrudePolygon("base", {
      shape: baseShape,
      depth: baseExtrusion,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
  }, scene);
  base.material = mainMaterial;
  base.rotation.x = Math.PI / 2;
  
  // Add control buttons (two small buttons on base)
  for (var i = 0; i < 2; i++) {
      var button = BABYLON.MeshBuilder.CreateCylinder("button" + i, {
          diameter: 0.15,
          height: 0.05
      }, scene);
      button.material = mainMaterial;
      button.position = new BABYLON.Vector3(-0.2 + i * 0.4, 0.12, 0.1);
  }
  
  // Stand/pole
  var pole = BABYLON.MeshBuilder.CreateBox("pole", {
      width: 0.1,
      height: 3,
      depth: 0.05
  }, scene);
  pole.material = mainMaterial;
  pole.position.y = 1.5;
  
  // Fan center
  var center = BABYLON.MeshBuilder.CreateCylinder("center", {
      diameter: 0.4,
      height: 0.2
  }, scene);
  center.material = mainMaterial;
  center.position.y = 3;
  center.rotation.x = Math.PI / 2;
  
  // Blades container
  var blades = new BABYLON.TransformNode("blades", scene);
  blades.position.y = 3;
  
  // Create 3 curved blades
  for (var i = 0; i < 3; i++) {
      var bladePath = [];
      for (var j = 0; j <= 10; j++) {
          var t = j / 10;
          var r = 1.5;
          var curveAmount = 0.8;
          var x = r * t;
          var y = curveAmount * Math.sin(t * Math.PI);
          bladePath.push(new BABYLON.Vector3(x, y, 0));
      }
      
      var blade = BABYLON.MeshBuilder.CreateTube("blade" + i, {
          path: bladePath,
          radius: 0.15,
          sideOrientation: BABYLON.Mesh.DOUBLESIDE
      }, scene);
      
      blade.material = mainMaterial;
      blade.parent = blades;
      blade.rotation.z = i * (Math.PI * 2 / 3);
  }
  
  // STATUS kipas ON/OFF
  var isOn = true;
  
  // Material warna untuk tombol on/off
  var onMaterial = new BABYLON.StandardMaterial("onMat", scene);
  onMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0); // Hijau
  
  var offMaterial = new BABYLON.StandardMaterial("offMat", scene);
  offMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Merah
  
  // Tombol on/off, nempel di atas base (posisi y baseExtrusion = 0.2)
  var onOffButton = BABYLON.MeshBuilder.CreateBox("onOffButton", { width: 0.3, height: 0.1, depth: 0.3 }, scene);
  
  // Posisi tombol tetap di sini
  var posOnY = baseExtrusion + 0.05; // 0.25
  onOffButton.position = new BABYLON.Vector3(0, posOnY, 0);
  onOffButton.material = onMaterial;
  
  // Action manager supaya tombol bisa diklik, toggle warna tapi posisi tetap
  onOffButton.actionManager = new BABYLON.ActionManager(scene);
  onOffButton.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          isOn = !isOn;
          onOffButton.material = isOn ? onMaterial : offMaterial;
          // posisi tetap tidak berubah
          onOffButton.position.y = posOnY;
      })
  );
  
  // Animasi putar baling-baling (jalan kalau ON)
  scene.registerBeforeRender(function () {
      if (isOn) {
          blades.rotation.z += 0.05;
      }
  });
  
  return scene;
};

var scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});