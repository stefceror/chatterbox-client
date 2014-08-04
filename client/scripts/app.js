// YOUR CODE HERE:
var app = {
  server: "https://api.parse.com/1/classes/chatterbox",
  initialMessageCount: 10,
  lastMessageID: undefined
};

//fetch initial messages, display them, kickoff fetch loop
app.init = function(){
  this.fetch();

};

app.send = function(message){
  //send a message
  $.ajax({
    url: this.server,
    type: "POST",
    data: JSON.stringify(message),
    dataType:"json",
    contentType: "application/json",
    success: function(data){
      console.log(data);
    },
    failure: function(data){
      console.log('Message not sent');
    }
  });
};

app.fetch = function(){
  //submit a get request via ajax
  $.ajax({
    url: this.server,
    type: "GET",
    contentType: "jsonp",
    data: { order: "-createdAt" },
    success: this.addNewestMessages.bind(this),
    failure: function(data) {
      console.log("fetch failed");
    }
  });
};

app.findLastMessageIndex = function(messages){
  var index = 0;
  for(var i = 0; i < messages.length; i++){
    if(messages[i].objectId === this.lastMessageID){
      index = i;
      break;
    }
  }
  return index;
}

app.addNewestMessages = function(data) {
  console.log(data);
  var messages = data.results;
  var lastIndex = this.initialMessageCount;

  if (this.lastMessageID) {
    lastIndex = this.findLastMessageIndex(messages);
  }

  for (var i = lastIndex - 1; i >= 0; i--) {
    this.addMessage(messages[i]);
  }

  this.lastMessageID = messages[0].objectId;
}

app.addMessage = function(message){
  var user = "<span class='username'>" + message.username + "</span>";
  var text = "<span id='message'>" + "'"+ message.text + "'" + "</span>";
  // var room = "<span class='room'>" + message.room + "</span>";

  $("#chats").prepend("<div>"+ user + ": " + text + "</div>");
};

app.clearMessages = function(){
  $("#chats").children().remove();
};

app.addRoom = function(lobbyName){
  $("#roomSelect").append("<div>" + lobbyName + "</div>");
};


app.addFriend = function(){};
app.handleSubmit = function(){};
