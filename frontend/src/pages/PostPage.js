import {useEffect, useState, useRef, useContext} from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as ReactDom from "react-dom/client";

import { PostPageMainPost, PostPageComment, DummySubject } from "../components/PostVariants";
import NavigationBar from "../components/NavigationBar";
import html_parser from "../utils/html_parser.js";
import { AppContext } from "../context";

async function get_post_info_from_profile_name_and_post_id(profile_name, post_id) {
    return fetch(`/flask/posts/${profile_name}/${post_id}/`,
    {method: "GET",
    credentials: "include",
    mode: "cors",}).then(response => response.json().then((output) =>
    {
    console.log(output);
    return output

    }))
};


async function get_subjects_from_post_id( post_id) {
    return fetch(`/flask/subjects/${post_id}/`,
    {method: "GET",
    credentials: "include",
    mode: "cors",}).then(response => response.json().then((output) =>
    {
    console.log(output);
    return output

    }))
};


function open_subject_creation(e) {
    const subthreads_container = document.getElementById("PostPageSubthreadsContainer");
    e.target.dataset.clicked = "true";
    subthreads_container.dataset.locked = "true";
    const subject_field = document.getElementById("PostPageCreateSubjectBox");
    subject_field.dataset.clicked = "true";
};


async function submit_subject(e, post_id) {
    e.stopPropagation();
    const subthreads_container = document.getElementById("PostPageSubthreadsContainer");
    const subject_box = document.getElementById("PostPageCreateSubjectInputField");
    subthreads_container.dataset.locked = "false";
    subject_box.dataset.clicked = "false";
    const subject_content = subject_box.value;

    var form = new FormData();
     form.append("subject_content", subject_content); 
    form.append("parent_post", post_id);

    fetch('/flask/self/subjects/create_subject/',
    {method: "POST",
    credentials: "include",
    mode: "cors",
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true},
    body: form}).then(response => response.json().then((output) =>
    {
        console.log(output); /* this is to be done*/
        document.getElementById("PostPageRoot").dataset.target_subject = output["subject_id"];
    }));

};

function close_subject_creation(e) {
    e.stopPropagation();
    const subthreads_container = document.getElementById("PostPageSubthreadsContainer");
    const subject_box = document.getElementById("PostPageCreateSubjectBox");

    subthreads_container.dataset.locked = "false";
    subject_box.dataset.clicked = "false";

};





function PostPage(props){
    const navigate = useNavigate();
    const params = useParams();
    const [update_posts, set_update_posts] = useState(0);
    const {logged_in, change_logged_in_state} = useContext(AppContext);

    useEffect(() => {   
        fetch(`/flask/profiling/avatar/${params.profile_name}/`,
        {method: "GET",
        credentials: "include",
        mode: "cors"}).then((response) => response.json().then(output => 
        {
        console.log(output);
        console.log("got it");

        if (output["avatar"] != null) {
            const profile_avatar_box = document.getElementById("PostPageMainAvatar");
            profile_avatar_box.style.backgroundImage = `url(/flask/avatars/${output["avatar"]}`;
           
        }
        

        get_post_info_from_profile_name_and_post_id(params.profile_name, params.post_id)//
            .then(output => {
                const main_post = document.getElementById("PostPageContent");
                const root = ReactDom.createRoot(main_post);
                const post = output["post"];
                console.log(output);
                root.render(
                    <PostPageMainPost post_content={post["post_content"]} post_id={post["post_id"]} post_title={post["post_title"]} 
                    amount_of_comments={post["amount_of_comments"]} post_owner={params.profile_name} thumbs_up={post["thumbs_up"]}
                    thumbs_down={post["thumbs_down"]} reactions={post["given_reactions"]} post_date={post["post_date"]} />
                )
                



                get_subjects_from_post_id(params.post_id).then((output) => {
                    const subthreads_container = document.getElementById("PostPageSubthreadsContainer");
                    console.log(output);
                    const root = ReactDom.createRoot(subthreads_container);
                    root.render(
                    <section style={{position: "absolute", width: "100%", height: "100%"}} id="HERE">
                        {output["subjects"].map((post) => 
                        <DummySubject key={post[1]} post_content={post[2]} post_date={post[6]} owner_name={post[0]}
                        subject_id={post[1]} post_id={params.post_id} amount_of_comments={post[3]} 
                        thumbs_up={post[4]} thumbs_down={post[5]} reactions={post[7]} {...props}/>)
                        }
                        {(logged_in == true) ?
                        
                        
                        <div id="PostPageCreateSubjectBox">
                            <div id="PostPageCreateSubjectTooltip">
                                <div style={{position: "absolute", backgroundColor: "white", left: "25%", width: "50%", 
                                bottom: "0%", height: "calc(100% - .2vh)", transform: "skew(-45deg)"}}></div>
                                <span className="StandardSpan">
                                        Create subject
                                </span>
                            </div>
                            <section id="PostPageSubjectOptions">
                                <div className="StandardOption" onClick={(e) => submit_subject(e, params.post_id).then(() => 
                                    set_update_posts(update_posts + 1))}>
                                    <span className="StandardSpan">Submit</span>
                                </div>
                            </section> 
                            <textarea id="PostPageCreateSubjectInputField"></textarea>
                        </div>
                        
                        : null }
                        
                    </section>
                    )
                    const target_subject_id = document.getElementById("PostPageRoot").dataset.target_subject;
                    if (target_subject_id) {
                        setTimeout(() => {
                            const target_subject = document.getElementById(target_subject_id);   
                            target_subject.scrollIntoView();
                            target_subject.dataset.selected = "true";
                        }, 100)
                    }
                    
                        });

                    })
                 
    

        }));
        

    }, [update_posts])
    
    return(
<>
<NavigationBar/>
<div id="PostPageRoot">
        <div className="PostPageProfilingContainer"> 
            <div id="PostPageMainAvatar"/>
        </div> 
        <div id="PostPageContent"/>


    

</div>
<div id="SelectedSubject">
    <div id="SubjectContainer">
        <div id="Placeholder"></div>
    </div>
    <div id="PostPageSubjectCommentSection"/>
</div>
</>

    )
};


export default PostPage