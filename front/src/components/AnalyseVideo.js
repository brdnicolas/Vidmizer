import React, {Component} from 'react';
import '../css/AnalyseVideo.css';
import axios from 'axios';
import img_analyze from '../img/radar.png'
import loading from '../img/loading.gif'

class Formulaire extends Component {

    constructor() {
        super();
        this.state = {
            img_link: require("../img/find.png"),
            file_selected: "No file selected",
            video_file: null,
            image_file:null,
            images_returned: [],
            error: "",
            infos: {},
            fps : 0.1,
            fps1_checked : 1,
            fps5_checked : 0,
            fps10_checked : 0,
            file_selectedLeft: "No file selected"
        }
    }

    componentDidMount() {
        const element = document.getElementById("loading");
        element.style.display = "none";
        document.getElementById("download").style.display = "none";
    }


    onChangeImage = () => {
        const image = document.getElementById("img_to_find").files[0];
        if(image) {
            this.urlToDataUrl(image);
            this.setState( {image_file: image, file_selectedLeft: image.name});
        }
    };

    onChangeVideo = () => {
        const video = document.getElementById("video_to_analyse").files[0];
        if(video) {
            this.setState( {file_selected:video.name});
            this.setState( {video_file:video});
        }
    };

    onChangeFps = () => {
        const fps1 = document.getElementById("fps1").checked;
        const fps5 = document.getElementById("fps5").checked;
        const fps10 = document.getElementById("fps10").checked;

        if(fps1)
            this.setState({fps : 0.1, fps1_checked : 1, fps5_checked : 0, fps10_checked : 0});
        else if(fps5)
            this.setState({fps : 0.5, fps1_checked : 0, fps5_checked : 1, fps10_checked : 0});
        else if(fps10)
            this.setState({fps : 1, fps1_checked : 0, fps5_checked : 0, fps10_checked : 1});
    };

    toDataUrl(img, callback) {
        let reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        };
        reader.readAsDataURL(img);
    }

    urlToDataUrl2(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            let reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    urlToDataUrl = (url) => {
        if(url instanceof Blob) {
            this.toDataUrl(url, (myBase64) => {
                this.setState({img_link: myBase64});
            });
        }
        else {
            this.urlToDataUrl2(url, (myBase64) => {
                this.setState({img_link: myBase64});
            });
        }
    };

    startAnalysis = () => {
        this.setState({error:"", images_returned:[],infos:{}});
        const input_name = document.getElementById("input_name");
        const btn_browse_image = document.getElementById("btnbrowsimage");
        const video = document.getElementById("video_to_analyse");
        const video_btn = document.getElementById("btnvideobrowse");

        input_name.style.borderBottom = "1px solid white";
        btn_browse_image.style.background = "#3587e1";
        video_btn.style.background = "#3587e1";

        /* Validateurs */
        if(input_name.value === "") {
            input_name.style.borderBottom = "1px solid #FE9898";
            return;
        }

        if(!this.state.image_file) {
            btn_browse_image.style.background = "#FE9898";
            return;
        }
        if(!video.files[0]) {
            video_btn.style.background = "#FE9898";
            return;
        }


        document.getElementById("loading").style.display = "flex";



        /* Valeurs */
        const file_video = document.getElementById("video_to_analyse").files[0];
        /* Valeurs */

        const image_start = document.getElementById("analyze_img");
        image_start.className = 'rotate';

        this.uploadVideo(file_video);

    };

    uploadVideo = (file_video) => {
        console.log("Analyse ...");
        document.getElementById("download").style.display = "none";
        const url = 'http://127.0.0.1:5000/similar/url/video';
        const formData = new FormData();
        formData.append('video',file_video);
        formData.append('fps', this.state.fps);
        formData.append("face-url", this.state.img_link);
        formData.append("visage-name", document.getElementById("input_name").value);

        const config = {
            headers: {
                'content-type': 'application:octet-stream'
            }
        };
        this.setState({loading:true});
        axios.post(url, formData, config)
            .then(response => {
                console.log("Success");
                if(response.data === "adult content found") {
                    this.setState({error:"adult content found"});
                    document.getElementById("loading").style.display = "none";
                    return;
                }
                if(response.data.images.length > 0) {
                    this.setState({infos: response.data.infos, images_returned:response.data.images});
                    document.getElementById("download").style.display = "block";
                    window.location.href="#imagesreturned";
                } else {
                    this.setState({error:"No visage found."})
                }
                document.getElementById("loading").style.display = "none";
            })
            .catch(error => {
                console.log(error);
                this.setState({error:"an error has occurred"});
                document.getElementById("loading").style.display = "none";
            });
    };

    render() {
        return (
            <div className="Upload">
                <p className="error">{this.state.error}</p>
                <div className="upload-image">
                    <div className="left">
                        <h2>Upload a face</h2>
                        <div>
                            <img alt="Visage you want to analyze on 2nd part" src={this.state.img_link}/>
                        </div>
                        <input id="input_name" placeholder="Name of this visage" className="input-name" type="text"/>
                        <input onChange={this.onChangeImage} style={{display:"none"}} type="file"
                               id="img_to_find" name="image"
                               accept="image/*"/>
                        <p className="selected_files">{this.state.file_selectedLeft}</p>
                        <input id="btnbrowsimage" className="buttonBrows" type="button" value="Browse..."
                               onClick={() => document.getElementById('img_to_find').click()}/>
                    </div>
                    <div className="right">
                        <p>Upload a video to analyse</p>
                        <input onChange={this.onChangeVideo} style={{display:"none"}} type="file"
                               id="video_to_analyse" name="video"
                               accept="video/*"/>
                        <div className="video_part">
                            <input id="btnvideobrowse" className="buttonBrows" type="button" value="Browse..."
                                   onClick={() => document.getElementById('video_to_analyse').click()}/>
                            <p className="selected_files">{this.state.file_selected}</p>
                        </div>
                        <div>
                            <p>Select a precision scope:</p>
                            <div className="precisionScope">
                                <input type="radio" id="fps1" name="drone" value="huey" checked={this.state.fps1_checked} onChange={this.onChangeFps}/>
                                <label>Sweet (Every 10 second)'</label>
                                <input type="radio" id="fps5" name="drone" value="huey" checked={this.state.fps5_checked} onChange={this.onChangeFps}/>
                                <label>Medium (Every 5 seconds)</label>
                                <input type="radio" id="fps10" name="drone" value="huey" checked={this.state.fps10_checked} onChange={this.onChangeFps}/>
                                <label>Hard (Every second)</label>
                            </div>
                        </div>
                        <div className="start">
                            <p className="change">If you want to analyse with an image, click <span><a href="/image">here</a></span></p>
                        </div>
                        <a id="download" href="http://127.0.0.1:5000/download/video"><button>Download all</button></a>
                        <button onClick={this.startAnalysis} className="analyze"><img id="analyze_img" alt="start analysis" src={img_analyze}/></button>
                    </div>
                </div>
                <img alt="loading" id="loading" className="loading" src={loading}/>
                <div className="list_image">
                    <h1 id="imagesreturned">Detected faces</h1>
                    {this.state.images_returned.map((item, i) => {
                        const path = "http://127.0.0.1:5000/static/video/" + item + '.png';
                        return(
                            <div key={path} className="images">
                                <p>{this.state.infos[item].captions[0].text}</p>
                                <div className="imgTAG">
                                    <img key={i} alt={this.state.infos[item].captions[0].text} className="imgReturned" src={path}/>
                                    <ul>
                                        <li>Tags : </li>
                                        <br/>
                                        {this.state.infos[item].tags.map((item2,i2) => {
                                            return(<li key={item2}>{item2}</li>);
                                        })}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default Formulaire;
