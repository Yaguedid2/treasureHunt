

const loginBtn=document.querySelector('#loginBtn');

loginBtn.onclick=function(){
    const username=document.querySelector("#username").value;
    const password=document.querySelector("#password").value;
    fetch('/getUser',{
        headers:{
            'Content-type':'application/json'
        },
        method:'POST',
        body: JSON.stringify({username:username,password:password})
    }).then(response=>response.json()).then(r=>redirect(r))
   
}
function redirect(data)
{
    if(data.success){
        window.location.href = "/displayQuests";
    }else
    {
       alert("Invalid username or password");
    }
}