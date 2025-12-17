var de=Object.defineProperty;var he=(r,e)=>()=>(r&&(e=r(r=0)),e);var ue=(r,e)=>{for(var t in e)de(r,t,{get:e[t],enumerable:!0})};var Q={};ue(Q,{HTMLJsconScrollThumbElement:()=>$,HTMLJsconScrollbarElement:()=>O});var J,O,$,ee=he(()=>{J=document.createElement("style");J.textContent=`
#container {
    display: block;
    width: var(--scrollbar-width);
    height: var(--scrollbar-height);
    overflow: hidden;
    position: relative;

    --scrollbar-size: 6px;
}
#container.is-horizontal {
    --scrollbar-width: 100%;
    --scrollbar-height: var(--scrollbar-size);
    cursor: w-resize;
}
#container.is-vertical {
    --scrollbar-width: var(--scrollbar-size);
    --scrollbar-height: 100%;
    cursor: n-resize;
}

#thumb {
    display: block;
    position: absolute;
    background: #cecfd1;
    border: 1px solid #cecfd1;
    border-radius: 3px;
    cursor: default;
    transition: background 0.1s;
    touch-action: none;
    box-sizing: border-box;

    visibility: hidden;
}
#thumb:hover {
    background: #c0c1c3;
}
#thumb:focus {
    border: 1px solid #aaaaaa;
    outline: none;
}
#thumb.visible {
    visibility: visible;
}
#thumb.moving {
    background: /*#c8c9cc*/#aeafb2;
    cursor: inherit;
}
`;O=class extends HTMLElement{#n=null;#t=null;#e=null;#a=null;constructor(){super(),this.#n=this.attachShadow({mode:"closed"}),this.#t=document.createElement("div"),this.#t.id="container",this.#e=document.createElement("jscon-scroll-thumb"),this.#e.id="thumb",this.#t.append(this.#e),this.#n.append(this.#t),this.#n.append(J.cloneNode(!0)),this.#a=new ResizeObserver(()=>{globalThis.requestAnimationFrame(()=>this.update())}),this.#e.addEventListener("pointerdown",this.#u.bind(this)),this.#e.addEventListener("pointermove",this.#m.bind(this)),this.#e.addEventListener("pointerup",this.#f.bind(this)),this.#e.addEventListener("pointercancel",this.#f.bind(this)),this.#e.addEventListener("contextmenu",()=>!1),this.#e.addEventListener("poschange",this.#b.bind(this))}get type(){return this.getAttribute("type")}set type(e){return this.setAttribute("type",e),!0}#i=0;get min(){return this.#i}set min(e){return this.#i=e,this.update(),!0}#l=1;get max(){return this.#l}set max(e){return this.#l=e,this.update(),!0}#s=0;get value(){return this.#s}set value(e){return this.#s=e,this.update(),!0}connectedCallback(){this.role="scrollbar",globalThis.requestAnimationFrame(()=>this.update()),this.#a?.observe(this)}disconnectedCallback(){this.#a?.unobserve(this)}static get observedAttributes(){return["type"]}attributeChangedCallback(e,t,n){globalThis.requestAnimationFrame(()=>this.update())}update(){{let o="remove",a="add";this.type==="horizontal"&&([o,a]=[a,o]),this.#t.classList[o]("is-horizontal"),this.#t.classList[a]("is-vertical")}if(isNaN(this.min)||isNaN(this.max))return;(isNaN(this.#s)||this.#s<this.min)&&(this.#s=this.min),this.#s>this.max&&(this.#s=this.max);let e=this.type==="horizontal"?this.#t.clientWidth:this.#t.clientHeight,t=this.max-this.min,n=this.#s-this.min,s=Math.max(6,Math.floor(e**2/t));s>e?this.#e.classList.remove("visible"):this.#e.classList.add("visible");let i=this.#s*(e-s)/t;{let o="width",a="height";this.type==="horizontal"&&([o,a]=[a,o]),this.#e.style[o]="var(--scrollbar-size)",this.#e.style[a]=s+"px",o="left",a="top",this.type==="horizontal"&&([o,a]=[a,o]),this.#e.style[o]="",this.#e.style[a]=i+"px"}this.dispatchEvent(new CustomEvent("scroll"))}#o=!1;#r=0;#u(e){this.#e.setPointerCapture(e.pointerId),this.#o=!0,this.#e.classList.add("moving"),this.#r=this.type==="horizontal"?e.offsetX:e.offsetY}#m(e){if(!this.#o)return;let t=this.type==="horizontal"?this.#t.clientWidth:this.#t.clientHeight,n=this.type==="horizontal"?e.offsetX:e.offsetY,s=this.max-this.min,i=Math.max(6,Math.floor(t**2/s)),o=this.#s*(t-i)/s,a=Math.min(t-i,Math.max(0,o+n-this.#r)),c,h;c="left",h="top",this.type==="horizontal"&&([c,h]=[h,c]),this.#e.style[c]="",this.#e.style[h]=a+"px",this.dispatchEvent(new CustomEvent("scrolling")),this.#s=this.min+a*s/(t-i)}#f(e){this.#o&&(this.#o=!1,this.#e.classList.remove("moving"),this.update())}#b(e){let t=this.type==="horizontal"?this.#t.clientWidth:this.#t.clientHeight,n=this.max-this.min,s=Math.max(6,Math.floor(t**2/n));switch(e.detail.type){case"update":this.value+=e.detail.data*(e.detail.altKey?1:20);break;case"updatepage":this.value+=e.detail.data*t;break;case"go":e.detail.data===1?this.value=this.max:e.detail.data===0&&(this.value=this.min);break;default:break}}},$=class extends HTMLElement{constructor(){super(),this.addEventListener("keydown",this.#n.bind(this),{capture:!0})}connectedCallback(){this.tabIndex=0}#n(e){switch(e.key){case"ArrowDown":case"ArrowUp":case"ArrowLeft":case"ArrowRight":this.dispatchEvent(new CustomEvent("poschange",{detail:{type:"update",data:e.key==="ArrowUp"||e.key==="ArrowLeft"?-1:1,altKey:e.altKey}}));break;case"PageDown":case"PageUp":this.dispatchEvent(new CustomEvent("poschange",{detail:{type:"updatepage",data:e.key==="PageUp"?-1:1,altKey:e.altKey}}));break;case"Home":case"End":this.dispatchEvent(new CustomEvent("poschange",{detail:{type:"go",data:e.key==="End"?1:0,altKey:e.altKey}}));break;default:return}return e.preventDefault(),e.stopPropagation(),!1}};customElements.define("jscon-scrollbar",O);customElements.define("jscon-scroll-thumb",$)});function pe(){return typeof document<"u"}function fe(){return typeof CSSStyleSheet<"u"&&!!document.adoptedStyleSheets&&typeof document.adoptedStyleSheets.push=="function"}function Y(r){if(!r&&!pe())throw new Error("No DOM detected")}function z(r,e=null){if(Y(e),fe()){let t=new CSSStyleSheet;return t.replace(r),e||(e=document),e.adoptedStyleSheets.push(t),Reflect.set(t,"remove",be.bind(null,t,e)),t}else{let t=document.createElement("style");return t.styleSheet?t.styleSheet.cssText=r:t.append(document.createTextNode(r)),(e||document.head||document.documentElement).append(t),t}}function be(r,e=null){if(Y(e),e||(e=document),r instanceof HTMLElement)return r.remove(),!r.isConnected;if(r instanceof CSSStyleSheet){let t=e.adoptedStyleSheets.indexOf(r);return t>-1?(e.adoptedStyleSheets.splice(t,1),!0):!1}return!1}var _e=BigInt("20250419224610"),A="fdf3404207ac433293f97c1dd3ca103a";function K(r){return r.preventDefault(),!1}var H=0,D=0;function me(r,e,t,n,s,i){let{container:o,isTranslatedToCenter:a}=s;if(t-=i.left,n-=i.top,t<0&&(t=0),n<0&&(n=0),t+r.$__BM_width>H&&(t=H-r.$__BM_width),n+r.$__BM_height>D&&(n=D-r.$__BM_height),a&&(t+=r.$__BM_width/2,n+=r.$__BM_height/2),e.style.left=t+"px",e.style.top=n+"px",o===document.documentElement){let c=e.getBoundingClientRect(),h=c.right>o.clientWidth?10:c.left<0?-10:0,f=c.bottom>o.clientHeight?10:c.top<0?-10:0;(h||f)&&window.scrollBy(h,f)}}function V(r,e){let t=0,n=r;do t+=n[e],n=n.offsetParent;while(n&&n!==document.body&&n!==document.documentElement);return t}function Z(r,e=r,t={container:null,isTranslatedToCenter:!1,isFixed:!1}){if(!r)throw new TypeError("Invalid paramters",arguments);t.container||(t.container=document.documentElement);let n={left:0,top:0};r.classList.add(A+"-el"),e.classList.add(A+"-target"),r.$__BM_target=e;function s(){return!1}function i(a){a.pointerId===r.$__BM_pointerId&&me(r,e,(t.isFixed?a.x:a.pageX)-r.$__BM_targetX,(t.isFixed?a.y:a.pageY)-r.$__BM_targetY,t,n)}function o(){r.classList.remove("moving"),e.classList.remove("moving"),delete r.$__BM_offsetX,delete r.$__BM_offsetY,delete r.$__BM_pointerId,r.removeEventListener("dragstart",s),r.removeEventListener("pointermove",i),r.removeEventListener("pointerup",o),r.removeEventListener("pointercancel",o)}r.$__PointerDownHandler=function(a){if(a.target.getAttribute("data-exclude-bindmove")==null){r.$__BM_offsetX=a.x,r.$__BM_offsetY=a.y;{let c=e.getBoundingClientRect();r.$__BM_targetX=r.$__BM_offsetX-c.x,r.$__BM_targetY=r.$__BM_offsetY-c.y,r.$__BM_width=Math.ceil(c.width),r.$__BM_height=Math.ceil(c.height)}n.left=V(t.container,"offsetLeft"),n.top=V(t.container,"offsetTop"),H=t.isFixed?t.container.clientWidth:t.container.scrollWidth,D=t.isFixed?t.container.clientHeight:t.container.scrollHeight,r.classList.add("moving"),e.classList.add("moving"),r.$__BM_pointerId=a.pointerId,r.setPointerCapture(a.pointerId),e.style.right=e.style.bottom="",r.addEventListener("pointermove",i),r.addEventListener("pointerup",o),r.addEventListener("pointercancel",o)}},r.addEventListener("pointerdown",r.$__PointerDownHandler),r.addEventListener("dragstart",K),r.addEventListener("contextmenu",K)}var B=z(`
.${A}-el { user-select: none; touch-action: none; }
.${A}-el.moving { cursor: move;}
.${A}-target { white-space: nowrap; }
.${A}-target.moving { transition: none; }
`);var R=class{#n=[];#t=1;#e=2;get[Symbol.toStringTag](){return"ZIndexManagerClass"}get activeElement(){return this.#n.length&&this.#n[this.#n.length-1]||null}constructor(){this.#t=1002,this.#e=1099}config(e,t){if(t<e)throw new TypeError("Invalid zIndexBase and zIndexMax");if(e<1)throw new TypeError("Invalid zIndexBase");this.#t=e,this.#e=t,this.update()}add(e){this.#n.includes(e)||(this.#n.push(e),this.update())}remove(e){let t=this.#n.indexOf(e);t!==-1&&(this.#n.splice(t,1),this.update())}#a(){let e=this.#t,t=0,n=this.#n.length,s=this.#e-this.#t+1;if(n>s){let a=n-s+1,c=0,h=c+a,f=this.#n.slice(c,h);for(let x of f)x.style.zIndex=this.#t;t=a,++e}let i=t===0?this.#n:this.#n.slice(t);for(let o of i)console.assert(e<=this.#e),o.style.zIndex=e++}#i=!1;update(){this.#i||(this.#i=!0,requestAnimationFrame(()=>{this.#a(),this.#i=!1}))}activate(e){e&&e!==this.activeElement&&this.#n.includes(e)&&(this.#n.splice(this.#n.indexOf(e),1),this.#n.push(e),this.update())}deactivate(e){this.#n.includes(e)&&(this.#n.splice(this.#n.indexOf(e),1),this.#n.splice(0,0,e)),this.update()}};var ge=`
:host:not(:has([slot="widget-caption"])) {
    --no-caption: none;
}
:host {
    position: absolute;
    z-index: 1002;
    -webkit-app-region: no-drag; app-region: no-drag;
    background: transparent;
    padding: 10px;
    touch-action: none;
    box-sizing: border-box;
}
:host(:not([open])) { display: none; }
:host(:focus-visible), :host(:focus) {
    outline: none;
    --focus-visible: "[+]";
}
resizable-widget-content-container-5e5921c2 {
    display: flex;
    flex-direction: column;
    background-color: var(--background, #FFFFFF);
    outline: var(--focus-visible, none);
    box-shadow: 0 0 10px 0 #ccc;
    white-space: nowrap;
    cursor: auto;
    box-sizing: border-box;
    width: 100%; height: 100%;
    overflow: hidden;
    touch-action: revert;
    border-radius: 5px;
}
#caption {
    user-select: none;
    padding: 5px;
    border-bottom: 1px solid var(--border-color, currentColor);
    display: var(--no-caption, revert);
}
#container {
    padding: var(--padding, 10px);
    flex: 1;
    overflow: auto;
}
`,M=new R,q=class r extends HTMLElement{#n=null;#t=null;#e=null;get[Symbol.toStringTag](){return"HTMLResizableWidgetElement"}constructor(){super(),this.#n=this.attachShadow({mode:"open"}),z(ge,this.#n),this.#n.adoptedStyleSheets?this.#n.adoptedStyleSheets.push(B):this.#n.append(B),this.#e=document.createElement("resizable-widget-content-container-5e5921c2"),this.#n.append(this.#e),this.#t=document.createElement("div"),this.#t.id="caption",this.#t.innerHTML='<slot name="widget-caption"></slot>',this.#e.append(this.#t);let e=document.createElement("div");e.id="container",this.#e.append(e),e.append(document.createElement("slot")),queueMicrotask(()=>Z(this.#t,this,{container:this.offsetParent})),this.#e.addEventListener("pointermove",n=>{n.stopPropagation()}),this.addEventListener("contextmenu",n=>{n.composedPath()[0]===this&&n.preventDefault()}),this.addEventListener("keydown",this.#b.bind(this)),this.addEventListener("pointermove",this.#u.bind(this)),this.addEventListener("pointerdown",this.#m.bind(this));let t=this.#f.bind(this);this.addEventListener("pointerup",t),this.addEventListener("pointercancel",t)}connectedCallback(){this.tabIndex=0,this.#a()}disconnectedCallback(){this.zIndexManagementProhibited||M.deactivate(this),M.remove(this)}attributeChangedCallback(e,t,n){e==="z-index-management-prohibited"&&this.#a(t==null)}static get observedAttributes(){return["z-index-management-prohibited"]}get open(){return this.getAttribute("open")!=null}set open(e){return e?(this.setAttribute("open",""),this.focus()):this.removeAttribute("open"),this.zIndexManagementProhibited||M.activate(this),!0}get zIndexManagementProhibited(){return this.getAttribute("z-index-management-prohibited")!=null}set zIndexManagementProhibited(e){return e?this.setAttribute("z-index-management-prohibited",""):this.removeAttribute("z-index-management-prohibited"),!0}#a(e=null){!this.zIndexManagementProhibited&&this.isConnected?M.add(this):(M.remove(this),e&&(this.style.zIndex="")),M.update()}static get MIN_SIZE(){return 50}static get SIZING_ATTRS(){return["left","top","width","height"]}#i(e,t,n=1,s=!1){if(e<1)return 0;if(s)return e;let i=getComputedStyle(this),o=this.offsetParent===document.body?document.documentElement:this.offsetParent,a=n*(t==="x"?parseInt(i.left):t==="y"?parseInt(i.top):0);return t==="x"&&o.clientWidth>0&&e+a>o.clientWidth?o.clientWidth-a:t==="y"&&o.clientHeight>0&&e+a>o.clientHeight?o.clientHeight-a:e}close(){this.open=!1}activate(){if(this.zIndexManagementProhibited)throw new TypeError("zIndexManagement is prohibited");M.activate(this)}#l=!1;#s={a:0,b:0};#o=null;#r=-1;#u(e){if(!e.isPrimary)return;if(this.#l){let a=()=>{parseInt(this.style.width)<r.MIN_SIZE&&(this.style.width=r.MIN_SIZE+"px"),parseInt(this.style.height)<r.MIN_SIZE&&(this.style.height=r.MIN_SIZE+"px")};if(this.#s.a)do{let c=e.x-this.#o.x;if(this.#s.a<0){let h=this.#o.x,f=this.#i(e.x,"x",0,!0)-this.#o.offsetX;f=Math.min(Math.max(f,0),this.#o.left+this.#o.width-r.MIN_SIZE),this.style.left=f+"px";let x=h-f,S=this.#o.width+x-this.#o.offsetX;this.style.width=S+"px"}else this.style.width=this.#i(this.#o.width+c,"x")+"px"}while(!1);if(this.#s.b)do{let c=e.y-this.#o.y;if(this.#s.b<0){let h=this.#o.y,f=this.#i(e.y,"y",0,!0)-this.#o.offsetY;f=Math.min(Math.max(f,0),this.#o.top+this.#o.height-r.MIN_SIZE),this.style.top=f+"px";let x=h-f,S=this.#o.height+x-this.#o.offsetY;this.style.height=S+"px"}else this.style.height=this.#i(this.#o.height+c,"y")+"px"}while(!1);a();return}let t=e.offsetX,n=e.offsetY,s=this.clientWidth-t,i=this.clientHeight-n,o="";i<=10&&(o+="s"),n<=10&&(o+="n"),s<=10&&(o+="e"),t<=10&&(o+="w"),o+="-resize",this.style.cursor=o}#m(e){if(this.zIndexManagementProhibited||M.activate(this),!e.isPrimary||e.composedPath()[0]!==this)return;this.setPointerCapture(this.#r=e.pointerId),this.#l=!0;let t=e.offsetX,n=e.offsetY,s=this.clientWidth-t;this.clientHeight-n<=10&&(this.#s.b=1),n<=10&&(this.#s.b=-1),s<=10&&(this.#s.a=1),t<=10&&(this.#s.a=-1),this.#o={x:e.x,y:e.y,offsetX:e.offsetX,offsetY:e.offsetY,left:this.offsetLeft,top:this.offsetTop,width:this.clientWidth,height:this.clientHeight}}#f(e){this.#l=!1,[this.#s.a,this.#s.b]=[0,0],this.#r=-1}#b(e){if(e.composedPath()[0]===this&&e.key==="Escape"&&this.#l){this.releasePointerCapture(this.#r),this.#l=!1;for(let t of r.SIZING_ATTRS)this.style[t]=this.#o[t]+"px";return!1}}},G=!1;function ye(r="resizable-widget",e=!1){if(!(G&&!e))return G=!0,customElements.get(r)?(globalThis.console.warn("%c[npm::resizable-widget] %cERR! %CDuplicated element registration.","color: #007700","color: red; font-weight: bold;","font-weight: bold;"),null):customElements.define(r,q)}var Ie=ye();var re=document.createElement("template");re.innerHTML=`
<resizable-widget>
    <widget-caption slot="widget-caption">
        <span>JavaScript Console</span>
        <button class=jscon-btn data-id=CLOSE style="float:right" data-exclude-bindmove>x</button>
    </widget-caption>
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
        <jscon-tabbar data-id="TABS">
            <jscon-tab is-current>Console</jscon-tab>
            <jscon-tab>Source</jscon-tab>
            <jscon-tab>Network</jscon-tab>
            <jscon-tab>User</jscon-tab>
        </jscon-tabbar>

        <div class="panels">
            <div data-panel="Console" class="console-panel">
                <div class="console-btns">
                    <button class="jscon-btn" data-id="ClearConsole" title="Clear console (Ctrl+L)">Clear</button>
                    <span class=split></span>
                    <label><input type=checkbox data-id="con_opts"><select data-id="con_opts_label"></select></label>
                    <span class=split></span>
                    <input placeholder="Filter..." disabled style="flex:1;min-width:1px" data-id="ConsoleFilter" />
                </div>
                <div class="console-content" tabindex=0>
                    <div class="console-messages" aria-label="Console Messages">
                    
                    </div>
                    <div class="console-input" aria-label="Input code to evalute it">
                        <div style="display: inline-flex; flex: 1; flex-direction: column;">
                            <textarea data-id="cons" rows=1></textarea>
                            <jscon-scrollbar data-id="cons_sc2" type=horizontal min=0></jscon-scrollbar>
                        </div>
                        <jscon-scrollbar data-id="cons_sc" min=0></jscon-scrollbar>
                    </div>
                </div>
            </div>

            <div data-panel="Source" class="source-panel" hidden>
                <div class="panel-left">

                </div>

                <div class="panel-right">
                    <jscon-tabbar data-id="SourceTabs">
                        <jscon-tab is-current>+</jscon-tab>
                    </jscon-tabbar>

                    <div class="flex-1 code-viewer" hidden></div>
                    <div class="flex-1" data-id="Tab_NewSource" style="padding: 20px">
                        <label style="display:flex">Input source URL: &nbsp;<input data-id="SourceURL" type=text style="flex:1"></label>
                        <button data-id="OpenSource" type=button>Open Source</button>
                    </div>
                </div>
            </div>

            <div data-panel="Network" hidden>
                Network
            </div>

            <div data-panel="User" hidden style="overflow: auto; padding: 10px;">
                <form class="user-settings">
                    <fieldset>
                        <legend>User Settings</legend>
                        <div>
                            <div><button type=button data-id=ClearConHist>Clear Console History</button></div>
                            <div><button type=button data-id=ResetSettings>Reset all settings</button></div>
                        
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Window Options</legend>
                        <div>
                            <div><button type=button data-id=RenderAsTopLayer>Render as #top-layer</button></div>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    </div>
</resizable-widget>

<dialog data-id="top-layer-container"></dialog>

<dialog data-id="allowPasteConfirm">
    <div>Are you sure you want to allow paste?</div>
    <form method=dialog>
        <button type=submit data-id="doAllowPaste">Yes</button>
        <button type=submit autofocus>No</button>
    </form>
</dialog>

<div class="jscon-messages-container"></div>
`;var te=`

[hidden] {
    display: none!important;
}
:host {
    all: initial;
    --font-monospace: consolas, lucida console, courier new, monospace;
    --background: #FFFFFF;
}
resizable-widget, dialog > resizable-widget {
    z-index: 1073741823;
    left: 20px; top: 20px;
    width: 60%; height: 60%;
    --padding: 0;
}
dialog[data-id="top-layer-container"] {
    overflow: visible;
    margin: 0; padding: 0; border: 0;
}
::selection {
    background-color: rgb(141 199 248 / 60%);
}
.jscon-btn {
    border: 0; background: var(--background, inherit);
    transition: .1s;
}
.jscon-btn:hover {
    --background: var(--color-scheme-background-hover, #dee1e6);
}
.panels {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.panels > * {
    flex: 1;
}
.console-panel {
    display: flex; flex-direction: column; 
    flex: 1; overflow: hidden;
}
.console-btns {
    display: flex;
    border-bottom: 1px solid;
    padding: 5px;
}
.console-btns * {
    font-family: monospace;
    font-size: small;
}
.console-btns button {
    padding: 0;
}
.console-btns .split {
    border-right: 1px solid;
    display: inline-block;
    width: 1px;
    margin: 0 5px;
}
.console-messages {
    flex: 1;
    cursor: default;
}
.console-messages > .row {
    font-family: var(--font-monospace);
    border-bottom: 1px solid #f0f0f0;
    padding: 2px 5px;
    font-size: small;
    white-space: pre-wrap; word-break: break-all;
    background: var(--background, inherit);
}
.console-content {
    padding: 10px;
    padding-top: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
}
.console-input {
    display: flex;
    margin-top: 5px;
}
.console-input::before {
    content: ">";
    font-family: monospace;
    display: inline-block;
    width: 1em; height: 1em;
    color: #367cf1;
}
.console-input [data-id="cons"] {
    border: none;
    outline: none;
    resize: none;
    padding: 0;
    flex: 1;
    max-height: 10em;
    white-space: pre;
    font-family: consolas, lucida console, courier new, monospace;
}
.console-input [data-id="cons"]::-webkit-scrollbar {
    width: 0; height: 0;
}
.is-symbol, .is-regexp { color: #c80000 }
.is-number, .is-boolean { color: #1a1aa6 }
.is-null, .is-undefined { color: #80868b }
.is-object, .is-function { font-style: italic }
.is-error { display: block }
.row[data-type=error] {
    --background: #fff0f0;
    color: red;
}
.row[data-type=warn] {
    --background: #fffbe6;
    color: #5c3c00;
}
.row:focus, .row:focus-visible {
    outline: 0;
    --background: var(--background-row-focus, #ecf1f8);
}
.row[data-repeat-count]::before {
    content: attr(data-repeat-count);
    border: 1px solid;
    padding: 2px;
    margin-right: 5px;
    border-radius: 10px;
    display: inline-block;
    width: auto;
}
.row a.ref {
    color: var(--ref-link-color, #5f6368);
}
.row a.ref:focus {
    outline: 2px solid;
}
.source-panel {
    display: flex;
}
.source-panel > .panel-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.source-panel > .panel-right > .flex-1 {
    flex: 1;
}
.user-settings fieldset+fieldset {
    margin-top: 10px;
}
.jscon-messages-container {
    position: fixed;
    right: 0;
    top: calc(env(titlebar-area-y, 0px) + env(titlebar-area-height, 0px));
    z-index: 1073741823;
    height: 0;
    overflow: visible;
}
.jscon-message {
    box-sizing: border-box;
    padding: 10px;
    width: 360px;
    /*border: 1px solid gray;*/
    border-radius: 10px;
    background: var(--background);
    margin: 10px;
    box-shadow: 0 0 5px 0 #ccc;
    cursor: pointer;
    transition: all .1s;
    font-family: Consolas, monospace;
    -webkit-app-region: no-drag;
    app-region: no-drag;

    position: relative;
    top: 0;
}
.jscon-message:hover {
    --background: var(--color-scheme-background-hover, #f0f0f0);
}
.jscon-message.not-open {
    top: -200px;
}
@media screen and (max-width: 380px) {
.jscon-message {
    width: calc(100vw - 20px);
}
}

.jscon-message.is-error {
    --title-color: red;
}

`,ne=(function(){if("adoptedStyleSheets"in document){let e=new CSSStyleSheet;return e.replace(te),e}let r=document.createElement("style");return r.innerHTML=te,r})(),ae=document.createElement("template");ae.innerHTML=`
<div style="margin-bottom: 8px; color: var(--title-color, currentColor)">
    <span style="font-weight: bold"><slot name="title"></slot></span>
    <button type=button id=close style="float: right; border: 0; cursor: pointer; background: inherit; color: gray">x</button>
</div>
<div><slot></slot></div>
`;var le=document.createElement("template");le.innerHTML=`<!--
--><style>
a { text-decoration: none; cursor: pointer } a:hover { text-decoration: underline }
::selection { background-color: rgb(141 199 248 / 60%) }
#wrapper {
    display: inline-block;
    outline: 0;
    font-family: var(--font-monospace, monospace);
}
#wrapper:focus>.object-prototype-name, #wrapper:focus-visible>.object-prototype-name {
    background-color: #e2eaf3;
}
.object-prototype-name {
    font-style: italic;
    display: inline-block;
    padding: 2px;
    border-radius: 5px;
    user-select: none;
    cursor: default;
}
.object-prototype-name::before {
    content: "+";
    margin-right: 5px;
    font-style: normal;
    color: gray;
}
.object-prototype-name.open::before {
    content: "-";
    margin-right: 5px;
}
#re_eval { color: gray; font-style: italic; }
#re_eval:not([hidden]) { margin-left: 0.5em }
#viewer:not([hidden]) { margin-left: 1em }
#viewer .property {
    display: flex;
    align-items: flex-start;
    cursor: default;
}
#viewer .property-key {
    padding: 2px;
    color: #881280;
    white-space: nowrap;
}
#viewer .property-key.is-unenumerable { opacity: 0.6; }
#viewer .property-key.is-internal { color: #5f6368; }
#viewer .property-key.is-own { font-weight: bold; }
#viewer .property-key::after {
    content: ":";
    color: var(--text-color, black);
    margin-right: 3px;
}
#viewer .property-value:not(jscon-object-viewer) {
    padding: 2px;
}
#viewer .property-value.is-string {
    color: #c80000;
}
#viewer .property-value.is-string::before, #viewer .property-value.is-string::after {
    content: "\\"";
}
#viewer .property:has(jscon-object-viewer[open]) {
    flex-direction: column;
}
#viewer .property:has(jscon-object-viewer[open]) jscon-object-viewer[open] {
    margin-left: 1em;
}
#viewer:empty::before {
    content: "(no attribute)";
    font-style: italic;
    color: gray;
    margin-left: 2em;
}
</style><div id="wrapper" tabindex=0><!--
--><span class="object-prototype-name"><slot></slot></span><!--
--><a id="re_eval" href="javascript:" hidden>re-evaluate</a><!--
--><div id="viewer" hidden></div></div>`;var ce=document.createElement("template");ce.innerHTML=`
<div id=container>
    <span class="jscon-tabbar-placeholder">&NoBreak;</span>
</div>

<style>
#container {
    display: flex;
    background: var(--background);
    user-select: none;
    overflow: auto;
    --background: var(--color-scheme-background, #f1f3f4);
    --border-bottom-color: #cacdd1;
}
#container::-webkit-scrollbar {
    width: 0; height: 0;
}
.jscon-btn {
    cursor: pointer;
    border: 0; background: var(--background, inherit);
    transition: .1s;
}
.jscon-btn:hover {
    --background: var(--color-scheme-background-hover, #dee1e6);
}
.jscon-btn:active {
    --background: var(--color-scheme-background-active, #cccccc);
}
.jscon-tabbtn {
    --background: var(--color-scheme-background, #f1f3f4);
    padding: 5px 10px; margin: 0;
    border-bottom: 1px solid var(--border-bottom-color);
}
#container>.jscon-tabbtn * {
    pointer-events: none; /* \u65B9\u4FBF\u5224\u65ADev.target */
}
#container>.jscon-tabbar-placeholder {
    flex: 1;
    border-bottom: 1px solid var(--border-bottom-color);
}
.jscon-tabbtn[data-is-current] {
    border-bottom: 2px solid #1a73e8;
    padding-bottom: 4px;
}
.jscon-closebtn {
    display: inline-block;
    margin-left: 5px;
    visibility: hidden;
    pointer-events: auto !important;
}
.jscon-tabbtn:hover .jscon-closebtn,
.jscon-tabbtn:focus .jscon-closebtn,
.jscon-tabbtn:focus-within .jscon-closebtn {
    visibility: visible;
}
.jscon-tabbtn:has(.jscon-closebtn:hover) {
    --background: var(--color-scheme-background, #f1f3f4);
}
.jscon-closebtn:empty::after {
    content: "x";
    font-family: sans-serif;
    display: inline-block;
}
</style>
`;try{await Promise.resolve().then(()=>(ee(),Q))}catch{}function Re(){}var ve=["a","button"],se=1e3,we=100,xe=/([A-z]|[0-9]|\\|\/|\?|\[|\]|\;|\:|\,|\.|\#|\$|\%|\@|\&|\-|\+|\=|\{|\})/,ie={allowPaste:!1,allowClear:!0,useStrict:{label:"'use strict'",value:!1},sandbox:{label:"Run code in sandbox",enforced:!0},notifications:!0,recordHistory:!0},F=class r extends Error{constructor(...e){super(...e),Error.captureStackTrace&&Error.captureStackTrace(this,r),this.name="Tracker"}};function N(r,e,t=1,n={}){let s=N.__data__[String(t)][0],i=N.__data__[String(t)][1];if(!r||n.deep&&n.deep>24)return null;if(r.childElementCount){if(n.isChild2&&e(r))return r;t<0&&!(n.isChild||n.isChild2)&&(r=r[s]||r);let c=N(r[i],e,t,{isChild:!0,isChild2:t<0,isChild3:t<0});return c||(n.isChild&&e(r)?r:null)}let o=r,a=!0;for(;o;){if(a&&n.isChild&&e(o))return o;let c=o[s];if(!c){let h=0,f=o;for(;h++<24;){if(f=f.parentElement,(n.isChild3||t<0)&&e(f))return f;if(f[s])return N(f[s],e,t,{deep:(n.deep||0)+1,isChild2:!0})}return null}if(o=c,e(o))return o;a&&(a=!1)}return null}N.__data__={"-1":["previousElementSibling","lastElementChild"],1:["nextElementSibling","firstElementChild"]};var U=class{#n=null;#t=null;constructor(e){if(!e)throw new TypeError("Failed to construct DataManager: 1 paramater required");this.#n=e,this.update(!0)}#e=0;update(e=!1){let t=new Date().getTime();if(!(!e&&t-this.#e<1e3)){this.#e=t;try{if(this.#t=JSON.parse(localStorage.getItem(this.#n)),!this.#t)throw 0}catch{this.clear()}}}save(){try{return localStorage.setItem(this.#n,JSON.stringify(this.#t)),!0}catch{return!1}return null}get(e){return this.update(),Reflect.get(this.#t,e)}set(e,t){return Reflect.set(this.#t,e,t),this.save()}clear(){return this.#t={},this.save()}},I=new U("jscon-web-data"),oe=class r extends EventTarget{#n=null;#t=null;#e=null;#a=null;#i=null;#l=null;#s=new Array;#o=-1;#r=new Map;#u=!1;get[Symbol.toStringTag](){return"JsCon"}constructor(){super(),this.#n=document.createElement("jscon-console-root"),this.#t=this.#n.attachShadow({mode:"open"}),this.#t.append(re.content.cloneNode(!0)),"adoptedStyleSheets"in document?(this.#t.adoptedStyleSheets.push(...document.adoptedStyleSheets),this.#t.adoptedStyleSheets.push(ne)):(document.head.querySelectorAll("style,link[rel=stylesheet]").forEach(e=>this.#t.append(e.cloneNode(!0))),this.#t.append(ne.cloneNode(!0))),this.#e=this.#t.firstElementChild,customElements.whenDefined("resizable-widget").then(()=>{z("#container{overflow:hidden}",this.#e.shadowRoot)}),this.#a=this.#t.querySelector(".console-messages"),this.#l=this.#t.querySelector(".jscon-messages-container"),(document.body||document.documentElement).append(this.#n),this.#m(),this.#S(),this.#_()}#m(){this.#r.label=s=>{let i=this.#r.get(s);if(i.label)return i.label;let o="";for(let a of s)/[A-Z]/.test(a)?o+=" "+a.toLowerCase():o+=a;return o=o[0].toUpperCase()+o.substring(1),o},this.#r.check=s=>{let i=this.#r.get(s);return i===!0?!0:i?!!(i.enforced||i.value):!1},this.#r.__hooks__=new Map,this.#r.hook=(s,i)=>{let o=[i],a=this.#r.__hooks__.get(s),c=a?a.concat(o):o;this.#r.__hooks__.set(s,c)},this.#r.unhook=s=>{this.#r.__hooks__.delete(s)},this.#r.update=(s,i)=>{let o=this.#r.__hooks__.get(s);if(o){let c=!1,h=()=>c=!0;for(let f of o)f(h);if(c)return!1}let a=this.#r.get(s);return a===!1||a===!0||a==null?(I.set(s,i),this.#r.set(s,i)):(!a&&(a={}),a.value=i,I.set(s,a),this.#r.set(s,a))};for(let s in ie){let i=I.get(s);i==null&&(i=ie[s]),this.#r.set(s,i)}let e=this.#e.querySelector("[data-id=con_opts]"),t=this.#e.querySelector("[data-id=con_opts_label]"),n=!0;for(let s of this.#r.keys()){let i=this.#r.label(s),o=document.createElement("option");o.value=s,o.innerText=i,t.append(o),n&&(n=!1,e.checked=this.options.check(s),e.disabled=!!this.options.get(s)?.enforced)}}#f=null;#b(){let e=this.#e.querySelector("[data-id=cons_sc]"),t=this.#e.querySelector("[data-id=cons_sc2]"),n=Math.max(0,this.#i.scrollHeight-this.#i.offsetHeight),s=this.#i.scrollTop;e.value=s,e.max=n;let i=Math.max(0,this.#i.scrollWidth-this.#i.offsetWidth),o=this.#i.scrollLeft;t.value=o,t.max=i}#S(){this.forbiddenConsoleAPIs={has:s=>this.#p.has(s),values:()=>{let s=[];for(let i of this.#p)s.push(i);return s},add:s=>(this.#p.add(s),!0)};let e=this.#e.querySelector("[data-id=TABS]"),t=this.#e.querySelector("[data-id=SourceTabs]");this.#v.add=s=>{e.currentTab=1;let i=new URL(s,location.href),o=i.pathname.substring(i.pathname.lastIndexOf("/")+1)||"(index)";return t.addTab(encodeURI(i.href),o,!1,!0,0),t.currentTab=0,this.#v.set(s,null)};let n=I.get("console-history");n&&(this.#s=n),this.#i=this.#e.querySelector("[data-id=cons]"),this.#f=new ResizeObserver(()=>{this.#b()}),this.#f.observe(this.#i)}#_(){this.#e.addEventListener("beforeclose",function(l){}),this.#e.addEventListener("keydown",l=>{if(l.key.toUpperCase()==="L"&&l.ctrlKey)return l.preventDefault(),this.doClear()},!0),this.#e.querySelector("[data-id=CLOSE]").addEventListener("click",()=>this.close());let t=this.#e.querySelector("[data-id=TABS]");t.addEventListener("change",l=>{this.#t.querySelectorAll(".panels > *").forEach(p=>p.hidden=!0),(this.#t.querySelector(`.panels > [data-panel="${t.currentId}"]`)||{}).hidden=!1});let n=this.#i;n.addEventListener("keydown",l=>{if(l.key==="Enter"&&!l.shiftKey)return l.isTrusted?(l.preventDefault(),queueMicrotask(()=>this.#k(n))):void 0;if(l.key==="ArrowDown"||l.key==="ArrowUp"){let p=n.selectionStart,v=n.value.split(`
`).length,_=n.value.substring(0,p).split(`
`).length;if(l.key==="ArrowDown"&&_===v||l.key==="ArrowUp"&&_===1){l.preventDefault(),this.#o<0&&(this.#o=this.#s.length),this.#o+=l.key==="ArrowDown"?1:-1,this.#o=Math.max(0,Math.min(this.#s.length-1,this.#o));let j=this.#s[this.#o];if(!j)return;n.value=j,n.rows=j.split(`
`).length,n.selectionStart=n.selectionEnd=0}return}if(l.key==="Tab"){let p=n.value;if(!p)return;l.preventDefault();let v=n.selectionStart,k=p.split(`
`),j=p.substring(0,v).split(`
`).length-1,T=k[j];if(T){let C=0;if(l.shiftKey){let P=4;for(;P--&&T[0]===" ";)T=T.substring(1),C-=1}else C=4,T="    "+T;k.splice(j,1,T),n.value=k.join(`
`),n.selectionStart=n.selectionEnd=v+C}return}}),n.addEventListener("input",()=>{let p=n.value.split(`
`).length,v=+n.rows;p!==v&&(n.rows=p),this.#b()}),n.addEventListener("scroll",()=>{this.#b()});let s=this.#e.querySelector("[data-id=cons_sc]"),i=this.#e.querySelector("[data-id=cons_sc2]"),o=()=>{n.scrollTop=s.value},a=()=>{n.scrollLeft=i.value};s.addEventListener("scrolling",o),s.addEventListener("scroll",o),i.addEventListener("scrolling",a),i.addEventListener("scroll",a);let c=l=>{this.options.check("allowPaste")||l.preventDefault()};n.addEventListener("paste",c),n.addEventListener("drop",c),this.#t.querySelector("[data-id=ClearConsole]").addEventListener("click",()=>this.doClear());let f=this.#t.querySelector("[data-id=allowPasteConfirm]"),x=this.#t.querySelector("[data-id=doAllowPaste]"),S=this.#t.querySelector("[data-id=con_opts]"),E=this.#t.querySelector("[data-id=con_opts_label]");E.onchange=()=>{let l=E.value,p=this.options.check(l);S.checked=p,S.disabled=!!this.options.get(l)?.enforced},S.addEventListener("input",l=>{let p=E.value;this.options.update(p,S.checked);let v=this.options.check(p);S.checked=v,S.disabled=!!this.options.get(p)?.enforced}),x.addEventListener("click",l=>{let p={enforced:!0};this.options.set("allowPaste",p),I.set("allowPaste",p),E.onchange()}),this.options.hook("allowPaste",l=>{l(),f.showModal()});let m=this.#t.querySelector("[data-id=ResetSettings]");m.onclick=()=>{confirm("Are you sure?")&&(I.clear(),location.reload())};let g=this.#t.querySelector("[data-id=ClearConHist]");g.onclick=()=>{if(g.$__CONFIRM__)return this.#w("Console history was cleared","User Settings"),g.innerText=g.$__INNERTEXT__,delete g.$__CONFIRM__,delete g.$__INNERTEXT__,I.set("console-history",this.#s=[]);g.$__CONFIRM__=!0,g.$__INNERTEXT__=g.innerText,g.innerText="Confirm"};let b=this.#t.querySelector("[data-id=RenderAsTopLayer]"),L=this.#t.querySelector('[data-id="top-layer-container"]');b.onclick=()=>{if(this.#e.parentNode!==this.#t)return;let l=getComputedStyle(this.#e);this.#e.style.width=l.width,this.#e.style.height=l.height,L.append(this.#e),L.showModal()},L.onclose=()=>{L.before(this.#e)};let d=this.#t.querySelector(".console-messages");d.addEventListener("keydown",l=>{if(l.key==="Tab"&&l.isTrusted)l.preventDefault(),l.shiftKey?d.parentElement.focus():n.focus();else if(l.key==="ArrowDown"||l.key==="ArrowUp"){l.preventDefault();let p=l.key==="ArrowDown",v=p?["firstElementChild","nextElementSibling"]:["lastElementChild","previousElementSibling"],k=l.target,_=d;N(k,C=>{let P=C.tabIndex;return P!=null&&P!==-1||ve.includes(C.tagName?.toLowerCase())},p?1:-1)?.focus()}else if(l.key==="Home")l.preventDefault(),d.firstElementChild?.focus();else if(l.key==="End")l.preventDefault(),d.lastElementChild?.focus();else if(l.key==="Delete"){let p=l.composedPath();for(let v of p)if(v?.classList?.contains("row")){(v.nextElementSibling||v.previousElementSibling)?.focus(),v.remove();break}}},!0),d.addEventListener("click",l=>{let p=l.target;if(p.tagName?.toLowerCase()==="a"){l.preventDefault();try{let v=new URL(p._url);if(v.origin!==globalThis.location.origin){window.open(v,"_blank");return}let k=this.#a.parentElement.scrollTop;this.sources.add(String(v)),queueMicrotask(()=>this.#a.parentElement.scrollTop=k)}catch{}}},!0),d.addEventListener("pointerdown",l=>{if(l.target?.tagName?.toUpperCase()!=="A"||l.button!==1)return;let p=l.target.getAttribute("href");!p||p.startsWith("javascript:")||l.preventDefault()},!0);let u=l=>{l.target.tagName?.toLowerCase()==="a"&&l.preventDefault()};d.addEventListener("contextmenu",u,!0),d.addEventListener("dragstart",u,!0);let y=this.#t.querySelector("[data-id=SourceURL]"),w=this.#t.querySelector("[data-id=OpenSource]");w.onclick=()=>{if(y.value)try{let l=new URL(y.value);this.sources.add(l.href)}catch(l){this.error("Invalid URL:",y.value,`
(error:`,l,")")}}}disableObject(){if(this.#u)throw new TypeError("object is already disabled");this.#u=!0,this.#d(['<hr><div style="color: red; font-size: x-large; text-align: center;"><b>!!</b>CONSOLE IS DISABLED<b>!!</b></div>'],"info",!0),this.#d(['<div style="text-align: center;"><b>Type "close" or "x" to close the console</b></div><hr>'],"info",!0),this.#e.querySelectorAll(".console-btns,jscon-tabbar,[data-panel][hidden]").forEach(e=>e.remove())}get options(){return this.#r}set options(e){throw new DOMException("Cannot set readonly property","SecurityError")}#T(e){let t=document.createElement("jscon-object-viewer");return t.classList.add("is-object-view"),t.data=e,t}#d(e,t="log",n=!1){let s=document.createElement("div");s.tabIndex=0,s.classList.add("row");let i=[];for(let E=0;E<e.length;++E)try{let m=e[E],g=typeof m;if((t==="dir"||g==="object")&&m!=null&&(!(m instanceof Error||m instanceof RegExp)||t==="dir")){let b=this.#T(m);if(!b)throw new Error("Internal Error: Assertion Failed");i.push(b)}else{let b=document.createElement("span");switch(g){case"string":b.classList.add("is-string"),b[n?"innerHTML":"innerText"]=b._text=m;break;case"number":case"symbol":case"boolean":case"function":case"undefined":b.classList.add("is-"+g),b.innerText=b._text=String(m);break;case"object":m===null?(b.classList.add("is-null"),b.innerText=b._text=String(m)):m instanceof RegExp?(b.classList.add("is-regexp"),b.innerText=b._text=String(m)):m instanceof Error?(b.classList.add("is-error"),b.innerText=b._text=String(m)+`
`+String(m.stack)):(b.classList.add("is-object"),b.innerText=b._text=String(m));break;default:b.innerText=b._text=String(m)}i.push(b)}i.push(" ")}catch(m){let g=document.createElement("span");g.style.color="red";try{g.innerText=g._text=`[Error writing console: ${m}]`}catch{try{g.innerText=g._text=`[Error writing console: ${Object.toString.call(m)}]`}catch{g.innerText=g._text="[Error writing console: Unknown Error]"}}i.push(g),i.push(" ")}i.pop();for(let E of i){if(E._text?.includes("http")){let m=E._text,g=m.length;E.innerHTML="";let b=0,L=0;for(;;){let d=m.indexOf("http",b);if(d<0)break;let u=g;for(let l=d;l<g;++l)if(!xe.test(m[l])){u=l;break}let y=m.substring(d,u);E.append(m.substring(L,d));let w=document.createElement("a");w.href="#/$console/refs/Ref@source",w.innerText=w._url=y,w.className="ref",E.append(w),b=d+1,L=u}E.append(m.substring(L))}s.append(E)}s.dataset.type=t;let o=this.#e.querySelector(".console-content"),a=o.scrollTop+o.offsetHeight,h=o.scrollHeight-a<30,f=this.#a.lastElementChild,x=!1;if(this.#a.append(s),f&&f.innerText===s.innerText&&f.dataset.type===s.dataset.type){x=!0;let E=f.dataset.repeatCount;E||(E=1),f.dataset.repeatCount=++E,s.remove()}else this.#a.childElementCount>2e3&&this.#a.firstElementChild.remove();let S=this.#e.querySelector("[data-id=cons]");return S.rows=1,h&&(o.scrollTop=o.offsetHeight+o.scrollHeight),x?f:s}#x(e){let t=document.createElement("div");t.tabIndex=0,t.classList.add("row");let n=document.createElement("span");n.className="is-null",n.style.fontStyle="italic",n.innerText=e,t.append(n),this.#a.append(t)}#p=new Set(["close"]);#E=!1;forbiddenConsoleAPIs=null;#k(e){let t=e.value;if(!t)return!1;e.value="",this.log(">",t),this.#o=-1,this.#s[this.#s.length-1]!==t&&this.options.check("recordHistory")&&(this.#s.push(t),this.#s.length>se&&this.#s.splice(0,this.#s.length-se),I.set("console-history",this.#s));let n=this,s=new Proxy({},{get(c,h,f){if(n.#p.has(h))throw new DOMException("Access denied","SecurityError");if(h in{self:1,top:1,parent:1,window:1,globalThis:1})return s;let x=Reflect.get(globalThis,h);return typeof x=="function"&&(x=x.bind(globalThis)),x},set(c,h,f,x){if(n.#p.has(h))throw new DOMException("Access denied","SecurityError");return Reflect.set(globalThis,h,f)},has(c,h){if(n.#p.has(h))throw new DOMException("Access denied","SecurityError");return Reflect.has(globalThis,h)},ownKeys(c){return Reflect.ownKeys(globalThis).filter(h=>!n.#p.has(h))}}),i=[];this.options.check("useStrict")&&i.push("'use strict'"),i.push("var $ = globalThis.document.querySelector.bind(globalThis.document)");let o=[`// Forbidden APIs
`];for(let c of this.#p)o.push(`const ${c} = undefined;
`);let a=o.join("");i.push(""),this.#E=!0;try{if(this.#u)throw t==="close"||t==="x"?(this.close(),"Console is closed"):new TypeError(`[SecurityError] !!CONSOLE IS DISABLED!!
while trying to execute:
	`+t);let c=new Function("window","globalThis","self","top","parent","setTimeout","setInterval","Function","safeContext","code",`${i.join(`;
`)}
${a}
;return eval(code);`),h={},f=(m,g,...b)=>typeof m=="string"?globalThis.setTimeout(()=>h.fn(m,b),g,...b):globalThis.setTimeout.call(globalThis,m,g,...b),x=(m,g,...b)=>typeof m=="string"?globalThis.setInterval(()=>h.fn(m,b),g,...b):globalThis.setInterval.call(globalThis,m,g,...b),S=c.bind(Object.create(null),s,s,s,s,s,f,x,Function,h);h.fn=S;let E=S(t);this.log("<",E)}catch(c){this.error(c)}finally{this.#E=!1}}doClear(e=!1){this.#a.innerHTML="",e&&this.#x("(console was cleared)")}open(){this.#e.open=!0;let e=this.#e.querySelector(".console-content");e.scrollTop=e.offsetHeight+e.scrollHeight,e.querySelector("[data-id=cons]")?.focus()}close(){this.#e.close(),this.#e.parentElement?.tagName?.toLowerCase()==="dialog"&&this.#e.parentElement.close()}#v=new Map;get sources(){return this.#v}#w(e,t,n="info",s=null){let i=document.createElement("div");i.role="alert",i.className=`jscon-message is-${n} not-open`,i.tabIndex=0,i.attachShadow({mode:"open"}).append(ae.content.cloneNode(!0)),i.innerText=String(e);let o=i.shadowRoot.getElementById("close");o.onkeydown=h=>h.stopPropagation(),o.onclick=h=>{h.stopPropagation(),o.disabled=!0,i.style.position="absolute";let f=i.offsetHeight,x=i.offsetTop-f,S=setInterval(()=>{x-=5,i.style.top=x+"px",x<-f-100&&(clearInterval(S),i.remove())},20)};let a=document.createElement("span");a.slot="title",a.innerText=t,i.append(a);let c=h=>(queueMicrotask(()=>o.click()),s&&s(h)||1);i.onclick=c,i.onkeydown=h=>{if(h.key==="Enter")return h.preventDefault(),c.apply(this,arguments)},this.#l.append(i),this.#l.childElementCount>50&&this.#l.firstElementChild.remove(),requestAnimationFrame(()=>i.classList.remove("not-open"))}static get managedConAPIs(){return["clear","log","dir","debug","error","warn","info","assert","trace"]}#c=null;#h=null;registerConsoleAPI(e){if(this.#u)throw new TypeError("Object is disabled");if(!e)throw new TypeError("Invalid paramater");if(this.#c)throw new Error("Console API already registered");this.#c={},this.#h=e;for(let t of r.managedConAPIs)this.#c[t]=e[t],e[t]=this[t].bind(this);return!0}unregisterConsoleAPI(e){if(!e)throw new TypeError("Invalid paramater");for(let t in this.#c)e[t]=this.#c[t];return this.#c=null,!0}#C(e){let t=!e.isTrusted,n=t?"[untrusted] ":"",s=this.#d([`${n}Uncaught ${e.message}
(${e.filename}:${e.lineno}:${e.colno})`],"error");this.options.check("notifications")&&(t||this.#w(`${n}Uncaught ${e.message}`,"JavaScript Exception","error",()=>{this.#e.open||(this.#e.open=!0),this.#e.querySelector("[data-id=TABS]").currentTab=0,s.focus()}))}#L(e){let t=!e.isTrusted,n=t?"[untrusted] ":"",s=this.#d([`${n}Uncaught (in promise) ${e.reason} (Promise:`,e.promise,")"],"error");this.options.check("notifications")&&(t||this.#w(`${n}Uncaught (in promise) ${e.reason}`,"JavaScript Unhandled Rejection","error",()=>{this.#e.open||(this.#e.open=!0),this.#e.querySelector("[data-id=TABS]").currentTab=0,s.focus()}))}#g=null;#y=null;addErrorHandler(){if(this.#u)throw new TypeError("Object is disabled");this.#g||(this.#g=this.#C.bind(this)),this.#y||(this.#y=this.#L.bind(this)),globalThis.addEventListener("error",this.#g),globalThis.addEventListener("unhandledrejection",this.#y)}removeErrorHandler(){this.#g&&globalThis.removeEventListener("error",this.#g),this.#y&&globalThis.removeEventListener("unhandledrejection",this.#y)}clear(){if(this.options.check("allowClear"))return this.doClear(!0),this.#c.clear.apply(this.#h,arguments);this.#x("(tried to clear console, prevented)")}log(){return this.#d(arguments,"log"),this.#c?.log?.apply(this.#h,arguments)}dir(){return this.#d(arguments,"dir"),this.#c?.dir?.apply(this.#h,arguments)}debug(){return this.#d(arguments,"debug"),this.#c?.debug?.apply(this.#h,arguments)}error(){return this.#d(arguments,"error"),this.#c?.error?.apply(this.#h,arguments)}warn(){return this.#d(arguments,"warn"),this.#c?.warn?.apply(this.#h,arguments)}info(){return this.#d(arguments,"info"),this.#c?.info?.apply(this.#h,arguments)}assert(){return arguments[0]||this.#d([new Error("Assertion Failed:")].concat(arguments),"error"),this.#c?.assert?.apply(this.#h,arguments)}trace(){return this.#d([Object.assign(new F(arguments[0]||"console.trace","console.trace"),{toString(){return this.message}})],"info"),this.#c?.trace?.apply(this.#h,arguments)}},W=class extends HTMLElement{#n=null;constructor(){super(),this.#n=this.attachShadow({mode:"open"}),this.#n.append(le.content.cloneNode(!0));let e=this.#n.getElementById("wrapper"),t=this.#n.getElementById("viewer"),n=this.#n.getElementById("re_eval"),s=this.#n.querySelector("#wrapper > .object-prototype-name"),i=()=>{this.#e?(t.hidden=n.hidden=!0,s.classList.remove("open"),this.#e=!1):queueMicrotask(()=>{this.load(),t.hidden=n.hidden=!1,s.classList.add("open"),this.#e=!0})};s.addEventListener("click",()=>{i()}),n.addEventListener("click",()=>{this.loadMetaData(),this.#i=!0,this.#t=!1,i();let o=document.createTextNode("d");n.append(o),setTimeout(()=>o.remove(),1e3)}),e.addEventListener("keydown",o=>{o.key==="Enter"&&o.target===e&&i()})}connectedCallback(){}#t=!1;get#e(){return this.#t}set#e(e){return this.#t=e,this.style.display=e?"block":"",this[e?"setAttribute":"removeAttribute"]("open",""),!0}#a=null;get data(){return this.#a}set data(e){return this.#a=e,queueMicrotask(()=>this.loadMetaData()),!0}#i=!0;loadMetaData(){switch(this.#i=!0,typeof this.data){case"undefined":this.innerText="undefined";break;case"string":case"number":case"boolean":this.innerText=String(this.data);break;case"symbol":this.innerText="Symbol()";break;case"function":this.innerHTML=`<span style="font-style: italic; pointer-events: none">f ${this.data.name||""}()</span>`;break;case"object":if(this.data===null){this.innerText="null";break}try{let e=this.data,t=Reflect.getPrototypeOf(e),n="object";if(t===Array.prototype)n=`Array (${e.length})`;else if(t){let s=t.constructor?.name;e[Symbol.toStringTag]?n=e[Symbol.toStringTag]:typeof e.constructor=="function"&&Object.prototype.hasOwnProperty.call(e,"constructor")?n=`${e.constructor.name} (constructor)`:s&&(n=s)}else n="Object";this.innerText=n}catch{this.innerText="object"}break;default:this.innerText="unknown";break}}load(e=0,t=!1){let n=t?1048576:we;if(!this.#i&&e===0)return;let s=this.#n.getElementById("viewer");if(e===0&&(s.innerHTML=""),!this.data)return;let i=this.data,o=typeof i;if(!/(function|object)/.test(o))return;let a=Reflect.ownKeys(i),c=[],h=Symbol(),f=Symbol(),x={[Symbol.toPrimitive]:"Symbol(Symbol.toPrimitive)",[Symbol.toStringTag]:"Symbol(Symbol.toStringTag)",[Symbol.iterator]:"Symbol(Symbol.iterator)",[Symbol.unscopables]:"Symbol(Symbol.unscopables)"};try{let d=i;for(;d=Reflect.getPrototypeOf(d);){let u=Reflect.ownKeys(d);for(let y of u)try{let w=Object.getOwnPropertyDescriptor(d,y);if(w&&w.value&&(typeof w.value=="symbol"||typeof w.value=="function")||y==="__proto__"||y in x||a.includes(y)||c.includes(y))continue;c.push(y),a.push({[h]:y,[f]:w})}catch{continue}}}catch{}let S=a.length,E=!1;n<a.length&&(a.splice(e+n,a.length-e-n),e&&a.splice(0,e),e+a.length<S&&(E=!0));let m=d=>{try{return d in x?x[d]:d.toString()}catch{return"Symbol()"}},g=(d,u)=>{switch(typeof d){case"undefined":u.innerText="undefined",u.style.color="#80868b";break;case"string":u.classList.add("is-string");case"number":case"boolean":u.innerText=String(d);break;case"symbol":u.innerText=m(d);break;case"function":case"object":if(d===null){u.innerText="null";break}{let y=document.createElement("jscon-object-viewer");return y.className="property-value",y.data=d,y}break;default:u.innerText="unknown";break}};for(let d of a){let u=d&&d[h]?d[h]:d,y=document.createElement("div");y.className="property";let w=document.createElement("span");w.innerText=typeof u=="symbol"?m(u):String(u),w.className="property-key",y.append(w),Object.prototype.hasOwnProperty.call(i,u)&&w.classList.add("is-own");let l=document.createElement("span");l.className="property-value";let p=d&&d[f]?d[f]:Object.getOwnPropertyDescriptor(i,u);if(w.addEventListener("click",v=>{let k=w.getBoundingClientRect(),_=document.createElement("select");_.setAttribute("style",`position: fixed; left: ${k.x}px; top: ${k.y}px; z-index: 1073741823; background: white; font-family: monospace; outline: 0;`);let j={"(Context Menu)":()=>{},Cancel:()=>{},"Store as global variable":()=>{try{let T=1;for(;"temp"+T in globalThis&&T<32767;)++T;let C=p&&p.value||Reflect.get(i,u,i);globalThis["temp"+T]=C,console.log(">","temp"+T),console.log("<",C)}catch(T){console.error("Cannot store as global variable:",T)}}};for(let T in j){let C=document.createElement("option");C.value=C.innerText=T,_.append(C)}_.onblur=()=>_.remove(),_.oninput=()=>{j[_.value]?.call(this),_.blur()},(document.body||document.documentElement).append(_),_.focus()}),p&&!p.enumerable&&w.classList.add("is-unenumerable"),!p||"value"in p)try{let v=p?p.value:Reflect.get(i,u,i),k=g(v,l);y.append(k||l)}catch(v){l.innerText=`[Exception: ${v}]`,y.append(l)}else if("get"in p){let v=document.createElement("a");v.className="property-value",v.href="javascript:",v.innerText="(...)",v.style.color="inherit",v.title="Call getter",v.onclick=()=>{try{let k=Reflect.get(i,u,i),_=g(k,l);v.replaceWith(_||l)}catch(k){let _=document.createElement("span");_.className="property-value",_.append("[Exception: ",String(k),"]"),v.replaceWith(_)}},y.append(v)}else l.innerText="undefined",y.append(l);s.append(y)}let b=d=>{let u=document.createElement("div");u.className="property is-internal";let y=document.createElement("span");return y.innerText=d,y.className="property-key is-internal",u.append(y),u},L=Reflect.getPrototypeOf(i);if(L&&e===0){let d=b("[[Prototype]]");d.classList.add("is-prototype");let u=document.createElement("jscon-object-viewer");u.className="property-value",u.data=L,d.append(u),s.append(d)}if(L===Promise.prototype&&e===0){let d=b("[[PromiseResult]]"),u=document.createElement("jscon-object-viewer");u.className="property-value",u.data=void 0,d.append(u);{let y=b("[[PromiseState]]"),w=document.createElement("span");w.className="property-value is-string",w.innerText="Querying",y.append(w);let l="pending";i.then(p=>{l=w.innerText="fulfilled",u.data=p}).catch(p=>{l=w.innerText="rejected",u.data=p}),queueMicrotask(()=>l==="pending"&&(w.innerText="pending")),s.append(y)}s.append(d)}if(e!==0)for(let d of s.querySelectorAll(".property.is-internal"))s.append(d);if(E){let d=document.createElement("div");d.className="property";let u=document.createElement("a");u.href="javascript:",u.innerText=`(...) total ${S} properties`,u.style.color="inherit",u.title="Show more properties",u.onclick=()=>{u.remove(),this.load(e+n)},u.onpointerdown=y=>{y.button===1&&(u.remove(),this.#i=!0,queueMicrotask(()=>this.load(0,!0)))},d.append(u),s.append(d)}this.#i=!1}};customElements.define("jscon-object-viewer",W);var X=class extends HTMLElement{#n=null;#t=null;#e=new Array;constructor(){super(),this.#n=this.attachShadow({mode:"open"}),this.#n.append(ce.content.cloneNode(!0)),this.#t=this.#n.getElementById("container"),this.#a()}#a(){let e=this.firstElementChild;for(;e;)e.tagName?.toLowerCase()==="jscon-tab"&&this.addTab(e.dataset.id||e.innerText,e.innerHTML,!0),e=e.nextElementSibling;this.#e.length&&(this.currentTab=0),this.#t.addEventListener("click",t=>{let n=t.target;if(!n?.classList?.contains("jscon-tabbtn"))return;let s=new CustomEvent("beforechange",{bubbles:!1,cancelable:!0});if(!this.dispatchEvent(s))return;let i=n.dataset.index;i&&(this.currentTab=i)}),this.#t.addEventListener("wheel",t=>{this.#t.scrollBy({left:t.deltaX||t.deltaY,top:0,behavior:"smooth"})},{passive:!0})}#i=-1;get currentTab(){return this.#i}set currentTab(e){if(isNaN(+e))throw new TypeError("Invalid data type");if(typeof e!="number"&&(e=+e),e<0||e>=this.#e.length)throw new RangeError("out of range");this.#i=e,this.#l();let t=new CustomEvent("change",{bubbles:!0,cancelable:!1});return this.dispatchEvent(t),!0}get currentId(){return this.#e[this.#i]?.id}update(){for(;this.#t.firstElementChild?.nextElementSibling;)this.#t.firstElementChild.remove();for(let e=0,t=this.#e.length;e<t;++e){let n=this.#e[e],s=document.createElement("button");s.className="jscon-btn jscon-tabbtn",e===this.#i&&(s.dataset.isCurrent="");let i=n.id;if(s.dataset.index=e,s.dataset.id=i,s[n.isHTML?"innerHTML":"innerText"]=n.text,n.closable){let o=document.createElement("button");o.className="jscon-btn jscon-closebtn",o.onclick=()=>{for(let a=0,c=this.#e.length;a<c;++a)if(this.#e[a].id===i)return this.deleteTab(a)},s.append(o)}this.#t.lastElementChild?this.#t.lastElementChild.before(s):this.#t.append(s)}return!0}#l(){let e=this.#t.firstElementChild,t=!1;for(;e;){if(e.dataset.index==String(this.#i)){t=e;break}e=e.nextElementSibling}if(!t)return this.update();this.#t.querySelectorAll("[data-is-current]").forEach(n=>{delete n.dataset.isCurrent}),t.dataset.isCurrent=""}addTab(e,t,n=!1,s=!1,i=void 0){for(let a=0,c=this.#e.length;a<c;++a)if(this.#e[a].id===e)return i!=null?this.moveTab(a,i):this.update();let o={id:e,text:t,isHTML:n,closable:s};return i===this.#e.length||i==null?this.#e.push(o):this.#e.splice(i,0,o),this.update()}deleteTab(e){if(e<0||e>=this.#e.length)throw new RangeError("out of range");return this.#e.splice(e,1),this.#i>=this.#e.length&&(this.currentTab=Math.max(this.#e.length-1,0)),this.update()}moveTab(e,t){if(e<0||e>=this.#e.length||t<0||t>=this.#e.length)throw new RangeError("out of range");let n=this.#e[e];return this.#e.splice(e,1),this.#e.splice(t,0,n),this.update()}getTabs(){return this.#e.concat()}};customElements.define("jscon-tabbar",X);export{se as CONSOLE_HISTORY_MAX,ae as ConMsg_Template,le as ConObjView_Template,re as ConRoot_Template,ce as ConTabbar_Template,N as DOM_find,U as DataManager,W as HTMLJsconObjectViewerElement,X as HTMLJsconTabbarElement,ie as JSCON_INIT_OPTIONS,oe as JsCon,we as PROPERTIESCOUNTEACHPAGE,F as Tracker,xe as UrlTester,ve as focusableElements,I as jscon_data,ne as jscon_style,te as jscon_style_text,Re as register};
//# sourceMappingURL=bundle.js.map
