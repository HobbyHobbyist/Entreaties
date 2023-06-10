

function CategoryButtonMockup({category_name}) {
    return (
<div className="CategoryButton" style={{zIndex: "0"}} data-active="true" onClick={(e) => {
    if (e.currentTarget.dataset.active === "true") {
        e.currentTarget.dataset.active = "false"
    }
    else {
        e.currentTarget.dataset.active = "true";
    }
}}> 
    <span className="CategoryButtonSpan">{category_name}</span>
    <div className="CategoryButtonIndicator"></div>
</div>
    )
};





function EntreatiesPageMockup() {
    return (
<div style={{transform: "scale(.65) translateY(20%)", position: "absolute", top: "0%", marginTop: "0%", border: "solid 1vh black"}}>
    <div className="ScrollContainer" style={{marginTop: "0%", height: "100%", maxHeight: "100%"}}>
        <section className="ScrollSection" style={{height: "100%", maxHeight: "100%"}}>

            <div id="EntreatySearchFilter">
            <div className="EntreatyDropdownSearchOption" id="EntreatiesCategoriesDropdown"> 
            <span className="EntreatyManagementSpan">Categories</span> 
            </div>
                <div className="EntreatyManagementOption" id="CurrentEntreatiesNavigator">
                    <span className="EntreatyManagementSpan">View current</span>
                </div>
            </div>

            <div id="EntreatySearchOptions">
                <CategoryButtonMockup category_name="Design"/>
                
                <CategoryButtonMockup category_name="Art"/>
                
                <CategoryButtonMockup category_name="Programming"/>

                <CategoryButtonMockup category_name="Gaming"/>

                <CategoryButtonMockup category_name="Roleplaying"/>

                
                <CategoryButtonMockup category_name="Writing"/>

                
                <CategoryButtonMockup category_name="Music"/>

            </div>

            <div id="EntreatyDropdownSearchOptions">
            <CategoryButtonMockup category_name="Design"/>
                
                <CategoryButtonMockup category_name="Art"/>
                
                <CategoryButtonMockup category_name="Programming"/>

                <CategoryButtonMockup category_name="Gaming"/>

                <CategoryButtonMockup category_name="Roleplaying"/>

                
                <CategoryButtonMockup category_name="Writing"/>

                
                <CategoryButtonMockup category_name="Music"/>

            </div>

            <section id="EntreatiesContainer">
            <div className="ScrollSubsection" id="EntreatiesImplantContainer">
            </div>

            </section>
        </section>
    </div>
</div>);
}

export default EntreatiesPageMockup;