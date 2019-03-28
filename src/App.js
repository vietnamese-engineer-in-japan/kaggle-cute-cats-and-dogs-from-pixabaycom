import React from 'react';
import ReactDOM from 'react-dom';
import MagicDropzone from 'react-magic-dropzone';
import * as tf from '@tensorflow/tfjs';
import './index.css';

class App extends React.Component {
  state = {
    model: null,
    preview: '',
    prediction: null
  };

  componentDidMount() {
    tf.loadLayersModel('/model/model.json').then(model => {
      this.setState({
        model: model
      });
    });
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({
      preview: accepted[0].preview || links[0],
      prediction: null
    });
  };

  onImageChange = e => {
    let image = tf.browser.fromPixels(e.target).resizeBilinear([192, 192]).expandDims().div(255);
    this.state.model.predict(image, {batchSize: 1}).data().then(result => {
      let probability = Array.from(result)[0] * 100;
      let prediction = probability > 50
        ? ('犬（' + probability.toFixed(2) + '％）')
        : ('猫（' + (100 - probability).toFixed(2) + '％）');
      this.setState({ prediction: prediction });
    });
  };

  render() {
    return (
      <div className="dropzone-page">
        {this.state.model ? (
          <MagicDropzone
            className="dropzone"
            accept="image/jpeg, image/png, .jpg, .jpeg, .png"
            multiple={false}
            onDrop={this.onDrop}
          >
            <div className="dropzone-content">
              {this.state.preview ? (
                <img
                  alt="upload preview"
                  onLoad={this.onImageChange}
                  className="dropzone-img"
                  src={this.state.preview}
                />
              ) : (
                "Choose or drop a file."
              )}
            </div>
          </MagicDropzone>
        ) : (
          <div className="dropzone">Loading model...</div>
        )}
        <div className="prediction">
          {this.state.prediction}
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
export default App;
