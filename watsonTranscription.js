var watson = require('watson-developer-cloud');
var fs = require('fs');
var sql = require('mssql');
var path = require('path');
var Promise = require('promise');

var config = {
    customerNumber: 1,
    applicationNumber: 1
};

var speech_to_text = watson.speech_to_text({
    username: '[add username]',
    password: '[add pasword]',
    version: 'v1'
});

function transcribe(fileName) {

    console.log('transcribing start');
    var params = {
        audio: fs.createReadStream(fileName),
        content_type: 'audio/wav',
        model: 'en-US_NarrowbandModel'
    };

    speech_to_text.recognize(params, function (err, transcript) {
        if (err)
            console.log(JSON.stringify(err));
        else {
            console.log(JSON.stringify(transcript, null, 2));
            if (transcript.results.length > 0)
              //transcriptionResult = transcript.results[0].alternatives[0].transcript;
            saveTranscription(transcript,fileName);

        }
    });
    console.log('transcribing end');

}

var dbConfig = {
    server: "[add DB]",
    database: "Test",
    user: "[add user]",
    password: "[pwd]",
    port: 1433
};

function saveTranscription(result,fileName) {

    var conn = new sql.Connection(dbConfig);

    var confidence = result.results[0].alternatives[0].confidence;
    var transcript = result.results[0].alternatives[0].transcript;
    var originalResponse = JSON.stringify(result.results[0]);

    conn.connect().then(function() {
        var req = new sql.Request(conn);
        var sqlScript = "INSERT INTO AutomatedTranscriptions (customerNumber,applicationNumber,[fileName],transcription,confidence,added,apiProvider,originalResponse) VALUES (" + config.customerNumber + "," + config.applicationNumber + ",'" + fileName + "','" + transcript + "','" + confidence + "',GetUTCDate()," + " 'Watson','" + JSON.stringify(originalResponse) + "')";
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



