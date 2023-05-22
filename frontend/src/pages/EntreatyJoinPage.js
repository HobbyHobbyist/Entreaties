import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom"

function join_entreaty(entreaty_id) {
    let form = new FormData();
    form.append("intent", "join")
    return fetch(`/flask/self/entreaty_admission_post/${entreaty_id}/`, {
        method: "POST",
        credentials: "include",
        body: form,
        mode: 'cors',
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": true}  
        }).then((res) => res.json().then((jsonRes) => {
            return jsonRes
        }))
}

export function EntreatyJoinPage() {
    const navigate = useNavigate();
    const params = useParams();
    const [openAccess, setOpenAccess] = useState();
    const [joinPrompt, setJoinPrompt] = useState();
    useEffect(() => {
        fetch(`/flask/entreaty_admission_info/${params.entreaty_id}/`, {
            method: "GET",
            credentials: "include",
            mode: 'cors',
            headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Credentials": true}  
            }).then((res) => res.json().then((jsonRes) => {
                setOpenAccess(jsonRes.open_access);
                setJoinPrompt(true);

            }))
    }, []);
    return (
<div id="EntreatyJoinPageRoot">

<section id="PromptOptionsContainer">
    <div className="StandardOption" onClick={() => navigate(`/Entreaty/${params.entreaty_id}`)}>
        <span className="StandardSpan">Exit</span>
    </div>
    {(openAccess == 1) ? 
    <div className="StandardOption" onClick={() => {
        join_entreaty(params.entreaty_id).then(() => {
            navigate(`/Entreaty/${params.entreaty_id}`);
        })
    }}>
        <span className="StandardSpan">Join</span>
    </div>:
    <div className="StandardOption" onClick={() => {
        join_entreaty(params.entreaty_id).then(() => {
            navigate(`/Entreaty/${params.entreaty_id}`);
        })
    }}>
        <span className="StandardSpan">Submit</span>
    </div>}
</section>

    {joinPrompt ? 
<section id="PromptContainer">
    <div id="PromptDescriptionBox">
        <span className="PromptSpan">
            The ideal purpose of this page would have been to have a prompt that asks
            the reader (you, who wishes to join) for information, then have the prompt's response reviewed by the group's 
            adminstrator(s) to permit or deny entry to the applicant. As of now (and likely forever; it's time to move to another 
            project!), simply clicking the join/submit button will allow you to join.


        </span>
    </div>
    <textarea id="PromptResponseBox">

    </textarea>
</section>
    : null}

</div>

)
};
