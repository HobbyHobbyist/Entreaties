
export function ProfileSearchBox(props) {
    return (

<div className="ProfileSearchBox" onClick={() => props.navigate()}>
        <div className="ProfileSearchBoxAvatarContainer" >
            <div className="ProfileSearchBoxAvatar" 
            style={{backgroundImage: (props.profile_avatar != null) ? `url(avatars/${props.profile_avatar})`: null, 
            backgroundRepeat: "no-repeat"}}></div>    
        </div> 
        <div className="ProfileSearchBoxNameSection">{props.profile_name}</div>
        <div className="ProfileSearchBoxDescriptionSection">
            <span className="DescriptionSpan">
                {props.introduction}
            </span>
        </div>
</div>
)
};

export default ProfileSearchBox;