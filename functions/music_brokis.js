require('dotenv').config();
const { send_song } = require('./messagesBot.js');
const { p, connection_channel } = require('./commands.js')
const { Client} = require('discord.js')
const Discord =  require('discord.js')
const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice')
const play = require('play-dl')

const client = new Client({
    intents: [
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Discord.Partials.Channel],
})

let connection = null;
const ds = require('./data_structures.js')
const queue = new ds.Queue();
const queueAux = new ds.Queue();

let playing = false;
const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
    }
})

async function playSong() {
    let link
    if (queue.isEmpty()) {
        if (queueAux.isEmpty()) {
            playing = false;
            player.stop();
            return
        } else {
            [link, channel] = queueAux.dequeue()
            await send_song(link, channel, 'Te recomiendo esta')
        }
    } else {
        link = queue.dequeue();
    }
    stream = await play.stream(link, { discordPlayerCompatibility: true, quality: 3 });
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })
    player.play(resource)
    connection.subscribe(player)
    playing = true
}

client.on('messageCreate', async message => {
    let videos
    const ct = message.content;
    if (ct.startsWith("!")) {
        try {
            const command = ct.split(" ")[0].slice(1).toLowerCase()
            switch (command) {
                case "p":
                    connection = await connection_channel(message)
                    if (connection) {
                        const link = await p(message)
                        queue.enqueue(link);
                        if (!playing) await playSong();
                    }
                    break;
                case "s":
                    if (queue.isEmpty() && queueAux.isEmpty()) message.channel.send('No hay más canciones...');
                    await playSong();
                    break;
                case "clear":
                    queue.empty()
                    queueAux.empty()
                    await playSong();
                    break;
                case "l":
                    connection = await connection_channel(message)
                    if (connection) {
                        const link = ct.split('l ')[1].split(' ')[0];
                        const playlist = await play.playlist_info(link)
                        videos = await playlist.all_videos()
                        videos.forEach((v) => {
                            queue.enqueue(v.url);
                        });
                        if (!playing) await playSong();
                    }
                    break;
                case "pk":
                    connection = await connection_channel(message)
                    if (connection) {
                        const link = await p(message)
                        queue.enqueue(link);
                        queueAux.empty()
                        const info = await play.video_info(link)
                        videos = info.related_videos
                        videos.forEach(v => {
                            queueAux.enqueue([v, message.channel]);
                        });
                        if (!playing) await playSong();
                    }
                    break;
            }
        } catch (e) {
            console.log(e);
            message.channel.send('Escribe bien, loco');
        }
    }
})

client.on('ready', () => {
    console.log('Qué chille!')
})

player.on(AudioPlayerStatus.Idle, async () => {
    await playSong()
});

client.login(process.env.TOKEN);