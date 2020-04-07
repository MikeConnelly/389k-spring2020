var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var pokeDataUtil = require("./poke-data-util");
var _ = require("underscore");
var app = express();
var PORT = 3000;

// Restore original data into poke.json. 
// Leave this here if you want to restore the original dataset 
// and reverse the edits you made. 
// For example, if you add certain weaknesses to Squirtle, this
// will make sure Squirtle is reset back to its original state 
// after you restard your server. 
pokeDataUtil.restoreOriginalData();

// Load contents of poke.json into global variable. 
var _DATA = pokeDataUtil.loadData().pokemon;

/// Setup body-parser. No need to touch this.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res) {
    let contents = "";
    _.each(_DATA, entry => {
        contents += `<tr><td>${entry.id}</td><td><a href="/pokemon/${entry.id}">${entry.name}</a></td></tr>\n`;
    });
    const html = `<html>\n<body>\n<table>${contents}</table>\n</body>\n</html>`;
    res.send(html);
});

app.get("/pokemon/:pokemon_id", function(req, res) {
    const _id = parseInt(req.params.pokemon_id);
    const entry = _.findWhere(_DATA, { id: _id });
    let contents = "";
    _.keys(entry).forEach(key => {
        contents += `<tr><td>${key}</td><td>${JSON.stringify(entry[key])}</td></tr>\n`;
    });
    const html = `<html>\n<body>\n<table>${contents}</table>\n</body>\n</html>`;
    res.send(html);
});

app.get("/pokemon/image/:pokemon_id", function(req, res) {
    const _id = parseInt(req.params.pokemon_id);
    if (!_id) {
        res.send('Error: Pokemon not found');
    } else {
        const entry = _.findWhere(_DATA, { id: _id });
        res.send(`<html>\n<body>\n<img src="${entry.img}">\n</body>\n</html>`);
    }
});

app.get("/api/id/:pokemon_id", function(req, res) {
    var _id = parseInt(req.params.pokemon_id);
    var result = _.findWhere(_DATA, { id: _id })
    if (!result) return res.json({});
    res.json(result);
});

app.get("/api/evochain/:pokemon_name", function(req, res) {
    const _name = req.params.pokemon_name;
    const entry = _.findWhere(_DATA, { name: _name });
    if (!entry) {
        res.json([]);
    }
    const prev_list = _.has(entry, 'prev_evolution') ? entry['prev_evolution'] : [];
    const next_list = _.has(entry, 'next_evolution') ? entry['next_evolution'] : [];
    const evolution_list = [];
    prev_list.forEach(evo => {
        evolution_list.push(evo.name);
    });
    evolution_list.push(_name);
    next_list.forEach(evo => {
        evolution_list.push(evo.name);
    });
    res.json(evolution_list);
});

function getEntriesOfType(_type) {
    return _.filter(_DATA, entry => {
        return _.contains(entry.type, _type);
    });
}

app.get("/api/type/:type", function(req, res) {
    const _type = req.params.type;
    const valid_entries = getEntriesOfType(_type);
    const names = _.map(valid_entries, entry => {
        return entry.name;
    });
    res.json(names);
});

app.get("/api/type/:type/heaviest", function(req, res) {
    const _type = req.params.type;
    const valid_entries = getEntriesOfType(_type);
    if (valid_entries.length === 0) {
        res.json([]);
    } else {
        const sorted_entries = _.sortBy(valid_entries, entry => {
            return parseFloat(entry.weight.slice(0, -3));
        });
        const heaviest = sorted_entries[sorted_entries.length - 1];
        res.json({ name: heaviest.name, weight: parseFloat(heaviest.weight.slice(0, -3))});
    }
});

app.post("/api/weakness/:pokemon_name/add/:weakness_name", function(req, res) {
    const _pokemon = req.params.pokemon_name;
    const _weakness = req.params.weakness_name;
    if (!_pokemon) {
        res.json({});
    }
    const index = _DATA.findIndex(entry => entry.name === _pokemon);
    if (index === -1) {
        res.json({});
    } else if (_.contains(_DATA[index].weaknesses, _weakness)) {
        res.json({ name: _pokemon, weaknesses: _DATA[index].weaknesses });
    } else {
        _DATA[index].weaknesses.push(_weakness);
        pokeDataUtil.saveData(_DATA);
        res.json({ name: _pokemon, weaknesses: _DATA[index].weaknesses });
    }
});

app.delete("/api/weakness/:pokemon_name/remove/:weakness_name", function(req, res) {
    const _pokemon = req.params.pokemon_name;
    const _weakness = req.params.weakness_name;
    if (!_pokemon) {
        res.json({});
    }
    const index = _DATA.findIndex(entry => entry.name === _pokemon);
    if (index === -1) {
        res.json({});
    } else if (!_.contains(_DATA[index].weaknesses, _weakness)) {
        res.json({ name: _pokemon, weaknesses: _DATA[index].weaknesses });
    } else {
        const typeIndex = _DATA[index].weaknesses.findIndex(type => type === _weakness);
        _DATA[index].weaknesses.splice(typeIndex, 1);
        pokeDataUtil.saveData(_DATA);
        res.json({ name: _pokemon, weaknesses: _DATA[index].weaknesses });
    }
});


// Start listening on port PORT
app.listen(PORT, function() {
    console.log('Server listening on port:', PORT);
});

// DO NOT REMOVE (for testing purposes)
exports.PORT = PORT
