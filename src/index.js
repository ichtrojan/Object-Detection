import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./style.css";

class App extends React.Component {
  componentDidMount() {
    const video = document.getElementById("video");
    const webCamPromise = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: 1000,
          height: 1000
        }
      })
      .then(stream => {
        video.srcObject = stream;
        return new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve();
          };
        });
      });
    const modelPromise = cocoSsd.load();
    Promise.all([modelPromise, webCamPromise]).then(values => {
      this.detectFrame(video, values[0]);
    });
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  render() {
    return (
      <div>
        <video id="video" width="1000" height="1000" />
        <canvas id="canvas" width="1000" height="1000" />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
