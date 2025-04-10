const express=require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const app=express();
const cors=require('cors');
const dotenv=require('dotenv');
const nodemailer = require("nodemailer");
dotenv.config();



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(session({
   secret: 'FC1D39E951195ADEC1CFA5B2A9ABC', 
   resave: false,
   saveUninitialized: true,
   cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Set storage engine for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({ storage: storage });
//////

const transporter = nodemailer.createTransport({
    name: 'upo-opu.com',
    host: "mail.upo-opu.com", 
    port: 465, 
    secure: true, // Set to true if using port 465 (SSL)
    auth: {
        user: "treasurehunt@upo-opu.com", // Replace with your Bluehost email
        pass: "casa@CASA789789789" // Use your email password
    },
    tls: {
        rejectUnauthorized: false // Important to prevent SSL issues
    },
   
});


//////////////////


app.get('/admin', (req, res) => {
   if (req.session.user) {
    return  res.sendFile(__dirname + '/public/displayQuests.html');
  }
   res.sendFile(__dirname + '/public/login.html');
});

app.get('/loginPlayer', (req, res) => {
    
    res.sendFile(__dirname + '/public/loginPlayer.html');
 });
 app.get('/redirecting', (req, res) => {
    
    res.sendFile(__dirname + '/public/redirecting.html');
 });
app.get('/', (req, res) => {
   
    res.sendFile(__dirname + '/public/index.html');
 });
 app.get('/verified', (req, res) => {
    
    res.sendFile(__dirname + '/public/Verified.html');
 });
 


const DbService = require('./dbService');



////////////////////////login//////////////////////////////
let _username;

app.post('/getUser',(request,response)=>{
   const {username,password}=request.body;
  
   const db=DbService.getDbServiceInstance();

   db.getUser(username, password)
        .then(data => {
            if (data.length > 0) {
                // Store user session
                request.session.user = username;
                _username=data[0].name;
                response.json({ success: true });
            } else {
                response.json({ success: false, message: "Invalid username or password" });
            }
        })
        .catch(err => {
            console.log(err);
            response.status(500).json({ success: false, message: "Internal server error " });
        });
});
app.post('/getplayer', (request, response) => {
    const { email, password } = request.body;
    const db = DbService.getDbServiceInstance();

    db.getPlayer(email, password)
        .then(data => {
            if (data.length > 0) {
                // Store player session
                request.session.player = data[0]; // You can store full object or just email
                response.json(data[0]);
            } else {
                response.json({ success: false, message: "Invalid email or password" });
            }
        })
        .catch(err => {
            console.log(err);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});




app.get('/getPlayer', (req, res) => {
    if (req.session.player) {
        return res.json({ loggedIn: true, player: req.session.player.Name });
    } else {
        return res.json({ loggedIn: false });
    }
});
app.get('/logoutPlayer', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});
app.get('/displayQuests', (req, res) => {
   if (!req.session.user) {
       return res.redirect('/');
   }
   res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '-1'
  });
   res.sendFile(__dirname + '/public/displayQuests.html');
});


app.get('/addQuest', (req, res) => {
   if (!req.session.user) {
       return res.redirect('/admin');
   }
   res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '-1'
  });
   res.sendFile(__dirname + '/public/createQuest.html');
});
app.get('/logout', (req, res) => {
   req.session.destroy(() => {
       res.redirect('/admin');
   });
});
app.get('/getUserName', (req, res) => {
   res.json(_username);
});
///////////////////////end login////////////////////////////////////
//////////////////////get Quests////////////////////////////////////

app.get('/getQuests', (req, res) => {
    const db=DbService.getDbServiceInstance();
    db.getAllQuests()
    .then(data=>res.json(data))
    .catch(err=>{
        console.log(err);
    })
 });
/////////////////////end get Quests////////////////////////////////
///////////////////detele quest //////////////////////////////////
const fs = require('fs');
app.post('/deleteQuest', async (request, response) => {
    const { questId } = request.body;
    const db = DbService.getDbServiceInstance();

    try {
        // Get file paths
        const filesToDelete = await db.deleteQuest(questId);
        
        // Delete files from uploads folder
        filesToDelete.forEach(file => {
            if (file.questMap) fs.unlink(`${file.questMap}`, err => { if (err) console.log(err); });
            if (file.markerImage) fs.unlink(`${file.markerImage}`, err => { if (err) console.log(err); });
            if (file.prefabImage) fs.unlink(`${file.prefabImage}`, err => { if (err) console.log(err); });
        });

        // Proceed to delete the quest and markers
        await db.deleteQuestFromDB(questId);
        
        response.json({ success: true, message: "Quest deleted successfully" });
    } catch (err) {
        console.log(err);
        response.status(500).json({ success: false, message: "Delete Failed" });
    }
});
///////////////////////////end delete quest////////////////////////////
////////////////////////// Handle Quest creation///////////////////////
app.post('/upload', upload.fields([
    { name: 'QuestMap', maxCount: 1 },
    { name: 'MarkerImage', maxCount: 100 },
    { name: 'PrefabImage', maxCount: 100 }   
]), (req, res) => {
    const db=DbService.getDbServiceInstance();
    const questName = req.body.questName;
    const order = req.body.order;
    
    const questMap = req.files['QuestMap'] ? req.files['QuestMap'][0].path : null;
    
    // Insert quest into database
    

        db.addQuest(questName,order,questMap)
        .then(questId=>{

            if (req.files['MarkerImage']) {
                req.files['MarkerImage'].forEach((file, index) => {
                    const markerImage = file.path;
                    const prefab = req.files['PrefabImage'][index] ? req.files['PrefabImage'][index].path : null;
                  
                    const markerName=typeof(req.body.markerName)=='object'?req.body.markerName[index]:req.body.markerName;
                    const longitude=typeof(req.body.longitude)=='object'?req.body.longitude[index]:req.body.longitude;
                    const latitude=typeof(req.body.latitude)=='object'? req.body.latitude[index]:req.body.latitude;
                    const hint1=typeof(req.body.hint1)=='object'?req.body.hint1[index]:req.body.hint1;
                    const hint2=typeof(req.body.hint2)=='object'?req.body.hint2[index]:req.body.hint2;
                    const imageSize=typeof(req.body.imageSize)=='object'?req.body.imageSize[index]:req.body.imageSize;
                    const difficultyLevel=typeof(req.body.difficultyLevel)=='object'?req.body.difficultyLevel[index]:req.body.difficultyLevel;

                    db.addMarker(questId,markerName,latitude,longitude,markerImage,prefab,hint1,hint2,difficultyLevel,imageSize,0); 
                   
                });
            }
        })        
         .catch(err => {
             console.log(err);
           
         });
       return  res.sendFile(__dirname + '/public/displayQuests.html');

        
   
});
app.post('/update', upload.fields([
    { name: 'QuestMap', maxCount: 1 }   
]), async (req, res) => {
  
    if (!req.session.user) {
        return res.redirect('/admin');
    }
    const db = DbService.getDbServiceInstance();
    
    const questId = req.body.questId;
   
    // Get existing quest ID
    const questName = req.body.questName;
    const order = req.body.order;
    const questMapOldfile=req.body.questMapOldfile;
    var questMap;
    
     if(req.files['QuestMap']){
        questMap= req.files['QuestMap'][0].path;
        fs.unlink(`uploads\\${questMapOldfile}`, err => { if (err) console.log(err); });
     }else{
        questMap= `uploads\\${questMapOldfile}`;
     }

    // Update the existing quest
    await db.updateQuest(questId, questName, order, questMap);

    // Update existing markers
     
    

    res.redirect('back');
});
app.post('/update-marker', upload.fields([    
    { name: 'MarkerImage', maxCount: 1 },
    { name: 'PrefabImage', maxCount: 1 }
]), async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin');
    }
    const db = DbService.getDbServiceInstance();
    
    const questId = req.body.questId;
   
    
   
       
            var markerImage;
            var prefab;

            if(req.files['MarkerImage']){
                markerImage=req.files['MarkerImage'][0].path;
                fs.unlink(`uploads\\${req.body.old_marker_image_url}`, err => { if (err) console.log(err); });
            }else{
                markerImage=`uploads\\${req.body.old_marker_image_url}`;
            }
            if(req.files['PrefabImage']){
                prefab=req.files['PrefabImage'][0].path;
                fs.unlink(`uploads\\${req.body.old_prefab_url}`, err => { if (err) console.log(err); });
            }else{
                prefab=`uploads\\${req.body.old_prefab_url}`;
            }
            


          
          





            const markerId =req.body.markerId; // Get marker ID
           
            const markerName = req.body.markerName;
            const longitude = req.body.longitude ;
            const latitude = req.body.latitude ;
            const hint1 = req.body.hint1;
            const hint2 = req.body.hint2;
            const difficultyLevel =req.body.difficultyLevel;
            const imageSize =req.body.imageSize;
            if (markerId) {
              
                 db.updateMarker(markerId, markerName, latitude, longitude, markerImage, prefab, hint1, hint2, difficultyLevel,imageSize);
            }else{
              
                db.addMarker(questId,markerName,latitude,longitude,markerImage,prefab,hint1,hint2,difficultyLevel,imageSize,0); 
            }
           
    
    

            res.redirect('back');
});

////////////////////////////////end quest creation///////////////////////////////////////////
///////////////////////////////Edit Quest///////////////////////////////////////////////////
app.get('/modifyQuest', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin');
    }
    res.set({
       'Cache-Control': 'no-store, no-cache, must-revalidate, private',
       'Pragma': 'no-cache',
       'Expires': '-1'
   });
    res.sendFile(__dirname + '/public/modifyQuest.html');
 });


var _questId;
app.post('/setQuestId', (req, res) => {
    const { questId } = req.body;
    _questId=questId;
    
 });
 app.get('/getQuestId', (req, res) => {
    res.json(_questId);
 });
 app.post('/getQuestById',(request,response)=>{
    const {questId}=request.body;
   
    const db=DbService.getDbServiceInstance();
 
    db.getQuest(questId)
         .then(data =>  response.json(data))
         .catch(err => {
             console.log(err);
             
         });
 });
//////////////////////////////End Edit Quest////////////////////////////////////////////////

/////////////////////////////sign up////////////////////////////////////////////////////////





app.get('/signup', (req, res) => {
    
    res.sendFile(__dirname + '/public/signUp.html');
 });

/*

 app.post("/signup", async (req, res) => {
    const { username, name, email, password, city, country, age, sexe } = req.body;
    const db = DbService.getDbServiceInstance();

    try {
        const token = await db.storeTempUser(username, password, name, email, city, country, age, sexe);

        // Check if username already exists
        if (token === -1) {
            return res.status(400).json({ message: "Username Or Email already exists." });
        }

        const verificationLink = `/verify?token=${token}`;

        await transporter.sendMail({
            from: 'treasurehunt@upo-opu.com',
            to: email,
            subject: "Verify Your Account",
            html: `
                <h3>Welcome to Treasure Hunt!</h3>
                <p>Please verify your email by clicking the link below:</p>
                <a href="https://pop-pup.com${verificationLink}">Verification link</a>
            `
        });

        res.status(200).json({ message: "Verification email sent! Please check your inbox." });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Error processing signup request" });
    }
});
*/
app.post("/signup", async (req, res) => {
    const { username, name, email, password, city, country, age, sexe } = req.body;
    const db = DbService.getDbServiceInstance();

    try {
        const result = await db.addPlayerWithoutVerification(username, password, name, email, city, country, age, sexe);
        
        if (result === -1) {
            return res.status(400).json({ message: "Username already exists." });
        } else if (result === -2) {
            return res.status(400).json({ message: "Email already exists." });
        }

        return res.status(200).json({ message: "Signup successful!" });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Error processing signup request" });
    }
});




app.get("/verify", async (req, res) => {
    const token = req.query.token;
    const db=DbService.getDbServiceInstance();
    try {
        const result = await db.verifyUser(token);

        if (result.success) {
           // res.send("<h3>Your account has been verified! You can now log in.</h3>");
           res.sendFile(__dirname + '/public/Verified.html');
        } else {
            res.send("<h3>Invalid or expired token.</h3>");
        }

    } catch (error) {
        res.status(500).send("<h3>Server error while verifying your account.</h3>");
    }
});


////////////////////////////end Sign up/////////////////////////////////////////////////////


////////////////////////////////APi for Unity/////////////////////////////////////////////////

app.get('/getQuestsUnity', (req, res) => {
    const db=DbService.getDbServiceInstance();
    db.getQuestsUnity()
    .then(data=>res.json(data))
    .catch(err=>{
        console.log(err);
    })
 });

 app.post('/getQuestsByPlayer',(request,response)=>{
    const {username}=request.body;
    
    const db=DbService.getDbServiceInstance();
 
    db.getQuestsByPlayer(username)
         .then(data =>  response.json(data))
         .catch(err => {
             console.log(err);
             
         });
 });

 app.post('/updatePlayerQuests', (request, response) => {
    let { playerusername, questname, completionTime, started } = request.body;
    if (completionTime === "null" || completionTime === "" || completionTime == null) {
        completionTime = null;
    }
    const db = DbService.getDbServiceInstance();

    db.updatePlayerQuests(playerusername, questname, completionTime, started)
        .then(result => response.json({ result }))
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: 'An error occurred' });
        });
});
app.post('/updateMarker', (request, response) => {
    const { marker_id, done } = request.body;
    console.log('Received:', { marker_id, done });

    const db = DbService.getDbServiceInstance();

    db.updateMarkerUnity(marker_id, done)
        .then(result => {
            console.log("Database updated:", result);
            response.json({ success: true, result });
        })
        .catch(err => {
            console.error("Error in DB:", err);
            response.status(500).json({ error: 'An error occurred' });
        });
});
 //////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////downlaod /////////////////////

app.get('/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', fileName);

    res.download(filePath, fileName, (err) => {
        if (err) {
            res.status(500).json({ message: "File not found or an error occurred" });
        }
    });
});

///////////////////////////////////////////////////
app.listen(process.env.PORT,()=>console.log('app is running'));