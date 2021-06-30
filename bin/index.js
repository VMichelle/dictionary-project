#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const { argv } = require('process');
const memoryStorage = require('../memory');

const options = yargs
    .usage('vu -keys (returns all keys in the dictionary)')
    .options({
        'm': {
            alias: 'members',
            describe: 'vu -m <key> Returns the collection of strings for the given key.',
            requiresArg: true,
            type: 'string'
        },
        'a': {
            alias: 'add',
            describe: 'vu -a <key> <value> Adds a single string member to the collection.',
            requiresArg: true,
            type: 'string'
        },
        'k': {
            alias: 'keys',
            describe: 'vu -k All keys',
        },
        'i': {
            alias: 'items',
            describe: 'vu -i returns all items ',
        },
        'c': {
            alias: 'clear',
            describe: 'vu -c clears all dictionary entries',
        },
        'r': {
            alias: 'remove',
            describe: 'vu -r <key> removes members by key',
            type: 'string'
        },
        'd': {
            alias: 'definitionExists',
            describe: 'vu -d <key> <value> returns boolean if member exists on that key',
            type: 'string'
        },
        'h': {
            alias: 'hasKey',
            describe: 'vu -e <key> returns whether a key exists or not',
            type: 'string'
        },
        's': {
            alias: 'showMembers',
            describe: 'vu -s : shows all members'
        },
        'p': {
            alias: 'purge',
            describe: 'vu -p <key> <member> : purges the key value pair from the dictionary'
        }
    })
    .argv;

const userInput = argv[2];

const showAllMembers = allDefinition => {
    allDefinition.map(item => {
        const [members] = Object.values(item);
        console.log(members);
    })       
};

const checkForExistingKey = key => {
    const hasExisting = memoryStorage.some(item => {
        const itemKey = Object.keys(item).shift();
        return itemKey.toLocaleLowerCase() === key.toLocaleLowerCase();
    });

    console.log(hasExisting);
};

const checkForExistingMember = (key, value) => {
    const hasExisting = memoryStorage.some(item => {
        const [itemKey] = Object.keys(item);
        const [itemValue] = Object.values(item);

        return itemValue.toLocaleLowerCase() === value.toLocaleLowerCase() && itemKey.toLocaleLowerCase() === key.toLocaleLowerCase();
    });

    return hasExisting;
};

const getAllKeys = allDefinition => {
    const allDefinitions = allDefinition;
    allDefinitions.map(item => console.log(...Object.keys(item)))
};

const getAllItems = () => {
    const allDefinitions = memoryStorage;
    allDefinitions.map(item => {
        const [itemKey] = Object.keys(item);
        const [itemValue] = Object.values(item);
        console.log(`${itemKey}: ${itemValue}`)
    });
};

const getMemberByKey = options => {
    const searchValue = options.members;
    const allDefinitions = memoryStorage;

    const filteredDefinitions = allDefinitions.filter(item => {
        const [key] = Object.keys(item)
        return key.toLocaleLowerCase() == searchValue.toLocaleLowerCase();
    })
    
    if(filteredDefinitions.length === 0) {
        return console.log('Error: key does not exist')
    };

    filteredDefinitions.map(item => console.log(...Object.values(item)))
};

const addNewMember = options => {
        const key = options.add;
        const [value] = options._;
        const newDefinition = {[key]: `${value}`};  
        const hasExisting = checkForExistingMember(key, value);

        if(hasExisting) {
            return console.log('ERROR, member already exists for key');
        };
        
        memoryStorage.push(newDefinition);
        
        fs.writeFile('../memory.json', JSON.stringify(memoryStorage), err => {
            if(err) throw err;
            console.log("Added:", newDefinition )
        });
};

const removeMembersByKey = key => {
    const hasMatchingKey = memoryStorage.some(item => {
        const itemKey = Object.keys(item).shift();
        return itemKey.toLocaleLowerCase() === key.toLocaleLowerCase();
    })

    if(hasMatchingKey) {
        const filteredList = memoryStorage.filter(item => {
            const [itemKey] = Object.keys(item);
            return itemKey.toLocaleLowerCase() !== key.toLocaleLowerCase();
        })

        fs.writeFile('../memory.json', JSON.stringify(filteredList), err => {
            if(err) throw err;
            console.log(`Removed all for: ${key}`)
        });
    } else {
        console.log('ERROR, key does not exist')
    };
};

// CLEAR: Removes all keys and all members from the dictionary.
const clearAll = () => {
    fs.writeFile('../memory.json', JSON.stringify([]), err => {
        if(err) throw err;
        console.log(`Cleared all`)
    });
};

const checkForMemberAndKey = options => {
    const key = options.d;
    const value = options._;
    const hasMemeberAtKey = checkForExistingMember(key, value);
    
    console.log(hasMemeberAtKey);
};

// REMOVE: Removes a member from a key. 
const purgeKeyValuePair = options => {
    const key = options.p;
    const [value] = options._;
    const hasMatch = checkForExistingMember(key, value);

    if (hasMatch) {
        const filteredList = memoryStorage.filter(item => {
            const [itemKey] = Object.keys(item);
            const [itemValue] = Object.values(item);
            return itemKey.toLocaleLowerCase() !== key.toLocaleLowerCase() && itemValue.toLocaleLowerCase() !== value.toLocaleLowerCase();
        })

        fs.writeFile('../memory.json', JSON.stringify(filteredList), err => {
            if(err) throw err;
            console.log(`Purged: ${key}: ${value}`)
        });
    } else {
        console.log('ERROR, member does not exist')
    }
};

switch(userInput) {
    case '-k':
    case '--keys':
        getAllKeys(memoryStorage);
        break;
    case '-m':
    case '--members':
        getMemberByKey(options);
        break;
    case '-a':
    case '--add':
        addNewMember(options);
        break;
    case '-c':
    case '--clear':
        clearAll();
        break;
    case '-i':
    case '--items':
        getAllItems();
        break;
    case '-r':
    case '--remove':
        removeMembersByKey(options.r)
        break;
    case '-h':
    case '--hasKey':
        checkForExistingKey(options.h);
        break;
    case '-d':
    case '--definitionExists':
        checkForMemberAndKey(options);
        break;
    case '-s':
    case '--showMembers':
        showAllMembers(memoryStorage);
        break;
    case '-p':
    case '--purge':
        purgeKeyValuePair(options)
        break;
    default:
        console.log('Error: option does not exist') 
};