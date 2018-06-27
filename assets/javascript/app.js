// *************************************************
// Class - Coding Bootcamp MW 
// Assignment #7 - Train Scheduler
// Author: Rod Skoglund
// File: game.js
// *************************************************

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBOzaZ45b-D52_LeTl0MFdy0prZAwvlq2g",
    authDomain: "rls-train-scheduler.firebaseapp.com",
    databaseURL: "https://rls-train-scheduler.firebaseio.com",
    projectId: "rls-train-scheduler",
    storageBucket: "",
    messagingSenderId: "178636238756"
};

firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

// Capture Add Train Button Click
$("#add-train").on("click", function(event) {
event.preventDefault();

// Capture User Input
var trainName = $("#train-name").val().trim();
var destination = $("#destination").val().trim();
var firstTrainTime = $("#first-train-time").val().trim();
var frequency = $("#frequency").val().trim();

// User Input Validation
// Test for empty input
if (trainName == "" || destination == "" || firstTrainTime == "" || frequency == "") {
    alert("Please complete all fields before submitting.");
}
//test for numeric frequency inputs
else if (isNaN(frequency)) {
    alert("Please enter a number for the frequency.");
}
//test for valid time input
else if (!moment(firstTrainTime, "HH:mm").isValid()) {
    alert("Please enter a valid time for the first train (HH:mm).");
}
else {
    // All user inputs are valid
    // Push data to DB
    database.ref("schedule/").push({
        trainName: trainName,
        destination: destination,
        firstTrainTime: firstTrainTime,
        frequency: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
}
});

// Firebase watcher to initialize tables from DB on refresh and to respond to the addition of another Train
database.ref("schedule/").on("child_added", function(childSnapshot) {

    // Capture data from DB
    // var thisTrainName = childSnapshot.val().trainName;
    // var thisDestination = childSnapshot.val().destination;
    var thisFirstTrainTime = childSnapshot.val().firstTrainTime;
    var thisFrequency = childSnapshot.val().frequency;

    //Check to see if the first train time is in the future
    var isFirstTrainInFuture = (thisFirstTrainTime > moment().format("HH:mm"));

    // Convert the Frequency from the DB to an Integer
    thisFreq = parseInt(thisFrequency);

    currentTime = moment().format("HH:mm");

    // define variables for calculated fields
    var minAway;
    var nextArrival;

    // If the firt train is in the future, set the next train to the first train time (has not happened yet)
    // and calculate the time to next traing as the difference between the current time and the first train time
    if (isFirstTrainInFuture) {
        minAway = (moment(childSnapshot.val().firstTrainTime, "HH:mm").diff(moment(), "minutes") + 1);
        nextArrival = moment(childSnapshot.val().firstTrainTime, "HH:mm");
        console.log("first train is in the future");
    }
    // The first train time is in the past. Calculate the minutes to the next train and the next arrival 
    // time for this train
    else {
        minAway = thisFreq - (moment().diff(moment(childSnapshot.val().firstTrainTime, "HH:mm"), "minutes")) % thisFreq;
        nextArrival = moment().add(minAway, "minutes");

    }

    // Add the train to the Train Schedule table.
    $(".train-list").append("<tr><td>" + childSnapshot.val().trainName + "</td>" + 
        "<td>" + childSnapshot.val().destination + "</td>" + 
        "<td>" + childSnapshot.val().frequency + "</td>" + 
        "<td>" + nextArrival.format("HH:mm") + "</td>" + 
        "<td>" + minAway + "</td></tr>");
        
    // Handle the errors
}, function(errorObject) {
console.log("Errors handled: " + errorObject.code);
});
   
  