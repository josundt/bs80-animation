import{Logger as s}from"./logger.js";var u;(i=>{const d=new s;function c(r,e){let n=null;const l=()=>{n&&(clearTimeout(n),n=null),e==null||e.removeEventListener("abort",l),d.debug("Delay aborted")};return new Promise(m=>{n=setTimeout(m,r),e==null||e.addEventListener("abort",l)})}i.delayAsync=c;let t,o;function b(r,e){t=r,o&&o.abort("debounced"),o=new AbortController,c(e,o.signal).then(t)}i.debounce=b})(u||(u={}));export{u as Timing};
//# sourceMappingURL=timing.js.map
