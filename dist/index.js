(() => {
  // src/lib/linear-gradient.ts
  var LinearGradient = class {
    constructor(...colorStops) {
      this.colorStops = colorStops;
    }
    toRgb(color, includeAlpha) {
      const [r, g, b, a] = color;
      const rgb = [r, g, b].join(" ");
      const aTail = includeAlpha && a !== void 0 ? ` / ${a}` : "";
      return `rgb(${rgb}${aTail})`;
    }
    create(ctx, includeAlpha, ...rect) {
      const [x, y, , h] = rect;
      const linGrad = ctx.createLinearGradient(x, y, 0, h);
      for (const [offset, color] of this.colorStops) {
        linGrad.addColorStop(offset, this.toRgb(color, includeAlpha));
      }
      return linGrad;
    }
    render(ctx, includeAlpha, ...rect) {
      const linGrad = this.create(ctx, includeAlpha, ...rect);
      ctx.save();
      ctx.fillStyle = linGrad;
      ctx.fillRect(...rect);
      ctx.restore();
    }
  };

  // src/assets/bg-gradient.ts
  var BgGradient = class extends LinearGradient {
    constructor() {
      super(
        [0, [26, 4, 48, 1]],
        //[0.65, [26, 4, 48, 1]],
        [1, [41, 39, 62, 1]]
      );
    }
  };

  // src/assets/fog-gradient.ts
  var FogGradient = class extends LinearGradient {
    constructor() {
      super(
        [0, [26, 4, 48, 0]],
        [0.3, [0, 0, 0, 0]],
        [0.5, [0, 0, 0, 0.8]],
        [0.6, [0, 0, 0, 0.99]],
        [0.65, [0, 0, 0, 1]],
        [0.68, [0, 0, 0, 0.99]],
        [0.75, [0, 0, 0, 0.8]],
        [1, [41, 39, 62, 0]]
      );
    }
  };

  // src/lib/easing.ts
  var Easing;
  ((Easing2) => {
    Easing2.easeIn = (k, exp = 1.67) => k ** exp;
    Easing2.easeOut = (k, exp = 1.67) => 1 - Math.max(1 - k, 0) ** exp;
    Easing2.easeInOut = (k) => 0.5 * (Math.sin((k - 0.5) * Math.PI) + 1);
  })(Easing || (Easing = {}));

  // src/lib/logger.ts
  var Logger = class {
    constructor(c) {
      this.debug = (...args) => this.console.debug(...args);
      this.info = (...args) => this.console.info(...args);
      this.warn = (...args) => this.console.warn(...args);
      this.error = (...args) => this.console.error(...args);
      this.console = c != null ? c : console;
    }
  };

  // src/assets/logo.ts
  var Logo = class {
    constructor(options, logger = new Logger()) {
      this.logger = logger;
      // private static logoUrl: string = "bare_så_80_logo_nobg.svg";
      this.image = null;
      this.config = { ...options };
    }
    static loadImageAsync(url) {
      return new Promise((res, rej) => {
        const image = new Image();
        image.onload = () => res(image);
        image.onerror = (e, src, lineno, colno, error) => rej(error != null ? error : new Error(`Image failed to load: ${url}`));
        image.src = url;
      });
    }
    get size() {
      return [...this.config.size];
    }
    set size(value) {
      this.config.size = [...value];
    }
    async initAsync() {
      this.image = await Logo.loadImageAsync(this.config.url);
      return this;
    }
    createAnimationFrameRenderer(ctx) {
      let scaleFactor = 0;
      let hasLogged = false;
      const imageScale = 0.8;
      return (time) => {
        if (scaleFactor < 1) {
          const newScaleFactor = Math.min(Easing.easeInOut(time * 6e-5), 1);
          scaleFactor = newScaleFactor > scaleFactor ? newScaleFactor : 1;
        } else if (!hasLogged) {
          this.logger.debug("Logo animation done", time, scaleFactor);
          hasLogged = true;
        }
        const [w, h] = this.size;
        const currWH = Math.min(w, h) * scaleFactor * imageScale;
        const size = [currWH, currWH];
        const offset = [(w - currWH) / 2, (h - currWH) / (1.52 + 0.68 * scaleFactor)];
        const dimensions = [...offset, ...size];
        ctx.drawImage(this.image, ...dimensions);
        return true;
      };
    }
  };

  // src/lib/frame-animation.ts
  var FrameAnimation = class {
    constructor(cbRenderFrame, cbStopped) {
      this.cbRenderFrame = cbRenderFrame;
      this.cbStopped = cbStopped;
      this.started = false;
      this.currAnimationFrame = null;
    }
    start() {
      const result = !this.started;
      const render = (time) => {
        var _a;
        if (this.started) {
          this.started = this.cbRenderFrame(time);
        }
        if (!this.started) {
          (_a = this.cbStopped) == null ? void 0 : _a.call(this);
        } else {
          this.currAnimationFrame = requestAnimationFrame(render);
        }
      };
      this.started = true;
      this.currAnimationFrame = requestAnimationFrame(render);
      return result;
    }
    stop() {
      var _a;
      const result = this.started;
      this.started = false;
      if (this.currAnimationFrame) {
        cancelAnimationFrame(this.currAnimationFrame);
      }
      if (result) {
        (_a = this.cbStopped) == null ? void 0 : _a.call(this);
      }
      return result;
    }
  };

  // src/assets/perspective-grid.ts
  var PerspectiveGrid = class {
    constructor(options) {
      this.horizontalLines = [];
      this.verticalLines = [];
      this.canvasAnimation = null;
      this.config = {
        ...this.getDefaultOptions(),
        ...options != null ? options : {}
      };
      this.createVerticalLines();
      this.createHorizontalLines();
    }
    get center() {
      const [w, h] = this.size;
      return [w / 2, h / 2];
    }
    getDefaultOptions() {
      return {
        size: [960, 540],
        fieldOfView: 512,
        viewDistance: 12,
        angle: -75,
        gridSize: 12,
        lineWidth: 2
      };
    }
    rotateX(...point) {
      let [x, y] = point;
      const { angle, fieldOfView, viewDistance } = this.config;
      const rd = angle * Math.PI / 180;
      const ca = Math.cos(rd);
      const sa = Math.sin(rd);
      const ry = y * ca;
      const rz = y * sa;
      const f = fieldOfView / (viewDistance + rz);
      x = x * f + this.center[0];
      y = ry * f + this.center[1];
      return [x, y];
    }
    createVerticalLines() {
      const { gridSize } = this.config;
      let p1;
      let p2;
      this.verticalLines.splice(0);
      for (let i = -gridSize; i <= gridSize; i++) {
        p1 = this.rotateX(i, -gridSize);
        p2 = this.rotateX(i, gridSize);
        this.verticalLines.push([p1, p2]);
      }
    }
    createHorizontalLines(movePercent = 0) {
      const { gridSize } = this.config;
      let p1;
      let p2;
      this.horizontalLines.splice(0);
      for (let i = -gridSize; i <= gridSize; i++) {
        p1 = this.rotateX(-gridSize, i + movePercent / 100);
        p2 = this.rotateX(gridSize, i + movePercent / 100);
        this.horizontalLines.push([p1, p2]);
      }
    }
    drawCanvasLine(ctx, line, strokeStyle) {
      const [p1, p2] = line;
      ctx.save();
      ctx.lineWidth = this.lineWidth;
      ctx.beginPath();
      ctx.moveTo(...p1);
      ctx.lineTo(...p2);
      ctx.strokeStyle = strokeStyle;
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    toSvgLine(l, strokeStyle, indent = "  ") {
      const [[x1, y1], [x2, y2]] = l;
      return `${indent}<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeStyle}"/>`;
    }
    get size() {
      return [...this.config.size];
    }
    set size(value) {
      this.config.size = value;
    }
    get angle() {
      return this.config.angle;
    }
    set angle(value) {
      this.config.angle = value;
    }
    get lineWidth() {
      return this.config.lineWidth;
    }
    set lineWidth(value) {
      this.config.lineWidth = value;
    }
    get fieldOfView() {
      return this.config.fieldOfView;
    }
    set fieldOfView(value) {
      this.config.fieldOfView = value;
    }
    renderToCanvas(ctx, options, clear) {
      if (clear) {
        ctx.clearRect(0, 0, ...this.size);
      }
      for (const l of this.verticalLines) {
        this.drawCanvasLine(ctx, l, options.verStrokeStyle);
      }
      for (const l of this.horizontalLines) {
        this.drawCanvasLine(ctx, l, options.horStrokeStyle);
      }
    }
    toSvg(options) {
      const [w, h] = this.size;
      return [
        `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`,
        ...this.verticalLines.map((l) => this.toSvgLine(l, options.verStrokeStyle)),
        ...this.horizontalLines.map((l) => this.toSvgLine(l, options.horStrokeStyle)),
        "</svg>"
      ].join("\n");
    }
    createAnimationFrameRenderer(ctx, options) {
      let rowMovePercent = 0;
      let lastTime = 0;
      let rowCounter = 0;
      return (time) => {
        var _a, _b;
        const timeDelta = time - lastTime;
        const rotateDegDelta = timeDelta / 1e3 * ((_a = options.rotateDegPerSecond) != null ? _a : 0);
        this.angle += rotateDegDelta % 360;
        let hasMoreFrames = true;
        lastTime = time;
        const movePercentDelta = timeDelta * ((_b = options.gridRowsPerSecond) != null ? _b : 3) / 10;
        this.createVerticalLines();
        this.createHorizontalLines(rowMovePercent);
        this.renderToCanvas(ctx, options, !options.skipClear);
        if (rowMovePercent + movePercentDelta >= 100) {
          rowCounter++;
        }
        if (rowCounter < 0) {
          hasMoreFrames = false;
        }
        rowMovePercent = (rowMovePercent + movePercentDelta) % 100;
        return hasMoreFrames;
      };
    }
    startCanvasAnimation(ctx, options, onStopped) {
      this.canvasAnimation = new FrameAnimation(this.createAnimationFrameRenderer(
        ctx,
        options
      ), onStopped);
      return this.canvasAnimation.start();
    }
    stopCanvasAnimation() {
      var _a, _b;
      return (_b = (_a = this.canvasAnimation) == null ? void 0 : _a.stop()) != null ? _b : false;
    }
  };

  // src/assets/star-field.ts
  var StarField = class {
    constructor(options) {
      this.config = {
        patternSize: [500, 500],
        ...options
      };
      this.origSize = [...options.size];
      this.stars = StarField.createStars(this.config);
    }
    get scaling() {
      return [this.size[0] / this.origSize[0], this.size[1] / this.origSize[1]];
    }
    get size() {
      return this.config.size;
    }
    set size(value) {
      this.config.size = [...value];
      if (this.animationState) {
        this.animationState.pattern = this.createPattern(this.animationState.ctx);
      }
    }
    static createStars(options) {
      const result = [];
      const [w, h] = options.patternSize;
      for (let i = 0; i < options.starCount; ++i) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = Math.random() * options.maxStarSize;
        result.push([x, y, radius]);
      }
      return result;
    }
    static renderStars(stars, ctx, color) {
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(...s, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
    createPattern(ctx) {
      const [horScale, verScale] = this.scaling;
      const patternSize = [500 * horScale, 500 * verScale];
      const canvas = document.createElement("canvas");
      [canvas.width, canvas.height] = patternSize;
      const patternCtx = canvas.getContext("2d");
      patternCtx.scale(...this.scaling);
      StarField.renderStars(this.stars, patternCtx, this.config.color);
      return ctx.createPattern(canvas, "repeat");
    }
    createAnimationFrameRenderer(ctx, options) {
      var _a;
      const radPerSecond = options.rotateDegPerSecond * (Math.PI / 180);
      this.animationState = {
        ctx,
        pattern: this.createPattern(ctx)
      };
      const [horCenterFactor, verCenterFactor] = (_a = options.rotateCenterFactors) != null ? _a : [0.5, 0.65];
      return (time) => {
        const rotatation = time / 1e3 * radPerSecond % (Math.PI * 2);
        const [w, h] = this.size;
        ctx.save();
        ctx.translate(w * horCenterFactor, h * verCenterFactor);
        ctx.rotate(rotatation);
        ctx.beginPath();
        const radius = Math.sqrt((w / 2) ** 2 + h ** 2);
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.animationState.pattern;
        ctx.fill();
        ctx.strokeStyle = "#FFF";
        ctx.stroke();
        ctx.restore();
        return true;
      };
    }
  };

  // src/lib/timing.ts
  var Timing;
  ((Timing2) => {
    function delayAsync(ms, abortSignal) {
      let timer = null;
      const onAbort = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        abortSignal == null ? void 0 : abortSignal.removeEventListener("abort", onAbort);
      };
      return new Promise((r) => {
        timer = setTimeout(r, ms);
        abortSignal == null ? void 0 : abortSignal.addEventListener("abort", onAbort);
      });
    }
    Timing2.delayAsync = delayAsync;
    let debounceCallback;
    let lastAbortController;
    function debounce(fn, ms) {
      debounceCallback = fn;
      if (lastAbortController) {
        lastAbortController.abort("debounced");
      }
      lastAbortController = new AbortController();
      delayAsync(ms, lastAbortController.signal).then(debounceCallback);
    }
    Timing2.debounce = debounce;
  })(Timing || (Timing = {}));

  // src/index.ts
  var Bs80Animation = class {
    constructor(containerOrSelector) {
      let container;
      if (containerOrSelector) {
        container = typeof containerOrSelector === "string" ? document.querySelector(containerOrSelector) : containerOrSelector;
      } else {
        container = document.body;
      }
      if (!container) {
        throw new Error("Invali container argument");
      }
      this.container = container;
    }
    appendCanvas(width, height) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      this.container.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      return ctx;
    }
    getContainerSize() {
      return [window.innerWidth, window.innerHeight];
    }
    async start() {
      let [w, h] = this.getContainerSize();
      const ctx = this.appendCanvas(w, h);
      const bgGradient = new BgGradient();
      const fogGradient = new FogGradient();
      const starField = new StarField({
        size: [w, h],
        patternSize: [800, 800],
        starCount: 360,
        maxStarSize: (w / 2 + h / 2) / 900,
        color: "rgb(255 255 255 / .6)"
      });
      const renderStarFieldFrame = starField.createAnimationFrameRenderer(ctx, {
        rotateDegPerSecond: -3,
        rotateCenterFactors: [0.5, 0.65]
      });
      const pGrid = new PerspectiveGrid({
        // size: [960, 540]
        size: [w, h],
        viewDistance: 23,
        gridSize: 20,
        angle: 285,
        fieldOfView: h / 2,
        lineWidth: h / 400
      });
      const renderGridFrame = pGrid.createAnimationFrameRenderer(ctx, {
        horStrokeStyle: "rgb(97 161 172 / .42)",
        verStrokeStyle: "rgb(255 255 255 / .15)",
        gridRowsPerSecond: 3,
        rotateDegPerSecond: 0,
        skipClear: true
      });
      const logo = await new Logo({
        url: "./images/bare_saa_80_logo_nobg.svg",
        size: [w, h]
      }).initAsync();
      const renderLogoFrame = logo.createAnimationFrameRenderer(ctx);
      window.addEventListener("resize", () => {
        Timing.debounce(() => {
          const size = this.getContainerSize();
          [w, h] = pGrid.size = logo.size = starField.size = [ctx.canvas.width, ctx.canvas.height] = size;
          pGrid.fieldOfView = h / 2;
          pGrid.lineWidth = h / 400;
        }, 250);
      });
      const logoAnimationStartTime = 3e3;
      const animation = new FrameAnimation((time) => {
        let hasMoreFrames = true;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        bgGradient.render(ctx, false, 0, 0, w, h);
        hasMoreFrames = renderStarFieldFrame(time);
        ctx.save();
        ctx.translate(0, h / 4.25);
        hasMoreFrames = renderGridFrame(time);
        ctx.restore();
        ctx.save();
        ctx.rotate(Math.PI);
        ctx.translate(-w, h * -1.06);
        hasMoreFrames = renderGridFrame(time);
        ctx.restore();
        fogGradient.render(ctx, true, 0, 0, w, h);
        if (time > logoAnimationStartTime) {
          renderLogoFrame(time - logoAnimationStartTime);
        }
        return hasMoreFrames;
      });
      animation.start();
    }
  };
  new Bs80Animation().start();
})();
//# sourceMappingURL=index.js.map
