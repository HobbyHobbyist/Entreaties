import {useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context";

function promiseVariable(variable) {
    return new Promise(function(resolve, reject) {
        resolve(variable);
    })
}

function validate_registration() {
    const Profile_field = document.getElementById("ProfileInput");
    const email_field = document.getElementById("EmailInput");
    const password_field = document.getElementById("PasswordInput");

    const profile_name = Profile_field.value;

    const email = email_field.value;
    if (email.match("@") == null) {
        alert("invalid email");
        return promiseVariable(false)  
    };

    const password = password_field.value;
    //var upperCaseLetters = /[A-Z]/g; password.match(upperCaseLetters) == null
    var numbers = /[0-9]/g;
    if (password.length < 0 || false || password.match(numbers) == null) {
        alert("password does not fulfill the requirements");
        return promiseVariable(false)  
    };

    let form = new FormData();
    form.append("email", email); form.append("password", password); form.append("profile_name", profile_name);
    const target = fetch('/register/',
    {method: "POST",
    credentials: "include",
    mode: "cors",
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true},
    body: form})//
    .then(response => response.json().then((output) => {
        console.log(output);
        if (output.success === true) {
            alert("created");
            console.log(response);
            sessionStorage.setItem("logged_in", true);
            return true;
        }
        else {
            if (output.hasOwnProperty("errors")){
                alert(output["errors"])
                return false  
            }
        }
    }));
    console.dir(target);
    return target;
};

function RegisterPage(props){
    const navigate = useNavigate();
    const {logged_in, change_logged_in_state} = useContext(AppContext);

    
    return(
<div id="RegisterPageRoot">

    <section id="RegisterPageFormsContainer" style={{position: "relative", top: "5vh"}}>
        <div className="RegisterPageInputSection">
            <div className="RegisterPageSectionIdentifier">
                <span className="RegisterPageInputSpan">Profile Name</span>
            </div>
            <div className="RegisterPageDescription">
                <span className="StandardSpan">Cannot be changed after registration*. Minimum of 100 characters.</span>
            </div>
            <input type="text" className="RegisterPageInputField" id="ProfileInput"></input>
        </div>

        <div className="RegisterPageInputSection">
        <div className="RegisterPageSectionIdentifier">
                <span className="RegisterPageInputSpan">Email</span>
            </div>
            <div className="RegisterPageDescription">
                <span className="StandardSpan">Any input with an "@" symbol is a valid email so long as it hasnt already been used</span>
            </div>            <input type="text" className="RegisterPageInputField" id="EmailInput"></input>
        </div>

        <div className="RegisterPageInputSection">
        <div className="RegisterPageSectionIdentifier">
                <span className="RegisterPageInputSpan">Password</span>
            </div>
            <div className="RegisterPageDescription">
                <span className="StandardSpan">
                    Any password that has a minimum of one digit is valid
                </span>
            </div>
            <input type="text" className="RegisterPageInputField" id="PasswordInput"></input>
        </div>

        <div className="RegisterPageInputSection">
        <div className="RegisterPageSectionIdentifier">
                <span className="RegisterPageInputSpan">Confirm Password</span>
            </div>
            <div className="RegisterPageDescription">
                <span className="StandardSpan">
                    To ensure your password was entered correctly, avoid copy-pasting it below. (this isn't actually checked)
                </span>
            </div>
            <input type="text" className="RegisterPageInputField" id="PasswordConfirmationInput"></input>
        </div>
    </section> 

    <div id="RegisterSubmitButton" onClick={() => {
        validate_registration().then((output) => {
            if (output == true){
                change_logged_in_state("log_in"); 
                navigate("/profile");
            }
        })
    }}>
        <span className="StandardSpan">Submit</span>
    </div>

</div>

    )
};


export default RegisterPage