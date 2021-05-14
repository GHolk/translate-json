#!/usr/bin/env node


const fs = require('fs')

const excludeString = []
let targetRegexp = /[^\u0000-\u00A0]/

let debug = false

function jsonTreeWalkObject(json, path, callback) {
    for (const key in json) {
        if (typeof json[key] == 'object') {
            const keyPath = [...path, key]
            const action = callback(json[key], keyPath)
            if (action == 'continue') {
                jsonTreeWalkObject(json[key], keyPath, callback)
            }
            else if (action == 'return') continue
        }
    }
}

function printJsonTsv(path, value) {
    const pathEncode = path.map(
        key => encodeURIComponent(key).replace(/\./g, '%2e')
    ).join('.')
    for (const line of value.split('\n')) {
        console.log(`${pathEncode}\t${line}`)
    }
}

function logString(json, path) {
    for (const key in json) {
        const string = json[key]
        if (typeof string == 'string') {
            if (targetRegexp.test(string) && !~excludeString.indexOf(string)) {
                printJsonTsv([...path, key], string)
                // console.log(`${path.join('.')}.${key}\t${string}`)
            }
        }
    }
    return 'continue'
}

function readJson(file) {
    const string = fs.readFileSync(file, 'utf8')
    const json = JSON.parse(string)
    return json
}    

function readStdin() {
    return new Promise(resolve => {
        let string = ''
        process.stdin.on('data', s => string += s)
        process.stdin.on('end', () => resolve(string))
    })
}

function jsonAccess(json, path, value) {
    let target = json
    let i = 0
    for (let l=path.length-1; i<l; i++) {
        target = target[path[i]]
    }
    if (arguments.length == 3) target[path[i]] = value
    else return target[path[i]]
}
function assignJson(json, path, value, append = false) {
    if (path.length == 1) {
        if (append) json[path[0]] += '\n' + value
        else json[path[0]] = value
    }
    else assignJson(json[path[0]], path.slice(1), value)
}
function patchJson(json, patch) {
    let pathPrevious
    for (const line of patch.split('\n')) {
        if (!line) continue
        const [path, ...stringList] = line.split('\t')
        if (debug) console.log(path)
        const pathArray = path.split('.').map(key => decodeURIComponent(key))
        assignJson(
            json, pathArray,
            stringList.join('\t'),
            pathPrevious == path // if this path is equal to previous, append
        )
        pathPrevious = path
    }
}

function main(argv) {
    const minimist = require('minimist')
    const option = minimist(argv.slice(2), {
        string: Array.from('xm'),
        boolean: Array.from('lrdpc'),
        alias: {
            l: 'list',
            r: 'translate', // broken
            d: 'debug',
            p: 'patch',
            c: 'split',
            x: 'exclude',
            m: 'match',
            f: 'from', // broken
            t: 'to' // broken
        }
    })
    if (option.debug) {
        debug = true
        console.log(option)
    }
    if (option.exclude) excludeString.push(...option.exclude)
    if (option.match) targetRegexp = new RegExp(option.match)

    if (option.translate) {
        const translateOption = {from: option.from, to: option.to}
        const file = option._[0]
        const json = readJson(file)
        translate(json, translateOption, 'translate.google.com')
            .then(translateJson => {
                console.log(JSON.stringify(translateJson))
            })
    }
    else if (option.list) {
        const file = option._[0]
        const json = readJson(file)
        jsonTreeWalkObject(json, [], logString)
    }
    else if (option.patch) {
        const file = option._[0]
        const json = readJson(file)
        readStdin().then(patch => {
            if (debug) console.log(json)
            patchJson(json, patch)
            console.log(JSON.stringify(json, ' '))
        })
    }
    else if (option.split) {
        const file = option._[0]
        const json = readJson(file)
        for (const key in json) {
            const output = JSON.stringify(json[key])
            console.log(`write to ${key}`)
            fs.writeFileSync(key, output, 'utf8')
        }
    }
    else {
        const base = process.argv[1].replace(/^.*\//, '')
        console.log(`usage:
${base} [{--debug|-d}] {--split|-c} merge.json
${base} [-d] {--list|-l} [{-m|--match} regexp] [{-x|--exclude} string] subtitle.json > subtitle.tsv
${base} [-d] {--patch|-p} subtitle.json < translate.tsv > translate.json`)
    }
}

if (require.main == module) {
    const process = require('process')
    const returnValue = main(process.argv)
    // if (returnValue < 0 || 0 > returnValue) process.exit(returnValue)
}
