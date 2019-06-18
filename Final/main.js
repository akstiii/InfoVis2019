function main()
{
    var volume1 = new KVS.LobsterData();

    var options1 = {"displayName": "display1", "isovalue": "isovalue1"};
    var s = start("Lobster1");
    var screenInfo1 =  displayVolume(volume1, options1);
    stop(s, "Lobster1");

    var options2 = {
      "displayName": "display2",
      "isovalue": "isovalue2",
      "material": "material2"
    };
    var s = start("Lobster2");
    var screenInfo2 = displayVolume(volume1, options2);
    stop(s, "Lobster2");

    var options3 = {
      "displayName": "display3",
      "X": "X3",
      "Y": "Y3",
      "Z": "Z3",
      "nX": "nX3",
      "nY": "nY3",
      "nZ": "nZ3",
      "apply": "applyCoords3"
    };
    var s = start("Lobster3");
    var screenInfo3 = displaySlice(volume1, options3);
    stop(s, "Lobster3");

    var volume2 = new KVS.CreateTornadoData(64,64,64);
    var fov = 45;
    var aspect = this.width / this.height;
    var near = 0.1;
    var far = 1000;
    sharedCamera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    sharedCamera.position.set( 0, 0, 12 );
    var options4 = {
      "displayName": "display4",
      "isovalue": "isovalue4",
      "material": "material4",
      "camera": sharedCamera
    };
    var s = start("Tornado1");
    const [screenInfo4, seeds, reseed] = displayStreamline(volume2, options4);
    stop(s, "Tornado1");

    var options6 = {
      "displayName": "display6",
      "X": "X6",
      "Y": "Y6",
      "Z": "Z6",
      "addPoint": "addPoint6",
      "removePoints": "removePoints6",
      "seedBtn": "seedPoints6",
      "camera": sharedCamera
    };
    var s = start("Tornado2");
    var screenInfo6 = displayPoints(volume2, seeds, reseed, options6);
    stop(s, "Tornado2");

    /*
    var options5 = {
      "displayName": "display5",
      "X": "X5",
      "Y": "Y5",
      "Z": "Z5",
      "nX": "nX5",
      "nY": "nY5",
      "nZ": "nZ5",
      "apply": "applyCoords5"
    };
    displaySlice(volume2, options5);
    */

    var multiSceneScreen = new AKST.MultiSceneCanvas();
    multiSceneScreen.addScene(screenInfo1);
    multiSceneScreen.addScene(screenInfo2);
    multiSceneScreen.addScene(screenInfo3);
    multiSceneScreen.addScene(screenInfo4);
    //multiSceneScreen.addScene(screenInfo5);
    multiSceneScreen.addScene(screenInfo6);

    multiSceneScreen.loop();
}

function displayVolume(volume, options) {
  var display = document.getElementById(options["displayName"]);

  var screen = new AKST.SceneInfo();
  screen.init(volume, {
      width: display.offsetWidth,
      height: display.offsetWidth,
      elem: display,
      resizeFunction: AKST.ModifiedClientRect(display,
        () => { return display.offsetWidth; },
        () => { return display.offsetWidth; })
  });
  screen.scene.add(Bounds(volume));

  var isovalueSlider;
  var isovalue;
  if (typeof options["isovalue"] === 'string') {
    isovalueSlider = document.getElementById(options["isovalue"]);
    isovalue = isovalueSlider.value;
  } else {
    isovalue = options["isovalue"];
  }

  var materialSelection;
  var material;
  if (typeof options["material"] === 'string') {
    materialSelection = document.getElementById(options["material"]);
    material = getMaterial(materialSelection.value);
  } else {
    material = options["material"];
  }

  var surfaces = Isosurfaces(volume, isovalue, material, options["transfer_fucntion"]);
  screen.scene.add(surfaces);

  if (isovalueSlider !== undefined) {
    isovalueSlider.addEventListener('input', function() {
        isovalue = isovalueSlider.value;
        screen.scene.remove(surfaces);
        surfaces = Isosurfaces(volume, isovalue, material, options["transfer_fucntion"]);
        screen.scene.add(surfaces);
    });
  }

  if (materialSelection !== undefined) {
    materialSelection.addEventListener('input', function() {
        material = getMaterial(materialSelection.value);
        screen.scene.remove(surfaces);
        surfaces = Isosurfaces(volume, isovalue, material, options["transfer_fucntion"]);
        screen.scene.add(surfaces);
    });
  }

  return screen;
}

function displaySlice(volume, options) {
  var screen = new AKST.SceneInfo();

  var display = document.getElementById(options["displayName"]);

  screen.init(volume, {
      width: display.offsetWidth,
      height: display.offsetWidth,
      elem: display,
      resizeFunction: AKST.ModifiedClientRect(display,
        () => { return display.offsetWidth; },
        () => { return display.offsetWidth; })
  });

  screen.scene.add(Bounds(volume));

  var materialSelection;
  var material;
  if (typeof options["material"] === 'string') {
    materialSelection = document.getElementById(options["material"]);
    material = getMaterial(materialSelection.value);
  } else {
    material = options["material"];
  }

  var xRange = getRange(options, "X");
  var yRange = getRange(options, "Y");
  var zRange = getRange(options, "Z");
  var x = getValue(options, "X");
  var y = getValue(options, "Y");
  var z = getValue(options, "Z");
  if (xRange !== undefined) {
    xRange.min = 0;
    xRange.max = volume.resolution.x;
  }
  if (yRange !== undefined) {
    yRange.min = 0;
    yRange.max = volume.resolution.y;
  }
  if (zRange !== undefined) {
    zRange.min = 0;
    zRange.max = volume.resolution.z;
  }

  var nXRange = getRange(options, "nX");
  var nYRange = getRange(options, "nY");
  var nZRange = getRange(options, "nZ");
  var nX = getValue(options, "nX");
  var nY = getValue(options, "nY");
  var nZ = getValue(options, "nZ");
  if (nXRange !== undefined) {
    nXRange.min = 0;
    nXRange.max = 1;
  }
  if (nYRange !== undefined) {
    nYRange.min = 0;
    nYRange.max = 1;
  }
  if (nZRange !== undefined) {
    nZRange.min = 0;
    nZRange.max = 1;
  }

  var apply = document.getElementById(options["apply"]);

  var point = new THREE.Vector3(x, y, z);
  var normal = new THREE.Vector3(nX, nY, nZ);
  var surfaces = Slice(volume, point, normal);
  screen.scene.add(surfaces);

  window.addEventListener('resize', function() {
      screen.resize( [display.offsetWidth, display.offsetWidth] );
  });

  if (materialSelection !== undefined) {
    materialSelection.addEventListener('input', function() {
        material = getMaterial(materialSelection.value);
        screen.scene.remove(surfaces);
        surfaces = Slice(volume, point, normal);
        screen.scene.add(surfaces);
    });
  }
  //addCoordinateListeners(xRange, yRange, zRange, rangeListener);
  if (apply !== undefined && apply !== null) {
    apply.addEventListener('click', rangeListener);
  }

  function rangeListener() {
    x = xRange !== undefined ? xRange.value : x;
    y = yRange !== undefined ? yRange.value : y;
    z = zRange !== undefined ? zRange.value : z;

    nX = nXRange !== undefined ? nXRange.value : nX;
    nY = nYRange !== undefined ? nYRange.value : nY;
    nZ = nZRange !== undefined ? nZRange.value : nZ;

    screen.scene.remove(surfaces);
    point = new THREE.Vector3(x, y, z);
    normal = new THREE.Vector3(nX, nY, nZ);
    surfaces = Slice(volume, point, normal);
    screen.scene.add(surfaces);
  }

  return screen;
}

function getRange(options, name) {
  if (typeof options[name] === 'string') {
    slider = document.getElementById(options[name]);
    return slider;
  }
  return undefined;
}

function getValue(options, name) {
  if (typeof options[name] === 'string') {
    slider = document.getElementById(options[name]);
    return slider.value;
  }
  return options[name];
}

function addCoordinateListeners(xRange, yRange, zRange, listener) {
  if (xRange !== undefined) {
      xRange.addEventListener('input', listener);
  }
  if (yRange !== undefined) {
      yRange.addEventListener('input', listener);
  }
  if (zRange !== undefined) {
      zRange.addEventListener('input', listener);
  }
}

function getMaterial(materialName) {
  switch (materialName) {
    case "Lambert":
      return new THREE.MeshLambertMaterial();
    case "Phong":
      return new THREE.MeshPhongMaterial();
    case "Basic":
    default:
      return new THREE.MeshBasicMaterial();
  }
}

function displayStreamline(volume, options) {
  var screen = new AKST.SceneInfo();

  var display = document.getElementById(options["displayName"]);

  screen.init(volume, {
      width: display.offsetWidth,
      height: display.offsetWidth,
      elem: display,
      resizeFunction: AKST.ModifiedClientRect(display,
        () => { return display.offsetWidth; },
        () => { return display.offsetWidth; }),
      camera: options["camera"]
  });

  screen.scene.add(Bounds(volume));

  var start = volume.objectCenter();
  start = new THREE.Vector3(start.x, start.y, 0);
  var end = volume.objectCenter();
  end = new THREE.Vector3(end.x, end.y, 64);
  var res = AKST.Streamlines(volume, {"start": start, "end": end, "steps": 38})
  for (var i = 0; i < res[0].length; i++) {
    screen.scene.add(res[0][i]);
  }

  return [screen, res[1], reseed];

  function reseed(seeds) {
    for (var i = 0; i < res[0].length; i++) {
      screen.scene.remove(res[0][i]);
    }
    res = AKST.Streamlines(volume, {"seeds": seeds});
    for (var i = 0; i < res[0].length; i++) {
      screen.scene.add(res[0][i]);
    }
    return res[1];
  }
}

function displayPoints(volume, vertices, reseed, options) {
  var screen = new AKST.SceneInfo();

  var display = document.getElementById(options["displayName"]);

  screen.init(volume, {
      width: display.offsetWidth,
      height: display.offsetWidth,
      elem: display,
      resizeFunction: AKST.ModifiedClientRect(display,
        () => { return display.offsetWidth; },
        () => { return display.offsetWidth; }),
      camera: options["camera"]
  });

  screen.scene.add(Bounds(volume));

  var material = new THREE.PointsMaterial({size: 2, vertexColors: THREE.VertexColors});
  material.sizeAttenuation = false;
  var geometry = new THREE.Geometry();
  geometry.vertices = vertices;
  for (var i=0; i < vertices.length; i++) {
    geometry.colors.push(new THREE.Color("skyblue"));
  }
  var center = volume.objectCenter();
  var addPoint = new THREE.Vector3(center.x, center.y, center.z);

  var addPointPos = geometry.vertices.length;

  geometry.vertices.push(addPoint);
  geometry.colors.push(new THREE.Color("red"));

  while (geometry.vertices.length < 60) {
    geometry.vertices.push(new THREE.Vector3(-1000,-1000,-1000));
    geometry.colors.push(new THREE.Color("red"));
  }

  var points = new THREE.Points(geometry, material);
  screen.scene.add(points);

  var xRange = document.getElementById(options["X"]);
  var yRange = document.getElementById(options["Y"]);
  var zRange = document.getElementById(options["Z"]);
  xRange.min = 0;
  yRange.min = 0;
  zRange.min = 0;
  xRange.max = volume.resolution.x;
  yRange.max = volume.resolution.y;
  zRange.max = volume.resolution.z;
  xRange.value = addPoint.x;
  yRange.value = addPoint.y;
  zRange.value = addPoint.z;

  addCoordinateListeners(xRange, yRange, zRange, rangeListener);

  var addPointBtn = document.getElementById(options["addPoint"]);
  addPointBtn.addEventListener("click", function() {
    var color = new THREE.Color("skyblue");
    points.geometry.colors[addPointPos].r = color.r;
    points.geometry.colors[addPointPos].g = color.g;
    points.geometry.colors[addPointPos].b = color.b;

    addPointPos++
    addPoint = points.geometry.vertices[addPointPos];
    addPoint.x = parseFloat(xRange.value);
    addPoint.y = parseFloat(yRange.value);
    addPoint.z = parseFloat(zRange.value);
    points.geometry.vertices[addPointPos] = addPoint;
    color = new THREE.Color("red");
    points.geometry.colors[addPointPos].r = color.r;
    points.geometry.colors[addPointPos].g = color.g;
    points.geometry.colors[addPointPos].b = color.b;

    points.geometry.verticesNeedUpdate = true;
    points.geometry.colorsNeedUpdate = true;
  });

  var removePointsBtn = document.getElementById(options["removePoints"]);
  removePointsBtn.addEventListener("click", function() {
    for (var i=0; i < points.geometry.vertices.length; i++) {
      points.geometry.vertices[i] = new THREE.Vector3(-1000,-1000,-1000);
      color = new THREE.Color("red");
      points.geometry.colors[i].r = color.r;
      points.geometry.colors[i].g = color.g;
      points.geometry.colors[i].b = color.b;
      points.geometry.verticesNeedUpdate = true;
      points.geometry.colorsNeedUpdate = true;
      addPointPos = 0;
    }
  });

  var seedBtn = document.getElementById(options["seedBtn"]);
  seedBtn.addEventListener("click", function() {
    vertices = [];
    for (var i=0; i < points.geometry.vertices.length; i++) {
      vertice = points.geometry.vertices[i];
      if (vertice.x == -1000 && vertice.y == -1000 && vertice.z == -1000) {
        continue;
      }
      vertices.push(vertice);
    }
    reseed(vertices);
  });

  return screen;

  function rangeListener() {
    addPoint = points.geometry.vertices[addPointPos];
    addPoint.x = parseFloat(xRange.value);
    addPoint.y = parseFloat(yRange.value);
    addPoint.z = parseFloat(zRange.value);
    points.geometry.vertices[addPointPos] = addPoint;
    points.geometry.verticesNeedUpdate = true;
  }
}

function displayArrows(volume, options) {
  var screen = new AKST.SceneInfo();

  var display = document.getElementById(options["displayName"]);
  screen.init(volume, {
      width: display.offsetWidth,
      height: display.offsetWidth,
      elem: display,
      resizeFunction: AKST.ModifiedClientRect(display,
        () => { return display.offsetWidth; },
        () => { return display.offsetWidth; })
  });

  screen.scene.add(Bounds(volume));

  Arrows(screen.scene, volume, 8);

  return screen;
}

function start(tag) {
  console.log(`${tag} STARTED`)
  var d = new Date();
  return d.getTime();
}

function stop(start, tag) {
  var d = new Date();
  var took = d.getTime() - start;
  console.log(`${tag} DONE: ${took} ms`);
}
