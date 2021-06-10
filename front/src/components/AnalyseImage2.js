import React, {Component} from 'react';
import '../css/AnalyseVideo.css';
import axios from 'axios';
import img_analyze from '../img/radar.png'
import loading from '../img/loading.gif'

class Formulaire extends Component {

    constructor() {
        super();
        this.state = {
            file_selected: "No file selected",
            imageRight: null,
            image_link:require("../img/find.png"),
            imageLeft:null,
            imageLeftURL:null,
            image_returned: null,
            error: "",
            infos: {},
            file_selectedLeft: "No file selected"

        }
    }

    componentDidMount() {
        const element = document.getElementById("loading");
        element.style.display = "none";
        document.getElementById("download2").style.display = "none";
    }


    onChangeImage = () => {
        const image = document.getElementById("img_to_find").files[0];
        if(image) {
            this.fileToDataUrl(image);
            this.setState( {imageLeft: image,image_link:image, image_file: image, file_selectedLeft: image.name});
        }
    };

    onChangeVideo = () => {
        const video = document.getElementById("imageRight").files[0];
        if(video) {
            this.fileToDataUrl2(video);
            this.setState({file_selected:video.name});
            this.setState( {imageRight:video});
        }
    };

    toDataUrl(img, callback) {
        let reader = new FileReader();
        reader.onloadend = function() {
            console.log(reader.result);
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

    fileToDataUrl = (url) => {
        if(url instanceof Blob) {
            this.toDataUrl(url, (myBase64) => {
                console.log(myBase64);
                this.setState({imageLeft: myBase64,image_link: myBase64});
            });
        }
        else {
            this.urlToDataUrl2(url, (myBase64) => {
                console.log(myBase64);
                this.setState({imageLeft: myBase64,image_link: myBase64});
            });
        }
    };

    fileToDataUrl2 = (url) => {
        if(url instanceof Blob) {
            this.toDataUrl(url, (myBase64) => {
                console.log(myBase64);
                this.setState({imageRight: myBase64});
            });
        }
        else {
            this.urlToDataUrl2(url, (myBase64) => {
                console.log(myBase64);
                this.setState({imageRight: myBase64});
            });
        }
    };

    startAnalysis = () => {
        this.setState({error:"", image_returned:null,infos:{}});
        const input_name = document.getElementById("input_name");
        const btn_browse_image = document.getElementById("btnbrowsimage");
        const btn_url_image = document.getElementById("urlimage");
        const video = document.getElementById("imageRight");
        const video_btn = document.getElementById("btnvideobrowse");

        input_name.style.borderBottom = "1px solid white";
        btn_browse_image.style.background = "#3587e1";
        video_btn.style.background = "#3587e1";

        /* Validateurs */
        if(input_name.value === "") {
            input_name.style.borderBottom = "1px solid #FE9898";
            return;
        }

        if(!this.state.imageLeft) {
            btn_browse_image.style.background = "#FE9898";
            return;
        }
        if(!video.files[0]) {
            video_btn.style.background = "#FE9898";
            return;
        }


        document.getElementById("loading").style.display = "flex";



        /* Valeurs */

        const image_start = document.getElementById("analyze_img");
        image_start.className = 'rotate';

        this.uploadImageAPI(this.state.left, this.state.right);

    };

    uploadImageAPI = (imageLeft, imageRight) => {
        document.getElementById("download2").style.display = "none";
        this.setState({loading:true});
        let data = new FormData();
        data.append('face-url', this.state.imageLeft);
        data.append('multi-face-url',  this.state.imageRight);
        data.append('visage-name', document.getElementById("input_name").value);

        const url = 'http://127.0.0.1:5000/find/image/image';

        const config = {
            headers: {
                'content-type' : 'appication/octet-stream'
            }
        };
        axios.post(url, data, config)
            .then(response => {
                console.log(response.data)
                if(response.data === "adult content found") {
                    this.setState({error:"adult content found"});
                    document.getElementById("loading").style.display = "none";
                    return;
                }
                if(!response.data.image) {
                    this.setState({error:"Face not found"});
                    document.getElementById("loading").style.display = "none";
                    return;
                }
                if(response.data.image) {
                    this.setState({infos: response.data.infos, image_returned:response.data.image});
                    document.getElementById("download2").style.display = "block";
                }
                document.getElementById("loading").style.display = "none";

            })
            .catch(error => {
                console.log(error);
                this.setState({error:"an error has occurred"});
                document.getElementById("loading").style.display = "none";
            });

    };

    printImage = () => {
        if(this.state.image_returned) {
            console.log("nice");
            const path = "http://127.0.0.1:5000/static/image/" + this.state.image_returned + ".png";
            const infos = this.state.infos.captions[0].text;
            return(

                <div className="images">
                    <p>{infos}</p>
                        <div className="imgTAG">
                            <img alt={infos} className="imgReturned" src={path}/>
                            <ul>
                                <li>Tags : </li>
                                <br/>
                                {this.state.infos.tags.map((item2,i2) => {
                                    return(<li>{item2}</li>);
                                })}
                            </ul>
                        </div>
                </div>
            )
        }
    };

    render() {
        return (
            <div className="Upload">
                <p className="error">{this.state.error}</p>
                <div className="upload-image">
                    <div className="left">
                        <h2>Upload a face</h2>
                        <div>
                            <img alt="the visage for the analyse" src={this.state.image_link}/>
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
                        <p>Upload an image to analyse</p>
                        <input onChange={this.onChangeVideo} style={{display:"none"}} type="file"
                               id="imageRight" name="video"
                               accept="image/*"/>
                        <div className="video_part">
                            <input id="btnvideobrowse" className="buttonBrows" type="button" value="Browse..."
                                   onClick={() => document.getElementById('imageRight').click()}/>
                            <p className="selected_files">{this.state.file_selected}</p>
                        </div>
                        <div className="start">
                            <p className="change">If you want to analyse with a video, click <span><a href="/video">here</a></span></p>
                        </div>
                        <a id="download2" href="http://127.0.0.1:5000/download/image"><button>Download all</button></a>
                        <button onClick={this.startAnalysis} className="analyze2"><img id="analyze_img" alt="start analysis" src={img_analyze}/></button>
                    </div>
                </div>
                <img alt="loading" id="loading" className="loading" src={loading}/>
                {this.printImage()}
            </div>
        );
    }
}

export default Formulaire;
