import{m as u}from"./scheduler.55fc80cd.js";function y(o){const t=o-1;return t*t*t+1}function $(o,{delay:t=0,duration:n=400,easing:s=u}={}){const c=+getComputedStyle(o).opacity;return{delay:t,duration:n,easing:s,css:r=>`opacity: ${r*c}`}}function g(o,{delay:t=0,duration:n=400,easing:s=y,start:c=0,opacity:r=0}={}){const e=getComputedStyle(o),a=+e.opacity,f=e.transform==="none"?"":e.transform,m=1-c,p=a*(1-r);return{delay:t,duration:n,easing:s,css:(d,i)=>`
			transform: ${f} scale(${1-m*i});
			opacity: ${a-p*i}
		`}}export{$ as f,g as s};
