/**
		var sessionUser = de_sb_messenger.APPLICATION.sessionUser;
		if (!sessionUser) return;
 * de_sb_messenger.MessagesController: messenger messages controller.
 * Copyright (c) 2013 Sascha Baumeister
 */
"use strict";

this.de_sb_messenger = this.de_sb_messenger || {};
(function () {
	var SUPER = de_sb_messenger.Controller;
	var PERSONID = 0;
	var SUBJECTID = 0;
	var ISPERSON = false;
	var ROOT = null;
	
	/**
	 * Creates a new messages controller that is derived from an abstract controller.
	 * @param sessionUser {de_sb_messenger.sessionUser} a reference for the session User
	 * @param entityCache {de_sb_messenger.EntityCache} an entity cache
	 */
	de_sb_messenger.MessagesController = function (entityCache) {
		SUPER.call(this, 1, entityCache);
	}
	de_sb_messenger.MessagesController.prototype = Object.create(SUPER.prototype);
	de_sb_messenger.MessagesController.prototype.constructor = de_sb_messenger.MessagesController;

	/**
	 * Displays the associated view by calling the supertype's display
	 * method implementation and expanding it.
	 */
	de_sb_messenger.MessagesController.prototype.display = function () {
		var sessionUser = de_sb_messenger.APPLICATION.sessionUser;
		if (!sessionUser) return;
		SUPER.prototype.display.call(this);
		PERSONID = sessionUser.identity
		SUBJECTID = sessionUser.identity;
		ISPERSON = true;

		var subjectIdentities = [sessionUser.identity].concat(sessionUser.observedReferences);
		var mainElement = document.querySelector("main");
		var subjectsElement = document.querySelector("#subjects-template").content.cloneNode(true).firstElementChild;
		var messagesElement = document.querySelector("#messages-template").content.cloneNode(true).firstElementChild;

		mainElement.appendChild(subjectsElement);
		mainElement.appendChild(messagesElement);
		
		ROOT = messagesElement; //document.querySelector("section.messages");
		
		var actionListener = function(parentElement, subjectIdentity){
		    PERSONID = subjectIdentity;
		    SUBJECTID = subjectIdentity;
		    ISPERSON = true;
        	ROOT = parentElement;
			this.displayRootMessages();
			this.displayMessageEditor(parentElement, subjectIdentity);
		};

		this.refreshAvatarSlider(subjectsElement.querySelector("div.image-slider"), subjectIdentities, actionListener.bind(this, messagesElement));
		this.displayRootMessages();
	}


	function timeConverter(UNIX_timestamp){
	  var a = new Date(UNIX_timestamp);
	  //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var year = a.getFullYear();
	  var month = a.getMonth(); //months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  var time = date + '.' + month + '.' + year + ', ' + hour + ':' + min + ':' + sec ;
	  return time;
	}

	/**
	 * Displays the root messages.
	 */
	de_sb_messenger.MessagesController.prototype.displayRootMessages = function () {
		var sessionUser = de_sb_messenger.APPLICATION.sessionUser;
        var self = this;
        var messages = [];
        var messagesTime = [];
        var header = {"Accept": "application/json"};
        
        var parentElement = ROOT;
        parentElement.innerHTML = '';
        
        var displayMessages = function(messages) {
       		messages.sort((a, b) => a.creationTimestamp - b.creationTimestamp);
			messages.forEach(function (message) {
				console.log("Msg: ",message);
	            var messagesOutput = document.querySelector("#message-output-template").content.cloneNode(true).firstElementChild;
	            
	            var outputs = messagesOutput.querySelectorAll("output");
	            var outputSubject = outputs[0];
	            var outputBody = outputs[1];
	            var author_id = message.author.identity;

	        	de_sb_util.AJAX.invoke("/services/people/" + author_id, "GET", header, null, null, function (request) {
	        		var personGet = JSON.parse(request.responseText);
	        		//console.log("Person: ",personGet);
	        		outputSubject.innerHTML = personGet.name.given + " " + personGet.name.family + " ("+timeConverter(message.creationTimestamp)+")";
	    			outputBody.innerHTML = message.body;
	        	});
	                
	            messagesOutput.querySelector("img").src = "/services/people/" + author_id + "/avatar";
	            
	        	messagesOutput.querySelector("span").parentElement.addEventListener("click", function(){
	        		var list = messagesOutput.querySelector("ul");
	        		if(!list.hasChildNodes()){
	        			ISPERSON = false;
	        			SUBJECTID = message.identity;
	        			ROOT = list;
	        			messagesOutput.setAttribute("class","expanded");
	        			self.displayRootMessages();
	        			self.displayMessageEditor(list, message.identity);
	        		}
	        		else {
	        			messagesOutput.setAttribute("class","message");
	        			list.innerHTML = "";
	        		}
				});
	            
	            parentElement.appendChild(messagesOutput);
	    	});
        };
        
        de_sb_util.AJAX.invoke("/services/people/" + sessionUser.identity+"/messagesAuthored", "GET", header, null, null, function (request) {
            SUPER.prototype.displayStatus(request.status, request.statusText);
            if (request.status === 200) {
                var messagesGet = JSON.parse(request.responseText);
                //console.log("Your Msg: ",messagesGet);
                messagesGet.forEach(function (message) {
					if(message.subject.identity === SUBJECTID){
	                    messages.push(message);
	                    messagesTime.push(message.creationTimestamp)
	                    //console.log("Msg: ",message);
	                }
				});
			}
		
			if(PERSONID != sessionUser.identity) {
				var subjectId = (PERSONID === SUBJECTID) ? sessionUser.identity : SUBJECTID;
				var messagesSubject = [];
		        de_sb_util.AJAX.invoke("/services/people/" + PERSONID+"/messagesAuthored", "GET", header, null, null, function (request) {
		            SUPER.prototype.displayStatus(request.status, request.statusText);
		            if (request.status === 200) {
		                var messagesGet = JSON.parse(request.responseText);
		                //console.log("Subject msg: ",messagesGet);
		                messagesGet.forEach(function (message) {
							if(message.subject.identity === subjectId){
			                    messagesSubject.push(message);
			                }
						});
					}
				
					console.log("array1: ",messages);
					console.log("array2: ",messagesSubject);
					var combined = messages.concat(messagesSubject);
					console.log("array3: ",combined);
					displayMessages(combined);
	
				});
				
			}
			else {
				displayMessages(messages);
			}
  
  		});

		/*
		sessionUser.observedReferences.forEach(function(identity){
			console.log("observedReferences: ",sessionUser.observedReferences);
        	de_sb_util.AJAX.invoke("/services/people/" + identity +"/messagesAuthored", "GET", header, null, null, function (request) {
            SUPER.prototype.displayStatus(request.status, request.statusText);
            if (request.status === 200) {
            		var msgsSubject = JSON.parse(request.responseText);
            		console.log("tyka tyka",msgsSubject);
                	// msgsSubject.forEach(function (message) {
                	
                	// 	if(message.subject.identity === sessionUser.identity ){
                        
                 //        console.log("Msg to: ",message.subject.identity);
                 //    	}
              //   	});
            }
            });	
        });
        */
	}


	/**
	 * Discards an existing message editor if present, and displays a new one
	 * for the given subject.
	 * @param parentElement {Element} the parent element
	 * @param subjectIdentity {String} the subject identity
	 */
	de_sb_messenger.MessagesController.prototype.displayMessageEditor = function (parentElement, subjectIdentity) {
		var sessionUser = de_sb_messenger.APPLICATION.sessionUser;
        var self = this;
        var messages = [];
        var messagesTime = [];
        var header = {"Accept": "application/json"};
        
        var messagesInput = document.querySelector("#message-input-template").content.cloneNode(true).firstElementChild;
       	messagesInput.querySelector("button").addEventListener("click", function(){
						self.sendMessage(subjectIdentity);
				});

        messagesInput.querySelector("img").src = "/services/people/" + sessionUser.identity + "/avatar";
		
		var btn = document.querySelector("li.message button"); // only editor has button
		
        if(btn != null){
        	var editor = btn.parentElement;
        	editor.parentElement.removeChild(editor);
        }
        
        parentElement.appendChild(messagesInput);
	}

	de_sb_messenger.MessagesController.prototype.sendMessage = function (subjectIdentity) {
		var self = this;
		var textMsg = document.querySelector("li.message textarea");
		var header = {"Content-type": "text/plain"};
			de_sb_util.AJAX.invoke("/services/messages?subjectReference="+ subjectIdentity, "PUT", header, textMsg.value, null, function (request) {
			self.displayStatus(request.status, request.statusText);
				if (request.status === 200) {
					var msgID = JSON.parse(request.responseText);
					console.log("retured ID", msgID);
					console.log("put msg",textMsg.value.trim() );
				}
		});
		self.displayRootMessages();
	}


	function sortMsgs(messages) {
    messages.creationTimestamp.sort(function(a, b){return a - b});
    return messages
	}
} ());






