import { useNavigate } from "react-router-dom";
import validate_login from "../utils/validate_login";


function LoginOrRegisterOverlay(props) {
    let navigate = useNavigate();

    return (
<section id="LoginOrRegisterOverlayRoot">
    <section id="LoginOrRegisterOverlayMethodsContainer">
        <div className="LoginOrRegisterOverlayMethodButton" onClick={(e) => {
            let login_root = document.getElementById("LoginOrRegisterOverlayLoginRoot")
            let register_button = document.getElementById("RegisterButton")
            let return_button = document.getElementById("ReturnButton")

            if (login_root.dataset.revealed != "true") {
                login_root.dataset.revealed = "true";
                register_button.dataset.hidden = "true";
                return_button.dataset.hidden = "true";
                e.currentTarget.getElementsByClassName("StandardSpan")[0].innerText = "Cancel Login";
            }
            else {
                delete login_root.dataset.revealed
                delete register_button.dataset.hidden
                delete return_button.dataset.hidden
                e.currentTarget.getElementsByClassName("StandardSpan")[0].innerText = "Login";
            }
        }}>
            <span className="StandardSpan">Login</span>    
        </div>
        <section id="LoginOrRegisterOverlayLoginRoot">
            <section id="LoginOrRegisterOverlayLoginFormsContainer">
                <div className="LoginOrRegisterOverlayLoginFormRoot">
                    <div className="LoginOrRegisterOverlayLoginFormTitle">
                        <span className="StandardSpan"> Email</span>
                    </div>
                    <input className="LoginOrRegisterOverlayLoginFormInputField" type="text" id="MobileLoginEmailField"/>

                </div>

                <div className="LoginOrRegisterOverlayLoginFormRoot">
                    <div className="LoginOrRegisterOverlayLoginFormTitle">
                        <span className="StandardSpan">Password</span>
                    </div>
                    <input className="LoginOrRegisterOverlayLoginFormInputField" type="text" id="MobileLoginPasswordField"/>
                    
                </div>
        <div className="LoginOrRegisterOverlayMethodButton" 
        onClick={() => validate_login("MobileLoginEmailField", "MobileLoginPasswordField").then(output => {
            if (output == true){
            props.change_logged_in_state(true);
            window.location.reload();
            }
        })}>
            <span className="StandardSpan">Submit</span>    
        </div>

            </section>
        </section>


        <div className="LoginOrRegisterOverlayMethodButton" onClick={() => navigate("/Register")} id="RegisterButton">
            <span className="StandardSpan">Register</span>    
        </div>


        <div className="LoginOrRegisterOverlayMethodButton" id="ReturnButton" onClick={() => {
            delete document.getElementById("LoginOrRegisterOverlayLoginRoot").dataset.revealed;
            delete document.getElementById("LoginOrRegisterOverlayRoot").dataset.revealed;
            delete document.getElementById("HamburgerNavigationBar").dataset.login_or_register_overlay_revealed;

        }}>
            <span className="StandardSpan">Return</span>    
        </div>
    </section>

</section>
    )
}

export default LoginOrRegisterOverlay;