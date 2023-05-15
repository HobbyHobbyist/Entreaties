import LoginOrRegisterBar from "./LoginOrRegisterBar.js";
import LoginOrRegisterOverlay from "./LoginOrRegisterOverlay.js";
import {useContext, useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import { AppContext } from "../context.js";


function accessibleClick(e) {
    if (e.key == "Enter") {
        e.currentTarget.click()
    }
}

function extend(){
    const owner = document.getElementById("HeavyDutyNavigationBar");
    const additional_options_container = document.getElementById("HeavyDutyNavigationOptionsContainer");

    if (owner.dataset.bar_revealed !== "true") {
        if (extend.set_to_close == "true") {
            clearTimeout(extend.closing_command);
            clearTimeout(extend.second_closing_command);
            additional_options_container.style.opacity = 1;
            additional_options_container.style.display = "block";
            owner.dataset.bar_revealed = "true";
        }
        additional_options_container.style.display = "block";
        setTimeout(() => additional_options_container.style.opacity = 1, 1);
        owner.style.height = "100vh";
        owner.style.transition = ".5s";
        owner.dataset.bar_revealed = "true";

        const child_span = owner.getElementsByClassName("NavigationSpan")[0];
        child_span.textContent = "Close";
        child_span.onclick = () => {
            owner.style.height = "7.5vh";
            child_span.textContent = "Additional";
            additional_options_container.style.opacity = 0;
            extend.set_to_close = "true";
            extend.closing_command = setTimeout(() => {
                owner.dataset.bar_revealed = "false";
                child_span.onclick = null;
                extend.second_closing_command = setTimeout(() => {
                    additional_options_container.style.display = "none";
                    extend.set_to_close = "false";
                    extend.closing_command = null;
                    extend.second_closing_command = null;
                    }, 350);
                }, 1);
            return 1
        };
    };
};

function login_or_register(){
    const target = document.getElementById("LoginOrRegisterBar");
    target.style.display = "block";
    const navigation_bar = document.getElementById("NavigationBar")
    navigation_bar.dataset.bar_revealed = "true";

};

function mobile_login_or_register() {
    const overlay_root = document.getElementById("LoginOrRegisterOverlayRoot");
    const hamburger_navigation_bar = document.getElementById("HamburgerNavigationBar");

    overlay_root.dataset.revealed = "true";
    hamburger_navigation_bar.dataset.login_or_register_overlay_revealed = "true";

}

function log_out(set_logged_in){
    set_logged_in(false);
}

function clear_navigation_bars(){
    document.getElementById("NavigationBar").dataset.bar_revealed = "false";

}

function NavigationBar(props){
    const navigate = useNavigate();
    const location = useLocation();

    const {logged_in, change_logged_in_state} = useContext(AppContext);


    return (
    <div>
        <nav id="NavigationBar" data-bar_revealed="false">
            <LoginOrRegisterBar change_logged_in_state={change_logged_in_state} />

            <span className="NavigationSpan" style={{float: "left", marginRight: "0%", marginLeft: "5%"}} 
            onClick={() => {navigate("/Profiles");}} tabIndex="0" onKeyDown={(e) => accessibleClick(e)}> 
            Profiles
            </span>
            
            <span className="NavigationSpan" style={{float: "left", marginRight: "0%", marginLeft: "5%"}} 
            onClick={() => {navigate("/Entreaties");}} tabIndex="0" onKeyDown={(e) => accessibleClick(e)}>
            Entreaties
            </span>

            {logged_in == false ?
            <span className="NavigationSpan" onClick={() => login_or_register()} 
            tabIndex="0" onKeyDown={(e) => accessibleClick(e)} >
                Login/Register 
            </span>:
            <>
                <span className="NavigationSpan" onClick={() => {navigate("/Profile");}} tabIndex="0" 
                onKeyDown={(e) => accessibleClick(e)}>
                    Profile
                </span>

                <span className="NavigationSpan" tabIndex="0" onClick={() => {
                    change_logged_in_state("log_out");
                    sessionStorage.removeItem("logged_in");
                    if (location.pathname.toLowerCase() == "/profile"){
                            navigate("/");
                        }
                }} onKeyDown={(e) => accessibleClick(e)}>
                    Log out
                </span>
                                
            </>
            }

        </nav>
        <LoginOrRegisterOverlay change_logged_in_state={change_logged_in_state}/>
        <nav id="HeavyDutyNavigationBar" data-bar_revealed="false" onClick={() => extend()}>
            <div id="HeavyDutyOpenerContainer">
                <span className="NavigationSpan" tabIndex="0" style={{ display: "block", float: "unset", margin: "auto",
                width: "fit-content"}} onKeyDown={(e) => accessibleClick(e)}> Additional </span>
            </div>
            <div id="HeavyDutyNavigationOptionsContainer">
                <span className="HeavyDutyNavigationSpan" style={{top: "10%"}} onClick={() => navigate("/Settings")}
                tabIndex="0" onKeyDown={(e) => accessibleClick(e)}>
                    Settings</span>
                <span className="HeavyDutyNavigationSpan" style={{top: "20%"}} 
                tabIndex="0" onKeyDown={(e) => accessibleClick(e)}> Contact </span>
            </div>
        </nav>

        <nav id="HamburgerNavigationBar">
            <div id="HamburgerNavigationCoreOptionsDropdown" onTouchStart={(e) => {
                e.stopPropagation();
                const coreOptionsDropdown = document.getElementById("HamburgerNavigationCoreOptionsDropdown");
                const coreOptionsContainer = coreOptionsDropdown.getElementsByClassName("HamburgerNavigationOptionsContainer")[0];
                coreOptionsContainer.style.display = "block";
                if (document.closeCoreOptions == undefined) {
                    document.closeCoreOptions = "slatedForRemoval"
                    setTimeout(() => {
                        function close() {
                            coreOptionsContainer.style.display = "none";
                            document.removeEventListener("touchstart", close);
                            delete document.closeCoreOptions;
                        };
                        document.addEventListener("touchstart", close)
                        document.close_hamburger_menu = () => {
                            coreOptionsContainer.style.display = "none";
                            document.removeEventListener("touchstart", close);
                            delete document.closeCoreOptions;
                        } 

                    }, 13)
                }
                else if (e.target == coreOptionsDropdown  || e.target == coreOptionsDropdown.getElementsByClassName("StandardSpan")[0]) {
                    document.close_hamburger_menu();

                }
            }}>
                <span className="HamburgerSpan">Main Navigate</span>
                <section className="HamburgerNavigationOptionsContainer">
                    <div className="HamburgerNavigationDropdownDiv" onClick={(e) => {
                        navigate("/Profiles");
                        delete document.closeCoreOptions;
                        delete document.closeAdditionalOptions;
                        }}>
                        <span className="HamburgerSpan">Profiles</span>
                    </div>

                    <div className="HamburgerNavigationDropdownDiv" onClick={() => {
                        navigate("/Entreaties")
                        delete document.closeCoreOptions;
                        delete document.closeAdditionalOptions;
                        }}>
                        <span className="HamburgerSpan">Entreaties</span>
                    </div>

                    {logged_in == false ?
                    <div className="HamburgerNavigationDropdownDiv" onClick={() => mobile_login_or_register()}>
                        <span className="HamburgerSpan">Login/Register</span>
                    </div>:
                    <>
                        <div className="HamburgerNavigationDropdownDiv" onClick={() => {navigate("/Profile");}}>
                            <span className="HamburgerSpan">Profile</span>
                        </div>

                        <div className="HamburgerNavigationDropdownDiv"onClick={() => {
                            change_logged_in_state("log_out");
                            sessionStorage.removeItem("logged_in");
                            if (location.pathname.toLowerCase() == "/profile"){
                                    navigate("/");
                                }
                        }}>
                            <span className="HamburgerSpan">Log out</span>
                        </div>
                                        
                    </>
                    }


                </section>
            </div>

            <div id="HamburgerNavigationAdditionalOptionsDropdown" onTouchStart={(e) => {
                e.stopPropagation();
                const additionalOptionsDropdown = document.getElementById("HamburgerNavigationAdditionalOptionsDropdown");
                const additionalOptionsContainer = additionalOptionsDropdown.getElementsByClassName("HamburgerNavigationOptionsContainer")[0];
                additionalOptionsContainer.style.display = "block";
                if (document.closeAdditionalOptions == undefined) {
                    document.closeAdditionalOptions = "slatedForRemoval"
                    setTimeout(() => {
                        function close() {
                            additionalOptionsContainer.style.display = "none";
                            document.removeEventListener("touchstart", close);
                            delete document.closeAdditionalOptions;
                        };
                        document.addEventListener("touchstart", close)
                        document.close_hamburger_menu2 = () => {
                            additionalOptionsContainer.style.display = "none";
                            document.removeEventListener("touchstart", close);
                            delete document.closeAdditionalOptions;
                        };

                    }, 13)
                }

                else if (e.currentTarget == additionalOptionsDropdown) {
                    document.close_hamburger_menu2()
                }
            }}>
                    <span className="HamburgerSpan">Secondary Navigate</span>
                <section className="HamburgerNavigationOptionsContainer">
                    <div className="HamburgerNavigationDropdownDiv">
                        <span className="HamburgerSpan">No options here yet</span>
                    </div>
                </section>
            </div>
        </nav>
    </div>

    )

}

export default NavigationBar