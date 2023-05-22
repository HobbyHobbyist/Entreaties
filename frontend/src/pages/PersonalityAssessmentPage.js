

import { useContext } from "react";
import { AppContext } from "../context.js";
import NavigationBar from "../components/NavigationBar.js";
import { useNavigate, useParams } from "react-router-dom";


function flip_options(e) {
    const targeted_option = e.currentTarget;
    const parent = targeted_option.parentElement;
    const options = parent.getElementsByClassName("AssessmentOption");
    for (let option of options) {
        if (option != targeted_option) {
            option.dataset.active = "null";
        }
        else {
            if (option.dataset.active == "true") {
                option.dataset.active = "null";
                parent.dataset.status = "null"
            }
            else {
                option.dataset.active = "true";
                parent.dataset.status = option.dataset.value;
                
            }
        }
    }
};


function save_function(profile_name) {
    let form = new FormData;
    let trait_names = ["Care", "Wit", "Cool", "Crudeness", "Judgement", "Malice"];
    let traits = {};
    trait_names.forEach((name) => {
        let status = document.getElementById(name).dataset.status;
        if (status != "null") {
            traits[name.toLowerCase()] = status;
        }
    });

    form.append("traits", JSON.stringify(traits));
    console.log(form);
    console.log(traits);
    console.log("above");

    fetch(`/flask/self/rate_personality/${profile_name}/`, {
        method: "POST",
        credentials: "include",
        body: form,
        mode: 'cors',
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": true}  
        })
};


function AssesssmentOption({trait}) {
    return (
        <section className="AssessmentOptionContainer" id={trait} data-status="null">
            <div className="AssessmentOptionName">
            <div className="AssessmentOptionBackdrop"></div>
                <span className="StandardSpan">
                    {trait}
                </span>
            </div>

            <div className="AssessmentOption" data-active="null" data-value="false" onClick={(e) => flip_options(e)}>
                <span className="StandardSpan">Low</span>
            </div>

            <div className="AssessmentOption" data-active="null" data-value="true" onClick={(e) => flip_options(e)}>
                <span className="StandardSpan">High</span>
            </div>
        </section>
    )
}


export function PersonalityAssessmentPage() {
    const {logged_in, change_logged_in_state} = useContext(AppContext);
    const navigate = useNavigate();
    const params = useParams();

    return (
<>
<NavigationBar/>
<div id="PersonalityAssessmentPageRoot">
    <section id="PersonalityAssessmentMetaOptions">
        <div className="StandardOption" onClick={() => navigate(`/Profile/${params.profile_name}`)}>
            <span className="StandardSpan">Cancel</span>
        </div>
        <div className="StandardOption" onClick={() => {
            save_function(params.profile_name);
            navigate(`/Profile/${params.profile_name}`);
        }}>
            <span className="StandardSpan">Save & exit</span>
        </div>

    </section>
    <section id="AssessmentsSection">
        <AssesssmentOption trait="Care" />

        <AssesssmentOption trait="Wit" />

        <AssesssmentOption trait="Cool" />

        <AssesssmentOption trait="Crudeness" />

        <AssesssmentOption trait="Judgement" />

        <AssesssmentOption trait="Malice" />

    </section>
</div>
</>
    )

};


export default PersonalityAssessmentPage;