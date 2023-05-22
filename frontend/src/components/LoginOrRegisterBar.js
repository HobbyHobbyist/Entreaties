import {useEffect, useState} from "react";
import {Form, useNavigate} from "react-router-dom";
import validate_login from "../utils/validate_login";


function close_login_or_register() {
    document.getElementById("LoginOrRegisterBar").style.display = "none";
};


function LoginOrRegisterBar(props){
    const navigate = useNavigate();




    return (
    <div id="LoginOrRegisterBar">

        <div id="LoginOrRegisterBarCloseButton" className="LoginOrRegisterBarSpan" onClick={() => close_login_or_register()}>Close</div>
        <div id="LoginForm">
            <span className="LoginOrRegisterBarSpan" style={{right: "50%"}}>Login</span>
            <span className="LoginOrRegisterBarSpan" id="LoginDescriptor">
            Login into your account here if you have already created one
            <div className="LoginOrRegisterBarSpanLatch" data-option="login">
            <form method="post">

                    <label htmlFor="email" className="LoginOrRegisterEmailLabel" data-purpose="login"> Email </label>
                    <input type="text" id="LoginEmailField" name="email" className="LoginOrRegisterEmailField" data-purpose="login"/>

                    <label htmlFor="password" className="LoginOrRegisterPasswordLabel" data-purpose="login"> Password </label>
                    <input type="text" id="LoginPasswordField" name="password" className="LoginOrRegisterPasswordField" data-purpose="login"/>

            </form>

            <div className="LoginOrRegisterEnterButton" onClick={() => validate_login("LoginEmailField", "LoginPasswordField").//
            then(output => {
                if (output == true){
                props.change_logged_in_state(true);
                window.location.reload();
                }
            })}> Enter </div>

            </div>
            </span>
        </div>
        <div id="RegisterForm">
            <span className="LoginOrRegisterBarSpan" style={{left: "50%"}}>Register
            </span>

            <span id="RegisterSpan"
            onClick={() => navigate("/register")}>
            Join the site here
            
            </span>
        </div>
    </div>

    )

};

export default LoginOrRegisterBar