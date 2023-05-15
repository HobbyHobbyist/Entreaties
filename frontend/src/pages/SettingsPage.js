import NavigationBar from "../components/NavigationBar.js";

import {useEffect, useState} from "react";
import { Slider } from "@material-ui/core";


function change_root_hue(value) {
    document.querySelector(":root").style.setProperty("--chosenHue", value);
}

function change_root_saturation(value) {
    document.querySelector(":root").style.setProperty("--saturationBase", value + "%");
}

function change_root_lightness(value) {
    document.querySelector(":root").style.setProperty("--lightnessBase", value + "%");
}


function SettingsPage(props){
    const [bah, set_bah] = useState(240);
    const [saturation, set_saturation] = useState(30);
    const [lightness, set_lightness] = useState(30);


    return(
<>
<NavigationBar/>
<div style={{position: "absolute", backgroundColor: "grey", width: "100%", top: "7.5vh", height: "92.5vh",
overflowY: "scroll", scrollbarWidth: "none"}}>
    <div className="SettingSection" id="ColorSettings">
        <div class="Slider" id="HueSlider">
            <div variant="overline" style={{color: "white"}}>
                Hue
            </div>
            <Slider value={bah} min={0} max={300} step={1} aria-labelledby="Hue" style={{color: "white", height: "5%"}}
            onChange={(e, value) => {
                set_bah(value);
                change_root_hue(value);
            }}/>
        </div>

        <div class="Slider" id="SaturationSlider">
            <div variant="overline" style={{color: "white"}}>
                Saturation
            </div>
            <Slider value={saturation} min={0} max={100} step={1} aria-labelledby="Saturation" style={{color: "white", height: "5%"}}
            onChange={(e, value) => {
                set_saturation(value);
                change_root_saturation(value);
            }}/>
        </div>

        <div class="Slider" id="LightnessSlider">
            <div variant="overline" style={{color: "white"}}>
                Lightness
            </div>
            <Slider value={lightness} min={0} max={100} step={1} aria-labelledby="Lightness" style={{color: "white", height: "5%"}}
            onChange={(e, value) => {
                set_lightness(value);
                change_root_lightness(value);
            }}/>
        </div>

        <div className="StandardOption" style={{height: "7.5vh"}} onClick={() => {
            set_bah(240);
            change_root_hue(240);
            set_saturation(30);
            change_root_saturation(30);
            set_lightness(30);
            change_root_lightness(30);
        }}>
            <span className="StandardSpan" style={{pointerEvents: "none"}}>Default</span>
        </div>
    </div>

    <div className="SettingSection"></div>






</div>
</>

    )
};


export default SettingsPage