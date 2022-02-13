import React, { useEffect, useState } from "react";
import './App.css';
import CircularProgress from '@mui/material/CircularProgress';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

const ImagePreview = ({ dataUri }) => {
  const [dataUrl, setDataUrl] = useState(undefined);

  useEffect(()=>{
    var a = new FileReader();
    a.onload = function(e) {setDataUrl(e.target.result);}
    a.readAsDataURL(dataUri);
  },[])

  return (
    <div className={'demo-image-preview'}>
      <img src={dataUrl} />
    </div>
  );
};

function  App() {
  const webcamRef = React.useRef(null);

  const [selectedFiles, setSelectedFiles] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const [ws, setWS] = useState(undefined);

  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.binaryType = "arraybuffer";
    ws.onmessage = (event) => {
      var response = JSON.parse(event.data)
      console.log(response)
      if (response["found"]) {
          window.open(response["url"], '_blank')
          setMessage(response["url"])
      }else{
          setMessage("Object not found")
      }
      setLoading(false)
    };
    setWS(ws)
  },[])

  const dataURLtoBlob = (dataurl) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  const handleTakePhoto = (dataUri) => {
    // Do stuff with the photo...
    console.log('takePhoto');
    setSelectedFiles([dataURLtoBlob(dataUri)])
  }

  const sendFile = (event) => {
    event.preventDefault()
    setMessage("");
    var file = selectedFiles[0];
    if (!file) {
        setMessage("Please upload an image");
        return
    }
    setLoading(true)
    var reader = new FileReader();
    var rawData = new ArrayBuffer();
    reader.loadend = function() {

    }
    reader.onload = function(e) {
        rawData = e.target.result;
        ws.send(rawData);
    }
    reader.readAsArrayBuffer(file);
    
  }

  const onImageUploadTypeSwitch = () =>{
    setUseCamera(!useCamera)
    setSelectedFiles(undefined);
  }

  const retakePhotoCallback = () =>{
    setSelectedFiles(undefined);
  }
  return (
    <div className="col-xs-1" align="center">
        <h1 >Image browser</h1>
      
      {!loading && 
        <div>
          <button onClick={onImageUploadTypeSwitch}>{ !useCamera ? "Switch to camera" : "Switch to file upload"}</button>
          <br/>
          {useCamera &&
            (selectedFiles) &&
              <div>
                <ImagePreview dataUri = {selectedFiles[0]} />
                <button
                  className="btn btn-success"
                  onClick={retakePhotoCallback}
                >
                  Take another photo
                </button>
              </div>
          }
          {useCamera &&
            !(selectedFiles) &&
            <Camera onTakePhotoAnimationDone = {handleTakePhoto}/>
          }
          {!useCamera &&
            <label className="btn btn-default">
              <input type="file" onChange={(event)=>setSelectedFiles(event.target.files)} />
            </label>
          }
          <button
            className="btn btn-success"
            disabled={!selectedFiles}
            onClick={sendFile}
          >
            Upload
          </button>
        </div>
      }
      {loading && 
        <CircularProgress />
      }
      <p>{message}</p> 
    </div>
  );
}

export default  App;