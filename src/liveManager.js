const request = require('request');

const desiredMinutes = 2;
// eslint-disable-next-line
const loopTime = desiredMinutes * 60 * 1000; // Convert to miliseconds

let guild;
let channel;
let client;

function updateBotPresence(newType) {
  if (!newType) {
    console.error('No type provided.');
    return;
  }

  const clientOptions = {
    game: {
      name: process.env.STATUS_NAME,
      url: process.env.STATUS_URL,
      type: newType,
    },
  };

  client.user.setPresence(clientOptions);
}

function notify(data, online) {
  if (online) {
    const embed = {
      title: 'Click here to visit the stream!',
      author: {
        name: 'Meow!',
      },
      url: process.env.STATUS_URL,
      description: data.title,
      timestamp: data.started_at,
    };

    channel.send({ embed, }).catch(error => console.error(error));
    channel.send('@here').catch(error => console.error(error));
  } else {
    channel.send('Stream is offline!').catch(error => console.error(error));
  }
}

function getLiveStatus() {
  guild = client.guilds.get(process.env.ID_GUILD);
  channel = guild.channels.find(
    chan => chan.id === process.env.ID_ANNOUNCE_CHANNEL_ID
  );
  const options = {
    method: 'GET',
    url: 'https://api.twitch.tv/helix/streams',
    qs: { user_login: process.env.TWITCH_TARGET_STREAM_NAME, },
    headers: {
      'cache-control': 'no-cache',
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      Accept: 'application/vnd.twitchtv.v5+json',
    },
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    if (body) {
      const data = JSON.parse(body);

      if (data.data[0]) {
        // Stream is online
        if (channel.type === 'text') {
          if (channel.topic !== process.env.TWITCH_ONLINE_MESSAGE) {
            channel.setTopic(process.env.TWITCH_ONLINE_MESSAGE);
            notify(data.data[0], true);
            updateBotPresence(process.env.STATUS_ONLINE);
          }
        }
      } else if (!data.data[0]) {
        // Stream is offline
        if (channel.type === 'text') {
          if (channel.topic !== process.env.TWITCH_OFFLINE_MESSAGE) {
            channel.setTopic(process.env.TWITCH_OFFLINE_MESSAGE);
            notify(null, false);
            updateBotPresence(process.env.STATUS_OFFLINE);
          }
        }
      }
    } else {
      // This should never happen, but in the rare case it does
      // we'll just assume the stream is offline.
      if (channel.type === 'text') {
        if (channel.topic === process.env.TWITCH_ONLINE_MESSAGE) {
          channel.setTopic(process.env.TWITCH_OFFLINE_MESSAGE);
          notify(null, false);
          updateBotPresence(process.env.STATUS_OFFLINE);
        }
      }
    }
  });
}

function initLiveManager(newClient) {
  client = newClient;

  // Initialize the bot's notification system

  // We use an anonymous function here in case of
  // future refactoring that may require paramaters

  // We're using 5000 (5 seconds) here to give the bot
  // time to initialize all its needed components.
  setTimeout(function() {
    getLiveStatus();
  }, 5000);

  // Set it to loop every x minutes

  // We use an anonymous function here in case of
  // future refactoring that may require paramaters
  setInterval(function() {
    getLiveStatus();
  }, loopTime);
}

module.exports = {
  initLiveManager,
};
