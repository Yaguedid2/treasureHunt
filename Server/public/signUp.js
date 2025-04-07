document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("usernameInput");
    const usernameError = document.getElementById("usernameError");

    const emailInput = document.getElementById("emailInput");
    const emailError = document.getElementById("emailError");


    const formData = {
        username: document.querySelector('input[type="text"]').value,
        name: document.querySelectorAll('input[type="text"]')[1].value,
        email: document.querySelector('input[type="email"]').value,
        password:document.querySelector('input[type="password"]').value,
        city: document.querySelectorAll('input[type="text"]')[2].value,
        country: document.querySelectorAll('input[type="text"]')[3].value,
        age: document.querySelector('input[type="number"]').value,
        sexe: document.querySelector("select").value,
    };

    const response = await fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    const data = await response.json();
   var signInLink='<a href="/loginPlayer">sign in </a>';
    if (response.status === 400) {
        // Show the error message under the username input
        usernameError.style.display = "block";
        usernameError.textContent = data.message;
        usernameError.innerHTML+=signInLink;
    } else if(response.status === 401) {
        emailError.style.display = "block";
        emailError.textContent = data.message;
    }else{
        
        document.querySelector("form").reset();
        window.location.href = "/redirecting";
    }
});