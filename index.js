/*
    Axway Ship Event HTTP Post
    Blake Arnold barnold@cartonservice.com
    2018-06-07
*/
const fs = require('fs')
const request = require('request')
const readline = require('readline')

const config = require('./config')
const lib = require('./lib.js')

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.on('line', input => {
    var uri, gcp
    
    if (!lib.validate(input))
        rl.emit('invalid', input)
    
    uri = lib.plainToURI(input.substr(2,17))
    gcp = lib.findGCP(input.substr(2,17))    
    fs.readFile('shipevent.xml', 'utf-8', (err, data) => {
        if (err)
            console.log("error")
        lib.parseString(data, (err, data) => {
            if (err)
                console.log(err)
            data = lib.updateEPCIS(data, uri, gcp)
            fs.writeFile('output.xml', data, (err) => {
                if (err)
                    console.log(err)
            })
            request.post(
                {
                    url: config.url,
                    auth: config.auth,
                    form: data 
                }, (err, res, body) => {
                    if (err)
                        console.log(err)
                }
            )           
        })
    })       
    rl.emit('done')
})

rl.on('invalid', (input) => {
    console.log(input + ' invalid input.')
})

rl.on('done', () => {
    rl.close()
})
