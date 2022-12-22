const { Client, GatewayIntentBits } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { token, guildId, clientId } = require('./config.json')
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { google } = require("googleapis");
const fs = require('fs');
require("dotenv").config();
const _ = require('underscore');

client.on('ready', () => {
    console.log(client.user.tag)
});


const GOOGLE_PRIVATE_KEY = process.env.private_key.replace(/\\n/g, "\n");
const GOOGLE_CLIENT_EMAIL = process.env.client_email;
const GOOGLE_PROJECT_NUMBER = process.env.project_number;
const GOOGLE_CALENDAR_ID = process.env.calendar_id;

console.log(GOOGLE_CALENDAR_ID);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const jwtClient = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    SCOPES
  );
  
const calendar = google.calendar({
    version: "v3",
    project: GOOGLE_PROJECT_NUMBER,
    auth: jwtClient,
  });
  
const auth = new google.auth.GoogleAuth({
    keyFile: "./keys.json",
    scopes: SCOPES,
  });

const sleep = ms => new Promise(res => setTimeout(res, ms));

const eventWeekly = class{
    constructor(i_num){
        this.i_num=i_num //assign value number
    }

    combination(i){ //input data
        let title = i[this.i_num].summary //get summary for z value
        let desc = i[this.i_num].description //get description for z value
        let time = i[this.i_num].start.dateTime //get starting time for z value
        console.log(title+" "+desc+" "+time)
        var date = new Date(time);
        var formatOptions = { 
              day:    '2-digit', 
              month:  '2-digit', 
              year:   'numeric',
              hour:   '2-digit', 
              minute: '2-digit',
              hour12: true 
          };
        var dateString = date.toLocaleDateString('en-US', formatOptions);

        dateString = dateString.replace(',', '')
                               .replace('PM', 'p.m.')
                               .replace('AM', 'a.m.');

        const embed = new EmbedBuilder() //build embed
            .setTitle(title)
            .setDescription(desc+'\n'+'```'+dateString+'```') //send date in codeblock
        
        async function announce(){ //sending function
          console.log('worked')
          const channel = await client.channels.fetch('917926628561150046') //channel
          await channel.send({ embeds: [embed] }); //send embed
        }

        announce();
    }
}

function listCalendarEvents(){
  return new Promise((resolve)=> {
    calendar.events.list(
      {
        calendarId: GOOGLE_CALENDAR_ID,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      },
      (error, result1) => {
        if (error) {
          console.log("Something went wrong: ", error); // If there is an error, log it to the console
        } else {
          if (result1.data.items.length > 0) {
            let data1 = result1.data.items; //let data equal api result
            const o = data1; //assign to variable
            console.log('calender events listed')
            var ch1 = 'description'; //string to look for
            a = JSON.stringify(o); //convert data to string
            var count = a.split(ch1).length - 1; //count number of occurances

            let u = 0 //initial value
            const delay = async (ms = 1000) =>
              new Promise(resolve => setTimeout(resolve, ms))
            
            while (u<count){//while z is less than number of entries
              x = new eventWeekly(u); //initialize class with current value
              x.combination(o); //send message
              u++; //add to u
            }

          

             // If there are events, print them out
          } else {
            console.log("No upcoming events found."); // If no events are found
          }
        }
      }
    );
    resolve();
  });
    
}


let current = null;
function current_time(){
  var today= new Date;
  var date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes();
  current = date+" "+time
}

async function getCurrentTime(){
  current_time();
}

setInterval(getCurrentTime, 1000)

console.log(current)

let meetingData=null;

let isTime = true;

function sendmsg(){
  let title = meetingData.summary
  let description = meetingData.description
  isTime=false
  const data_embed = new EmbedBuilder() //build embed
    .setTitle(title+' starting in 10 minutes!')
    .setDescription(description) //send date in codeblock
  return data_embed
}

async function sendAlarm(embed){ //sending function
  console.log('worked')
  const channel = await client.channels.fetch('1055313435941937252') //channel
  await channel.send({ embeds: [embed] }); //send embed
}

const updates = class{
  constructor(i_num){
    this.i_num=i_num;
  }

  check(i){
    let startTime1 = i[this.i_num].start.dateTime;
    var date = new Date(startTime1);
        var formatOptions = { 
              day:    '2-digit', 
              month:  '2-digit', 
              year:   'numeric',
              hour:   '2-digit', 
              minute: '2-digit',
              hour12: false 
          };
    var dateString = date.toLocaleDateString('en-US', formatOptions).replace(', ', ' ');
    var diff = Math.abs(new Date(current) - new Date(dateString));
    var minutes = Math.floor((diff/1000)/60);

    if (minutes == 10){
      meetingData=i[this.i_num]
    }

    if (i[this.i_num] == meetingData){
      if (isTime){
        sendAlarm(sendmsg(meetingData));
      }
      if (minutes !== 10){
        isTime=true
        meetingData=''
      }
    }

  }
}


function eventUpdates(){
  calendar.events.list(
    {
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    },
    (error, result) => {
      if (error) {
        console.log("Something went wrong: ", error); // If there is an error, log it to the console
      } else {
        if (result.data.items.length > 0) {
          let data = result.data.items; //let data equal api result
          const i = data; //assign to variable

          var ch = 'description'; //string to look for
          a = JSON.stringify(i); //convert data to string
          var count = a.split(ch).length - 1; //count number of occurances

          let z = 0 //initial value
          while (z<count){ //while z is less than number of entries
              t = new updates(z); //initialize class with current value
              t.check(i); //send message
              z++; //add to z
          }
           // If there are events, print them out
        } else {
          console.log("No upcoming events found."); // If no events are found
        }
      }
    }
  );
};

async function redef(){
  eventUpdates();
}

listCalendarEvents();


setInterval(redef, 1000);

client.on('interactionCreate', async interaction => {
  const { commandName } = interaction;
  if (commandName === 'yo') {
    console.log('yo')
    const embed = new EmbedBuilder()
        .setTitle('dsfasdf')
        .setDescription('dsfasdfsdf')
      
    return interaction.reply({ embeds: [embed]})
  }
});

client.login(token);
