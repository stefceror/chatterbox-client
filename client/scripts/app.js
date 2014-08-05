// YOUR CODE HERE:
var app = {
  server: "https://api.parse.com/1/classes/chatterbox",
  initialMessageCount: 25,
  lastMessageID: undefined,
  rooms: {
    Lobby:"Lobby"
  }
};

var user = {
  username: location.search.split("username=")[1],
  room: "Lobby",
  friendsList: {}
};

user.toggleFriend = function(friend){
  if (!user.friendsList[friend]) {
    user.friendsList[friend] = friend;
  } else {
    delete user.friendsList[friend];
  }

  // toggle friends list on DOM
  app.toggleFriend(friend);
};

//fetch initial messages, display them, kickoff fetch loop
app.init = function(){
  $(document).ready(function(){
    app.addEventListeners();
    setInterval(app.fetch, 2000);
  });
};

app.send = function(message){
  //send a message
  $.ajax({
    url: app.server,
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
  //maybe filter by room
  $.ajax({
    url: app.server,
    type: "GET",
    contentType: "jsonp",
    data: { order: "-createdAt" },
    success: app.addNewDOMElements,
    failure: function(data) {
      console.log("fetch failed");
    }
  });
};

app.addEventListeners = function() {
  // changes room when clicked on
  $("#roomSelect").on("click", ".room", function(){
    user.room = $(this).text();
    app.changeRoom($(this));
  });

  // adds new room to the list and activates it
  $(".submitNewRoom").on("click", function() {
    console.log("clicky");
    var newRoom = $(".addRoom").val();
    app.addRoom(newRoom);
    user.room = newRoom;
    app.changeRoom($(".room:contains(" + newRoom + ")"));
  });

  // adds friend and styles messages
  $("#chats").on("click", ".username", function(){
    var userName = $(this).text();
    user.toggleFriend(userName);
    // app.addFriend(userName);
    app.styleFriend($(".username:contains(" + userName + ")"));
  });
};

app.findLastMessageIndex = function(messages){
  var index = 0;
  for(var i = 0; i < messages.length; i++){
    if(messages[i].objectId === app.lastMessageID){
      index = i;
      break;
    }
  }
  return index;
};

//TODO: handle escaping
app.addNewDOMElements = function(data) {
  var messages = data.results;
  var lastIndex = app.initialMessageCount;

  // check if messages have been added before
  if (app.lastMessageID) {
    // update index of last message
    lastIndex = app.findLastMessageIndex(messages);
  }

  // iterate over new messages to prepend to DOM
  for (var i = lastIndex - 1; i >= 0; i--) {
    app.addMessage(messages[i]);
    app.addRoom(messages[i].roomname);
  }

  // update last message
  app.lastMessageID = messages[0].objectId;
}

app.escapeString = function(string) {
  if(string){
    return string.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
};

app.addMessage = function(message){
  var classes = user.friendsList[message.username] ? "username friend" : "username";
  var userName = "<span class='" + classes + "''>" + app.escapeString(message.username) + "</span>";
  var text = "<span id='message'>" + app.escapeString(message.text) + "</span>";

  if(app.escapeString(user.room) === "Lobby"){
    $("#chats").prepend("<div>"+ userName + ": " + text + "</div>");
  } else {
    if(app.escapeString(message.roomname) === user.room){
      $("#chats").prepend("<div>"+ userName + ": " + text + "</div>");
    }
  }
};

app.clearMessages = function(){
  $("#chats").children().remove();
};

app.addRoom = function(lobbyName){
  //if room does not exist
  lobbyName = app.escapeString(lobbyName);
  if (!app.rooms[lobbyName] && lobbyName !== undefined && lobbyName !== "") {
    $("#roomSelect .roomContainer").append("<div class='room'>" + lobbyName + "</div>");
    app.rooms[lobbyName] = lobbyName;
  }
};

app.changeRoom = function(roomClicked) {
  app.clearMessages();
  app.lastMessageID = undefined;
  $(".currentRoom").removeClass().addClass("room");
  $(roomClicked).removeClass().addClass("currentRoom");
  app.fetch();
}

app.toggleFriend = function(friend) {
  if (user.friendsList[friend]) {
    $("#friendsList").append("<div class='inFriendsList'>" + friend + "</div>");
  } else {
    $(".inFriendsList:contains(" + friend + ")").remove();
  }
}

// maybe remove friend if already a friend
app.styleFriend = function(friendSelector) {
  friendSelector.toggleClass("friend");
}

app.handleSubmit = function(){
  //build message to send
  var message = {
    username: user.username,
    text: $("input.sendText").val(),
    roomname: user.room
  };

  //pass built message to send
  app.send(message);
};


app.init();
