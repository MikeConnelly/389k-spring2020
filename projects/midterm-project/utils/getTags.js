module.exports = data => {
    var allTags = [];
    for(var i = 0; i < data.length; i++) {
        var tags = data[i].tags;
        for(var j = 0; j < tags.length; j++) {
            if(!~allTags.indexOf(tags[j])) allTags.push(tags[j]);
        }
    }
    return allTags;
}
