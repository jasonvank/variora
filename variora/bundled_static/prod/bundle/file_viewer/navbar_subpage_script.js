!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=477)}({18:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),String.prototype.format=function(){var e=this;for(var t in arguments)e=e.replace("{"+t+"}",arguments[t]);return e},t.getCookie=function(e){var t=null;if(document.cookie&&""!=document.cookie)for(var n=document.cookie.split(";"),o=0;o<n.length;o++){var r=n[o].trim();if(r.substring(0,e.length+1)==e+"="){t=decodeURIComponent(r.substring(e.length+1));break}}return t},t.getUrlFormat=function(e,t){var n=e+"?";for(var o in t)n=n+o+"="+t[o]+"&";return n},t.hexToRgb=function(e){e=e.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(e,t,n,o){return t+t+n+n+o+o});var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null},t.formatOpenCoterieDocumentUrl=function(e,t){return"/coteries/"+t+"/documents/"+e.slug+"/"+e.title.replace(/\s/g,"-")},t.formatOpenDocumentUrl=function(e){return"/documents/"+e.slug+"/"+e.title.replace(/\s/g,"-")},t.getValFromUrlParam=function(e){return new URL(window.location.href).searchParams.get(e)},t.renderMathJax=function(){window.hasOwnProperty("MathJax")&&MathJax.Hub.Queue(["Typeset",MathJax.Hub])}},477:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.prepareNavbarFunction=void 0;var o=n(18);t.prepareNavbarFunction=function(){$("#collect_button").on("click",function(){var e=$(this).find(".fa");e.hasClass("fa-star-o")?(layer.msg("Collected"),e.removeClass("fa-star-o"),e.addClass("fa-star"),$.post({url:"",data:{csrfmiddlewaretoken:(0,o.getCookie)("csrftoken"),operation:"collect",document_id:$("button[name='document_id']").val()}})):e.hasClass("fa-star")&&(layer.msg("Uncollected"),e.removeClass("fa-star"),e.addClass("fa-star-o"),$.post({url:"",data:{csrfmiddlewaretoken:(0,o.getCookie)("csrftoken"),operation:"uncollect",document_id:$("button[name='document_id']").val()}}))}),$("#show_annotation_frame_button").on("click",function(){$(".Annotation").each(function(){$(this).slideDown(180)})}),$("#hide_annotation_frame_button").on("click",function(){$(".Annotation").each(function(){$(this).slideUp(180)})}),$("#instruction_button").on("click",function(){layer.photos({photos:{data:[{src:"/media/images/gif/how_to_create_annotation.gif",alt:"How to create an annotation"}]},shift:5,tab:function(e,t){$(".layui-layer-imgsee").find("em").remove()}})})}}});