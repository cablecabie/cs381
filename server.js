const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://s1299841:1303313524Aa@cluster0.uuchtz5.mongodb.net/?retryWrites=true&w=majority'; 
const dbName = 'test';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');

//app.use(formidable());
app.set('view engine', 'ejs');




const greetingMsg = (name = null, includeTime = false) => {
  let today = new Date();
  let msg = (name != null) ? 'Hello ' + name + '! ' : 'Hello there!';
  if (includeTime) {
    msg += ` It is now ${today.toLocaleTimeString('en-US', { timeZone: 'Asia/Hong_Kong' })}`;
  }
  return msg;
};

app.use(express.static('views'));  // folder for static contents
app.use("/download",express.static('views/video'));  // virtual path /download -> views/video
var documents = {};




//2.userinfo
var usersinfo = new Array(
    {name: "ds1", password: "381"},
    {name: "ds2", password: "381"},
    {name: "ds3", password: "381"},
    {name: "ds4", password: "381"}
);
var documents = {};
const SECRETKEY = '381';
//Main Body
app.use(session({
    userid: "session",  
    keys: [SECRETKEY],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const createDocument = function(db, createddocuments, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB database server.");
        const db = client.db(dbName);

        db.collection('Library_document_info').insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}


const findDocument =  function(db, criteria, callback){
    let cursor = db.collection('Library_document_info').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        return callback(docs);
    });
}

const handle_Find = function(res, criteria){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, criteria, function(docs){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    });
}

const handle_Details = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let user = {};
        user['_id'] = ObjectID(criteria._id)
        findDocument(db, user, function(docs){ 
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {item: docs[0]});
        });
    });
}


const handle_Edit = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('Library_document_info').find(documentID);
        cursor.toArray(function(err,docs) {
            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{item: docs[0]});

        });
    });
}

const updateDocument = function(criteria, updatedocument, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        console.log(criteria);
	console.log(updatedocument);
	
        db.collection('Library_document_info').updateOne(criteria,{
                $set: updatedocument
            }, function(err, results){
                client.close();
                assert.equal(err, null);
                return callback(results);
            }
        );
    });
}

app.get('/', function(req, res) {
  if (!req.session.authenticated) {
    console.log("...Not authenticated; directing to login");
    res.redirect("/login");
  } else {
    console.log("...Authenticated user; redirecting to home");
    res.redirect("/home");
  }
});

//1. Login

// Render login page
app.get('/login', function(req, res){
  console.log("...Welcome to the login page.");
  res.sendFile(__dirname + '/public/login.html');
  return res.status(200).render("login");
});

// Handle login request
app.post('/login', function(req, res){
  const username = req.body.account;
  const password = req.body.password;
  console.log("...Handling your login request");

  // Check if the username and password match
  const user = usersinfo.find(user => user.name === username && user.password === password);
  if (user) {
    req.session.authenticated = true;
    req.session.userid = user.name;
    req.session.usernamedisplay = username;
    console.log(req.session.userid);
    return res.status(200).redirect("/home");
  }

  console.log("Invalid username or password.");
  return res.redirect("/");
});



// Logout
app.get('/logout', function(req, res){
    const username = req.session.userid; // Get the username from the session

    // Clear the session and authentication status
    req.session = null;
    req.authenticated = false;

    // Generate a random farewell message
    const farewellMessages = [
        `Goodbye, ${username}! See you next time.`,
        `Logging out ${username}. Have a great day!`,
        `Until we meet again, ${username}!`,
        `Logout successful. Take care, ${username}!`
    ];
    const randomIndex = Math.floor(Math.random() * farewellMessages.length);
    const farewellMessage = farewellMessages[randomIndex];

    console.log(farewellMessage); // Log the farewell message

    res.redirect('/login');
});

app.get('/list', function(req, res){
    console.log("Show all information! ");
    handle_Find(res,req.query.docs);
    
});

app.get('/home', function(req, res){
    console.log("...Welcome to the home page!");
    
  const usernamedisplay = req.session.usernamedisplay; // Assuming the username is stored in the session
  const greeting = greetingMsg(usernamedisplay, true); // Generate the greeting message with username and time
  return res.status(200).render("home", { greeting });
});


app.get('/create', function(req, res){
    return res.status(200).render("create");
});

app.post('/create', function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
        
        const newDocument = {
            _id: ObjectID,
            UserName: req.body.UserName,
            Date: req.body.date,
            Borrow_or_Return: req.body.borrow_or_return,
            Telephone_Number: req.body.phone_num,
            Remark: req.body.remark,
            ownerID: req.session.userid
        };

        const bookinfo = {
            Book_Type: req.body.book_type,
        };
        if (req.body.book_name) {
            bookinfo.Book_Name = req.body.book_name;
        }
        newDocument.Book_Information = bookinfo;
        
        console.log("...putting data into documents");
        
        if (newDocument.UserName) {
            console.log("...Creating the document");
            createDocument(db, newDocument, function(docs){
                client.close();
                console.log("Closed DB connection");
                return res.status(200).render('info', {message: "Document is created successfully!"});
            });
        } else {
            client.close();
            console.log("Closed DB connection");
            return res.status(200).render('info', {message: "Invalid entry - User Name is compulsory!"});
        }
    });
});


const deleteDocument = function(db, criteria, callback){
console.log(criteria);
	db.collection('Library_document_info').deleteOne(criteria, function(err, results){
	assert.equal(err, null);
	console.log(results);
	return callback();
	});

};

const handle_Delete = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);
	
	let deldocument = {};
	
        deldocument["_id"] = ObjectID(criteria._id);
        deldocument["ownerID"] = criteria.owner;
        console.log(deldocument["_id"]);
        console.log(deldocument["ownerID"]);
        
        deleteDocument(db, deldocument, function(results){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Document is successfully deleted."});
        })     
    });
    //client.close();
    //res.status(200).render('info', {message: "Document is successfully deleted."});
}




app.post('/search', function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
    
        var searchID={};
        searchID['UserName'] = req.body.UserName;
    
        if (searchID.UserName){
            // Generate a unique search operation ID
            const searchOperationID = Math.floor(Math.random() * 1000000);

            console.log(`...Searching the document with operation ID: ${searchOperationID}`);
            findDocument(db, searchID, function(docs){
                client.close();
                console.log(`Closed DB connection for search operation ID: ${searchOperationID}`);
                res.status(200).render('display', {nItems: docs.length, items: docs});
            });
        }
        else{
            console.log("Invalid Entry - UserName is compulsory for searching!");
            res.status(200).redirect('/find');
        }         	
    });
});

app.get('/find', function(req, res){
    return res.status(200).render("search");
});

app.get('/details', function(req,res){
    handle_Details(res, req.query);
});

app.post('/update', function(req, res){
    const updatedDocument = {};
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the server.");
        
        if (req.body.phone_num) {
            updatedDocument.ownerID = req.session.userid;
            updatedDocument.Telephone_Number = req.body.phone_num;
            updatedDocument.Date = req.body.date;
            updatedDocument.Borrow_or_Return = req.body.borrow_or_return;
            updatedDocument.Remark = req.body.remark;
            
            const bookinfo = {
                Book_Type: req.body.book_type
            };
            if (req.body.book_name) {
                bookinfo.Book_Name = req.body.book_name;
            }
            updatedDocument.Book_Information = bookinfo;
            
            const updateDoc = {
                UserName: req.body.postId
            };
            
            console.log(updateDoc);
            
            updateDocument(updateDoc, updatedDocument, function(docs) {
                client.close();
                console.log("Closed DB connection");
                return res.render('info', {message: "Document is updated successfully!"});
            });
        } else {
            client.close();
            console.log("Closed DB connection");
            return res.render('info', {message: "Invalid entry - User Name is compulsory!"});
        }
    });
});


app.get('/edit', function(req,res) {
    handle_Edit(res, req.query);
})

app.get('/delete', function(req, res){
    const owner = req.query.owner;
    const currentUser = req.session.userid;

    if (owner === currentUser) {
        // Generate a random greeting message
        const greetings = [
            "Hello!",
            "Hi there!",
            "Greetings!",
            "Hey!"
        ];
        const randomIndex = Math.floor(Math.random() * greetings.length);
        const greeting = greetings[randomIndex];

        console.log(greeting); // Log the random greeting

        handle_Delete(res, req.query);
    } else {
        return res.status(200).render('info', {
            message: `Access denied - You don't have the access and deletion right.
                      You are using user: ${currentUser}. The original owner is: ${owner}`,
        });
    }
});


// Restful find
//curl -X GET http://localhost:3000/api/forfind/UserName/Luka
app.get('/api/forfind/UserName/:UserName', function(req,res) {
    if (req.params.UserName) {
        let criteria = {};
        criteria['UserName'] = req.params.UserName;
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, function(docs){
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing book id"});
    }
})

//Restful delete
//curl -X DELETE localhost:3000/api/fordelete/UserName/BK999

app.delete('/api/fordelete/UserName/:UserName', function(req, res){
    if (req.params.UserName) {
        let criteria = {};
        criteria['UserName'] = req.params.UserName;
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            db.collection('Library_document_info').deleteMany(criteria, function(err, results) {
                assert.equal(err, null);
                client.close();

                // Check if any documents were deleted
                if (results.deletedCount > 0) {
                    res.status(200).json({ "message": `${req.params.UserName} deleted successfully` });
                } else {
                    res.status(404).json({ "message": `${req.params.UserName} not found` });
                }
            });
        });
    } else {
        res.status(400).json({"error": "missing username"});       
    }
});


// Restful Update
/*
curl -X PUT -H "Content-Type: application/json" -d '{
    "UserName": "hahaha",
    "date": "2023-11-10",
    "borrow_or_return": "return",
    "phone_num": "01212331",
    "remark": "No",
    "book_type": "Fiction",
    "book_name": "NewHOME ",
    "ownerID": "jt4"
}' "http://localhost:3000/api/UserName/JTTTTTTTT"
*/
app.put('/api/UserName/:UserName', (req, res) => {
    const username = req.params.UserName;

    // Define the updated document
    const updatedDocument = {
        _id: ObjectID,
        UserName: req.body.UserName,
        Date: req.body.date,
        Borrow_or_Return: req.body.borrow_or_return,
        Telephone_Number: req.body.phone_num,
        Remark: req.body.remark,
        ownerID: req.body.ownerID,
        Book_Information: {
            Book_Type: req.body.book_type,
            Book_Name: req.body.book_name
        }
    };

    // Create a new MongoDB client
    const client = new MongoClient(mongourl, { useNewUrlParser: true, useUnifiedTopology: true });
    
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        // Access your DB within the client.connect callback to ensure it's defined
        const db = client.db(dbName);

        // Update the document in MongoDB
        db.collection('Library_document_info').findOneAndUpdate(
            { UserName: username },
            { $set: updatedDocument },
            { returnOriginal: false },
            (err, result) => {
                client.close();  // Close the connection when you're done
                if (err) {
                    console.error('Error updating document:', err);
                    res.status(500).json({ message: 'Error updating document' });
                } else {
                    if (result.value === null) {
                        res.status(404).json({ message: 'Document not found' });
                    } else {
                        console.log('Document updated successfully');
                        res.status(200).json({ message: 'Document updated successfully', updatedDocument: result.value });
                    }
                }
            }
        );
    });
});

/*curl -X POST -H "Content-Type: application/json" -d "
	{\"UserName\":\"luffy\",
	\"Date\":\"2023-01-01\",
	\"Borrow_or_Return\":\"Borrow\",	
	\"Telephone_Number\":\"1234567890\",
	\"Remark\":\"Sample remark\",
	\"ownerID\":\"123\",
	\"Book_Information\":
	{\"Book_Type\":\"fiction\",\"Book_Name\":\"one piece\"}}" 
	http://localhost:3000/api/UserName/luffy
*/
//Restful Create
app.post('/api/UserName/:UserName', (req, res) => {
    if (req.body.UserName) {
        // Check if Borrow_or_Return is either 'Borrow' or 'Return'
        if (req.body.Borrow_or_Return !== 'Borrow' && req.body.Borrow_or_Return !== 'Return') {
            return res.status(400).json({ "error": "Invalid Input. It should be either 'borrow' or 'return'." });
        }

        console.log(req.fields);
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to the server");
            const db = client.db(dbName);
            let newDoc = {
                UserName: req.body.UserName,  
                Date: req.body.Date,
                Borrow_or_Return: req.body.Borrow_or_Return,
                Telephone_Number: req.body.Telephone_Number,
                Remark: req.body.Remark,
                ownerID: req.body.ownerID,
  		Book_Information: req.body.Book_Information
            };

            db.collection('Library_document_info').insertOne(newDoc, (err, results) => {
                assert.equal(err, null);
                client.close();
                res.status(200).json({ "Successfully inserted": newDoc }).end();
            });
        });
    } else {
        res.status(500).json({ "error": "missing UserName" });
    }
});





app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
