import React, {Component} from 'react';
import '../css/Formulaire.css';
import axios from 'axios';
import request from 'request';


class Formulaire extends Component {

    constructor() {
        super();
        this.state = {
            video: "//aka.ms/ampembed?url=%2F%2Famssamples.streaming.mediaservices.windows.net%2F3b970ae0-39d5-44bd-b3a3-3136143d6435%2FAzureMediaServicesPromo.ism%2Fmanifest",
            url:'',
            name:''
        }
    }


    postVideoUpload() {
        const elem = document.getElementById("videobtn");
        const video = document.getElementById("video-input").files[0];

        if (video) {
            elem.innerHTML = "Uploaded !";
            elem.style.backgroundColor = "#C4FC90";
        } else {
            elem.innerHTML = "Error";
            elem.style.backgroundColor = "#FC9090";
            return;
        }

        const url = 'http://127.0.0.1:5000/upload';
        const formData = new FormData();
        formData.append('file',document.getElementById("video-input").files[0]);
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        return  axios.post(url, formData,config)
    }

    onVideoChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            this.setState({video: URL.createObjectURL(event.target.files[0])});
        }
    };

    call = () => {
        axios.post('https://vidmizer-faceapi.cognitiveservices.azure.com/face/v1.0/detect',
            {
                headers:
                    {
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': '95c586cd19b840daab32790bea776dc0'
                    },
                data:
                    {
                        'url': '../../public/decout_g.png'
                    }
            }).then(response => {
            console.log(response.data);
        })
            .catch(error => {
                console.log(error);
            });
    };

    cutVideo = (video) => {
        const elem = document.getElementById("videobtn");
        const input_video = document.getElementById("video-input").files[0];

        if (input_video) {
            elem.innerHTML = "Uploaded !";
            elem.style.backgroundColor = "#C4FC90";
        } else {
            elem.innerHTML = "Error";
            elem.style.backgroundColor = "#FC9090";
        }

    }

    createFaceList() {
        axios.put('https://francecentral.api.cognitive.microsoft.com/face/v1.0/largefacelists/{1}', {
            name : "test",
        }, {
            'Ocp-Apim-Subscription-Key' : '5de63d671c144fe0a06b4ed7ed9bf49e',
        }).then(response => {
            console.log(response.data);
        }).catch(error => {
            console.log(error);
        });
    };

    urlOnChange = (e) => {
        this.setState({url:e.target.value});
    };

    nameOnChange = (e) => {
        this.setState({name:e.target.value});
    };

    postFace = (e) => {
        e.preventDefault();
        const elem = document.getElementById("uploadbtn");
        const input_url = document.getElementById("face-input").value;
        const input_name = document.getElementById("text-input").value;

        if (input_url && input_name) {
            elem.innerHTML = "Uploaded !";
            elem.style.backgroundColor = "#C4FC90";
        } else {
            elem.innerHTML = "Error";
            elem.style.backgroundColor = "#FC9090";
            return;
        }

        const subscriptionKey = '814853617994445e94ab5702c7848828';

        const uriBase = 'https://faceapi-sub.cognitiveservices.azure.com/face/v1.0/detect';
        console.log(this.state.image);
        const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/37/Dagestani_man_and_woman.jpg";

        const params = {
            'returnFaceId': 'true',
            'returnFaceLandmarks': 'false',
            'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
                'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
        };

        const options = {
            uri: uriBase,
            qs: params,
            body: '{"url": ' + '"' + imageUrl + '"}',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key' : subscriptionKey
            }
        };

        request.post(options, (error, response, body) => {
            if (error) {
                console.log('Error: ', error);
                return;
            }
            let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
            console.log('JSON Response\n');
            console.log(jsonResponse);
        });
    };


    render() {
        return (
            <div className="Upload">
                <img src={this.state.image} />
                <div className="UploadPart">
                    <div className="FacePart">
                        <h2>Upload un visage</h2>
                        <form className="container">
                            <div>
                                <p>URL d'une photo de la personne que tu veux trouver</p>
                                <input className={"input"} onChange={this.urlOnChange} required={true} type="text"
                                       id="face-input" name="face" />
                            </div>
                            <div>
                                <p>Donnez lui un nom</p>
                                <input className={"input"} onChange={this.nameOnChange} required={true} type="text"
                                       id="text-input" name="name"/>
                            </div>
                            <button id="uploadbtn" onClick={this.postFace} type="submit">Upload</button>
                        </form>
                    </div>
                    <div className="FacePart">
                        <h2>Upload une vidéo</h2>
                        <form className="container">
                            <div>
                                <p>Choisissez une vidéo à analyser</p>
                                <input onChange={this.onVideoChange} type="file"
                                       id="video-input" name="vidoe"
                                       accept="video/mp4, video/avi, video/mov"/>
                            </div>
                            <button id="videobtn" onClick={() => {this.postVideoUpload()}} type="button">Upload</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default Formulaire;
