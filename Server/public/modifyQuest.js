var _testdata;
window.onload=function(){



    fetch('/getUserName')
    .then(response=>response.json())
    .then(data=>document.querySelector("#userNameText").innerHTML="Hi "+data);
    
    
    
    const addMarkerButton=document.querySelector("#addMarkerBtn");
    addMarkerButton.addEventListener("click",function(){
    var questId=document.querySelector("#questId").value;    
    const markerContainerDiv=document.querySelector("#markerContainer");
    markerContainerDiv.insertAdjacentHTML('beforeend', `
     <form class="questForm" action="/update-marker" method="POST" enctype="multipart/form-data">
    <div class="marker"> 
    <input name="questId" style="display: none;"  value="${questId}"/>
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
        <label  class="title">markerName:</label>
        <input type="text" name="markerName" placeholder="Marker Name" required>
         <label  class="title">longitude:</label>
        <input type="text" name="longitude" placeholder="Longitude" required>
         <label  class="title">latitude:</label>
        <input type="text" name="latitude" placeholder="Latitude" required>
    </div>
    <div class="hintDiv">
        <label  class="title">Hint1:</label>
        <textarea name="hint1" placeholder="Hint1" required></textarea>
        <label  class="title">Hint2:</label>
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
     <button  id="saveQuestBtn" type="submit" class="btn btn-danger saveMarkerButton" style="width:20%;align-self: center; ">Save Marker </button>
    </div>
    
    </form>`);
    
    submitEvent();
    })
    
           
    
    
    
    
    
    
    
    
    
    
    fetch('/getQuestId')
    .then(response=>response.json())
    .then(data=>loadQuest(data));
    
    
    
    function loadQuest(questId)
    {
        fetch('/getQuestById',{
            headers:{
                'Content-type':'application/json'
            },
            method:'POST',
            body: JSON.stringify({questId:questId})
        }).then(response=>response.json()).then(d=>displayData(d));
    }
    function displayData(data){
        _testdata=console.log(data);
        const questOrder=document.querySelector("#questOrder");
        const questMapFile=document.querySelector("#questMapFile");
        const questIdp=document.querySelector("#questId");
        const questName=document.querySelector("#questName");
        const QuestMapInput=document.querySelector("#QuestMapInput1");
        const markerContainerDiv=document.querySelector("#markerContainer");
       
    
        var quest_name=data[0].quest_name;
        var questId=data[0].quest_id;
        var quest_map=data[0].quest_map;
        var with_order=data[0].with_order;
        var questMapFileUrl=data[0].quest_map;
        questName.value=quest_name;
        questOrder.value=with_order;
       questIdp.value=questId;
        
        questMapFile.value=questMapFileUrl.split("/")[1];
        //questMapFile.value=questMapFileUrl.split("\\")[1];
        for(let marker in data)
        {
            marker=data[marker];
          
            var marker_id=marker.marker_id;
            var hint1=marker.hint1;
            var hint2=marker.hint2;
            var latitude=marker.latitude;
            var longitude=marker.longitude;
            var level_of_ease=marker.level_of_ease;
            var marker_image=marker.marker_image;
            var marker_name=marker.marker_name;
            var prefab=marker.prefab;
            var marker_image_url=marker.marker_image.split("/")[1];
            var prefab_url=marker.prefab.split("/")[1];
            //var marker_image_url=marker.marker_image.split("\\")[1];
            //var prefab_url=marker.prefab.split("\\")[1];
            markerContainerDiv.innerHTML+=`
            <form class="questForm" action="/update-marker" method="POST" enctype="multipart/form-data">
            <div class="marker">
                <input name="questId" style="display: none;"  value="${questId}"/>
                <input name="markerId" style="display: none;" value="${marker_id}" />
                <div class="markerPrefabDiv">
                    <div class="markerDiv" style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 80%;" >
                            <label for="QuestMapInput2" class="title">Marker:</label>
                            <input type="file" id="QuestMapInput2" name="MarkerImage"  >
                        </div>
                        <div> 
                                <input name="old_marker_image_url" value="${marker_image_url}" readonly>
                                <button  type="button" class="downloadBtn">download</button>
                        </div>
                        
                      
                    </div>
                    <div class="prefabDiv" style="display: flex; flex-direction: column; align-items: center;">
                       <div style="width: 80%;" >
                            <label for="QuestMapInput3" class="title">Prefab:</label>
                            <input type="file" id="QuestMapInput3" name="PrefabImage" >
                        </div>
                        <div style="display: flex;">
                                <input name="old_prefab_url" value="${prefab_url}" readonly>
                                 <button  type="button" class="downloadBtn">download</button>
                        </div>
                       
                      
                        
                    </div>
                </div>
                <div class="markerInfoDiv">
                     <label  class="title">markerName:</label>
                    <input type="text" name="markerName" value="${marker_name}" required>
                     <label  class="title">longitude:</label>
                    <input type="text" name="longitude" value="${longitude}" required>
                     <label  class="title">latitude:</label>
                    <input type="text" name="latitude" value="${latitude}" required>
                </div>
                <div class="hintDiv">
                     <label  class="title">hint1:</label>
                    <textarea name="hint1" placeholder="Hint1" required>${hint1}</textarea>
                     <label  class="title">hint2:</label>
                    <textarea name="hint2" placeholder="Hint2" required>${hint2}</textarea>
                </div>
                <div class="levelOfEaseDiv" style="display: flex; align-items: center;">
                    <p>Difficulty level</p>
                    <select name="difficultyLevel" style="width: 20%;" aria-label="Difficulty level">
                            <option value="Easy" ${level_of_ease == "Easy" ? "selected" : ""}>Easy</option>
                            <option value="Average" ${level_of_ease == "Average" ? "selected" : ""}>Average</option>
                            <option value="Hard" ${level_of_ease == "Hard" ? "selected" : ""}>Hard</option>
            </select>
                </div>
                 <button  id="saveQuestBtn" type="submit" class="btn btn-danger saveMarkerButton" style="width:20%;align-self: center; ">Save Marker </button>
            </div>
            
            </form>
            `;;
    
        }
    
        submitEvent();
        addDownloadEventsToButtons();
    }
    function disableAllsubmitButtons() {
        const buttons = document.querySelectorAll(".questForm .saveMarkerButton");
        buttons.forEach(btn => {
            btn.disabled = true;
        });
    }
    
    function submitEvent() {
        disableAllsubmitButtons();
        const forms = document.querySelectorAll(".questForm");
    
        forms.forEach(form => {
            form.addEventListener("input", function (event) {
                const changedElement = event.target;
                
                    let btn = form.querySelector("#saveQuestBtn");
                    if (btn) {
                        btn.disabled = false;
                    }
                
            });
        });
        forms.forEach(form => {
            form.addEventListener("submit", function (event) {
              
                const changedElement = event.target;
                
                    let btn = form.querySelector("#saveQuestBtn");
                    if (btn) {
                        btn.disabled = true;
                       
                    }
                
            });
        });
    }
    
    function addDownloadEventsToButtons(){
        const downloadButtons=document.querySelectorAll(".downloadBtn");
        downloadButtons.forEach(downloadbtn => {
            downloadbtn.addEventListener("click", function (event) {
              const url= event.target.parentElement.querySelector("input").value;
               fetch(`/download/${url}`) .then(response => {
                if (!response.ok) {
                    throw new Error("File not found or an error occurred");
                }
                return response.blob(); // Convert the response to a Blob (binary data)
            })
            .then(blob => {
                // Create a link element to download the file
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob); // Create a URL for the Blob
                a.download = url; // Set the download attribute with the filename
                a.click(); // Trigger the download
            })
            .catch(error => {
                console.error("Error downloading the file:", error);
                alert("There was an error while downloading the file.");
            });
            });
        });
    }
    
    
}
