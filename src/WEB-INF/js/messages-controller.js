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

		var subjectIdentities = [sessionUser.identity].concat(sessionUser.observedReferences);
		var mainElement = document.querySelector("main");
		var subjectsElement = document.querySelector("#subjects-template").content.cloneNode(true).firstElementChild;
		var messagesElement = document.querySelector("#messages-template").content.cloneNode(true).firstElementChild;

		mainElement.appendChild(subjectsElement);
		mainElement.appendChild(messagesElement);

		this.refreshAvatarSlider(subjectsElement.querySelector("div.image-slider"), subjectIdentities, this.displayMessageEditor.bind(this, messagesElement));
		this.displayRootMessages();
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
            de_sb_util.AJAX.invoke("/services/people/" + sessionUser.identity+"/messagesAuthored", "GET", header, null, null, function (request) {
                SUPER.prototype.displayStatus(request.status, request.statusText);
                if (request.status === 200) {
                    var messagesGet = JSON.parse(request.responseText);
                    console.log("all masgs: ",messagesGet);
                    messagesGet.forEach(function (message) {
                        messages.push(message.identity);
                        messagesTime.push(message.creationTimestamp)
                        console.log("MSG ID : ",message.creationTimestamp);
                    });
                }
            });

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
            var messagesInput = document.querySelector("#message-input-template").content.cloneNode(true).firstElementChild;
           	messagesInput.querySelector("button").addEventListener("click", function(){
    						self.sendMessage(subjectIdentity);
					});
            parentElement.appendChild(messagesInput);
            var imageElement = document.querySelector("li.message img");
			imageElement.src = "/services/people/" + subjectIdentity + "/avatar";	         
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






