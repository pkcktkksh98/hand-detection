import React from 'react';
import './App.css';
// import ImageUpload from './components/ImageUpload';
import VideoStream from './components/VideoStream';



const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hand Detection</h1>
      </header>
      <main>
        <VideoStream/>
      </main>
    </div>
  );
};

export default App;