import React, {Component} from 'react';
import '../css/AnalyseImage.css';
import axios from 'axios';
import request from 'request';
import img_analyze from '../img/radar.png'


class Formulaire extends Component {

    constructor() {
        super();
        this.state = {
            img_link: require("../img/find.png"),
            file_selected: "No file selected",
            image_file:null,
            analyse_image:null,
            analyse_imageURL:null,
        }
    }

    onChangeImage = () => {
        const image = document.getElementById("img_to_find").files[0];
        if(image) {
            this.setState( {img_link:URL.createObjectURL(image)});
            this.setState( {image_file: image});
        }
    };
    async ChangeImageURL(e){
        const image = e.target.value;
        if(image) {
            let test;
            await this.toDataUrl(image, (myBase64) => {
                test = myBase64;
                console.log(myBase64)// myBase64 is the base64 string
            });
            this.setState({img_link:test});

        } else {
            this.setState({img_link:require("../img/find.png")})
        }
    };

    onChangeImageAnalyse = () => {
        const image = document.getElementById("image_to_analyse").files[0];
        if(image) {
            this.setState({analyse_image:image});
            this.setState({file_selected:image.name});
        }

    };
    onChangeImageAnalyseURL = () => {
        const image = document.getElementById("imageToAnalyse");
        if(image.value.length > 10) {
            this.setState({analyse_imageURL:image.value});
        }
    };



    startAnalysis = () => {
        const input_name = document.getElementById("input_name");
        const btn_browse_image = document.getElementById("btnbrowsimage");
        const btn_url_image = document.getElementById("urlimage");

        const imageAnalyseURL = document.getElementById("imageToAnalyse");
        const imageAnalyseBtn = document.getElementById("btnImagebrowse");
        const file_imageAnalyse = document.getElementById("image_to_analyse");

        input_name.style.borderBottom = "1 px solid white";
        btn_url_image.style.background = "#3587e1";
        imageAnalyseURL.style.background = "#3587e1";



        /* Validateurs */
        if(!input_name.value) {
            input_name.style.borderBottom = "1px solid #FE9898";
            return;
        }

        if(!this.state.image_file && !btn_url_image.value) {
                btn_browse_image.style.background = "#FE9898";
            btn_url_image.style.background = "#FE9898";
            return;
        }

        let file_image = document.getElementById("urlimage").value;
        let file_imageToAnalyse = imageAnalyseURL.value;

        this.CompareUrlUrl(file_image, file_imageToAnalyse);

        const image_start = document.getElementById("analyze_img2");
        image_start.className = 'rotate';
    };

    CompareUrlUrl = (file_image,file_imageToAnalyse) => {
        let formdata = new FormData();
        formdata.append("face-url", file_image);
        formdata.append("multi-face-url", file_imageToAnalyse);

        let requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow'
        };

        fetch("http://20.43.59.16:5000/find/url/url", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    };

    render() {
        return (
            <div className="Upload">
                <form className="upload-image">
                    <div className="left">
                        <h2>Upload a face</h2>
                        <div>
                            <img alt="Image introuvable" src={this.state.img_link}/>
                        </div>
                        <input id="input_name" placeholder="Name of this visage" className="input-name" type="text"/>
                        <p>Enter the url of the face</p>
                        <input id="urlimage" onChange={this.onChangeImageURL} placeholder="http://..." className="input-url" type="text"/>
                    </div>
                    <div className="right">
                        <p>Enter the url of image to analyse</p>
                        <input id="imageToAnalyse" onChange={this.onChangeImageAnalyseURL} placeholder="http://..." className="input-url" type="text"/>

                        <div className="start">
                            <p className="change">If you want to analyse with a video, click <span><a href="/video">here</a></span></p>
                        </div>
                        <button type="button" onClick={this.startAnalysis} className="analyzeImg"><img id="analyze_img2" className="img_start2" alt="start analysis" src={img_analyze}/></button>
                    </div>
                </form>
            </div>
        );
    }
}

export default Formulaire;
