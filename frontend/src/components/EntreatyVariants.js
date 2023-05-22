import html_parser from "../utils/html_parser";


function enlarge_entreaty(event) {
    let parentEle = event.currentTarget.parentElement;
    if (parentEle.dataset.enlarged != "true") {
        parentEle.dataset.enlarged = "true";
        parentEle.scrollIntoView();
        }
    else {
        parentEle.dataset.enlarged = "false";
        parentEle.scrollIntoView();
    }
};

function open_thread(thread_id, entreaty_id) {
    
}

function turning_cursor(e) {
    const remnant = document.createElement("div");
    remnant.style.position = "absolute";
    remnant.style.zIndex = 100000;
    document.body.appendChild(remnant);
    setTimeout(() => {
        let width = window.getComputedStyle(remnant).getPropertyValue("width").slice(0, -2);
        remnant.style.left = e.clientX - 32 + "px";
        remnant.style.top = e.clientY - 24 + "px";
        remnant.className = "TurningCursor";

        setTimeout(() => {
            remnant.remove();
        }, 750)
    }, 1)
    

}


export function EntreatySearchBox({on_click_function, ...props}){
    let content = html_parser(JSON.parse(props.entreaty_content), props.entreaty_id);
    return (
    <div className="EntreatySearchBox" key={props.entreaty_id}>
        <div className="EntreatySearchBoxImageSection" 
        style={{backgroundImage: props.entreaty_cover ? `url(${"entreaty_covers/" + props.entreaty_cover})`: null}}
        onClick={(event) => enlarge_entreaty(event)}></div>
        <div className="EntreatySearchBoxDescriptionSection" onClick={(event) => enlarge_entreaty(event)}>
            <span className="EntreatySearchBoxSpan">
                {content}
            </span>
        </div>
        <div className="EntreatySearchBoxTitleSection" onClick={(e) => {
            on_click_function();
            turning_cursor(e);
        }}>
            <div className="StandardSpan" style={{color: "inherit"}}>
                {props.entreaty_title}
            </div>
        </div>
        <div className="EntreatySearchBoxMetaInfo">
            <span className="EntreatySearchBoxName" onClick={() => window.open(`/Profile/${props.entreaty_owner}`, "_blank")}>
            {props.entreaty_owner}</span> {props.entreaty_date}
        </div>
    </div>

    )

};


export function EntreatyThread(props) {

return(
<div className="SpecificEntreatyThread" data-key={props.thread_id} onClick={() => {
    alert("to keep the scope of this project reasonable, these threads cannot be viewed more deeply nor commented on.")
    }}>
    <div className="SpecificEntreatyThreadTitle">
        <span className="StandardButPotentiallyLengthySpan">
            {props.thread_title}
        </span>
    </div>
    <div className="SpecificEntreatyThreadMetadata">
        <span className="StandardButPotentiallyLengthySpan">
            {props.thread_owner} {props.date_posted}
        </span>
    </div>
    <div className="SpecificEntreatyThreadRecentData">
        <span className="StandardButPotentiallyLengthySpan">
            {props.last_comment_date}
        </span>
    </div>
</div>
)
};


export function EntreatyViewBox(props) {
    return(
<div className="EntreatyViewBox" key={props.entreaty_id} id={props.entreaty_id} data-pinned={(props.pinned) ? "true": null}
data-date={props.entreaty_date} onClick={(e) => props.on_click_function(e)}>
    <div className="EntreatyPinIndicator"></div>
    <div className="EntreatyViewBoxTitleSection">
        <span className="StandardSpan">{props.entreaty_title}</span>
    </div>
    <div className="EntreatyViewBoxImageSection"
    style={{backgroundImage: props.entreaty_cover ? `url(${"entreaty_covers/" + props.entreaty_cover})`: null}}></div>
</div>
    )
}