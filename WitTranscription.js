var wit = require('node-wit');
var fs = require('fs');
var sql = require('mssql');
var path = require('path');
var ACCESS_TOKEN = "[ADD THIS]";

var config = {
    customerNumber: 1,
    applicationNumber: 1
};

function transcribe(fileName) {

    wit.captureSpeechIntent(ACCESS_TOKEN,fs.createReadStream(fileName),"audio/wav", function(err,res) {


        if (err) {
            console.log(JSON.stringify(res, null, " "));
        }
        else if (res.outcomes.length === 0)
            console.log('no transcription');
        else
            //console.log(res);
            saveTranscription(res,fileName); //res._text;

    });



}

var dbConfig = {
    server: "[ADD THIS]",
    database: "Test",
    user: "[ADD THIS]",
    password: "[ADD THIS]",
    port: 1433
};

function saveTranscription(result,fileName) {

    var conn = new sql.Connection(dbConfig);

    var confidence = result.outcomes[0].confidence;//result.results[0].alternatives[0].confidence;
    var transcript = result._text;//result.results[0].alternatives[0].transcript;
    var originalResponse = '';//JSON.stringify(result.outcomes[0]);

    conn.connect().then(function() {
        var req = new sql.Request(conn);
        var sqlScript = "INSERT INTO AutomatedTranscriptions (customerNumber,applicationNumber,[fileName],transcription,confidence,added,apiProvider,originalResponse) VALUES (" + config.customerNumber + "," + config.applicationNumber + ",'" + fileName + "','" + transcript + "','" + confidence + "',GetUTCDate()," + " 'Wit','" + JSON.stringify(originalResponse) + "')";
        // console.log(sqlScript);
        req.query(sqlScript).then(function(recordset) {
            console.log(recordset);
            conn.close();
        }).catch(function (err) {
            console.log("1: " + err);
            conn.close();
        });

    }).catch(function (err) {
        console.log("2:  " + err);
    });
}

// Run transcriptions as a service
function watchDirectory() {

    var p = "transcriptions/";

    fs.readdir(p, function (err, files) {

        if (err) {throw err;}

        for (var i = 0;i < p.length;i++) {
            Pop(p + files[i]);
        }
        
    });

    function Pop(fname) {
        console.log('POP: ' + fname + ' ' + new Date())
        transcribe(fname);
    }


}

// Go through directory and transcribe the files.
watchDirectory();




