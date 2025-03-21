const mysql=require('mysql');
const dotenv=require('dotenv');


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


}

module.exports=DbService;