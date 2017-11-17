let https = require('https');
let request = require('request');
let fs = require('fs');
let commandData = require("./commandData/StarCitizen.json");
exports.run = () => {
    https.get('https://robertsspaceindustries.com/comm-link/rss', (resp) => { //Makes get request to cat api page
        let data = '';
    resp.on('data', (chunk) => { //Writes data chunks to variable as they are recieved
        data += chunk;
});
    resp.on('end', () => {
        var post = data.split('<item>')[1];
    var titleAr = post.split('<title>');
    var title = titleAr[1].split('</title>')[0];
    var urlAr = post.split('<guid isPermaLink=\"true\">')[1];
    var url = urlAr.split('</guid>')[0];
    var descAr = post.split('<description>')[1];
    var description = descAr.split('</description>')[0];
    if(post.includes('<media:content')) {
        var image = description.split('\"')[1]
    } else if(post.includes('<image>')) {
        var imgDat = data.split('<image>')[1];
        var imgAr = imgDat.split('<url>')[1];
        var image = imgAr.split('</url>')[0];
    } else var image = "";
    if(description.includes("<![CDATA[")){
        description = description.substring(9,description.length);
        description = description.substring(0,description.length-3);
    }
    description.replace("â€œ", '\"');
    description.replace("â€", '\"');
    /*descriptionFormat = description.split('&lt;');
    for(i = 0; i < descriptionFormat.length; i++) {
        var formatRemover = descriptionFormat[i].split('&gt;');
        if(formatRemover[0] == "br") descriptionFormat[i] = "\n" + formatRemover[1];
        else if(formatRemover[0] == "i") descriptionFormat[i] = "*" + formatRemover[1];
        else if(formatRemover[0] == "/i") descriptionFormat[i] = "*" + formatRemover[1];
        else descriptionFormat[i] = formatRemover[1];
    }
    description = descriptionFormat.join('');*/
    if (description.includes('http')) {
        var arr1 = description.split('http');
        for(i=0; i<arr1.length; i++){
            var arr2 = arr1[i].split(' ');
            if(arr2[0].indexOf("\n") == arr2[0].length-2 || arr2[0].indexOf("\n") == arr2[0].length-4){
                arr2[0] = arr2[0].substring(0, arr2[0].indexOf("\n")) + ">" + arr2[0].substring(arr2[0].indexOf("\n"), arr2[0].length);
            }else {
                arr2[0] = arr2[0] + ">";
            }
            arr1[i] = arr2.join(" ");
        }
        description = arr1.join("<http");
    }
    text = "*" + title + "*" + description + "\n\nFeed Link: <" + url + ">\n\n" + image;
    if(text.length > 2000){
        text = "*" + title + "*" + description;
        var textAr = [];
        var start = 0;
        var end = 1994;
        for(i=0; i<=(text.length/1994); i++){
            textAr[i] = text.substring(start, end);
            start = end;
            end +=1994;
            if(end>text.length) end = text.length;
        }
        textAr[0] = textAr[0] + "...";
        for(i=1; i < textAr.length-1; i++){
            textAr[i] = "..." + textAr[i] + "...";

        }
        textAr[textAr.length-1] = "..." + textAr[textAr.length-1];
        textAr[textAr.length] = "\nFeed Link: <" + url + ">\n\n" + image;
    }else var textAr[0] = text;
    if(title !== commandData.embeds.title) {
        commandData.title = title;
        fs.writeFile("./commandData/StarCitizen.json", JSON.stringify(commandData), (err) => console.error);
        var count = -1;
        var send = function() {
            count++;
            if(count < textAr.length){
                request({
                        method: 'POST',
                        url: "https://discordapp.com/api/webhooks/365976300227133451/vHh1VYi7_2KknvO4fBBvrBlEDNBX9i34xNiAvItJRBoiQc3Mum3nDsftcHSiA1Uhj2B-",
                        json: {
                            "username": "Star Citizen Updates",
                            "avatar_url": "http://www.freeiconspng.com/uploads/star-citizen-icon-18.png",
                            "content": textAr[count]
                        }
                    }
                    , function() {send()});
            }
        }
        send();
    }
});
}).on("error", (err) => {
        console.error(err);
});
}
