class d{constructor(...e){this.colorStops=e}toRgb(e,t){const[o,r,i,n]=e,a=[o,r,i].join(" "),l=t&&n!==void 0?` / ${n}`:"";return`rgb(${a}${l})`}create(e,t,...o){const[r,i,,n]=o,a=e.createLinearGradient(r,i,0,n);for(const[l,s]of this.colorStops)a.addColorStop(l,this.toRgb(s,t));return a}render(e,t,...o){const r=this.create(e,t,...o);e.save(),e.fillStyle=r,e.fillRect(...o),e.restore()}}export{d as LinearGradient};
//# sourceMappingURL=linear-gradient.js.map
