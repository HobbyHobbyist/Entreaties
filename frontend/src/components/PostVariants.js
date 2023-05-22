import html_parser from "../utils/html_parser";
import * as ReactDom from "react-dom/client";
import { useEffect, useState, useRef } from "react";
import { CommentEditor } from "./Editor";
import EmptyDocument from "../utils/documents/EmptyDocument";
import FireGif from "../static/images/fire_gif.webp";
import PoopGif from "../static/images/poop_gif.webp";
import { Link } from "react-router-dom";




function expand_subject(subject_id) {
    const root = document.getElementById("PostPageRoot")
    const subthreads_container = document.getElementById("PostPageSubthreadsContainer");
    const selected_subject_div = document.getElementById("SelectedSubject");
    const subject_comments_section = document.getElementById("PostPageSubjectCommentSection");
    const subject = document.getElementById(subject_id);
    const subject_container = document.getElementById("SubjectContainer");
    const create_subject_box = document.getElementById("PostPageCreateSubjectBox");

    create_subject_box.style.display = "none";
    selected_subject_div.style.display = "block";
    //root.style.height = 0;
    subthreads_container.dataset.locked = "true";
    subject_comments_section.style.height = "0vh";
    subject_comments_section.style.maxHeight = "100vh";
    const placeholder = document.getElementById("Placeholder");
    const subject_substite = document.createElement("div");
    subject_substite.id = "Substitute";
    const test = document.getElementById("HERE");

    test.insertBefore(subject_substite, subject);
    subject_container.insertBefore(subject, placeholder);
    test.insertBefore(placeholder, subject_substite)
    subject.getElementsByClassName("ThumbsDown")[0].addEventListener("click", window[subject_id].current.thumbs_down);
    subject.getElementsByClassName("ThumbsUp")[0].addEventListener("click", window[subject_id].current.thumbs_up);
    window.currentSubject = subject_id;
    subject.dataset.chosen = "true";
    subject.onclick = function() {

    }

    
    setTimeout(() => {

        subject_comments_section.style.height = "300vh";
        subject_container.dataset.unleashed = "true";

    }, 1)
};

function close_subject(subject_id) {
    const root = document.getElementById("PostPageRoot")
    const subthreads_container = document.getElementById("PostPageSubthreadsContainer");
    const selected_subject_div = document.getElementById("SelectedSubject");
    const subject_comments_section = document.getElementById("PostPageSubjectCommentSection");
    const subject = document.getElementById(subject_id);
    const subject_container = document.getElementById("SubjectContainer");
    const create_subject_box = document.getElementById("PostPageCreateSubjectBox");

    create_subject_box.style.display = "block";
    selected_subject_div.style.display = "none";
    //root.style.height = "100vh";
    subthreads_container.dataset.locked = "false";
    subject_comments_section.style.height = "0vh";
    
    const test = document.getElementById("HERE");
    const placeholder = document.getElementById("Placeholder");
    const substitute = document.getElementById("Substitute");
    subject_container.insertBefore(placeholder, subject);
    test.insertBefore(subject, substitute);
    substitute.remove();

    subject.dataset.chosen = "false";

};

async function get_comments_from_subject_id(subject_id) {
    return fetch(`/comments/${subject_id}/`,
    { 
        method: "GET", credentials: "include", mode: "cors"
    }).then((response) => response.json().then((output) => {return output}));
};


async function submit_subject(post_id) {
    const subject_field = document.getElementById("CreateNewSubjectField");
    let subject_content = subject_field.value;
    const form = new FormData();
    form.append("subject_content", subject_content); form.append("parent_post", post_id)

    return fetch('/self/subjects/create_subject/',
    {method: "POST",
    credentials: "include",
    mode: "cors",
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true},
    body: form}).then(response => response.json().then((output) =>
    {
    console.log(output);
    return output

    }))

};


function submit_comment(post_id, subject_id, comment_doc) {
    const jsonfied_document = JSON.stringify(comment_doc);
    var form = new FormData();
    form.append("parent_post", post_id); form.append("parent_subject", subject_id);
    form.append("comment_content", jsonfied_document);
  
    fetch("/self/comments/create_comment/", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                  "Access-Control-Allow-Credentials": true},
      body: form
      }).then(() => {
        fetch_and_render_comments(subject_id, function(doc) {submit_comment(post_id, subject_id, doc)});

        
      });
    
};


function react_to(root_id, reaction_name, reaction_image, target_category) {
    var form = new FormData();
    form.append("intent", "react_to"); form.append("reaction", reaction_name); form.append("id", root_id);
  
    fetch(`/self/reactions/${target_category}/`, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                  "Access-Control-Allow-Credentials": true},
      body: form
    }).then((output) => output.json().then((jsonRes) => {

        let highest_parent = document.getElementById(root_id);
        const reaction_container = highest_parent.getElementsByClassName("PostReactionsContainer")[0]
        if (reaction_container.dataset[reaction_name] != "true") {
            reaction_container.dataset[reaction_name] = "true";
            reaction_container.dataset[`${reaction_name}_count`] = parseInt(reaction_container.dataset[`${reaction_name}_count`]) + 1;
            if (reaction_container.dataset[`${reaction_name}_count`] == "1") {
                let reaction_div = document.createElement("div");
                reaction_div.className = "PostReaction";
                reaction_div.dataset.removal_name = reaction_name;
                reaction_div.style.backgroundImage = `url(${reaction_image})`;
                reaction_container.appendChild(reaction_div);
            }
        }
        

        else {
            reaction_container.dataset[`${reaction_name}_count`] = parseInt(reaction_container.dataset[`${reaction_name}_count`]) - 1;
            reaction_container.dataset[reaction_name] = "false";
            if (reaction_container.dataset[`${reaction_name}_count`] == "0") { /* a reaction div only disappear if the user is its only ~*/
                const reactions = reaction_container.getElementsByClassName("PostReaction"); /*~ voter. */
                console.log(reactions);
                for (const reaction of reactions) {
                    if (reaction.dataset.removal_name == reaction_name) {
                        reaction.remove();
                    }
                }
            }
        }
        
        }))
}

function fetch_and_render_comments(subject_id, personalized_submit_comment) {
    get_comments_from_subject_id(subject_id).then((output) => {
        console.log(output)
        console.log("above")
        const comment_section = document.getElementById("PostPageSubjectCommentSection");
        const root = ReactDom.createRoot(comment_section);

        
        root.render(
        <div>
            {output["comments"].map((comment_info) => 
            <PostPageComment id={comment_info[1]} post_content={comment_info[2]} avatar={comment_info[7]} key={comment_info[1]} 
            reactions={comment_info[8]} thumbs_up={comment_info[4]} thumbs_down={comment_info[5]} />
            )}
            <PostPageCommentPrompt document_submit={personalized_submit_comment}/>
            <div id="PostPageReturn">
                <div className="StandardOption" onClick={() => close_subject(subject_id)}>
                    return
                </div>
            </div>
        </div>)}
        )

}

export function PostPageMainPost(props) {

    const post_content = JSON.parse(props.post_content);
    var converted_html = html_parser(post_content, props.post_id);
    const atr = {"data-thumbs_up_count": props.thumbs_up,
                "data-thumbs_down_count": props.thumbs_down};

    if (props.reactions) {
        props.reactions.split(",").map((reaction) =>
        atr[`data-${reaction.toLowerCase()}`] = "true");
    }


    return (
<div className="PostPageMainPost" id={props.post_id}>
     <div className="PostBoxDateDiv">{props.post_date}</div>
     <div className="PostBoxTitleDiv">{props.post_title}</div>
     <div className="PostBoxCommentsDiv">{props.amount_of_comments} Comments</div>
     <div className="PostContentDiv">{converted_html}</div>
    
    <div className="PostReactionsContainer" {...atr} data-reactions={props.reactions ? props.reactions.split(","): null}>
        {(props.thumbs_up > 0) ? <div className="PostReaction" style={{backgroundImage: `url(${FireGif})`}} 
        data-removal_name="thumbs_up"></div>
        : null}
        {(props.thumbs_down > 0) ? <div className="PostReaction" style={{backgroundImage: `url(${PoopGif})`}} 
        data-removal_name="thumbs_down"></div>
        : null}
        <div className="PostAddReactionTooltip">
            <span className="StandardSpan">
                Add Reaction
            </span>
            <div className="PostAddReactionContainer">

                <div className={`PostReaction ThumbsUp`} style={{backgroundImage: `url(${FireGif})`}} 
                onClick={(e) => {
                    e.stopPropagation();
                    react_to(props.post_id, "thumbs_up", FireGif, "post");
                    }}></div>

                <div className={`PostReaction ThumbsDown`} style={{backgroundImage: `url(${PoopGif})`}}
                onClick={(e) => {
                    e.stopPropagation();
                    react_to(props.post_id, "thumbs_down", PoopGif, "post");
                    }}></div>

            </div>
    </div>
     </div>
    

    <section id="PostPageSubthreadsContainer" onTouchStart={(e) => {
        e.currentTarget.dataset.expanded = "true";
    }}>
        </section>

    <div id="PostPageCreateSubthreadButton" onClick={() => {
        submit_subject(props.post_id).then((output) => {
            const subthreads_container = document.getElementById("PostPageSubthreadsContainer");
        })
    }}>
    
    </div>

</div>
    )
}


export function PostPageCommentPrompt({document_submit}) {
    const [editorDocument, updateDocument] = useState(EmptyDocument);
    
    function expand_prompt(e) {
        e.currentTarget.style.display = "none";
        const editor = document.getElementById("Editor");
        editor.style.display = "block";

    };

    return (
<section className="PostPageCommentPrompt">
    <div className="PostBox" data-classification="comment_prompt" onClick={(e) => expand_prompt(e)}>    
        <div className="PostContentDiv">
            Post a comment
        </div>
    </div>
    <CommentEditor relevant_document={editorDocument} document_submit={document_submit} onChange={updateDocument}/>

</section>
    )
};

export function PostPageComment({id, ...props}) {
    const content = html_parser(JSON.parse(props.post_content));
    
    const attributes = {"data-thumbs_up_count": props.thumbs_up,
                "data-thumbs_down_count": props.thumbs_down};
    if (props.reactions) {
        props.reactions.split(",").map((reaction) =>
        attributes[`data-${reaction.toLowerCase()}`] = "true");
    }
    return (
<section className="PostPageComment" key={id} id={id}>
    <div className="PostPageProfilingContainer"> 
        <div id="PostPageMainAvatar" style={{backgroundImage: (props.avatar != null) ? `url(/avatars/${props.avatar}/)`: "none"}}/>
        <div className="ProfilingOverlay"></div>
    </div> 
    <div className="here">{props.post_owner}</div>
    <div className="PostBox" data-classification="comment" id={props.subject_id}>
    <div className="PostBoxDateDiv">{props.post_date}</div>
        
    <div className="PostContentDiv">{content}</div>

    <div className="PostReactionsContainer" {...attributes} data-reactions={props.reactions ? props.reactions.split(","): null}>
        {(props.thumbs_up > 0) ? <div className="PostReaction" style={{backgroundImage: `url(${FireGif})`}} 
        data-removal_name="thumbs_up"></div>
        : null}
        {(props.thumbs_down > 0) ? <div className="PostReaction" style={{backgroundImage: `url(${PoopGif})`}} 
        data-removal_name="thumbs_down"></div>
        : null}
        <div className="PostAddReactionTooltip">
            <span className="StandardSpan">
                Add Reaction
            </span>
            <div className="PostAddReactionContainer">

                <div className={`PostReaction ThumbsUp`} style={{backgroundImage: `url(${FireGif})`}} 
                onClick={(e) => {
                    e.stopPropagation();
                    react_to(id, "thumbs_up", FireGif, "comment");
                    }}></div>

                <div className={`PostReaction ThumbsDown`} style={{backgroundImage: `url(${PoopGif})`}}
                onClick={(e) => {
                    e.stopPropagation();
                    react_to(id, "thumbs_down", PoopGif, "comment");
                    }}></div>

            </div>
        </div>
        </div>
    
    </div>
    <div className="PostPageSignatureContainer">
        <span className="StandardSpan" style={{color: "white"}}>this is where the signature would go</span>
    </div>
</section>
    )
}



export function ReceptivePost({post_box_classname, id, link, on_click_function, text_converserion_required,
    target_category, ...props}) {
    const CustomTag = link ? Link: `div`;

    var content = props.post_content;
    if (text_converserion_required == true) {
        var post_content = JSON.parse(props.post_content);
        content = html_parser(post_content, id);
    }
    const attributes = {"data-thumbs_up_count": props.thumbs_up,
                "data-thumbs_down_count": props.thumbs_down};
    if (props.reactions) {
        props.reactions.split(",").map((reaction) =>
        attributes[`data-${reaction.toLowerCase()}`] = "true");
    }

    function thumbs_up(e) {
        e.stopPropagation();
        react_to(id, "thumbs_up", FireGif, target_category);
    }

    function thumbs_down(e) {
        e.stopPropagation();
        react_to(id, "thumbs_down", PoopGif, target_category);
    }

    window[id] = useRef({"thumbs_up": thumbs_up,
                        "thumbs_down": thumbs_down});
    

    
    return (
<div className={post_box_classname ? post_box_classname: "PostBox"} key={id} id={id ? id: null} 
onClick={on_click_function ? on_click_function: null}>
    <CustomTag to={link ? link: null} className="PostBoxLink">
     <div className="PostBoxDateDiv">{props.post_date}</div>
     <div className="PostBoxTitleDiv">{(target_category == "subject") ? props.owner_name : props.post_title}</div>
     <div className="PostBoxCommentsDiv">{props.amount_of_comments} Comments</div>
    
    <div className="PostContentDiv">{content}</div>
    </CustomTag>
    <div className="PostReactionsContainer" {...attributes} data-reactions={props.reactions ? props.reactions.split(","): null}>
        {(props.thumbs_up > 0) ? <div className="PostReaction" style={{backgroundImage: `url(${FireGif})`}} 
        data-removal_name="thumbs_up"></div>
        : null}
        {(props.thumbs_down > 0) ? <div className="PostReaction" style={{backgroundImage: `url(${PoopGif})`}} 
        data-removal_name="thumbs_down"></div>
        : null}
        <div className="PostAddReactionTooltip">
            <span className="StandardSpan">
                Add Reaction
            </span>
            <div className="PostAddReactionContainer">

                <div className={`PostReaction ThumbsUp`} style={{backgroundImage: `url(${FireGif})`}} 
                onClick={(e) => {
                    thumbs_up(e);
                    }}></div>

                <div className={`PostReaction ThumbsDown`} style={{backgroundImage: `url(${PoopGif})`}}
                onClick={(e) => {
                    thumbs_down(e);
                    }}></div>

            </div>
        </div>
    </div>
   
    
</div>
    )
}

export function DummyPost(props) {
    return(
<ReceptivePost id={props.post_id} text_converserion_required={true} target_category="post" {...props}></ReceptivePost>
    )
}

export function DummySubject(props) {
    return (
<ReceptivePost id={props.subject_id} {...props} target_category="subject"
on_click_function={() => {
    function personalized_submit_comment(comment_doc) {
        submit_comment(props.post_id, props.subject_id, comment_doc);
    };
    expand_subject(props.subject_id);
    fetch_and_render_comments(props.subject_id, personalized_submit_comment);
 
}

}></ReceptivePost>
    )
};


function DummyComment(props) {
    return (
<ReceptivePost id={props.comment_id} text_converserion_required={true} target_category="comment" {...props}></ReceptivePost>
    )
}