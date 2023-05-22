
export function mark_entreaties() {
    const entreaty_boxes = document.getElementsByClassName("EntreatyViewBox");
    const pin_button = document.getElementById("PinButton");
    const cancel_button = document.getElementById("PinCancel");
    const save_button = document.getElementById("PinSave");

    if (pin_button.dataset.pinning != "true") {
        for (let index = 0; index < entreaty_boxes.length; index++) {
            let target_entreaty = entreaty_boxes[index];
            target_entreaty.dataset.pin_candidate = "true";
            target_entreaty.addEventListener("click", toggle_pinned_status);
            if (target_entreaty.dataset.pinned == "true") {
                target_entreaty.getElementsByClassName("EntreatyPinIndicator")[0].dataset.pinned = "true";
            };
        }
        pin_button.dataset.pinning = "true";
        pin_button.dataset.visible = "false";
        cancel_button.dataset.visible = "true";
        save_button.dataset.visible = "true";
    }

};

export function unmark_entreaties() {
    const entreaty_boxes = document.getElementsByClassName("EntreatyViewBox");
    const pin_button = document.getElementById("PinButton");
    const cancel_button = document.getElementById("PinCancel");
    const save_button = document.getElementById("PinSave");

    for (let index = 0; index < entreaty_boxes.length; index++) {
        let target_entreaty = entreaty_boxes[index]; 
        target_entreaty.dataset.pin_candidate = "false";
        target_entreaty.removeEventListener("click", toggle_pinned_status);
        if (target_entreaty.dataset.pinned != "true" ) {
            delete target_entreaty.getElementsByClassName("EntreatyPinIndicator")[0].dataset.pinned;
        }
    }
    pin_button.dataset.pinning = "false";
    pin_button.dataset.visible = "true";
    cancel_button.dataset.visible = "false";
    save_button.dataset.visible = "false";

}


export function toggle_pinned_status(e) {
    let entreaty_pin = e.currentTarget.getElementsByClassName("EntreatyPinIndicator")[0];
    if (entreaty_pin.dataset.pinned == "true") {
        entreaty_pin.dataset.pinned = "false";
    }
    else {
        entreaty_pin.dataset.pinned = "true";
    }
};


export function save_pinned_statuses() {
    const entreaty_boxes = document.getElementsByClassName("EntreatyViewBox");
    let form = new FormData;
    let pin_groupings = [];
    let all_pinned_entreaties = [];
    let all_unpinned_entreaties = [];

    for (let index = 0; index < entreaty_boxes.length; index++) {
        let target_entreaty = entreaty_boxes[index];
        let target_indicator = target_entreaty.getElementsByClassName("EntreatyPinIndicator")[0];
        let indicator_status = target_indicator.dataset.pinned;
        let initial_status = target_entreaty.dataset.pinned;
        if (initial_status == undefined) {
            initial_status = "false";
        }
        if (indicator_status != initial_status) {
            if (target_indicator.dataset.pinned != undefined) {
                pin_groupings.push([target_entreaty.id, indicator_status]);
                target_entreaty.dataset.pinned = indicator_status;
                if (indicator_status == "true") {
                    all_pinned_entreaties.push([target_entreaty.id, target_entreaty.dataset.date]);
                }
                else {
                    all_unpinned_entreaties.push([target_entreaty.id, target_entreaty.dataset.date])
                }
            }
        }
        else if (initial_status == "true") {
            all_pinned_entreaties.push([target_entreaty.id, target_entreaty.dataset.date]);
        }
    }
    console.log(pin_groupings);
    form.append("modified_pinnings", JSON.stringify(pin_groupings));
    fetch("/flask/self/entreaty_management/pin_entreaties/", 
        {method: "POST", body: form, credentials: "include", mode: "cors", 
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Credentials": true} 
        });

    const current_entreaties_section = document.getElementById("CurrentEntreatiesSection");
    all_pinned_entreaties.sort((a, b) => {
        return new Date(a[1]) - new Date(b[1]);
        });

    for (let index = 0; index < all_pinned_entreaties.length; index++) {
        let pinned_entreaty = document.getElementById(all_pinned_entreaties[index][0]);
        current_entreaties_section.insertBefore(pinned_entreaty, current_entreaties_section.firstChild);
        let date = new Date(pinned_entreaty.dataset.date);
    }

    unmark_entreaties();
}

