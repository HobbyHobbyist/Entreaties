import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import getCroppedImg from './cropImage';





async function get_avatar_file() {
  
  const save_button = document.getElementById("SaveButton");
  if (save_button.dataset.clicked == "false") {
    save_button.dataset.clicked = "clicked";

    const image_holder = document.getElementById("CroppedImage");
    const avatar = image_holder.style.backgroundImage;
    var form = new FormData();
    console.log(avatar);

    const isolated_base64_info = avatar.split("base64,")[1];
    
    var blob = new Blob([isolated_base64_info]);


    form.append("avatar", blob); form.append("base", "base64")
    
    console.log(form);

    return fetch("/flask/self/update_profiling/avatar/",
    {method: "POST",
    credentials: "include",
    mode: "cors",
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true},
    body: form}).then(response => response.json().then((output) =>
    {
    console.log(output);
    return output;

    }))
  };
};


function load_entreaty_cover_file() {
  const image_holder = document.getElementById("CroppedImage");
  const entreaty_cover = image_holder.style.backgroundImage;
  const entreaty_picture = document.getElementById("EntreatyCreationPicture");
  entreaty_picture.style.backgroundImage = entreaty_cover;
  close_entreaty_cover_management();
};


function close_entreaty_cover_management() {
  const entreaty_cover_management_container = document.getElementById("EntreatyCoverManagementContainer");
  entreaty_cover_management_container.style.display = "none";
}



function readFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => resolve(reader.result), false)
      reader.readAsDataURL(file)
    })
};


export function ReceptiveCropper ( {save_function, navigation_target, navigate_tool, return_function}, classes ) {
  const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [croppedImage, setCroppedImage] = useState(null)
    const navigate = navigate_tool();
  
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels)
    }, [])
  
    const showCroppedImage = useCallback(async () => {
      try {
          const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
          setCroppedImage(croppedImage);
          const cropped_container = document.getElementById("CroppedImage");
  
          const container = document.getElementById("foo");
          const slider_container = document.getElementById("ZoomSlider");
          const save_button = document.getElementById("SaveButton");
          const show_result_button = document.getElementById("ShowResultButton");
  
  
          container.style.display = "none";
          slider_container.style.display = "none";
          show_result_button.style.display = "none";
          save_button.style.display = "block";
  
      } catch (e) {
        console.error(e);
        console.log(e);
        alert("error in log")
      }
    }, [croppedAreaPixels])
  
    const onClose = useCallback(() => {
      setCroppedImage(null)
    }, [])
  
    const onFileChange = async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        let imageDataUrl = await readFile(file);
  
        setImageSrc(imageDataUrl);
        
      }
    }
  
    if (imageSrc != null) {
    return (
  <div style={{backgroundImage: "linear-gradient(to bottom, rgb(62, 62, 125) 50%, rgb(62, 125, 125), rgb(125, 62, 125))",
  minHeight: "100vh", minWidth: "100%"}}>
      
        <div className="crop-container" style={{height: "50vh", width: "50vh"}} id="foo">
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1 / 1} onCropChange={setCrop} onCropComplete={onCropComplete} 
          onZoomChange={setZoom} style={{containerStyle: {height: "90vh", width: "100%", top: "10vh"}}} />
        </div>
  
        <div className={classes.controls} style={{position: "absolute", top: "0vh", width: "100%", height: "10vh",
          backgroundColor: "rgb(15, 15, 25)"}}>
  
          <div className={classes.sliderContainer} style={{position: "absolute", left: "5%", width: "25%", backgroundColor: "#3f51b5",
          borderRadius: "1vh", height: "50%", top: "25%"}} id="ZoomSlider">
  
            <div variant="overline" classes={{ root: classes.sliderLabel }} style={{color: "white"}}>
              Zoom
            </div>
            <Slider value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" classes={{ root: classes.slider }} 
            onChange={(e, zoom) => setZoom(zoom)} style={{color: "white", bottom: "28.5%", height: "5%"}}/>
          </div>
          
          <Button id="ShowResultButton" style={{position: "absolute", top: "25%", left: "37.5%", width: "25%"}}
            onClick={showCroppedImage} variant="contained" color="primary" classes={{ root: classes.cropButton }}>
            Show Result
          </Button>
  
          <Button style={{position: "absolute", top: "25%", left: "37.5%", width: "25%", display: "none"}} id="SaveButton"
          onClick={() => {
              console.log(save_function);
              save_function();
              if (navigation_target != undefined) {
                setTimeout(() => navigate(navigation_target), 0);
                }
              }}  
          variant="contained" color="primary" classes={{ root: classes.cropButton }} data-clicked="false">
            Save
          </Button>
  
          <Button style={{position: "absolute", top: "25%", right: "5%", width: "25%"}}
            onClick={() => {
              setImageSrc(null); setCroppedImage(null);
              const container = document.getElementById("foo");
              const slider_container = document.getElementById("ZoomSlider");
              const save_button = document.getElementById("SaveButton");
      
              container.style.display = "block";
              slider_container.style.display = "block";
              save_button.style.display = "none";
          }} 
            variant="contained" color="primary" classes={{ root: classes.cropButton }}>
            Close
          </Button>
        </div>
        <canvas id="CroppedImage" img={croppedImage} style={{position: "absolute", left: "calc(50% - 25vh)", height: "50vh", 
        top: "calc(50% - 25vh)", width: "50vh", backgroundImage: croppedImage ? `url(${croppedImage}`: "none", backgroundSize: "contain", 
        backgroundRepeat: "no-repeat"}} />
  </div>
    )} 
  
      else if (imageSrc == null) {
          return (
  <div style={{backgroundImage: "linear-gradient(to bottom, rgb(62, 62, 125) 50%, rgb(62, 125, 125), rgb(125, 62, 125))",
  minHeight: "100vh", minWidth: "100%"}}>
  
      <div className={classes.controls} style={{position: "absolute", top: "0vh", width: "100%", height: "10vh",
      backgroundColor: "rgb(15, 15, 25)"}}>
          
          <Button style={{position: "absolute", top: "25%", left: "37.5%", width: "25%"}}
            onClick={() => {
              const target = document.getElementById("UploadImageButton");
              target.click();
            }} variant="contained" color="primary" classes={{ root: classes.cropButton }}>
            Open image
            <input type="file" onChange={onFileChange} accept="image/*" id="UploadImageButton" style={{display: "none"}}/>
          </Button>
  
  
          <Button style={{position: "absolute", top: "25%", right: "5%", width: "25%"}}
            onClick={() => {
              if (navigation_target != undefined) {
                navigate(navigation_target);
              }
              else {
                return_function();
              }
            
            }} variant="contained" color="primary" classes={{ root: classes.cropButton }}>
            Return
          </Button>
      </div>
  
  </div>
          )
  
    }
  
  }


export function AvatarCropper(){
  return (
<ReceptiveCropper save_function={get_avatar_file} navigate_tool={useNavigate} navigation_target="/Profile"/>
  )
}

export function EntreatyCropper() {
  return (
<ReceptiveCropper save_function={load_entreaty_cover_file} navigate_tool={() => {return null; } } 
return_function={close_entreaty_cover_management}/>
  )
}
  

