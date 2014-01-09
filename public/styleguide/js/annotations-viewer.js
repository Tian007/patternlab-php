/*!
 * Annotations Support for the Viewer - v0.3
 *
 * Copyright (c) 2013 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 */

var annotationsViewer = {
	
	commentsActive: false,
	
	onReady: function() {
		
		$('body').addClass('comments-ready');
		$('#sg-t-annotations').click(function(e) {
			
			e.preventDefault();
			
			// make sure the code view overlay is off
			$('#sg-t-code').removeClass('active');
			codeViewer.codeActive = false;
			var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
			document.getElementById('sg-viewport').contentWindow.postMessage({ "codeToggle": "off" },targetOrigin);
			codeViewer.slideCode(999);
				
			annotationsViewer.toggleComments();
			annotationsViewer.commentContainerInit();
			
		});
	},
	
	toggleComments: function() {
		
		var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
		
		if (!annotationsViewer.commentsActive) {
			
			annotationsViewer.commentsActive = true;
			document.getElementById('sg-viewport').contentWindow.postMessage({ "commentToggle": "on" },targetOrigin);
			$('#sg-t-annotations').addClass('active');
			
		} else {
			
			annotationsViewer.commentsActive = false;
			document.getElementById('sg-viewport').contentWindow.postMessage({ "commentToggle": "off" },targetOrigin);
			annotationsViewer.slideComment($('#sg-annotation-container').outerHeight());
			$('#sg-t-annotations').removeClass('active');
			
		}
		
	},
	
	commentContainerInit: function() {
		
		if (document.getElementById("sg-annotation-container") === null) {
			$('<div id="sg-annotation-container" class="sg-view-container"></div>').html('<a href="#" id="sg-annotation-close-btn" class="sg-view-close-btn">Close</a><div id="sg-comments-container"></div>').appendTo('body').css('bottom',-$(document).outerHeight());
			
			setTimeout(function(){ $('#sg-annotation-container').addClass('anim-ready'); },50); //Add animation class once container is positioned out of frame
		}
		
		//Close Annotation View Button
		$('body').delegate('#sg-annotation-close-btn','click',function() {
			annotationsViewer.commentsActive = false;
			$('#sg-t-annotations').removeClass('active');
			annotationsViewer.slideComment($('#sg-annotation-container').outerHeight());
			var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
			document.getElementById('sg-viewport').contentWindow.postMessage({ "commentToggle": "off" },targetOrigin);
			return false;
		});
	},
	
	slideComment: function(pos) {
		$('#sg-annotation-container').css('bottom',-pos);
	},
	
	updateComments: function(count, comments) {
		
		var commentsContainer = document.getElementById("sg-comments-container");
		
		if (commentsContainer.innerHTML != "") {
			commentsContainer.innerHTML = "";
		}
		
		for(i = 0; i < count; i++) {
			
			// for loop and add them to a doc frag and join it
			var commentDiv = document.createElement("div");
			commentDiv.classList.add("sg-comment-container");
			
			var h2        = document.createElement("h2");
			var div       = document.createElement("div");
			h2.innerHTML  = comments[i].title;
			div.innerHTML = comments[i].comment;
			
			commentDiv.appendChild(h2);
			commentDiv.appendChild(div);
			
			commentsContainer.appendChild(commentDiv);
			
		}
		
		annotationsViewer.slideComment(0);
		
	},
	
	/**
	* toggle the comment pop-up based on a user clicking on the pattern
	* based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	* @param  {Object}      event info
	*/
	receiveIframeMessage: function(event) {
		
		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
			return;
		}
		
		if (event.data.commentOverlay !== undefined) {
			if (event.data.commentOverlay === "on") {
				annotationsViewer.updateComments(event.data.count, event.data.comments);
			} else {
				annotationsViewer.slideComment($('#sg-annotation-container').outerHeight());
			}
		}
		
	}
	
};

$(document).ready(function() { annotationsViewer.onReady(); });
window.addEventListener("message", annotationsViewer.receiveIframeMessage, false);

// make sure if a new pattern or view-all is loaded that comments are turned on as appropriate
$('#sg-viewport').load(function() {
	if (annotationsViewer.commentsActive) {
		var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
		document.getElementById('sg-viewport').contentWindow.postMessage({ "commentToggle": "on" },targetOrigin);
	}
});

// no idea why this has to be outside. there's something funky going on with the JS pattern
$('#sg-view li a').click(function() {
	$(this).parent().parent().removeClass('active');
	$(this).parent().parent().parent().parent().removeClass('active');
});
