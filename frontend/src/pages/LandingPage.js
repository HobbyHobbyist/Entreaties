import {useEffect, useState} from "react";

import NavigationBar from "../components/NavigationBar.js";
import TogetherImg from "../static/images/together.png";


function ProfilePage(props){
    
    return(
<div>
    <NavigationBar/>
    <div style={{marginBottom: "7.5vh"}}/>
    <section style={{height: "92.5vh", width: "100%", backgroundImage: `url(${TogetherImg})`, backgroundSize: "100% auto",
    backgroundRepeat: "no-repeat"}}>

    </section>

</div>

    )
};


export default ProfilePage