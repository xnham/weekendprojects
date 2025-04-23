import{s as ze,v as ot,n as yt,b as je,w as se,x as oe,y as Tn}from"./scheduler.77de885a.js";import{S as Ye,i as We,J as _n,H as Mn,K as Ln,j as Dn,E as Rn,f as Et,L as zn,a as Ue,e as le,d as rt,p as jn,t as Ot,b as Yn,M as Wn,r as Un,u as Hn,v as Gn,w as Xn}from"./index.aa830225.js";function Bn(t,e){const n={},a={},r={$$scope:1};let i=t.length;for(;i--;){const s=t[i],o=e[i];if(o){for(const f in s)f in o||(a[f]=1);for(const f in o)r[f]||(n[f]=o[f],r[f]=1);t[i]=o}else for(const f in s)r[f]=1}for(const s in a)s in n||(n[s]=void 0);return n}function Vn(t){return typeof t=="object"&&t!==null?t:{}}function Kn(t){const{beat:e,fade:n,beatFade:a,bounce:r,shake:i,flash:s,spin:o,spinPulse:f,spinReverse:c,pulse:m,fixedWidth:h,inverse:g,border:x,listItem:p,flip:A,size:y,rotation:k,pull:v}=t,P={"fa-beat":e,"fa-fade":n,"fa-beat-fade":a,"fa-bounce":r,"fa-shake":i,"fa-flash":s,"fa-spin":o,"fa-spin-reverse":c,"fa-spin-pulse":f,"fa-pulse":m,"fa-fw":h,"fa-inverse":g,"fa-border":x,"fa-li":p,"fa-flip":A===!0,"fa-flip-horizontal":A==="horizontal"||A==="both","fa-flip-vertical":A==="vertical"||A==="both",[`fa-${y}`]:typeof y<"u"&&y!==null,[`fa-rotate-${k}`]:typeof k<"u"&&k!==null&&k!==0,[`fa-pull-${v}`]:typeof v<"u"&&v!==null,"fa-swap-opacity":t.swapOpacity};return Object.keys(P).map(E=>P[E]?E:null).filter(E=>E)}function qn(t){return t=t-0,t===t}function Jn(t){return qn(t)?t:(t=t.replace(/[\-_\s]+(.)?/g,function(e,n){return n?n.toUpperCase():""}),t.substr(0,1).toLowerCase()+t.substr(1))}function Qn(t){return typeof t=="string"?t:Object.keys(t).reduce((e,n)=>e+n.split(/(?=[A-Z])/).join("-").toLowerCase()+":"+t[n]+";","")}function He(t,e,n={}){if(typeof e=="string")return e;const a=(e.children||[]).map(i=>He(t,i)),r=Object.keys(e.attributes||{}).reduce((i,s)=>{const o=e.attributes[s];return s==="style"?i.attrs.style=Qn(o):s.indexOf("aria-")===0||s.indexOf("data-")===0?i.attrs[s.toLowerCase()]=o:i.attrs[Jn(s)]=o,i},{attrs:{}});return t(e.tag,{...r.attrs},a)}/*!
 * Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2024 Fonticons, Inc.
 */function Zn(t,e,n){return(e=ta(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function fe(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter(function(r){return Object.getOwnPropertyDescriptor(t,r).enumerable})),n.push.apply(n,a)}return n}function l(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?fe(Object(n),!0).forEach(function(a){Zn(t,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):fe(Object(n)).forEach(function(a){Object.defineProperty(t,a,Object.getOwnPropertyDescriptor(n,a))})}return t}function $n(t,e){if(typeof t!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var a=n.call(t,e||"default");if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}function ta(t){var e=$n(t,"string");return typeof e=="symbol"?e:e+""}const ce=()=>{};let Gt={},Ge={},Xe=null,Be={mark:ce,measure:ce};try{typeof window<"u"&&(Gt=window),typeof document<"u"&&(Ge=document),typeof MutationObserver<"u"&&(Xe=MutationObserver),typeof performance<"u"&&(Be=performance)}catch{}const{userAgent:ue=""}=Gt.navigator||{},M=Gt,b=Ge,de=Xe,nt=Be;M.document;const T=!!b.documentElement&&!!b.head&&typeof b.addEventListener=="function"&&typeof b.createElement=="function",Ve=~ue.indexOf("MSIE")||~ue.indexOf("Trident/");var ea=/fa(s|r|l|t|d|dr|dl|dt|b|k|kd|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/,na=/Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit)?.*/i,Ke={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"}},aa={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},qe=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone"],S="classic",ct="duotone",ra="sharp",ia="sharp-duotone",Je=[S,ct,ra,ia],sa={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"}},oa={"Font Awesome 6 Free":{900:"fas",400:"far"},"Font Awesome 6 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 6 Brands":{400:"fab",normal:"fab"},"Font Awesome 6 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 6 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 6 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"}},la=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}]]),fa={classic:{solid:"fas",regular:"far",light:"fal",thin:"fat",brands:"fab"},duotone:{solid:"fad",regular:"fadr",light:"fadl",thin:"fadt"},sharp:{solid:"fass",regular:"fasr",light:"fasl",thin:"fast"},"sharp-duotone":{solid:"fasds",regular:"fasdr",light:"fasdl",thin:"fasdt"}},ca=["fak","fa-kit","fakd","fa-kit-duotone"],me={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},ua=["kit"],da={kit:{"fa-kit":"fak"},"kit-duotone":{"fa-kit-duotone":"fakd"}},ma=["fak","fakd"],ga={kit:{fak:"fa-kit"},"kit-duotone":{fakd:"fa-kit-duotone"}},ge={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},at={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},ha=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone"],pa=["fak","fa-kit","fakd","fa-kit-duotone"],ba={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},ya={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"}},va={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"]},It={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"}},xa=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands"],Ct=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt",...ha,...xa],Aa=["solid","regular","light","thin","duotone","brands"],Qe=[1,2,3,4,5,6,7,8,9,10],ka=Qe.concat([11,12,13,14,15,16,17,18,19,20]),Pa=[...Object.keys(va),...Aa,"2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","fw","inverse","layers-counter","layers-text","layers","li","pull-left","pull-right","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul",at.GROUP,at.SWAP_OPACITY,at.PRIMARY,at.SECONDARY].concat(Qe.map(t=>"".concat(t,"x"))).concat(ka.map(t=>"w-".concat(t))),Sa={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}};const N="___FONT_AWESOME___",wt=16,Ze="fa",$e="svg-inline--fa",z="data-fa-i2svg",Nt="data-fa-pseudo-element",Ea="data-fa-pseudo-element-pending",Xt="data-prefix",Bt="data-icon",he="fontawesome-i2svg",Oa="async",Ia=["HTML","HEAD","STYLE","SCRIPT"],tn=(()=>{try{return!0}catch{return!1}})();function Q(t){return new Proxy(t,{get(e,n){return n in e?e[n]:e[S]}})}const en=l({},Ke);en[S]=l(l(l(l({},{"fa-duotone":"duotone"}),Ke[S]),me.kit),me["kit-duotone"]);const Ca=Q(en),Ft=l({},fa);Ft[S]=l(l(l(l({},{duotone:"fad"}),Ft[S]),ge.kit),ge["kit-duotone"]);const pe=Q(Ft),Tt=l({},It);Tt[S]=l(l({},Tt[S]),ga.kit);const Vt=Q(Tt),_t=l({},ya);_t[S]=l(l({},_t[S]),da.kit);Q(_t);const wa=ea,nn="fa-layers-text",Na=na,Fa=l({},sa);Q(Fa);const Ta=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],vt=aa,_a=[...ua,...Pa],V=M.FontAwesomeConfig||{};function Ma(t){var e=b.querySelector("script["+t+"]");if(e)return e.getAttribute(t)}function La(t){return t===""?!0:t==="false"?!1:t==="true"?!0:t}b&&typeof b.querySelector=="function"&&[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]].forEach(e=>{let[n,a]=e;const r=La(Ma(n));r!=null&&(V[a]=r)});const an={styleDefault:"solid",familyDefault:S,cssPrefix:Ze,replacementClass:$e,autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};V.familyPrefix&&(V.cssPrefix=V.familyPrefix);const H=l(l({},an),V);H.autoReplaceSvg||(H.observeMutations=!1);const d={};Object.keys(an).forEach(t=>{Object.defineProperty(d,t,{enumerable:!0,set:function(e){H[t]=e,K.forEach(n=>n(d))},get:function(){return H[t]}})});Object.defineProperty(d,"familyPrefix",{enumerable:!0,set:function(t){H.cssPrefix=t,K.forEach(e=>e(d))},get:function(){return H.cssPrefix}});M.FontAwesomeConfig=d;const K=[];function Da(t){return K.push(t),()=>{K.splice(K.indexOf(t),1)}}const _=wt,I={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Ra(t){if(!t||!T)return;const e=b.createElement("style");e.setAttribute("type","text/css"),e.innerHTML=t;const n=b.head.childNodes;let a=null;for(let r=n.length-1;r>-1;r--){const i=n[r],s=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(s)>-1&&(a=i)}return b.head.insertBefore(e,a),t}const za="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function q(){let t=12,e="";for(;t-- >0;)e+=za[Math.random()*62|0];return e}function G(t){const e=[];for(let n=(t||[]).length>>>0;n--;)e[n]=t[n];return e}function Kt(t){return t.classList?G(t.classList):(t.getAttribute("class")||"").split(" ").filter(e=>e)}function rn(t){return"".concat(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ja(t){return Object.keys(t||{}).reduce((e,n)=>e+"".concat(n,'="').concat(rn(t[n]),'" '),"").trim()}function ut(t){return Object.keys(t||{}).reduce((e,n)=>e+"".concat(n,": ").concat(t[n].trim(),";"),"")}function qt(t){return t.size!==I.size||t.x!==I.x||t.y!==I.y||t.rotate!==I.rotate||t.flipX||t.flipY}function Ya(t){let{transform:e,containerWidth:n,iconWidth:a}=t;const r={transform:"translate(".concat(n/2," 256)")},i="translate(".concat(e.x*32,", ").concat(e.y*32,") "),s="scale(".concat(e.size/16*(e.flipX?-1:1),", ").concat(e.size/16*(e.flipY?-1:1),") "),o="rotate(".concat(e.rotate," 0 0)"),f={transform:"".concat(i," ").concat(s," ").concat(o)},c={transform:"translate(".concat(a/2*-1," -256)")};return{outer:r,inner:f,path:c}}function Wa(t){let{transform:e,width:n=wt,height:a=wt,startCentered:r=!1}=t,i="";return r&&Ve?i+="translate(".concat(e.x/_-n/2,"em, ").concat(e.y/_-a/2,"em) "):r?i+="translate(calc(-50% + ".concat(e.x/_,"em), calc(-50% + ").concat(e.y/_,"em)) "):i+="translate(".concat(e.x/_,"em, ").concat(e.y/_,"em) "),i+="scale(".concat(e.size/_*(e.flipX?-1:1),", ").concat(e.size/_*(e.flipY?-1:1),") "),i+="rotate(".concat(e.rotate,"deg) "),i}var Ua=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 6 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 6 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";
  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 6 Duotone";
  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 6 Duotone";
  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 6 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 6 Sharp Duotone";
  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 6 Sharp Duotone";
  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 6 Sharp Duotone";
  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 6 Sharp Duotone";
}

svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
  overflow: visible;
  box-sizing: content-box;
}

.svg-inline--fa {
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285705em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left {
  margin-right: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-pull-right {
  margin-left: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  top: 0.25em;
}
.svg-inline--fa.fa-fw {
  width: var(--fa-fw-width, 1.25em);
}

.fa-layers svg.svg-inline--fa {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}
.fa-layers svg.svg-inline--fa {
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: 0.625em;
  line-height: 0.1em;
  vertical-align: 0.225em;
}

.fa-xs {
  font-size: 0.75em;
  line-height: 0.0833333337em;
  vertical-align: 0.125em;
}

.fa-sm {
  font-size: 0.875em;
  line-height: 0.0714285718em;
  vertical-align: 0.0535714295em;
}

.fa-lg {
  font-size: 1.25em;
  line-height: 0.05em;
  vertical-align: -0.075em;
}

.fa-xl {
  font-size: 1.5em;
  line-height: 0.0416666682em;
  vertical-align: -0.125em;
}

.fa-2xl {
  font-size: 2em;
  line-height: 0.03125em;
  vertical-align: -0.1875em;
}

.fa-fw {
  text-align: center;
  width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-left: var(--fa-li-margin, 2.5em);
  padding-left: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  left: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.08em);
  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);
}

.fa-pull-left {
  float: left;
  margin-right: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right {
  float: right;
  margin-left: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
.fa-bounce,
.fa-fade,
.fa-beat-fade,
.fa-flip,
.fa-pulse,
.fa-shake,
.fa-spin,
.fa-spin-pulse {
    animation-delay: -1ms;
    animation-duration: 1ms;
    animation-iteration-count: 1;
    transition-delay: 0s;
    transition-duration: 0s;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.fa-stack {
  display: inline-block;
  vertical-align: middle;
  height: 2em;
  position: relative;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.sr-only,
.fa-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:not(:focus),
.fa-sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}`;function sn(){const t=Ze,e=$e,n=d.cssPrefix,a=d.replacementClass;let r=Ua;if(n!==t||a!==e){const i=new RegExp("\\.".concat(t,"\\-"),"g"),s=new RegExp("\\--".concat(t,"\\-"),"g"),o=new RegExp("\\.".concat(e),"g");r=r.replace(i,".".concat(n,"-")).replace(s,"--".concat(n,"-")).replace(o,".".concat(a))}return r}let be=!1;function xt(){d.autoAddCss&&!be&&(Ra(sn()),be=!0)}var Ha={mixout(){return{dom:{css:sn,insertCss:xt}}},hooks(){return{beforeDOMElementCreation(){xt()},beforeI2svg(){xt()}}}};const F=M||{};F[N]||(F[N]={});F[N].styles||(F[N].styles={});F[N].hooks||(F[N].hooks={});F[N].shims||(F[N].shims=[]);var C=F[N];const on=[],ln=function(){b.removeEventListener("DOMContentLoaded",ln),lt=1,on.map(t=>t())};let lt=!1;T&&(lt=(b.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(b.readyState),lt||b.addEventListener("DOMContentLoaded",ln));function Ga(t){T&&(lt?setTimeout(t,0):on.push(t))}function Z(t){const{tag:e,attributes:n={},children:a=[]}=t;return typeof t=="string"?rn(t):"<".concat(e," ").concat(ja(n),">").concat(a.map(Z).join(""),"</").concat(e,">")}function ye(t,e,n){if(t&&t[e]&&t[e][n])return{prefix:e,iconName:n,icon:t[e][n]}}var Xa=function(e,n){return function(a,r,i,s){return e.call(n,a,r,i,s)}},At=function(e,n,a,r){var i=Object.keys(e),s=i.length,o=r!==void 0?Xa(n,r):n,f,c,m;for(a===void 0?(f=1,m=e[i[0]]):(f=0,m=a);f<s;f++)c=i[f],m=o(m,e[c],c,e);return m};function Ba(t){const e=[];let n=0;const a=t.length;for(;n<a;){const r=t.charCodeAt(n++);if(r>=55296&&r<=56319&&n<a){const i=t.charCodeAt(n++);(i&64512)==56320?e.push(((r&1023)<<10)+(i&1023)+65536):(e.push(r),n--)}else e.push(r)}return e}function Mt(t){const e=Ba(t);return e.length===1?e[0].toString(16):null}function Va(t,e){const n=t.length;let a=t.charCodeAt(e),r;return a>=55296&&a<=56319&&n>e+1&&(r=t.charCodeAt(e+1),r>=56320&&r<=57343)?(a-55296)*1024+r-56320+65536:a}function ve(t){return Object.keys(t).reduce((e,n)=>{const a=t[n];return!!a.icon?e[a.iconName]=a.icon:e[n]=a,e},{})}function Lt(t,e){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const{skipHooks:a=!1}=n,r=ve(e);typeof C.hooks.addPack=="function"&&!a?C.hooks.addPack(t,ve(e)):C.styles[t]=l(l({},C.styles[t]||{}),r),t==="fas"&&Lt("fa",e)}const{styles:J,shims:Ka}=C,fn=Object.keys(Vt),qa=fn.reduce((t,e)=>(t[e]=Object.keys(Vt[e]),t),{});let Jt=null,cn={},un={},dn={},mn={},gn={};function Ja(t){return~_a.indexOf(t)}function Qa(t,e){const n=e.split("-"),a=n[0],r=n.slice(1).join("-");return a===t&&r!==""&&!Ja(r)?r:null}const hn=()=>{const t=a=>At(J,(r,i,s)=>(r[s]=At(i,a,{}),r),{});cn=t((a,r,i)=>(r[3]&&(a[r[3]]=i),r[2]&&r[2].filter(o=>typeof o=="number").forEach(o=>{a[o.toString(16)]=i}),a)),un=t((a,r,i)=>(a[i]=i,r[2]&&r[2].filter(o=>typeof o=="string").forEach(o=>{a[o]=i}),a)),gn=t((a,r,i)=>{const s=r[2];return a[i]=i,s.forEach(o=>{a[o]=i}),a});const e="far"in J||d.autoFetchSvg,n=At(Ka,(a,r)=>{const i=r[0];let s=r[1];const o=r[2];return s==="far"&&!e&&(s="fas"),typeof i=="string"&&(a.names[i]={prefix:s,iconName:o}),typeof i=="number"&&(a.unicodes[i.toString(16)]={prefix:s,iconName:o}),a},{names:{},unicodes:{}});dn=n.names,mn=n.unicodes,Jt=dt(d.styleDefault,{family:d.familyDefault})};Da(t=>{Jt=dt(t.styleDefault,{family:d.familyDefault})});hn();function Qt(t,e){return(cn[t]||{})[e]}function Za(t,e){return(un[t]||{})[e]}function R(t,e){return(gn[t]||{})[e]}function pn(t){return dn[t]||{prefix:null,iconName:null}}function $a(t){const e=mn[t],n=Qt("fas",t);return e||(n?{prefix:"fas",iconName:n}:null)||{prefix:null,iconName:null}}function L(){return Jt}const bn=()=>({prefix:null,iconName:null,rest:[]});function tr(t){let e=S;const n=fn.reduce((a,r)=>(a[r]="".concat(d.cssPrefix,"-").concat(r),a),{});return Je.forEach(a=>{(t.includes(n[a])||t.some(r=>qa[a].includes(r)))&&(e=a)}),e}function dt(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{family:n=S}=e,a=Ca[n][t];if(n===ct&&!t)return"fad";const r=pe[n][t]||pe[n][a],i=t in C.styles?t:null;return r||i||null}function er(t){let e=[],n=null;return t.forEach(a=>{const r=Qa(d.cssPrefix,a);r?n=r:a&&e.push(a)}),{iconName:n,rest:e}}function xe(t){return t.sort().filter((e,n,a)=>a.indexOf(e)===n)}function mt(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{skipLookups:n=!1}=e;let a=null;const r=Ct.concat(pa),i=xe(t.filter(h=>r.includes(h))),s=xe(t.filter(h=>!Ct.includes(h))),o=i.filter(h=>(a=h,!qe.includes(h))),[f=null]=o,c=tr(i),m=l(l({},er(s)),{},{prefix:dt(f,{family:c})});return l(l(l({},m),ir({values:t,family:c,styles:J,config:d,canonical:m,givenPrefix:a})),nr(n,a,m))}function nr(t,e,n){let{prefix:a,iconName:r}=n;if(t||!a||!r)return{prefix:a,iconName:r};const i=e==="fa"?pn(r):{},s=R(a,r);return r=i.iconName||s||r,a=i.prefix||a,a==="far"&&!J.far&&J.fas&&!d.autoFetchSvg&&(a="fas"),{prefix:a,iconName:r}}const ar=Je.filter(t=>t!==S||t!==ct),rr=Object.keys(It).filter(t=>t!==S).map(t=>Object.keys(It[t])).flat();function ir(t){const{values:e,family:n,canonical:a,givenPrefix:r="",styles:i={},config:s={}}=t,o=n===ct,f=e.includes("fa-duotone")||e.includes("fad"),c=s.familyDefault==="duotone",m=a.prefix==="fad"||a.prefix==="fa-duotone";if(!o&&(f||c||m)&&(a.prefix="fad"),(e.includes("fa-brands")||e.includes("fab"))&&(a.prefix="fab"),!a.prefix&&ar.includes(n)&&(Object.keys(i).find(g=>rr.includes(g))||s.autoFetchSvg)){const g=la.get(n).defaultShortPrefixId;a.prefix=g,a.iconName=R(a.prefix,a.iconName)||a.iconName}return(a.prefix==="fa"||r==="fa")&&(a.prefix=L()||"fas"),a}class sr{constructor(){this.definitions={}}add(){for(var e=arguments.length,n=new Array(e),a=0;a<e;a++)n[a]=arguments[a];const r=n.reduce(this._pullDefinitions,{});Object.keys(r).forEach(i=>{this.definitions[i]=l(l({},this.definitions[i]||{}),r[i]),Lt(i,r[i]);const s=Vt[S][i];s&&Lt(s,r[i]),hn()})}reset(){this.definitions={}}_pullDefinitions(e,n){const a=n.prefix&&n.iconName&&n.icon?{0:n}:n;return Object.keys(a).map(r=>{const{prefix:i,iconName:s,icon:o}=a[r],f=o[2];e[i]||(e[i]={}),f.length>0&&f.forEach(c=>{typeof c=="string"&&(e[i][c]=o)}),e[i][s]=o}),e}}let Ae=[],W={};const U={},or=Object.keys(U);function lr(t,e){let{mixoutsTo:n}=e;return Ae=t,W={},Object.keys(U).forEach(a=>{or.indexOf(a)===-1&&delete U[a]}),Ae.forEach(a=>{const r=a.mixout?a.mixout():{};if(Object.keys(r).forEach(i=>{typeof r[i]=="function"&&(n[i]=r[i]),typeof r[i]=="object"&&Object.keys(r[i]).forEach(s=>{n[i]||(n[i]={}),n[i][s]=r[i][s]})}),a.hooks){const i=a.hooks();Object.keys(i).forEach(s=>{W[s]||(W[s]=[]),W[s].push(i[s])})}a.provides&&a.provides(U)}),n}function Dt(t,e){for(var n=arguments.length,a=new Array(n>2?n-2:0),r=2;r<n;r++)a[r-2]=arguments[r];return(W[t]||[]).forEach(s=>{e=s.apply(null,[e,...a])}),e}function j(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),a=1;a<e;a++)n[a-1]=arguments[a];(W[t]||[]).forEach(i=>{i.apply(null,n)})}function D(){const t=arguments[0],e=Array.prototype.slice.call(arguments,1);return U[t]?U[t].apply(null,e):void 0}function Rt(t){t.prefix==="fa"&&(t.prefix="fas");let{iconName:e}=t;const n=t.prefix||L();if(e)return e=R(n,e)||e,ye(yn.definitions,n,e)||ye(C.styles,n,e)}const yn=new sr,fr=()=>{d.autoReplaceSvg=!1,d.observeMutations=!1,j("noAuto")},cr={i2svg:function(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return T?(j("beforeI2svg",t),D("pseudoElements2svg",t),D("i2svg",t)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:e}=t;d.autoReplaceSvg===!1&&(d.autoReplaceSvg=!0),d.observeMutations=!0,Ga(()=>{dr({autoReplaceSvgRoot:e}),j("watch",t)})}},ur={icon:t=>{if(t===null)return null;if(typeof t=="object"&&t.prefix&&t.iconName)return{prefix:t.prefix,iconName:R(t.prefix,t.iconName)||t.iconName};if(Array.isArray(t)&&t.length===2){const e=t[1].indexOf("fa-")===0?t[1].slice(3):t[1],n=dt(t[0]);return{prefix:n,iconName:R(n,e)||e}}if(typeof t=="string"&&(t.indexOf("".concat(d.cssPrefix,"-"))>-1||t.match(wa))){const e=mt(t.split(" "),{skipLookups:!0});return{prefix:e.prefix||L(),iconName:R(e.prefix,e.iconName)||e.iconName}}if(typeof t=="string"){const e=L();return{prefix:e,iconName:R(e,t)||t}}}},O={noAuto:fr,config:d,dom:cr,parse:ur,library:yn,findIconDefinition:Rt,toHtml:Z},dr=function(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:e=b}=t;(Object.keys(C.styles).length>0||d.autoFetchSvg)&&T&&d.autoReplaceSvg&&O.dom.i2svg({node:e})};function gt(t,e){return Object.defineProperty(t,"abstract",{get:e}),Object.defineProperty(t,"html",{get:function(){return t.abstract.map(n=>Z(n))}}),Object.defineProperty(t,"node",{get:function(){if(!T)return;const n=b.createElement("div");return n.innerHTML=t.html,n.children}}),t}function mr(t){let{children:e,main:n,mask:a,attributes:r,styles:i,transform:s}=t;if(qt(s)&&n.found&&!a.found){const{width:o,height:f}=n,c={x:o/f/2,y:.5};r.style=ut(l(l({},i),{},{"transform-origin":"".concat(c.x+s.x/16,"em ").concat(c.y+s.y/16,"em")}))}return[{tag:"svg",attributes:r,children:e}]}function gr(t){let{prefix:e,iconName:n,children:a,attributes:r,symbol:i}=t;const s=i===!0?"".concat(e,"-").concat(d.cssPrefix,"-").concat(n):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:l(l({},r),{},{id:s}),children:a}]}]}function Zt(t){const{icons:{main:e,mask:n},prefix:a,iconName:r,transform:i,symbol:s,title:o,maskId:f,titleId:c,extra:m,watchable:h=!1}=t,{width:g,height:x}=n.found?n:e,p=ma.includes(a),A=[d.replacementClass,r?"".concat(d.cssPrefix,"-").concat(r):""].filter(w=>m.classes.indexOf(w)===-1).filter(w=>w!==""||!!w).concat(m.classes).join(" ");let y={children:[],attributes:l(l({},m.attributes),{},{"data-prefix":a,"data-icon":r,class:A,role:m.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(g," ").concat(x)})};const k=p&&!~m.classes.indexOf("fa-fw")?{width:"".concat(g/x*16*.0625,"em")}:{};h&&(y.attributes[z]=""),o&&(y.children.push({tag:"title",attributes:{id:y.attributes["aria-labelledby"]||"title-".concat(c||q())},children:[o]}),delete y.attributes.title);const v=l(l({},y),{},{prefix:a,iconName:r,main:e,mask:n,maskId:f,transform:i,symbol:s,styles:l(l({},k),m.styles)}),{children:P,attributes:E}=n.found&&e.found?D("generateAbstractMask",v)||{children:[],attributes:{}}:D("generateAbstractIcon",v)||{children:[],attributes:{}};return v.children=P,v.attributes=E,s?gr(v):mr(v)}function ke(t){const{content:e,width:n,height:a,transform:r,title:i,extra:s,watchable:o=!1}=t,f=l(l(l({},s.attributes),i?{title:i}:{}),{},{class:s.classes.join(" ")});o&&(f[z]="");const c=l({},s.styles);qt(r)&&(c.transform=Wa({transform:r,startCentered:!0,width:n,height:a}),c["-webkit-transform"]=c.transform);const m=ut(c);m.length>0&&(f.style=m);const h=[];return h.push({tag:"span",attributes:f,children:[e]}),i&&h.push({tag:"span",attributes:{class:"sr-only"},children:[i]}),h}function hr(t){const{content:e,title:n,extra:a}=t,r=l(l(l({},a.attributes),n?{title:n}:{}),{},{class:a.classes.join(" ")}),i=ut(a.styles);i.length>0&&(r.style=i);const s=[];return s.push({tag:"span",attributes:r,children:[e]}),n&&s.push({tag:"span",attributes:{class:"sr-only"},children:[n]}),s}const{styles:kt}=C;function zt(t){const e=t[0],n=t[1],[a]=t.slice(4);let r=null;return Array.isArray(a)?r={tag:"g",attributes:{class:"".concat(d.cssPrefix,"-").concat(vt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(d.cssPrefix,"-").concat(vt.SECONDARY),fill:"currentColor",d:a[0]}},{tag:"path",attributes:{class:"".concat(d.cssPrefix,"-").concat(vt.PRIMARY),fill:"currentColor",d:a[1]}}]}:r={tag:"path",attributes:{fill:"currentColor",d:a}},{found:!0,width:e,height:n,icon:r}}const pr={found:!1,width:512,height:512};function br(t,e){!tn&&!d.showMissingIcons&&t&&console.error('Icon with name "'.concat(t,'" and prefix "').concat(e,'" is missing.'))}function jt(t,e){let n=e;return e==="fa"&&d.styleDefault!==null&&(e=L()),new Promise((a,r)=>{if(n==="fa"){const i=pn(t)||{};t=i.iconName||t,e=i.prefix||e}if(t&&e&&kt[e]&&kt[e][t]){const i=kt[e][t];return a(zt(i))}br(t,e),a(l(l({},pr),{},{icon:d.showMissingIcons&&t?D("missingIconAbstract")||{}:{}}))})}const Pe=()=>{},Yt=d.measurePerformance&&nt&&nt.mark&&nt.measure?nt:{mark:Pe,measure:Pe},B='FA "6.7.2"',yr=t=>(Yt.mark("".concat(B," ").concat(t," begins")),()=>vn(t)),vn=t=>{Yt.mark("".concat(B," ").concat(t," ends")),Yt.measure("".concat(B," ").concat(t),"".concat(B," ").concat(t," begins"),"".concat(B," ").concat(t," ends"))};var $t={begin:yr,end:vn};const it=()=>{};function Se(t){return typeof(t.getAttribute?t.getAttribute(z):null)=="string"}function vr(t){const e=t.getAttribute?t.getAttribute(Xt):null,n=t.getAttribute?t.getAttribute(Bt):null;return e&&n}function xr(t){return t&&t.classList&&t.classList.contains&&t.classList.contains(d.replacementClass)}function Ar(){return d.autoReplaceSvg===!0?st.replace:st[d.autoReplaceSvg]||st.replace}function kr(t){return b.createElementNS("http://www.w3.org/2000/svg",t)}function Pr(t){return b.createElement(t)}function xn(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{ceFn:n=t.tag==="svg"?kr:Pr}=e;if(typeof t=="string")return b.createTextNode(t);const a=n(t.tag);return Object.keys(t.attributes||[]).forEach(function(i){a.setAttribute(i,t.attributes[i])}),(t.children||[]).forEach(function(i){a.appendChild(xn(i,{ceFn:n}))}),a}function Sr(t){let e=" ".concat(t.outerHTML," ");return e="".concat(e,"Font Awesome fontawesome.com "),e}const st={replace:function(t){const e=t[0];if(e.parentNode)if(t[1].forEach(n=>{e.parentNode.insertBefore(xn(n),e)}),e.getAttribute(z)===null&&d.keepOriginalSource){let n=b.createComment(Sr(e));e.parentNode.replaceChild(n,e)}else e.remove()},nest:function(t){const e=t[0],n=t[1];if(~Kt(e).indexOf(d.replacementClass))return st.replace(t);const a=new RegExp("".concat(d.cssPrefix,"-.*"));if(delete n[0].attributes.id,n[0].attributes.class){const i=n[0].attributes.class.split(" ").reduce((s,o)=>(o===d.replacementClass||o.match(a)?s.toSvg.push(o):s.toNode.push(o),s),{toNode:[],toSvg:[]});n[0].attributes.class=i.toSvg.join(" "),i.toNode.length===0?e.removeAttribute("class"):e.setAttribute("class",i.toNode.join(" "))}const r=n.map(i=>Z(i)).join(`
`);e.setAttribute(z,""),e.innerHTML=r}};function Ee(t){t()}function An(t,e){const n=typeof e=="function"?e:it;if(t.length===0)n();else{let a=Ee;d.mutateApproach===Oa&&(a=M.requestAnimationFrame||Ee),a(()=>{const r=Ar(),i=$t.begin("mutate");t.map(r),i(),n()})}}let te=!1;function kn(){te=!0}function Wt(){te=!1}let ft=null;function Oe(t){if(!de||!d.observeMutations)return;const{treeCallback:e=it,nodeCallback:n=it,pseudoElementsCallback:a=it,observeMutationsRoot:r=b}=t;ft=new de(i=>{if(te)return;const s=L();G(i).forEach(o=>{if(o.type==="childList"&&o.addedNodes.length>0&&!Se(o.addedNodes[0])&&(d.searchPseudoElements&&a(o.target),e(o.target)),o.type==="attributes"&&o.target.parentNode&&d.searchPseudoElements&&a(o.target.parentNode),o.type==="attributes"&&Se(o.target)&&~Ta.indexOf(o.attributeName))if(o.attributeName==="class"&&vr(o.target)){const{prefix:f,iconName:c}=mt(Kt(o.target));o.target.setAttribute(Xt,f||s),c&&o.target.setAttribute(Bt,c)}else xr(o.target)&&n(o.target)})}),T&&ft.observe(r,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}function Er(){ft&&ft.disconnect()}function Or(t){const e=t.getAttribute("style");let n=[];return e&&(n=e.split(";").reduce((a,r)=>{const i=r.split(":"),s=i[0],o=i.slice(1);return s&&o.length>0&&(a[s]=o.join(":").trim()),a},{})),n}function Ir(t){const e=t.getAttribute("data-prefix"),n=t.getAttribute("data-icon"),a=t.innerText!==void 0?t.innerText.trim():"";let r=mt(Kt(t));return r.prefix||(r.prefix=L()),e&&n&&(r.prefix=e,r.iconName=n),r.iconName&&r.prefix||(r.prefix&&a.length>0&&(r.iconName=Za(r.prefix,t.innerText)||Qt(r.prefix,Mt(t.innerText))),!r.iconName&&d.autoFetchSvg&&t.firstChild&&t.firstChild.nodeType===Node.TEXT_NODE&&(r.iconName=t.firstChild.data)),r}function Cr(t){const e=G(t.attributes).reduce((r,i)=>(r.name!=="class"&&r.name!=="style"&&(r[i.name]=i.value),r),{}),n=t.getAttribute("title"),a=t.getAttribute("data-fa-title-id");return d.autoA11y&&(n?e["aria-labelledby"]="".concat(d.replacementClass,"-title-").concat(a||q()):(e["aria-hidden"]="true",e.focusable="false")),e}function wr(){return{iconName:null,title:null,titleId:null,prefix:null,transform:I,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function Ie(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0};const{iconName:n,prefix:a,rest:r}=Ir(t),i=Cr(t),s=Dt("parseNodeAttributes",{},t);let o=e.styleParser?Or(t):[];return l({iconName:n,title:t.getAttribute("title"),titleId:t.getAttribute("data-fa-title-id"),prefix:a,transform:I,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:r,styles:o,attributes:i}},s)}const{styles:Nr}=C;function Pn(t){const e=d.autoReplaceSvg==="nest"?Ie(t,{styleParser:!1}):Ie(t);return~e.extra.classes.indexOf(nn)?D("generateLayersText",t,e):D("generateSvgReplacementMutation",t,e)}function Fr(){return[...ca,...Ct]}function Ce(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!T)return Promise.resolve();const n=b.documentElement.classList,a=m=>n.add("".concat(he,"-").concat(m)),r=m=>n.remove("".concat(he,"-").concat(m)),i=d.autoFetchSvg?Fr():qe.concat(Object.keys(Nr));i.includes("fa")||i.push("fa");const s=[".".concat(nn,":not([").concat(z,"])")].concat(i.map(m=>".".concat(m,":not([").concat(z,"])"))).join(", ");if(s.length===0)return Promise.resolve();let o=[];try{o=G(t.querySelectorAll(s))}catch{}if(o.length>0)a("pending"),r("complete");else return Promise.resolve();const f=$t.begin("onTree"),c=o.reduce((m,h)=>{try{const g=Pn(h);g&&m.push(g)}catch(g){tn||g.name==="MissingIcon"&&console.error(g)}return m},[]);return new Promise((m,h)=>{Promise.all(c).then(g=>{An(g,()=>{a("active"),a("complete"),r("pending"),typeof e=="function"&&e(),f(),m()})}).catch(g=>{f(),h(g)})})}function Tr(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Pn(t).then(n=>{n&&An([n],e)})}function _r(t){return function(e){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const a=(e||{}).icon?e:Rt(e||{});let{mask:r}=n;return r&&(r=(r||{}).icon?r:Rt(r||{})),t(a,l(l({},n),{},{mask:r}))}}const Mr=function(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=I,symbol:a=!1,mask:r=null,maskId:i=null,title:s=null,titleId:o=null,classes:f=[],attributes:c={},styles:m={}}=e;if(!t)return;const{prefix:h,iconName:g,icon:x}=t;return gt(l({type:"icon"},t),()=>(j("beforeDOMElementCreation",{iconDefinition:t,params:e}),d.autoA11y&&(s?c["aria-labelledby"]="".concat(d.replacementClass,"-title-").concat(o||q()):(c["aria-hidden"]="true",c.focusable="false")),Zt({icons:{main:zt(x),mask:r?zt(r.icon):{found:!1,width:null,height:null,icon:{}}},prefix:h,iconName:g,transform:l(l({},I),n),symbol:a,title:s,maskId:i,titleId:o,extra:{attributes:c,styles:m,classes:f}})))};var Lr={mixout(){return{icon:_r(Mr)}},hooks(){return{mutationObserverCallbacks(t){return t.treeCallback=Ce,t.nodeCallback=Tr,t}}},provides(t){t.i2svg=function(e){const{node:n=b,callback:a=()=>{}}=e;return Ce(n,a)},t.generateSvgReplacementMutation=function(e,n){const{iconName:a,title:r,titleId:i,prefix:s,transform:o,symbol:f,mask:c,maskId:m,extra:h}=n;return new Promise((g,x)=>{Promise.all([jt(a,s),c.iconName?jt(c.iconName,c.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(p=>{let[A,y]=p;g([e,Zt({icons:{main:A,mask:y},prefix:s,iconName:a,transform:o,symbol:f,maskId:m,title:r,titleId:i,extra:h,watchable:!0})])}).catch(x)})},t.generateAbstractIcon=function(e){let{children:n,attributes:a,main:r,transform:i,styles:s}=e;const o=ut(s);o.length>0&&(a.style=o);let f;return qt(i)&&(f=D("generateAbstractTransformGrouping",{main:r,transform:i,containerWidth:r.width,iconWidth:r.width})),n.push(f||r.icon),{children:n,attributes:a}}}},Dr={mixout(){return{layer(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{classes:n=[]}=e;return gt({type:"layer"},()=>{j("beforeDOMElementCreation",{assembler:t,params:e});let a=[];return t(r=>{Array.isArray(r)?r.map(i=>{a=a.concat(i.abstract)}):a=a.concat(r.abstract)}),[{tag:"span",attributes:{class:["".concat(d.cssPrefix,"-layers"),...n].join(" ")},children:a}]})}}}},Rr={mixout(){return{counter(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{title:n=null,classes:a=[],attributes:r={},styles:i={}}=e;return gt({type:"counter",content:t},()=>(j("beforeDOMElementCreation",{content:t,params:e}),hr({content:t.toString(),title:n,extra:{attributes:r,styles:i,classes:["".concat(d.cssPrefix,"-layers-counter"),...a]}})))}}}},zr={mixout(){return{text(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=I,title:a=null,classes:r=[],attributes:i={},styles:s={}}=e;return gt({type:"text",content:t},()=>(j("beforeDOMElementCreation",{content:t,params:e}),ke({content:t,transform:l(l({},I),n),title:a,extra:{attributes:i,styles:s,classes:["".concat(d.cssPrefix,"-layers-text"),...r]}})))}}},provides(t){t.generateLayersText=function(e,n){const{title:a,transform:r,extra:i}=n;let s=null,o=null;if(Ve){const f=parseInt(getComputedStyle(e).fontSize,10),c=e.getBoundingClientRect();s=c.width/f,o=c.height/f}return d.autoA11y&&!a&&(i.attributes["aria-hidden"]="true"),Promise.resolve([e,ke({content:e.innerHTML,width:s,height:o,transform:r,title:a,extra:i,watchable:!0})])}}};const jr=new RegExp('"',"ug"),we=[1105920,1112319],Ne=l(l(l(l({},{FontAwesome:{normal:"fas",400:"fas"}}),oa),Sa),ba),Ut=Object.keys(Ne).reduce((t,e)=>(t[e.toLowerCase()]=Ne[e],t),{}),Yr=Object.keys(Ut).reduce((t,e)=>{const n=Ut[e];return t[e]=n[900]||[...Object.entries(n)][0][1],t},{});function Wr(t){const e=t.replace(jr,""),n=Va(e,0),a=n>=we[0]&&n<=we[1],r=e.length===2?e[0]===e[1]:!1;return{value:Mt(r?e[0]:e),isSecondary:a||r}}function Ur(t,e){const n=t.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(e),r=isNaN(a)?"normal":a;return(Ut[n]||{})[r]||Yr[n]}function Fe(t,e){const n="".concat(Ea).concat(e.replace(":","-"));return new Promise((a,r)=>{if(t.getAttribute(n)!==null)return a();const s=G(t.children).filter(g=>g.getAttribute(Nt)===e)[0],o=M.getComputedStyle(t,e),f=o.getPropertyValue("font-family"),c=f.match(Na),m=o.getPropertyValue("font-weight"),h=o.getPropertyValue("content");if(s&&!c)return t.removeChild(s),a();if(c&&h!=="none"&&h!==""){const g=o.getPropertyValue("content");let x=Ur(f,m);const{value:p,isSecondary:A}=Wr(g),y=c[0].startsWith("FontAwesome");let k=Qt(x,p),v=k;if(y){const P=$a(p);P.iconName&&P.prefix&&(k=P.iconName,x=P.prefix)}if(k&&!A&&(!s||s.getAttribute(Xt)!==x||s.getAttribute(Bt)!==v)){t.setAttribute(n,v),s&&t.removeChild(s);const P=wr(),{extra:E}=P;E.attributes[Nt]=e,jt(k,x).then(w=>{const $=Zt(l(l({},P),{},{icons:{main:w,mask:bn()},prefix:x,iconName:v,extra:E,watchable:!0})),Y=b.createElementNS("http://www.w3.org/2000/svg","svg");e==="::before"?t.insertBefore(Y,t.firstChild):t.appendChild(Y),Y.outerHTML=$.map(tt=>Z(tt)).join(`
`),t.removeAttribute(n),a()}).catch(r)}else a()}else a()})}function Hr(t){return Promise.all([Fe(t,"::before"),Fe(t,"::after")])}function Gr(t){return t.parentNode!==document.head&&!~Ia.indexOf(t.tagName.toUpperCase())&&!t.getAttribute(Nt)&&(!t.parentNode||t.parentNode.tagName!=="svg")}function Te(t){if(T)return new Promise((e,n)=>{const a=G(t.querySelectorAll("*")).filter(Gr).map(Hr),r=$t.begin("searchPseudoElements");kn(),Promise.all(a).then(()=>{r(),Wt(),e()}).catch(()=>{r(),Wt(),n()})})}var Xr={hooks(){return{mutationObserverCallbacks(t){return t.pseudoElementsCallback=Te,t}}},provides(t){t.pseudoElements2svg=function(e){const{node:n=b}=e;d.searchPseudoElements&&Te(n)}}};let _e=!1;var Br={mixout(){return{dom:{unwatch(){kn(),_e=!0}}}},hooks(){return{bootstrap(){Oe(Dt("mutationObserverCallbacks",{}))},noAuto(){Er()},watch(t){const{observeMutationsRoot:e}=t;_e?Wt():Oe(Dt("mutationObserverCallbacks",{observeMutationsRoot:e}))}}}};const Me=t=>{let e={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return t.toLowerCase().split(" ").reduce((n,a)=>{const r=a.toLowerCase().split("-"),i=r[0];let s=r.slice(1).join("-");if(i&&s==="h")return n.flipX=!0,n;if(i&&s==="v")return n.flipY=!0,n;if(s=parseFloat(s),isNaN(s))return n;switch(i){case"grow":n.size=n.size+s;break;case"shrink":n.size=n.size-s;break;case"left":n.x=n.x-s;break;case"right":n.x=n.x+s;break;case"up":n.y=n.y-s;break;case"down":n.y=n.y+s;break;case"rotate":n.rotate=n.rotate+s;break}return n},e)};var Vr={mixout(){return{parse:{transform:t=>Me(t)}}},hooks(){return{parseNodeAttributes(t,e){const n=e.getAttribute("data-fa-transform");return n&&(t.transform=Me(n)),t}}},provides(t){t.generateAbstractTransformGrouping=function(e){let{main:n,transform:a,containerWidth:r,iconWidth:i}=e;const s={transform:"translate(".concat(r/2," 256)")},o="translate(".concat(a.x*32,", ").concat(a.y*32,") "),f="scale(".concat(a.size/16*(a.flipX?-1:1),", ").concat(a.size/16*(a.flipY?-1:1),") "),c="rotate(".concat(a.rotate," 0 0)"),m={transform:"".concat(o," ").concat(f," ").concat(c)},h={transform:"translate(".concat(i/2*-1," -256)")},g={outer:s,inner:m,path:h};return{tag:"g",attributes:l({},g.outer),children:[{tag:"g",attributes:l({},g.inner),children:[{tag:n.icon.tag,children:n.icon.children,attributes:l(l({},n.icon.attributes),g.path)}]}]}}}};const Pt={x:0,y:0,width:"100%",height:"100%"};function Le(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return t.attributes&&(t.attributes.fill||e)&&(t.attributes.fill="black"),t}function Kr(t){return t.tag==="g"?t.children:[t]}var qr={hooks(){return{parseNodeAttributes(t,e){const n=e.getAttribute("data-fa-mask"),a=n?mt(n.split(" ").map(r=>r.trim())):bn();return a.prefix||(a.prefix=L()),t.mask=a,t.maskId=e.getAttribute("data-fa-mask-id"),t}}},provides(t){t.generateAbstractMask=function(e){let{children:n,attributes:a,main:r,mask:i,maskId:s,transform:o}=e;const{width:f,icon:c}=r,{width:m,icon:h}=i,g=Ya({transform:o,containerWidth:m,iconWidth:f}),x={tag:"rect",attributes:l(l({},Pt),{},{fill:"white"})},p=c.children?{children:c.children.map(Le)}:{},A={tag:"g",attributes:l({},g.inner),children:[Le(l({tag:c.tag,attributes:l(l({},c.attributes),g.path)},p))]},y={tag:"g",attributes:l({},g.outer),children:[A]},k="mask-".concat(s||q()),v="clip-".concat(s||q()),P={tag:"mask",attributes:l(l({},Pt),{},{id:k,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[x,y]},E={tag:"defs",children:[{tag:"clipPath",attributes:{id:v},children:Kr(h)},P]};return n.push(E,{tag:"rect",attributes:l({fill:"currentColor","clip-path":"url(#".concat(v,")"),mask:"url(#".concat(k,")")},Pt)}),{children:n,attributes:a}}}},Jr={provides(t){let e=!1;M.matchMedia&&(e=M.matchMedia("(prefers-reduced-motion: reduce)").matches),t.missingIconAbstract=function(){const n=[],a={fill:"currentColor"},r={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};n.push({tag:"path",attributes:l(l({},a),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});const i=l(l({},r),{},{attributeName:"opacity"}),s={tag:"circle",attributes:l(l({},a),{},{cx:"256",cy:"364",r:"28"}),children:[]};return e||s.children.push({tag:"animate",attributes:l(l({},r),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:l(l({},i),{},{values:"1;0;1;1;0;1;"})}),n.push(s),n.push({tag:"path",attributes:l(l({},a),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:e?[]:[{tag:"animate",attributes:l(l({},i),{},{values:"1;0;0;0;0;1;"})}]}),e||n.push({tag:"path",attributes:l(l({},a),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:l(l({},i),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:n}}}},Qr={hooks(){return{parseNodeAttributes(t,e){const n=e.getAttribute("data-fa-symbol"),a=n===null?!1:n===""?!0:n;return t.symbol=a,t}}}},Zr=[Ha,Lr,Dr,Rr,zr,Xr,Br,Vr,qr,Jr,Qr];lr(Zr,{mixoutsTo:O});O.noAuto;O.config;const li=O.library;O.dom;const Ht=O.parse;O.findIconDefinition;O.toHtml;const $r=O.icon;O.layer;O.text;O.counter;let Sn=!1;try{Sn=!0}catch{}function ti(...t){!Sn&&console&&typeof console.error=="function"&&console.error(...t)}function De(t){if(t&&typeof t=="object"&&t.prefix&&t.iconName&&t.icon)return t;if(Ht.icon)return Ht.icon(t);if(t===null)return null;if(t&&typeof t=="object"&&t.prefix&&t.iconName)return t;if(Array.isArray(t)&&t.length===2)return{prefix:t[0],iconName:t[1]};if(typeof t=="string")return{prefix:"fas",iconName:t}}function St(t,e){return Array.isArray(e)&&e.length>0||!Array.isArray(e)&&e?{[t]:e}:{}}function ei(t){let e,n,a=[t[2]],r={};for(let i=0;i<a.length;i+=1)r=ot(r,a[i]);return{c(){e=_n("svg"),n=new Mn(!0),this.h()},l(i){e=Ln(i,"svg",{});var s=Dn(e);n=Rn(s,!0),s.forEach(Et),this.h()},h(){n.a=null,zn(e,r)},m(i,s){Ue(i,e,s),n.m(t[1],e),t[7](e)},p:yt,i:yt,o:yt,d(i){i&&Et(e),t[7](null)}}}function ni(t,e,n){let{tag:a}=e,{props:r}=e,{children:i}=e,{style:s=null}=e,{ref:o=null}=e;if(a!=="svg")throw new Error('SvgElement requires a tag of "svg"');function f(p){return(p==null?void 0:p.reduce((A,y)=>A+(y.tag?c(y):y),""))||""}function c({tag:p,props:A,children:y}){const k=Object.keys(A).map(v=>`${v}="${A[v]}"`).join(" ");return`<${p} ${k}>${f(y)}</${p}>`}const m=f(i),h=r!=null&&r.style?`${r.style}${s||""}`:s,g={...r,style:h};function x(p){je[p?"unshift":"push"](()=>{o=p,n(0,o)})}return t.$$set=p=>{"tag"in p&&n(3,a=p.tag),"props"in p&&n(4,r=p.props),"children"in p&&n(5,i=p.children),"style"in p&&n(6,s=p.style),"ref"in p&&n(0,o=p.ref)},[o,m,g,a,r,i,s,x]}class ai extends Ye{constructor(e){super(),We(this,e,ni,ei,ze,{tag:3,props:4,children:5,style:6,ref:0})}}function Re(t){let e,n,a;const r=[t[2],{style:t[1]}];function i(o){t[28](o)}let s={};for(let o=0;o<r.length;o+=1)s=ot(s,r[o]);return t[0]!==void 0&&(s.ref=t[0]),e=new ai({props:s}),je.push(()=>Wn(e,"ref",i)),{c(){Un(e.$$.fragment)},l(o){Hn(e.$$.fragment,o)},m(o,f){Gn(e,o,f),a=!0},p(o,f){const c=f[0]&6?Bn(r,[f[0]&4&&Vn(o[2]),f[0]&2&&{style:o[1]}]):{};!n&&f[0]&1&&(n=!0,c.ref=o[0],Tn(()=>n=!1)),e.$set(c)},i(o){a||(rt(e.$$.fragment,o),a=!0)},o(o){Ot(e.$$.fragment,o),a=!1},d(o){Xn(e,o)}}}function ri(t){let e,n,a=t[2]&&Re(t);return{c(){a&&a.c(),e=le()},l(r){a&&a.l(r),e=le()},m(r,i){a&&a.m(r,i),Ue(r,e,i),n=!0},p(r,i){r[2]?a?(a.p(r,i),i[0]&4&&rt(a,1)):(a=Re(r),a.c(),rt(a,1),a.m(e.parentNode,e)):a&&(jn(),Ot(a,1,1,()=>{a=null}),Yn())},i(r){n||(rt(a),n=!0)},o(r){Ot(a),n=!1},d(r){r&&Et(e),a&&a.d(r)}}}function ii(t,e,n){const a=["border","mask","maskId","fixedWidth","inverse","flip","icon","listItem","pull","pulse","rotation","size","spin","spinPulse","spinReverse","beat","fade","beatFade","bounce","shake","symbol","title","titleId","transform","swapOpacity","ref","style"];let r=se(e,a),{border:i=!1}=e,{mask:s=null}=e,{maskId:o=null}=e,{fixedWidth:f=!1}=e,{inverse:c=!1}=e,{flip:m=!1}=e,{icon:h=null}=e,{listItem:g=!1}=e,{pull:x=null}=e,{pulse:p=!1}=e,{rotation:A=null}=e,{size:y=null}=e,{spin:k=!1}=e,{spinPulse:v=!1}=e,{spinReverse:P=!1}=e,{beat:E=!1}=e,{fade:w=!1}=e,{beatFade:$=!1}=e,{bounce:Y=!1}=e,{shake:tt=!1}=e,{symbol:ht=!1}=e,{title:pt=""}=e,{titleId:bt=null}=e,{transform:X=null}=e,{swapOpacity:ee=!1}=e,{ref:et=null}=e,{style:ne=null}=e;const ae=De(h),En=St("classes",[...Kn(e),...(e.class||"").split(" ")]),On=St("transform",typeof X=="string"?Ht.transform(X):X),In=St("mask",De(s)),re=$r(ae,{...En,...On,...In,symbol:ht,title:pt,titleId:bt,maskId:o});let ie=null;if(!re)ti("Could not find icon",ae);else{const{abstract:u}=re;ie=He((wn,Nn,Fn)=>({tag:wn,props:Nn,children:Fn}),u[0],r)}function Cn(u){et=u,n(0,et)}return t.$$set=u=>{n(35,e=ot(ot({},e),oe(u))),n(34,r=se(e,a)),"border"in u&&n(3,i=u.border),"mask"in u&&n(4,s=u.mask),"maskId"in u&&n(5,o=u.maskId),"fixedWidth"in u&&n(6,f=u.fixedWidth),"inverse"in u&&n(7,c=u.inverse),"flip"in u&&n(8,m=u.flip),"icon"in u&&n(9,h=u.icon),"listItem"in u&&n(10,g=u.listItem),"pull"in u&&n(11,x=u.pull),"pulse"in u&&n(12,p=u.pulse),"rotation"in u&&n(13,A=u.rotation),"size"in u&&n(14,y=u.size),"spin"in u&&n(15,k=u.spin),"spinPulse"in u&&n(16,v=u.spinPulse),"spinReverse"in u&&n(17,P=u.spinReverse),"beat"in u&&n(18,E=u.beat),"fade"in u&&n(19,w=u.fade),"beatFade"in u&&n(20,$=u.beatFade),"bounce"in u&&n(21,Y=u.bounce),"shake"in u&&n(22,tt=u.shake),"symbol"in u&&n(23,ht=u.symbol),"title"in u&&n(24,pt=u.title),"titleId"in u&&n(25,bt=u.titleId),"transform"in u&&n(26,X=u.transform),"swapOpacity"in u&&n(27,ee=u.swapOpacity),"ref"in u&&n(0,et=u.ref),"style"in u&&n(1,ne=u.style)},e=oe(e),[et,ne,ie,i,s,o,f,c,m,h,g,x,p,A,y,k,v,P,E,w,$,Y,tt,ht,pt,bt,X,ee,Cn]}class fi extends Ye{constructor(e){super(),We(this,e,ii,ri,ze,{border:3,mask:4,maskId:5,fixedWidth:6,inverse:7,flip:8,icon:9,listItem:10,pull:11,pulse:12,rotation:13,size:14,spin:15,spinPulse:16,spinReverse:17,beat:18,fade:19,beatFade:20,bounce:21,shake:22,symbol:23,title:24,titleId:25,transform:26,swapOpacity:27,ref:0,style:1},null,[-1,-1])}}export{fi as F,li as l};
