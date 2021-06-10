import React from 'react';
import AnalyseVideo from "./components/AnalyseVideo";
import AnalyseImage from "./components/AnalyseImage2";
import './App.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";



function App() {
  return (
    <div className="App">
        <Router>
        <header>
            <Link to="/"><h1>Vidmizer</h1></Link>
            <div className="links">
                    <Link to="/image">Image Analyzer</Link>
                    <Link to="/video">Video Analyzer</Link>
            </div>
        </header>
            <Switch>
                <Route path="/video">
                    <AnalyseVideo />
                </Route>
                <Route path="/image">
                    <AnalyseImage/>
                </Route>
                <Route path="/">
                    <div className="homepage" style={{display:'flex',justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                        <iframe width="1050" height="550" src="https://www.youtube.com/embed/agGEDdj05U0" title="Presentation" frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen/>
                        <Link to="/video"><button style={{width:300,height:40,background:"#3689e4",border:"none",color:"white",fontSize:20}}>Get Started</button></Link>
                    </div>
                    <div className="area">
                        <ul className="circles">
                            <li/>
                            <li/>
                            <li/>
                            <li/>
                            <li/>
                            <li/>
                            <li/>
                            <li/>
                            <li/>
                            <li/>
                        </ul>
                    </div>
                </Route>
            </Switch>
        </Router>






    </div>
  );
}

export default App;
