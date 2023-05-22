import NavigationBar from "../components/NavigationBar.js";

import {useEffect, useState} from "react";
import { Form, useNavigate } from "react-router-dom";

function ModifyIntroductionPage(props){
    let navigate = useNavigate();
    return(
<div id="GenericPageRoot">

<section id="PromptOptionsContainer">
    <div className="StandardOption" onClick={() => navigate("/Profile")}>
        <span className="StandardSpan">Cancel</span>
    </div>
    <div className="StandardOption" onClick={() => {
        navigate("/Profile");
        let form = new FormData();
        form.append("introduction", document.getElementById("ModifyIntroductionPageTextArea").value);
        fetch("/flask/self/update_profiling/introduction/", {
            method: "POST",
            body: form
        })
    }}>
        <span className="StandardSpan">Save & Exit</span>
    </div>
</section>

<section id="ModifyIntroductionContainer">

    <section id="ModifyIntroductionDescriptionArea">
        <span className="PromptSpan">
            When appearing in profile search, this is what searchers will see when they view you.


        </span>
    </section>
    <textarea id="ModifyIntroductionPageTextArea">
            
    </textarea>

</section>

</div>

    )
};


export default ModifyIntroductionPage