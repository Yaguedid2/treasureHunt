document.addEventListener('DOMContentLoaded',function(){
   
    
fetch('http://localhost:5000/getAll')
.then(response=>response.json())
.then(data=>console.log(data));
});

const addBtn=document.querySelector('#add-name-btn');

addBtn.onclick=function(){
    const nameInput=document.querySelector('#name-input');
    const name=nameInput.value;

    nameInput.value="";

    fetch('http://localhost:5000/insert',{
        headers:{
            'Content-type':'application/json'
        },
        method:'POST',
        body: JSON.stringify({name:name})
    })
   
}