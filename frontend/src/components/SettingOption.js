

function toggle_status(e) {
    const target = e.currentTarget;
    const indicator_section = target.getElementsByClassName("SettingOptionIndicatorSection")[0];
    const indicator = indicator_section.getElementsByClassName("SettingSpan")[0];

    if (target.dataset.status == "1") {
        target.dataset.status = "0";
        indicator_section.dataset.status = "0";
        indicator.dataset.indicator = "0"
    }
    else {
        target.dataset.status = "1";
        indicator_section.dataset.status = "1";
        indicator.dataset.indicator = "1"
    }
};


export function SettingOption({setting_name, default_status, id}) {
    return (
<div className="SettingOptionContainer" id={id} data-status={default_status} 
onClick={(e) => toggle_status(e)}>
    <div className="SettingOptionNameSection">
        <div className="SettingBackdrop"></div>
        <span className="SettingSpan">{setting_name}</span>
    </div>
    <div className="SettingOptionIndicatorSection" data-status={default_status}>
        <span className="SettingSpan" data-indicator={default_status}></span>
    </div>
</div>
)
};

export default SettingOption;