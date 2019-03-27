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
    let image = tf.browser.fromPixels(e.target).resizeNearestNeighbor([192, 192]).expandDims();
    this.state.model.predict(image, {batchSize: 1}).data().then(result => {
      let prediction = Array.from(result).map((probability, index) => {
        return {
          probability: probability,
          className: index
        };
      })[0].probability;
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
        <div>
          {this.state.prediction == null ? '' : this.state.prediction > 0.5 ? '犬' : '猫'}
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
export default App;
