
var usernames = ["Cammie", "Chidi", "Benny", "Chirag"];
var passwords = ["$56#hdj", "$56#asd", "$56#mqw", "$56#sla"];

function logins(ulist, plist) {
    let index = 0;
    const loginList = ulist.map(n => {
        return {
            name: n,
            password: plist[index++]
        };
    });
    return loginList;
}

console.log(logins(usernames, passwords));

var animals = {"rat": 0, "Hamster": 100, "cat": 200, "dog": 300,
    "rabbit": 400, "lizard": 500, "goldfish": 600, "fly": 700};

function animalFilter(alist) {
    let sum = 0;
    for (var key in alist) {
        if (key.length === 3) {
            sum += alist[key];
        } else {
            sum -= alist[key];
        }
    }
    return sum;
}

console.log(animalFilter(animals));
