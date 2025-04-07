const mysql=require('mysql');
const dotenv=require('dotenv');
const crypto = require("crypto");

dotenv.config();

let instance=null;
const connection=mysql.createConnection({
    host:process.env.HOST,
    user:process.env.DB_USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,
    port:process.env.DB_PORT
});

connection.connect((err)=>{
    if(err){
        console.log(err.message);
    }
    console.log(' db '+ connection.state);
});


class DbService{
    static getDbServiceInstance(){
        return instance? instance:new DbService();
    }
    async getAllQuests(){
        try{
            const response=await new Promise((resolve,reject)=>{
           
                const query="SELECT * FROM quests";
                connection.query(query,(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
        });
            //console.log(response);
            return response;
        }catch(error){
            console.log(error);
        }
        
    }

   
    async getUser(username,password){
       
        try{
           

            const response=await new Promise((resolve,reject)=>{
           
                const query="SELECT name FROM users WHERE username=? AND password=?";
                connection.query(query,[username,password],(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
        });
            
            return response;
        }catch(error){
            console.log(error);
        }
    }

    async deleteQuest(questId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT q.map AS questMap, m.marker_image AS markerImage, m.prefab AS prefabImage
                    FROM quests q
                    LEFT JOIN markers m ON q.id = m.quest_id
                    WHERE q.id = ?;
                `;
                connection.query(query, [questId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
    
            return response; // Return file paths before deletion
        } catch (error) {
            console.log(error);
        }
    }
    


    async deleteQuestFromDB(questId){
       
        try{
           

            const response=await new Promise((resolve,reject)=>{
           
                const query="DELETE FROM quests WHERE id = ?;";
                connection.query(query,[questId],(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
        });
            
            return response;
        }catch(error){
            console.log(error);
        }
    }
    async addQuest(questName,with_order,questMap){
       
        try{
           

            const response=await new Promise((resolve,reject)=>{
           
                const query="INSERT INTO quests (name, with_order, map) VALUES (?, ?, ?);";
                connection.query(query,[questName,with_order,questMap],(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results.insertId);
                })
        });
            
            return response;
        }catch(error){
            console.log(error);
        }
    }
    async addMarker(quest_id,name,latitude,longitude,marker_image,prefab,hint1,hint2,level_of_ease){
       
        try{
           

            const response=await new Promise((resolve,reject)=>{
           
                const query="INSERT INTO markers (quest_id, name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
                connection.query(query,[quest_id,name,latitude,longitude,marker_image,prefab,hint1,hint2,level_of_ease],(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
        });
            
            return response;
        }catch(error){
            console.log(error);
        }
    }
    async updateQuest(questId, questName, with_order, questMap) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE quests SET name = ?, with_order = ?, map = ? WHERE id = ?;";
                connection.query(query, [questName, with_order, questMap, questId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
    
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    async updateMarker(markerId, name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE markers SET name = ?, latitude = ?, longitude = ?, marker_image = ?, prefab = ?, hint1 = ?, hint2 = ?, level_of_ease = ? WHERE id = ?;";
                connection.query(query, [name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease, markerId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
    
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getQuest(questId){
       
        try{
           

            const response=await new Promise((resolve,reject)=>{
           
                const query="SELECT  q.id AS quest_id,q.name AS quest_name,q.with_order,q.map AS quest_map,m.id AS marker_id,m.name AS marker_name,m.latitude,m.longitude,m.marker_image,m.prefab,m.hint1,m.hint2,m.level_of_ease FROM quests q LEFT JOIN markers m ON q.id = m.quest_id WHERE q.id = ?;";
                connection.query(query,[questId],(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
        });
            
            return response;
        }catch(error){
            console.log(error);
        }
    }

    async getQuestsUnity(){
        try{
            const response=await new Promise((resolve,reject)=>{
           
                const query="SELECT q.id AS quest_id, q.name AS quest_name, q.with_order,  q.map AS quest_map,  m.id AS marker_id, m.name AS marker_name,  m.latitude,  m.longitude,  m.marker_image, m.prefab,  m.hint1, m.hint2, m.level_of_ease FROM quests q LEFT JOIN markers m ON q.id = m.quest_id ORDER BY q.id, m.id;";
                connection.query(query,(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
        });
            //console.log(response);
            return response;
        }catch(error){
            console.log(error);
        }
        
    }
    async getPlayer(emailOrUsername, password) {
        try {
            // Regular expression to validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
            let query, params;
    
            if (emailRegex.test(emailOrUsername)) {
                // If it's a valid email, search by email
                query = "SELECT * FROM `players` WHERE Email=? AND Password=?";
                params = [emailOrUsername, password];
            } else {
                // If not a valid email, search by username
                query = "SELECT * FROM `players` WHERE Username=? AND Password=?";
                params = [emailOrUsername, password];
            }
    
            const response = await new Promise((resolve, reject) => {
                connection.query(query, params, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
    
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    async getQuestsByPlayer(username) {
        try{
           

            const response=await new Promise((resolve,reject)=>{
           
                const query="SELECT * FROM `questtimes` WHERE Player_Username=?;";
                connection.query(query,[username],(err,results)=>{
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
        });
            
            return response;
        }catch(error){
            console.log(error);
        }
    }






    async signUp(username, name, email, city, country, age, sexe, points, coins, gems, total_quests, started_quests, finished_quests) {
        try {
            // Check if username already exists
            const userExists = await new Promise((resolve, reject) => {
                const checkQuery = "SELECT COUNT(*) AS count FROM Players WHERE Username = ?";
                connection.query(checkQuery, [username], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results[0].count > 0); // If count > 0, username exists
                });
            });
    
            const emailExists = await new Promise((resolve, reject) => {
                const checkQuery = "SELECT COUNT(*) AS count FROM Players WHERE Email = ?";
                connection.query(checkQuery, [email], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results[0].count > 0); // If count > 0, email exists
                });
            });
    
            if (userExists) {
                return { success: false, exception: "username", message: "Username already taken!" };
            }
            if (emailExists) {
                return { success: false, exception: "email", message: "There is aleady an account attached to this email , consider sign in !" };
            }
    
            const response = await new Promise((resolve, reject) => {
                const query = "INSERT INTO Players (Username, Name, Email, City, Country, Age, Sexe, Points, Coins, Gems, Total_Quests, Started_Quests, Finished_Quests) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?,?,?);";
                connection.query(query, [username, name, email, city, country, age, sexe, points, coins, gems, total_quests, started_quests, finished_quests], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
    
            // ADDITION: insert default quest times
           
    
            return { success: true, message: "User registered successfully!" };
        } catch (error) {
            console.log(error);
        }
    }
    
    
    async  storeTempUser(username,password, name, email, city, country, age, sexe) {
        try {
            const verificationToken = crypto.randomBytes(32).toString("hex");
    
           


            await new Promise((resolve, reject) => {
                const query = "INSERT INTO TempUsers (Username, Name, Password,Email, City, Country, Age, Sexe, VerificationToken) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?)";
                connection.query(query, [username, name, password,email, city, country, age, sexe, verificationToken], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
    
            return verificationToken;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async  verifyUser(token) {
        try {
           
            // Retrieve user from TempUsers
            const user = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM TempUsers WHERE VerificationToken = ?";
                connection.query(query, [token], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results.length > 0 ? results[0] : null);
                });
            });
    
            if (!user) {
                return { success: false, message: "Invalid or expired token!" };
            }
    
            // Insert into Players table
            await new Promise((resolve, reject) => {
                const query = "INSERT INTO Players (Username, Name, Email, City,Password, Country, Age, Sexe, Points, Coins, Gems, Total_Quests, Started_Quests, Finished_Quests) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                connection.query(query, [user.Username, user.Name, user.Email, user.City, user.Password,user.Country, user.Age, user.Sexe, 0, 0, 0, 0, 0, 0], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            const quests = await new Promise((resolve, reject) => {
                const query = "SELECT Name FROM Quests";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results.map(row => row.Name));
                });
            });
    
            for (const questName of quests) {
                await new Promise((resolve, reject) => {
                    const insertQuery = "INSERT INTO QuestTimes (Player_Username , Quest_Name, Completion_Time,started) VALUES (?, ?, NULL,0)";
                    connection.query(insertQuery, [user.Username, questName], (err, result) => {
                        if (err) reject(new Error(err.message));
                        resolve(result);
                    });
                });
            }
    
            // Delete user from TempUsers
            await new Promise((resolve, reject) => {
                const query = "DELETE FROM TempUsers WHERE VerificationToken = ?";
                connection.query(query, [token], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
    
            return { success: true, message: "Your account has been verified!" };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    

}


module.exports=DbService;