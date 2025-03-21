const loginBtn=document.querySelector('#loginBtn');

loginBtn.onclick=function(){
    const username=document.querySelector("#username").value;
    const password=document.querySelector("#password").value;
    fetch('http://localhost:5000/getUser',{
        headers:{
            'Content-type':'application/json'
        },
        method:'POST',
        body: JSON.stringify({username:username,password:password})
    })
   
}