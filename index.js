const youtubedl = require('youtube-dl-exec')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')



const filename = "%(title)s-%(id)s.%(ext)s";
const outputPath = "./output/"

if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
}

function getLinks(url){
    return new Promise(function(resolve, reject) {
        youtubedl(url,{
            "get-url": true,
        })
        .then(output => resolve(output))
    });
}

function getTitle(url){
    return new Promise(function(resolve, reject) {
        youtubedl(url,{
            output : filename,
            "get-filename" : true,
        })
        .then(output => resolve(output))
    });
}

url = process.argv[2]
start_time = process.argv[3]
start_secondSplit = start_time.split(":")
start_second = (+start_secondSplit[0]) * 60 * 60 + (+start_secondSplit[1]) * 60 + (+start_secondSplit[2])
end_time = process.argv[4]
end_secondSplit = end_time.split(":")
end_second = (+end_secondSplit[0]) * 60 * 60 + (+end_secondSplit[1]) * 60 + (+end_secondSplit[2])
time = end_second-start_second;

Promise.all([getLinks(url),getTitle(url)]).then(output => {
    links = output[0].split('\n');
    videoLink = links[0];
    audioLink = links[1];
    OutputFilename = output[1];


    let filenameOutputPath = outputPath+OutputFilename;

    ffmpeg.setFfmpegPath(ffmpegPath)
    ffmpeg()
        .input(audioLink)
        .setStartTime(start_time)
        .inputOptions([
            '-reconnect 1',
            '-reconnect_streamed 1',
            '-reconnect_delay_max 5'
         ])
        .input(videoLink)
        .setStartTime(start_time)
        .setDuration(time)
        .output(filenameOutputPath)
        .on('end', function(err) {
            if(!err) {
                console.log('conversion Done')
            }
        })
        .on('error', function(err){
            console.log('error: ', err)
        })
        .on('stderr', function(line) {
            console.log(line)
        })
        .run()
})