if (AKST === undefined) {
var AKST = {
}
}

AKST.ModifiedClientRect = function(elem, width, height) {
  return function() {
    var orgRect = elem.getBoundingClientRect();
    return {
      width: width(),
      height: height(),
      left: width() >= 0 ? orgRect.x : orgRect.x + width(),
      top: height() >= 0 ? orgRect.y : orgRect.y + height(),
      right: width() >= 0 ? orgRect.x + width() : orgRect.x,
      bottom: height() >= 0 ?  orgRect.y + height() : orgRect.y
    }
  };
}

AKST.MultiSceneCanvas = function() {
  this.canvas = document.createElement('canvas');
  this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true});
  this.renderer.setScissorTest(true);
  this.renderer.setClearColor(new THREE.Color(.828125,.86328125,.89453125));
  this.sceneInfos = [];
}

AKST.MultiSceneCanvas.prototype = {
  constructor: AKST.MultiSceneCanvas,

  addScene: function(sceneInfo) {
    const ctx = document.createElement('canvas').getContext('2d');
    sceneInfo.elem.appendChild(ctx.canvas);
    sceneInfo.setContext(ctx);
    sceneInfo.setRenderer(this.renderer);
    this.sceneInfos.push(sceneInfo);
  },

  draw: function() {
    for (const sceneInfo of this.sceneInfos) {
      // get the viewport relative position opf this element
      const {left, right, top, bottom, width, height} = sceneInfo.resizeFunction();
      const rendererCanvas = this.renderer.domElement;
      const ctx = sceneInfo.getContext();

      const isOffscreen =
          bottom < 0 ||
          top > window.innerHeight ||
          right < 0 ||
          left > window.innerWidth;

      if (!isOffscreen) {
        // make sure the renderer's canvas is big enough
        if (rendererCanvas.width < width || rendererCanvas.height < height) {
          this.renderer.setSize(width, height, false);
        }

        // make sure the canvas for this area is the same size as the area
        if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
          ctx.canvas.width = width;
          ctx.canvas.height = height;
        }

        this.renderer.setScissor(0, 0, width, height);
        this.renderer.setViewport(0, 0, width, height);

        sceneInfo.resize([width, height]);
        sceneInfo.draw();

        // copy the rendered scene to this element's canvas
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(
            rendererCanvas,
            0, rendererCanvas.height - height, width, height,  // src rect
            0, 0, width, height);                              // dst rect
      }
    }
  },

  loop: function() {
      requestAnimationFrame(this.loop.bind(this));
      this.draw()
  }
}

AKST.SceneInfo = function() {
  this.width = 0;
  this.height = 0;
  this.scene = undefined;
  this.camera = undefined;
  this.light = undefined;
  this.renderer = undefined;
  this.trackball = undefined;
  this.resizeFunction = undefined;
  this.elem = undefined;
  this.ctx = undefined;
}

AKST.SceneInfo.prototype = {
  constructor: AKST.SceneInfo,

  setContext: function(ctx) {
    this.ctx = ctx;
  },

  getContext: function() {
    return this.ctx;
  },

  setRenderer: function(ctx) {
    this.renderer = ctx;
  },

  init: function(target, options) {
    if (options === undefined) {
        options = {};
    }
    if (options.resizeFunction === undefined) {
      options.resizeFunction = function() {
        return this.elem.getBoundingClientRect();
      }
    }

    this.width = options.width;
    this.height = options.height;

    var d = target.objectCenter();
    if (options.camera === undefined) {
      var f = target.max_coord.clone().sub(target.min_coord).max();

      var fov = 45;
      var aspect = this.width / this.height;
      var near = 0.1;
      var far = 100 * f;
      options.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      options.camera.position.set(d.x, d.y, 2*f);
      options.camera.up.set(0, 1, 0);
    }

    this.elem = options.elem;
    this.resizeFunction = options.resizeFunction;

    this.scene = new THREE.Scene();
    this.camera = options.camera;
    this.scene.add(this.camera);

    this.light = new THREE.DirectionalLight(new THREE.Color( "white" ));
    this.light.position = this.camera.position;
    this.scene.add(this.light);

    this.trackball = new THREE.TrackballControls(this.camera, this.elem);
    this.trackball.staticMoving = true;
    this.trackball.rotateSpeed = 3;
    this.trackball.radius = Math.min( this.width, this.height );
    this.trackball.target = d;
    this.trackball.noRotate = false;
    this.trackball.update();
    this.trackball.addEventListener( 'change', this.draw );

    //this.renderer = new THREE.WebGLRenderer();
    //this.renderer.setSize( this.width, this.height );
    //this.renderer.setClearColor( new THREE.Color( "black" ) );
  },

  draw: function() {
    if ( this.renderer == undefined ) return;
    this.light.position.copy(this.camera.position);
    this.trackball.handleResize();
    this.renderer.render(this.scene, this.camera);
    this.trackball.update();
  },

  resize: function(size) {
      if (size[0] == this.width && size[1] == this.height) {
        return;
      }
      this.width = size[0];
      this.height = size[1];
      a = this.width / this.height;
      this.camera.aspect = a;
      this.camera.updateProjectionMatrix();
  }
}
