

const loginBtn=document.querySelector('#loginBtn');

loginBtn.onclick=function(){
    const email=document.querySelector("#email").value;
    const password=document.querySelector("#password").value;
    fetch('/getPlayer',{
        headers:{
            'Content-type':'application/json'
        },
        method:'POST',
        body: JSON.stringify({email:email,password:password})
    }).then(response=>response.json()).then(r=>redirect(r))
   
}
function redirect(data)
{
  console.log(data.success);
    if(data.success){
        window.location.href = "/";
    }else
    {
       alert(data.message);
    }
}