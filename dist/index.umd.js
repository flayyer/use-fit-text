!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("react")):"function"==typeof define&&define.amd?define(["react"],t):e.useFitText=t(e.react)}(this,function(e){return function(t){void 0===t&&(t={});var n=t.maxFontSize;void 0===n&&(n=100);var i=t.minFontSize;void 0===i&&(i=20);var o=t.recalcOnResize;void 0===o&&(o=!1);var r=t.resolution;void 0===r&&(r=5);var f=e.useCallback(function(){return{fontSize:n,fontSizePrev:i,fontSizeMax:n,fontSizeMin:i}},[n,i]),u=e.useRef(null),a=e.useState(f()),c=a[0],d=a[1],s=c.fontSize,z=c.fontSizeMax,v=c.fontSizeMin,S=c.fontSizePrev;return e.useEffect(function(){if(o){var e,t=function(){window.clearTimeout(e),e=window.setTimeout(function(){d(f())},100)};return window.addEventListener("resize",t),function(){window.clearTimeout(e),window.removeEventListener("resize",t)}}},[f,o]),e.useEffect(function(){var e=Math.abs(s-S)<=r,t=!!u.current&&(u.current.scrollHeight>u.current.offsetHeight||u.current.scrollWidth>u.current.offsetWidth),n=s>S;if(e)t&&d({fontSize:S<s?S:s-(S-s),fontSizeMax:z,fontSizeMin:v,fontSizePrev:S});else{var i,o=z,f=v;t?(i=n?S-s:v-s,o=Math.min(z,s)):(i=n?z-s:S-s,f=Math.max(v,s)),d({fontSize:s+i/2,fontSizeMax:o,fontSizeMin:f,fontSizePrev:s})}},[s,z,v,S,u,r]),{fontSize:s+"%",ref:u}}});
//# sourceMappingURL=index.umd.js.map