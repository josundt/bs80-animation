import{Calc as d}from"../lib/calc.js";import{FrameAnimation as g}from"../lib/frame-animation.js";class u{constructor(e){this.horizontalLines=[];this.verticalLines=[];this.canvasAnimation=null;this.config={...this.getDefaultOptions(),...e!=null?e:{}},this.createVerticalLines(),this.createHorizontalLines()}get center(){const[e,i]=this.size;return[e/2,i/2]}get lineWidth(){return d.avg(...this.config.size)*.001*this.config.lineScaling}getDefaultOptions(){return{size:[960,540],fieldOfView:512,viewDistance:12,angle:-75,gridSize:12,lineScaling:1}}rotateX(...e){let[i,t]=e;const{angle:n,fieldOfView:r,viewDistance:a}=this.config,s=n*Math.PI/180,h=Math.cos(s),l=Math.sin(s),c=t*h,v=t*l,o=r/(a+v);return i=i*o+this.center[0],t=c*o+this.center[1],[i,t]}createVerticalLines(){const{gridSize:e}=this.config;let i,t;this.verticalLines.splice(0);for(let n=-e;n<=e;n++)i=this.rotateX(n,-e),t=this.rotateX(n,e),this.verticalLines.push([i,t])}createHorizontalLines(e=0){const{gridSize:i}=this.config;let t,n;this.horizontalLines.splice(0);for(let r=-i;r<=i;r++)t=this.rotateX(-i,r+e/100),n=this.rotateX(i,r+e/100),this.horizontalLines.push([t,n])}drawCanvasLine(e,i,t){const[n,r]=i;e.save(),e.lineWidth=this.lineWidth,e.beginPath(),e.moveTo(...n),e.lineTo(...r),e.strokeStyle=t,e.closePath(),e.stroke(),e.restore()}toSvgLine(e,i,t="  "){const[[n,r],[a,s]]=e;return`${t}<line x1="${n}" y1="${r}" x2="${a}" y2="${s}" stroke="${i}"/>`}get size(){return[...this.config.size]}set size(e){this.config.size=e}get angle(){return this.config.angle}set angle(e){this.config.angle=e}get fieldOfView(){return this.config.fieldOfView}set fieldOfView(e){this.config.fieldOfView=e}renderToCanvas(e,i,t){t&&e.clearRect(0,0,...this.size);for(const n of this.verticalLines)this.drawCanvasLine(e,n,i.verStrokeStyle);for(const n of this.horizontalLines)this.drawCanvasLine(e,n,i.horStrokeStyle)}toSvg(e){const[i,t]=this.size;return[`<svg width="${i}" height="${t}" xmlns="http://www.w3.org/2000/svg">`,...this.verticalLines.map(n=>this.toSvgLine(n,e.verStrokeStyle)),...this.horizontalLines.map(n=>this.toSvgLine(n,e.horStrokeStyle)),"</svg>"].join(`
`)}createFrameRenderer(e,i){let t=0,n=0,r=0;return a=>{var v,o;const s=a-n,h=s/1e3*((v=i.rotateDegPerSecond)!=null?v:0);this.angle+=h%360;let l=!0;n=a;const c=s*((o=i.gridRowsPerSecond)!=null?o:3)/10;return this.createVerticalLines(),this.createHorizontalLines(t),this.renderToCanvas(e,i,!i.skipClear),t+c>=100&&r++,r<0&&(l=!1),t=(t+c)%100,l}}startCanvasAnimation(e,i,t){return this.canvasAnimation=new g(this.createFrameRenderer(e,i),t),this.canvasAnimation.start()}stopCanvasAnimation(){var e,i;return(i=(e=this.canvasAnimation)==null?void 0:e.stop())!=null?i:!1}}export{u as PerspectiveGrid};
//# sourceMappingURL=perspective-grid.js.map
