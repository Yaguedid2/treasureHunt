document.querySelector("#createQuestBtn").addEventListener('click',function(){
    window.location.href = "/addQuest";
});    





fetch('/getUserName')
.then(response=>response.json())
.then(data=>document.querySelector("#userNameText").innerHTML="Hi "+data);


    
fetch('/getQuests')
.then(response=>response.json())
.then(data=>displayQuests(data));

function displayQuests(data){
    const questContainer=document.querySelector("#questContainer");
    
    for(let quest in data){
       
        var questId=data[quest].id;
        var questMap=data[quest].map;
        var questOrder=data[quest].with_order;
        var questHTML=`<div class="quest">
            <div class="questName">
                <p >${data[quest].name}</p>
            </div>            
            <div class="questButtons">
                <button  onclick="editQuest(${questId})" class="btn btn-primary edit-quest-btn" >Edit</button>
                <button  onclick="showPopUp(${questId})" class="btn btn-danger delete-quest-btn" data-bs-toggle="modal" data-bs-target="#deleteQuestPopUp">Delete</button>    
            </div>
             
        </div>`
        questContainer.innerHTML+=questHTML;
       

    }

    
}
function showPopUp(questId){
document.querySelector("#deleteQuestBtn").addEventListener("click",function(){
    deleteQuest(questId);
});
}
function deleteQuest(questId)
    {
       
     fetch('/deleteQuest',{
                    headers:{
                        'Content-type':'application/json'
                    },
                    method:'POST',
                    body: JSON.stringify({questId:questId})
                }).then(data=>data.json()).then(d=>console.log(d.message))

         window.location.href = "/displayQuests";

    
    }
    function editQuest(questId)
    {
        fetch('/setQuestId',{
            headers:{
                'Content-type':'application/json'
            },
            method:'POST',
            body: JSON.stringify({questId:questId})
        }).then(data=>data.json()).then(d=>console.log(d.message));
        
        window.location.href = "/modifyQuest";

    }