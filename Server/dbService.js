const mysql = require('mysql');
const dotenv = require('dotenv');
const crypto = require("crypto");

dotenv.config();

let instance = null;
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(' db ' + connection.state);
});


class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllQuests() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM quests";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getUser(username, password) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT name FROM users WHERE username=? AND password=?";
                connection.query(query, [username, password], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
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
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async deleteQuestFromDB(questId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM quests WHERE id = ?;";
                connection.query(query, [questId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async addQuest(questName, with_order, questMap) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "INSERT INTO quests (name, with_order, map) VALUES (?, ?, ?);";
                connection.query(query, [questName, with_order, questMap], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results.insertId);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async addMarker(quest_id, name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease,imagesize) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "INSERT INTO markers (quest_id, name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease,imagesize ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?);";
                connection.query(query, [quest_id, name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease,imagesize], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
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

    async updateMarker(markerId, name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease,imagesize) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE markers SET name = ?, latitude = ?, longitude = ?, marker_image = ?, prefab = ?, hint1 = ?, hint2 = ?, level_of_ease = ?,imagesize ? WHERE id = ?;";
                connection.query(query, [name, latitude, longitude, marker_image, prefab, hint1, hint2, level_of_ease,imagesize, markerId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getQuest(questId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT  q.id AS quest_id,q.name AS quest_name,q.with_order,q.map AS quest_map,m.id AS marker_id,m.name AS marker_name,m.latitude,m.longitude,m.marker_image,m.prefab,m.hint1,m.hint2,m.level_of_ease,m.imagesize FROM quests q LEFT JOIN markers m ON q.id = m.quest_id WHERE q.id = ?;";
                connection.query(query, [questId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getQuestsUnity() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT q.id AS quest_id, q.name AS quest_name, q.with_order,  q.map AS quest_map,  m.id AS marker_id, m.name AS marker_name,  m.latitude,  m.longitude,  m.marker_image, m.prefab,  m.hint1, m.hint2, m.level_of_ease,m.imagesize  FROM quests q LEFT JOIN markers m ON q.id = m.quest_id ORDER BY q.id, m.id;";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getPlayer(emailOrUsername, password) {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let query, params;

            if (emailRegex.test(emailOrUsername)) {
                query = "SELECT * FROM players WHERE Email=? AND Password=?";
                params = [emailOrUsername, password];
            } else {
                query = "SELECT * FROM players WHERE Username=? AND Password=?";
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
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM questtimes WHERE Player_Username=?;";
                connection.query(query, [username], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async signUp(username, name, email, city, country, age, sexe, points, coins, gems, total_quests, started_quests, finished_quests) {
        try {
            const userExists = await new Promise((resolve, reject) => {
                const checkQuery = "SELECT COUNT(*) AS count FROM players WHERE Username = ?";
                connection.query(checkQuery, [username], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results[0].count > 0);
                });
            });

            const emailExists = await new Promise((resolve, reject) => {
                const checkQuery = "SELECT COUNT(*) AS count FROM players WHERE Email = ?";
                connection.query(checkQuery, [email], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results[0].count > 0);
                });
            });

            if (userExists) {
                return { success: false, exception: "username", message: "Username already taken!" };
            }
            if (emailExists) {
                return { success: false, exception: "email", message: "There is already an account attached to this email, consider signing in!" };
            }

            const response = await new Promise((resolve, reject) => {
                const query = "INSERT INTO players (Username, Name, Email, City, Country, Age, Sexe, Points, Coins, Gems, Total_Quests, Started_Quests, Finished_Quests) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
                connection.query(query, [username, name, email, city, country, age, sexe, points, coins, gems, total_quests, started_quests, finished_quests], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            return { success: true, message: "User registered successfully!" };
        } catch (error) {
            console.log(error);
        }
    }

    async storeTempUser(username, password, name, email, city, country, age, sexe) {
        try {
            const verificationToken = crypto.randomBytes(32).toString("hex");

            const result = await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO tempusers 
                    (Username, Name, Password, Email, City, Country, Age, Sexe, VerificationToken)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                connection.query(query, [username, name, password, email, city, country, age, sexe, verificationToken], (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return resolve(-1);
                        }
                        return reject(new Error(err.message));
                    }
                    resolve(verificationToken);
                });
            });

            return result;
        } catch (error) {
            console.log(error);
            return -2;
        }
    }

    async verifyUser(token) {
        try {
            const user = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM tempusers WHERE VerificationToken = ?";
                connection.query(query, [token], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results[0]);
                });
            });

            return user;
        } catch (error) {
            console.log(error);
        }
    }

    async addPlayerWithoutVerification(username, password, name, email, city, country, age, sexe) {
        try {
            // Insert into Players table
            const insertResult = await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO players (Username, Name, Email, City, Password, Country, Age, Sexe, Points, Coins, Gems, Total_Quests, Started_Quests, Finished_Quests)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0)
                `;
                connection.query(query, [username, name, email, city, password, country, age, sexe], (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return resolve(-1); // Duplicate user
                        }
                        return reject(new Error(err.message));
                    }
                    resolve(results);
                });
            });
    
            if (insertResult === -1) {
                return -1;
            }
    
            // Get all quests
            const quests = await new Promise((resolve, reject) => {
                const query = "SELECT Name FROM quests";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results.map(row => row.Name));
                });
            });
    
            // Insert default quest times for player
            for (const questName of quests) {
                await new Promise((resolve, reject) => {
                    const insertQuery = `
                        INSERT INTO questtimes (Player_Username, Quest_Name, Completion_Time, started)
                        VALUES (?, ?, NULL, 0)
                    `;
                    connection.query(insertQuery, [username, questName], (err, result) => {
                        if (err) reject(new Error(err.message));
                        resolve(result);
                    });
                });
            }
    
            return 1; // Success
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


    async  updatePlayerQuests(playerusername, questname, completionTime, started) {
        try {
            const result = await new Promise((resolve, reject) => {
                // First, check if the quest exists
                const checkQuestQuery = `SELECT 1 FROM Quests WHERE Name = ? LIMIT 1`; // Adjust table/column names if needed
                connection.query(checkQuestQuery, [questname], (err, questResults) => {
                    if (err) return reject(new Error(err.message));
    
                    if (questResults.length === 0) {
                        // Quest does not exist
                        return resolve(-1);
                    }
    
                    // Check if entry already exists in questtimes
                    const checkEntryQuery = `
                        SELECT * FROM QuestTimes 
                        WHERE Player_Username = ? AND Quest_Name = ?
                    `;
                    connection.query(checkEntryQuery, [playerusername, questname], (err, existingEntries) => {
                        if (err) return reject(new Error(err.message));
    
                        if (existingEntries.length > 0) {
                            // Entry exists, update it
                            const updateQuery = `
                                UPDATE QuestTimes 
                                SET Completion_Time = ?, started = ? 
                                WHERE Player_Username = ? AND Quest_Name = ?
                            `;
                            connection.query(updateQuery, [completionTime, started, playerusername, questname], (err, updateResult) => {
                                if (err) return reject(new Error(err.message));
                                resolve(1); // Successfully updated
                            });
                        } else {
                            // Entry doesn't exist, insert it
                            const insertQuery = `
                                INSERT INTO QuestTimes 
                                (Player_Username, Quest_Name, Completion_Time, started)
                                VALUES (?, ?, ?, ?)
                            `;
                            connection.query(insertQuery, [playerusername, questname, completionTime, started], (err, insertResult) => {
                                if (err) return reject(new Error(err.message));
                                resolve(2); // Successfully inserted
                            });
                        }
                    });
                });
            });
    
            return result;
        } catch (error) {
            console.log(error);
            return -2; // Error occurred
        }
    }
    
}

module.exports = DbService;
