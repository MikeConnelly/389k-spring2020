
# PROJECT NAME

---

Name: Michael Connelly

Date: 4/7/20

Project Topic: Coding Challenges

URL: 

---


### 1. Data Format and Storage

Data point fields:
- `Field 1`:     title         `Type: String`
- `Field 2`:     description   `Type: String`
- `Field 3`:     preview       `Type: String`
- `Field 4`:     date          `Type: String`
- `Field 5`:     tags          `Type: [String]`
- `Field 5`:     difficulty    `Type: Number`
- `Field 5`:     id            `Type: Number`

Schema: 
```javascript
{
   title: String,
   description: String,
   preview: String,
   date: String,
   tags: [String],
   difficulty: Number,
   id: Number
}
```

### 2. Add New Data

HTML form route: `/create`

POST endpoint route: `/api/create`

Example Node.js POST request to endpoint: 
```javascript
var request = require("request");

var options = { 
    method: 'POST',
    url: 'http://localhost:3000/api/create',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: { 
      title: 'fibonacci',
      description: 'output the fibonacci sequence',
      tags: ['beginner', 'recursion'],
      difficulty: 3
    } 
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

### 3. View Data

GET endpoint route: `/api/data`

### 4. Search Data

Search Field: `title`

### 5. Navigation Pages

Navigation Filters
1. random -> `  /random  `
2. easiest -> `  /easiest  `
3. hardest -> `  /hardest  `
4. shortest description -> `  /shortest  `
5. longest description -> `  /longest  `
5. sort by tag -> `  /tag/:tag  `

