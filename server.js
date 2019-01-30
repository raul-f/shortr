"use strict" // strict mode

// modules requirement

const express = require("express")
const bodyParser = require("body-parser")
const mongo = require("mongodb")
const mongoose = require("mongoose")
const dns = require("dns").promises
const dotenv = require("dotenv")
const cors = require("cors")

// Basic Configuration

const app = express()
const port = process.env.PORT || 3000

dotenv.config()
mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true }
)
dns.lookup("google.com", (error, address, family) => {
    if (error) console.log(error)
    else console.log("address: %j family: IPv%s", address, family)
})

// schema and models

let Schema = mongoose.Schema

let shortenedSchema = new Schema({
    og_url: String,
    st_url: String
})

let StURL = mongoose.model("StURL", shortenedSchema)

// middlewares

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use("/public", express.static(process.cwd() + "/public"))

// route handling

app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/views/index.html")
})

// API endpoints

app.get("/api/hello", function(req, res) {
    res.json({ greeting: "hello API" })
})

// receive new url to shorten /api/shorturl/new

app.post("/", (req, res) => {
    console.log(req.body)
    res.json({ resp: "request successfully processed." })
})

app.post("/api/shorturl/new", (req, res) => {
    if (req.body.url) {
        let protocolRegEx = /^https?:\/\//
        let helpRegex = /\/.*/
        console.log(req.body)
        let dnsURL = req.body.url.replace(protocolRegEx, "")
        dnsURL = dnsURL.replace(helpRegex, "")
        let url = req.body.url.replace(protocolRegEx, "")
        dns.lookup(dnsURL)
            .then(data =>
                console.log(
                    `The lookup has been successful ${JSON.stringify(data)}`
                )
            )
            .then(empty => {
                check(url).then(result => {
                    let shorturl = {}
                    ;[shorturl.data, shorturl.existence] = result
                    console.log(
                        `The check function has returned ${JSON.stringify(
                            shorturl
                        )}`
                    )
                    if (shorturl.existence) {
                        res.json({
                            message: `This url already exists! It\'s at ${
                                shorturl.data.st_url
                            }`,
                            short_url: shorturl.data.st_url
                        })
                    } else {
                        res.json({
                            original_url: shorturl.data.og_url,
                            short_url: shorturl.data.st_url
                        })
                    }
                })
            })
            .catch(err => {
                console.log(`The lookup has returned an error: ${err}`)
                res.json({ error: "invalid URL" })
            })
    } else {
        res.send({ error: "no URL has been provided" })
    }
})

app.get("/favicon.ico", (req, res) => {
    res.status(204)
})

// receive shorturl and redirect to og url

app.get("/:short", (req, res) => {
    console.log("Gotten!")
    console.log(req.url)
    StURL.find({ st_url: req.params.short }).then(doc => {
        if (doc.length) {
            res.redirect(`https://${doc[0].og_url}`)
        } else {
            res.send({ error: "short url provided has no associated address" })
        }
    })
})

// db functions

function check(url) {
    return StURL.find({ og_url: url }).then(searchResult => {
        // console.log(searchResult);
        if (searchResult.length === 0) {
            return create(url)
        } else return [searchResult[0], true]
    })
}

function create(url) {
    return generateRandomKey().then(key => {
        let newURL = new StURL({ og_url: url, st_url: key })
        newURL.save((err, data) => {
            if (err) return err
            else return data
        })
        return [{ og_url: url, st_url: key }, false]
    })
}

// utility functions

function generateRandomKey() {
    let key = ""
    for (let i = 0; i < 5; i++) {
        let randomNum = Math.random()
        let upCaseRN = Math.round(Math.random() * (90 - 65)) + 65
        let lowCaseRN = Math.round(Math.random() * (123 - 97)) + 97
        let numRN = Math.round(Math.random() * (57 - 48)) + 48
        key +=
            randomNum > 0.375
                ? randomNum > 0.75
                    ? String.fromCharCode(numRN)
                    : String.fromCharCode(upCaseRN)
                : String.fromCharCode(lowCaseRN)
    }
    return StURL.find({ st_url: key }, (err, data) => {
        if (err) console.log(err)
        else return data
    }).then(result => {
        if (result.length === 0) return key
        else return generateRandomKey()
    })
}

// listener setup

const listener = app.listen(port, function() {
    console.log("Node.js listening on port %s", listener.address().port)
})
