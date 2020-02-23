// @ts-check
/*
packetInspector.js

Used for dumping raw packets to the console to learn about the MFC protocol and debug changes in their code
*/

"use strict";

const fs = require("fs");
const mfc = require("../../lib/index.js");
const log = mfc.log;
let user = "guest";
let pass = "guest";

// CHANGE THIS NAME TO FIND THE # 
let modelName = "CitySunshine";

// To examine packet streams for a logged in user, put your
// username and hashed password (read the comment in Client.ts)
// in a file named cred.txt in the test folder. Separate them by
// a single newline. And this script will log in as that user.
// Otherwise it will default to using guest credentials, which
// also work fine but only reveal and subset of the message protocol.
// cred.txt is excluded from git via .gitignore. Please never commit
// your own password hash.
let cred = "cred.txt";
if (fs.existsSync(cred)) {
    let data = fs.readFileSync(cred).toString().split("\r\n");
    if (data.length >= 2) {
        user = data[0];
        pass = data[1];
    }
}
mfc.setLogLevel(mfc.LogLevel.WARNING, "packetLog_errors.txt", null);
let client = new mfc.Client(user, pass, {modernLogin: true});

client.on("ANY", (packet) => {
    log(packet.toString(), "packetLog.txt", null);
});

console.log("Logging on to MFC...");
client.connectAndWaitForModels().then(() => {
    console.log("Logged on. \nSearching for " + modelName + "...");
    client.queryUser(modelName).then((msg) => {
        if (msg === undefined){
            console.log("Can't find " + modelName);
        } else {
            let model = mfc.Model.getModel(msg.uid);
            console.log(model.nm + "'s user ID is " + model.uid); 
            client.disconnect();
        }
    });
});
