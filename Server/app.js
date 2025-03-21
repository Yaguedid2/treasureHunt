const express=require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const app=express();
const cors=require('cors');
const dotenv=require('dotenv');
dotenv.config();



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(session({
   secret: 'FC1D39E951195ADEC1CFA5B2A9ABC', // Change this to a strong secret key
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


app.get('/', (req, res) => {
   if (req.session.user) {
    return  res.sendFile(__dirname + '/public/displayQuests.html');
  }
   res.sendFile(__dirname + '/public/login.html');
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
       return res.redirect('/');
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
       res.redirect('/');
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
                    const difficultyLevel=typeof(req.body.difficultyLevel)=='object'?req.body.difficultyLevel[index]:req.body.difficultyLevel;

                    db.addMarker(questId,markerName,latitude,longitude,markerImage,prefab,hint1,hint2,difficultyLevel); 
                   
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
        return res.redirect('/');
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
        return res.redirect('/');
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
          
            if (markerId) {
              
                 db.updateMarker(markerId, markerName, latitude, longitude, markerImage, prefab, hint1, hint2, difficultyLevel);
            }else{
              
                db.addMarker(questId,markerName,latitude,longitude,markerImage,prefab,hint1,hint2,difficultyLevel); 
            }
           
    
    

            res.redirect('back');
});

////////////////////////////////end quest creation///////////////////////////////////////////
///////////////////////////////Edit Quest///////////////////////////////////////////////////
app.get('/modifyQuest', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
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


////////////////////////////////APi for Unity/////////////////////////////////////////////////

app.get('/getQuestsUnity', (req, res) => {
    const db=DbService.getDbServiceInstance();
    db.getQuestsUnity()
    .then(data=>res.json(data))
    .catch(err=>{
        console.log(err);
    })
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