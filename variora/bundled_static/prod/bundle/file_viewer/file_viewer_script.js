!function(t){function e(o){if(n[o])return n[o].exports;var a=n[o]={i:o,l:!1,exports:{}};return t[o].call(a.exports,a,a.exports,e),a.l=!0,a.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=650)}({100:function(t,e,n){"use strict";function o(){tinymce.init({menubar:!1,selector:"textarea",forced_root_block:!1,plugins:["advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker","searchreplace visualblocks visualchars codesample fullscreen insertdatetime media nonbreaking","save table contextmenu directionality emoticons template paste textcolor"],toolbar:["styleselect | bold italic codesample | link image | bullist numlist outdent indent | forecolor backcolor"],paste_as_text:!0,branding:!1,width:"calc(100% - 2px)",setup:function(t){t.on("change",function(){t.save()})}}),$(document).on("focusin",function(t){$(t.target).closest(".mce-window").length&&t.stopImmediatePropagation()})}Object.defineProperty(e,"__esModule",{value:!0}),e.tinymceInit=o},16:function(t,e,n){"use strict";function o(t,e){var n=t+"?";for(var o in e)n=n+o+"="+e[o]+"&";return n}function a(t){var e=null;if(document.cookie&&""!=document.cookie)for(var n=document.cookie.split(";"),o=0;o<n.length;o++){var a=n[o].trim();if(a.substring(0,t.length+1)==t+"="){e=decodeURIComponent(a.substring(t.length+1));break}}return e}function i(t,e){var n=setInterval(function(){t.complete&&(e(t),clearInterval(n))},8)}function r(t){var e=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;t=t.replace(e,function(t,e,n,o){return e+e+n+n+o+o});var n=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return n?{r:parseInt(n[1],16),g:parseInt(n[2],16),b:parseInt(n[3],16)}:null}function s(t,e){return"/coteries/"+e+"/documents/"+t.title.replace(/\s/g,"-")+"/"+t.pk}function c(t){return"/documents/"+t.title.replace(/\s/g,"-")+"/"+t.pk}Object.defineProperty(e,"__esModule",{value:!0}),e.getCookie=a,e.getUrlFormat=o,e.imgLoad=i,e.hexToRgb=r,e.formatOpenCoterieDocumentUrl=s,e.formatOpenDocumentUrl=c},521:function(t,e,n){"use strict";function o(t){$(".AnnotationDiv[annotation_id='"+t+"']").remove(),$(".Annotation[annotation_id='"+t+"']").remove()}function a(t){$(".AnnotationReplyBlock[annotation_reply_id='"+t+"']").remove(),$(".AnnotationReplyBlock[reply_to_annotation_reply='"+t+"']").remove()}function i(){$("code").addClass("prettyprint"),PR.prettyPrint(),$(".AnnotationBlock").on("mouseover",function(){var t=$(this).attr("annotation_id"),e=$(".Annotation[annotation_id='"+t+"']");$(this).css("box-shadow","2px 3px 8px rgba(0, 0, 0, .25)"),e.css("box-shadow","2px 3px 8px rgba(0, 0, 0, .25)")}),$(".AnnotationBlock").on("mouseout",function(){var t=$(this).attr("annotation_id"),e=$(".Annotation[annotation_id='"+t+"']");$(this).css("box-shadow","none"),e.css("box-shadow","none")}),$(".AnnotationBlock").on("click",function(){var t=$(this).attr("annotation_id"),e=$(".Annotation[annotation_id='"+t+"']"),n=$("#file_viewer"),o=e.offset().top-n.offset().top+n.scrollTop()-.38*window.innerHeight+e.height()/2;n.animate({scrollTop:parseInt(o)},240)}),$(".PostReplyReplyButton").on("click",function(){if(is_authenticated){var t=$(this),e=layer.load(1,{shade:.18});$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,r.getCookie)("csrftoken"),operation:"reply_annotation",annotation_reply_content:t.prev("textarea[name='reply_reply_content']").val(),reply_to_annotation_id:t.parents(".AnnotationBlock").find(".PostAnnotationReplyButton").val(),reply_to_annotation_reply_id:t.val(),document_id:$("button[name='document_id']").val()},success:function(t){$("#annotation_update_div").html(t),i(),(0,s.tinymceInit)(),layer.close(e)}})}else layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')}),$(".DeleteAnnotationReplyButton").on("click",function(){var t=layer.load(1,{shade:.18}),e=this.value;$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,r.getCookie)("csrftoken"),operation:"delete_annotation_reply",reply_id:e,document_id:$("button[name='document_id']").val()},success:function(n){a(e),layer.close(t)}})}),$(".PostAnnotationReplyButton").on("click",function(){if(is_authenticated){var t=$(this),e=layer.load(1,{shade:.18});$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,r.getCookie)("csrftoken"),operation:"reply_annotation",annotation_reply_content:t.prev("textarea[name='annotation_reply_content']").val(),reply_to_annotation_id:t.val(),document_id:$("button[name='document_id']").val()},success:function(t){$("#annotation_update_div").html(t),i(),(0,s.tinymceInit)(),layer.close(e)}})}else layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')}),$(".DeleteAnnotationButton").on("click",function(){var t=layer.load(1,{shade:.18}),e=this.value;$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,r.getCookie)("csrftoken"),operation:"delete_annotation",annotation_id:this.value},success:function(){o(e),layer.close(t)}})}),$(".LikeAnnotationButton").on("click",function(){if(is_authenticated){var t=$(this),e=parseInt(t.next().text())+1;t.next().text(e.toString()),t.off("click"),t.css("color","#6495ED"),t.on("click",function(){layer.msg("already liked",{icon:6,time:800})}),$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,r.getCookie)("csrftoken"),operation:"like_annotation",annotation_id:t.attr("annotation_id")}})}else layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')}),$(".LikeAnnotationReplyButton").on("click",function(){if(is_authenticated){var t=$(this),e=parseInt(t.next().text())+1;t.next().text(e.toString()),t.off("click"),t.css("color","#6495ED"),t.on("click",function(){layer.msg("already liked",{icon:6,time:800})}),$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,r.getCookie)("csrftoken"),operation:"like_annotation_reply",annotation_reply_id:t.attr("annotation_reply_id")}})}else layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')}),$(".ReplyAnnotationButton").on("click",function(){$(this).parents("footer").children("form").slideToggle({duration:180,start:function(){$(this).is(":hidden")||$(".ReplyAnnotationButton").parents("footer").children("form").not($(this)).slideUp(180)}})})}Object.defineProperty(e,"__esModule",{value:!0}),e.addAnnotationRelatedListener=void 0;var r=n(16),s=n(100);e.addAnnotationRelatedListener=i},522:function(t,e,n){"use strict";function o(t){$(".CommentBlock[comment_id='"+t+"']").remove(),$(".CommentBlock[reply_to_comment_id='"+t+"']").remove()}function a(){(0,c.tinymceInit)(),$("code").addClass("prettyprint"),PR.prettyPrint(),$(".likeCommentButton").on("click",function(){if(is_authenticated){var t=$(this),e=parseInt(t.next().text())+1;t.next().text(e.toString()),t.off("click"),t.css("color","#6495ED"),t.on("click",function(){layer.msg("already liked",{icon:6,time:800})}),$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,s.getCookie)("csrftoken"),operation:"like_comment",comment_id:t.attr("comment_id")}})}else layer.msg('<span style="color: #ECECEC">You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first</span>')}),$(".delete_comment_button").on("click",function(){if(is_authenticated){var t=layer.load(0,{shade:.18}),e=this.value;$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,s.getCookie)("csrftoken"),operation:"delete_comment",comment_id:e,document_id:$("button[name='document_id']").val()},success:function(n){o(e),layer.close(t)}})}}),$(".reply_comment_button").on("click",function(){$(this).parents("blockquote").find(".reply_comment_form").slideToggle({duration:180,start:function(){$(this).is(":hidden")||$(".reply_comment_form").not($(this)).slideUp(180)}})}),$(".post_comment_reply_button").on("click",function(){if(is_authenticated){var t=$(this),e=layer.load(0,{shade:.18});$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,s.getCookie)("csrftoken"),operation:"comment",comment_content:t.prev("textarea[name='comment_content']").val(),document_id:$("button[name='document_id']").val(),reply_to_comment_id:t.val(),is_public:!0},success:function(t){$("#comment_update_div").html(t),a(),layer.close(e)}})}else layer.msg('<span style="color: #ECECEC">You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first</span>')})}function i(){$("#refresh_comment_button").on("click",function(){$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,s.getCookie)("csrftoken"),operation:"refresh",document_id:$("button[name='document_id']").val()},success:function(t){$("#comment_update_div").html(t),a()}})})}function r(){$(".post_comment_button").on("click",function(){var t=!this.classList.contains("anonymously_post_comment_button");if(is_authenticated){var e=layer.load(0,{shade:.18}),n=tinyMCE.activeEditor;$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,s.getCookie)("csrftoken"),operation:"comment",comment_content:$("textarea[name='comment_content']").val(),document_id:$("button[name='document_id']").val(),is_public:t},success:function(t){$("#comment_update_div").html(t),a(),n.setContent(""),layer.close(e)}})}else layer.msg('<span style="color: #ECECEC">You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first</span>')})}Object.defineProperty(e,"__esModule",{value:!0}),e.enablePostCommentButton=e.enableRefreshCommentButton=e.addCommentRelatedListener=void 0;var s=n(16),c=n(100);e.addCommentRelatedListener=a,e.enableRefreshCommentButton=i,e.enablePostCommentButton=r},523:function(t,e,n){"use strict";function o(){$("#collect_button").on("click",function(){var t=$(this).find(".fa");t.hasClass("fa-star-o")?(layer.msg("Collected"),t.removeClass("fa-star-o"),t.addClass("fa-star"),$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,a.getCookie)("csrftoken"),operation:"collect",document_id:$("button[name='document_id']").val()}})):t.hasClass("fa-star")&&(layer.msg("Uncollected"),t.removeClass("fa-star"),t.addClass("fa-star-o"),$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,a.getCookie)("csrftoken"),operation:"uncollect",document_id:$("button[name='document_id']").val()}}))}),$("#show_annotation_frame_button").on("click",function(){$(".Annotation").each(function(){$(this).slideDown(180)})}),$("#hide_annotation_frame_button").on("click",function(){$(".Annotation").each(function(){$(this).slideUp(180)})})}Object.defineProperty(e,"__esModule",{value:!0}),e.prepareNavbarFunction=void 0;var a=n(16);e.prepareNavbarFunction=o},650:function(t,e,n){"use strict";function o(t){if(C*=t,E.length>0){for(;E.length>1;)E.pop();E.push([E[0][0],"PENDING",null])}for(var e=0;e<P.length;e++){var n="page_canvas_"+P[e],o=document.getElementById(n);o.width=0,o.height=0,E.push([P[e],"PENDING",null])}P=[],I||d(E,P,C);var a=$("#file_viewer")[0].scrollHeight;m*=t,h*=t,$(".page_div").each(function(){var t=$(this);t.css("width",m+"px"),t.css("height",h+"px")}),i(t);var r=$("#file_viewer")[0].scrollHeight/a;$("#file_viewer").scrollTop(parseFloat($("#file_viewer").scrollTop())*r)}function a(){var t="rgba(0,0,0,0.28)";_.on("change",function(e){var n=(0,v.hexToRgb)(e);t="rgba("+n.r+","+n.g+","+n.b+",0.28)"}),$("#annotation_color_buttons_div").find(".ColorSelectorButton").on("click",function(){t=$(this).css("background-color")}),$(".PageDiv, .page_div").on("mousedown",function(e){if(!$(e.target).hasClass("ui-draggable")&&!$(e.target).hasClass("ui-resizable-handle")){layer.closeAll(),$(".ui-draggable.Annotation").remove();var n=$(this).find(".PageImg, .PageCanvas"),o=e.pageX,a=e.pageY,i=n.offset().left,r=n.offset().top,s=o-i,c=a-r,l=$("<div class='Annotation'></div>");n.parents(".page_div, .PageDiv").append(l),l.css({background:t,position:"absolute",width:"1px",height:"1px",left:s,top:c}),$(".PageImg, .PageCanvas, .Annotation").on("mousemove",function(t){var e=t.pageX,o=t.pageY,a=n.offset().left,i=n.offset().top,r=e-a,d=o-i;l.css({width:Math.abs(r-s),height:Math.abs(d-c),left:Math.min(s,r),top:Math.min(c,d)}),t.stopPropagation()}),$("body").on("mouseup",function(e){if($(e.target).hasClass("PageImg")||$(e.target).hasClass("PageCanvas")||$(e.target).hasClass("Annotation")){var o=n.height(),a=n.width(),i=parseFloat(l.css("top"))/o,r=parseFloat(l.css("left"))/a,s=parseFloat(l.css("height"))/o,c=parseFloat(l.css("width"))/a;l.draggable({containment:"parent"}).resizable({containment:"parent"});var d=layer.open({type:1,title:"Post Annotation",shadeClose:!0,shade:!1,maxmin:!0,zIndex:800,fixed:!1,content:'<form id="annotation_form">                        <textarea name="annotation_content" class="form-control" rows="8" style="resize: vertical"></textarea>                        <button type="button" class="post_annotation_button anonymously_post_annotation_button btn" name="document_id" value="{{ document.id }}" style="margin: 8px; float: right; border-radius: 0; color: white; background-color: #636e72">                          post anonymously &nbsp <i class="fa fa-user-secret"></i>                        </button>                        <button type="button" class="post_annotation_button btn " name="document_id" value="{{ document.id }}" style="margin: 8px; float: right; border-radius: 0; color: white; background-color: #1BA39C">post annotation</button>                    </form>',success:function(){(0,k.tinymceInit)()},cancel:function(){l.remove()}}),u=$(".layui-layer[times="+d+"]");u.find(".post_annotation_button").on("click",function(){if(is_authenticated){var e=!this.classList.contains("anonymously_post_annotation_button");$.ajax({type:"POST",url:"",data:{csrfmiddlewaretoken:(0,v.getCookie)("csrftoken"),operation:"annotate",annotation_content:u.find("textarea[name='annotation_content']").val(),page_id:n.attr("id"),top_percent:i,left_percent:r,height_percent:s,width_percent:c,frame_color:t,document_id:$("button[name='document_id']").val(),is_public:e},success:function(t){l.draggable("destroy").resizable("destroy"),$("#annotation_update_div").html(t.new_annotations_html),(0,y.addAnnotationRelatedListener)(),(0,k.tinymceInit)(),l.attr("annotation_id",t.new_annotation_id),layer.close(d)}}),u.find(".post_annotation_button").attr("disabled",!0)}else layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')}),$(".PageImg, .PageCanvas, .Annotation").off("mousemove"),$("body").off("mouseup"),u.find(".post_annotation_button").attr("disabled",!1)}else l.remove(),$(".PageImg, .PageCanvas, .Annotation").off("mousemove"),$("body").off("mouseup");e.stopPropagation()}),e.stopPropagation()}})}function i(t){$(".Annotation").each(function(){$(this).css("top",parseFloat($(this).css("top"))*t+"px"),$(this).css("left",parseFloat($(this).css("left"))*t+"px"),$(this).css("width",parseFloat($(this).css("width"))*t+"px"),$(this).css("height",parseFloat($(this).css("height"))*t+"px")})}function r(t){var e=$("#file_viewer"),n=t.offset().top-e.offset().top+e.scrollTop();e.animate({scrollTop:parseInt(n)},240)}function s(){var t=$("#scroll_page_into_view_div").children("input"),e=$("#scroll_page_into_view_div").children("button");t.attr("min","1"),t.attr("max",x.toString()),e.on("click",function(){var e=t.val(),n="page_div_"+e;r($("#"+n))})}function c(){var t=$("#wrapper"),e=$("#file_viewer");t.css("height",document.body.clientHeight-28+"px"),t.css("width",document.body.clientWidth),e.css("height",t.height()+"px"),e.css("width",.6*parseInt(t.css("width"))+"px"),$("#annotation_update_div").css("height",t.height()+"px"),$("#annotation_update_div").css("width",t.width()-3.8-e.width()+"px"),$("#horizontal_draggable").css("height",t.height()+"px"),$(".PageImg").css("width",e.width()-24+"px"),$(".PageDiv").each(function(){var t=$(this),e=t.children(".PageImg");(0,v.imgLoad)(e[0],function(){t.css("width",e.width()+"px"),t.css("height",e.height()+"px")})})}function l(){$("#buttonForLarger").on("click",function(){o(w)}),$("#buttonForSmaller").on("click",function(){o(1/w)})}function d(t,e,n){if(t.length>0){I=!0,$("#buttonForLarger, #buttonForSmaller").attr("disabled",!0);var o=t[0][0];f.getPage(o).then(function(a){var i="page_canvas_"+o,r=document.getElementById(i),s=r.getContext("2d"),c=a.getViewport(A*n);r.height=c.height,r.width=c.width,r.style.height=c.height/A+"px",r.style.width=c.width/A+"px";var l={canvasContext:s,viewport:c};t[0][2]=a.render(l),t[0][1]="RENDERING",t[0][2].promise.then(function(){t.shift(),e.push(o),I=!1,$("#buttonForLarger, #buttonForSmaller").attr("disabled",!1),d(t,e,n)},function(t){console.log("rejected because of this reason: "+t)})})}}function u(){var t=1;$("#file_viewer").scroll(function(){var e=this.scrollTop/this.scrollHeight,n=Math.ceil(e*x);if(n!=t){t=n;for(var o=[!0,!0,!0,!0,!0],a=0,i=P.length,r=0;r<i;r++)if(P[a]-n>=-1&&P[a]-n<=3)o[P[a]-n+1]=!1,a+=1;else{var s="page_canvas_"+P[a],c=document.getElementById(s);c.width=0,c.height=0,P.splice(a,1)}for(;E.length>1;)E.pop();for(var r=0;r<5;r++)1==o[r]&&E.push([Math.min(x,Math.max(1,n+r-1)),"PENDING",null]);I||d(E,P,C)}})}function p(t){PDFJS.workerSrc="/static/pdfjs/pdf.worker.js";var e=layer.load(1,{shade:!1,offset:"48%"});PDFJS.getDocument(t).then(function(t){layer.close(e),f=t,x=f.numPages,s(),f.getPage(x).then(function(t){C=.66*$("#file_viewer").width()/t.getViewport(1).width;var e="";h=t.getViewport(C).height,m=t.getViewport(C).width;for(var n=1;n<=f.numPages;n++){e+="<div class='page_div' id='"+("page_div_"+n)+"'><canvas class='PageCanvas' id='"+("page_canvas_"+n)+"'></canvas></div><br>"}$("#file_viewer").append(e),$(".page_div").css("height",h+"px"),$(".page_div").css("width",m+"px"),a(),drawAllExistingAnnotationFrame(),E.push([Math.min(x,1),"PENDING",null]),E.push([Math.min(x,2),"PENDING",null]),E.push([Math.min(x,3),"PENDING",null]),E.push([Math.min(x,4),"PENDING",null]),E.push([Math.min(x,5),"PENDING",null]),d(E,P,C),u()})})}var f,m,h,_,g=n(522),v=n(16),y=n(521),b=n(523),k=n(100),x=0,w=1.08,C=1,P=[],E=[],I=!1,A=2.4;$(document).ready(function(){p($("#file-url").val()),(0,k.tinymceInit)(),(0,g.enablePostCommentButton)(),(0,g.enableRefreshCommentButton)(),l(),(0,b.prepareNavbarFunction)(),$(window).resize(function(){c();var t=parseFloat($(".PageImg").css("width"));i(parseFloat($(".PageImg").css("width"))/t)}),_=new Huebee(".color-picker",{notation:"hex",saturations:2}),(0,g.addCommentRelatedListener)(),(0,y.addAnnotationRelatedListener)(),c();var t=$("#wrapper"),e=$("#file_viewer");$("#horizontal_draggable").draggable({axis:"x",containment:"#containment-wrapper",revert:!0,revertDuration:0,stop:function(n,o){var a=o.offset.left;e.css("width",a+"px"),$("#annotation_update_div").css("width",t.width()-3-e.width()+"px")}})})}});