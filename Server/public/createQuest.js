    
const markerDiv=`<div class="marker">
            <div class="markerPrefabDiv">
                <div class="markerDiv">
                    <label for="QuestMapInput2" class="title">Marker:</label>
                    <input type="file" id="QuestMapInput2" name="MarkerImage" required>
                </div>
                <div class="prefabDiv">
                    <label for="QuestMapInput3" class="title">Prefab:</label>
                    <input type="file" id="QuestMapInput3" name="PrefabImage" required>
                </div>
            </div>
            <div class="markerInfoDiv">
                <input type="text" name="markerName" placeholder="Marker Name" required>
                <input type="text" name="longitude" placeholder="Longitude" required>
                <input type="text" name="latitude" placeholder="Latitude" required>
            </div>
            <div class="hintDiv">
                <textarea name="hint1" placeholder="Hint1" required></textarea>
                <textarea name="hint2" placeholder="Hint2" required></textarea>
            </div>
            <div class="levelOfEaseDiv" style="display: flex; align-items: center;">
                <p>Difficulty level</p>
                <select name="difficultyLevel" style="width: 20%;" aria-label="Difficulty level">
                    <option value="Easy">Easy</option>
                    <option value="Average">Average</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>
        </div>`;
           
fetch('/getUserName')
.then(response=>response.json())
.then(data=>document.querySelector("#userNameText").innerHTML="Hi "+data);



const addMarkerButton=document.querySelector("#addMarkerBtn");
addMarkerButton.addEventListener("click",function(){
const markerContainerDiv=document.querySelector("#markerContainer");
markerContainerDiv.insertAdjacentHTML('beforeend', markerDiv);


})

       


