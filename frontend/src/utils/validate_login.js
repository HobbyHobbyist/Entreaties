
async function validate_login(email_field_id, password_field_id){
    const email_field = document.getElementById(email_field_id);
    const password_field = document.getElementById(password_field_id);
    let form = new FormData;
    const email = email_field.value;
    if (email.match("@") == null) {
        return alert("invalid email")
    };

    const password = password_field.value;
    form.append("email", email); form.append("password", password);

    return fetch("/flask/login/",
    {method: "POST",
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*'},
    body: form}).then(response => response.json()).then(output => {
        if (output["success"] == true){
            sessionStorage.setItem("logged_in", true);
            localStorage.setItem("logged_in", true);            
            return true
        }
    });

};

export default validate_login;