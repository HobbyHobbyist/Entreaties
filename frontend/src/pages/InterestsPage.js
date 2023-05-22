import { useEffect, useState } from "react";
import TagAdder from "../components/TagAdder";


function save_and_exit() {
    const interests = document.getElementsByClassName("SettingOptionContainer");
    let form = new FormData();
    form.append("intent", "update_interests")
    for (let index = 0; index < interests.length; index++) {
        let targetInterest = interests[index];
        form.append(targetInterest.id, targetInterest.dataset.status);
    }
    console.log(form);
    fetch("/flask/self/update_profiling/interests/",
    {method: "POST",
    body: form,
    credentials: "include",
    mode: "cors",
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true}
    }).then(response => response.json().then((output) =>
        {
        console.log(output);
        }));
    return {"callback": "trigger navigate"};
    
}

function cancel() {
    return {"callback": "trigger navigate"};
}


export function InterestsPage() {
    const [tags, set_tags] = useState(null);
    useEffect(() => {
    fetch("/flask/self/profiling/interests/",
    {method: "GET",
    credentials: "include",
    mode: "cors",
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true}
    }).then(response => response.json().then((output) =>
        {
        let entries = Object.entries(output);
        const raw_tags = {"art": ["Art", null, "art"], "design": ["Design", null, "design"], 
        "gaming": ["Gaming", null, "gaming"], "programming": ["Programming", null, "programming"], "music": ["Music", null, "music"], 
        "writing": ["Writing", null, "writing"], "roleplaying": ["Roleplaying", null, "roleplaying"]};

        let modded_tags = [];
        for (let key of Object.keys(raw_tags)) {
            raw_tags[key][1] = output[key];
            modded_tags.push(raw_tags[key]);
        }
        
        set_tags(modded_tags);

        }))
    }, [])
    
    if (tags) {
        return (
        <TagAdder tags={tags} save_and_exit_function={save_and_exit} cancel_function={cancel}/>
        )
    }
    else {
        return (
            <div id="GenericPageRoot"/>
        )
    }
}

export default InterestsPage;