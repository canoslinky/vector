import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import * as posenet from "@tensorflow-models/posenet";
import Stats from "stats.js";
import { drawKeypoints, drawSkeleton } from "./../functions";

@Component({
  selector: "app-detection",
  templateUrl: "./detection.component.html",
  styleUrls: ["./detection.component.scss"]
})
export class DetectionComponent implements OnInit, AfterViewInit {
  @ViewChild("video", { static: true }) video: ElementRef;

  loading = true;
  net: any;
  minPartConfidence = 0.5;
  minPoseConfidence = 0.75;

  constructor() {}

  async ngOnInit() {
    console.log("loading model...");
    this.net = await posenet.load({
      architecture: "ResNet50",
      outputStride: 16,
      inputResolution: 250,
      multiplier: 1.0,
      quantBytes: 2
    });
    console.log("Sucessfully loaded model");
    this.loading = false;
    this.video.nativeElement.onloadeddata = () => {
      this.detectPoseInRealTime(this.video, this.net);
    };
  }

  detectPoseInRealTime(video, net) {
    let canvas;
    canvas = document.getElementById("output");
    const ctx = canvas.getContext("2d");
    const flipPoseHorizontal = true;
    const stats = new Stats();
    stats.showPanel(0);
    async function poseDetectionFrame() {
      stats.begin();
      let poses = [];

      const pose = await net.estimateSinglePose(video.nativeElement, {
        flipHorizontal: false,
        decodingMethod: "single-person"
      });
      poses = poses.concat(pose);
      ctx.clearRect(0, 0, 500, 500);
      if (poses.length > 0) {
        poses.forEach(({ score, keypoints }) => {
          if (score >= 0.75) {
            drawKeypoints(keypoints, 0.5, ctx);
            // drawSkeleton(keypoints, minPartConfidence, this.ctx);
          }
        });
      }
      stats.end();
      requestAnimationFrame(poseDetectionFrame);
    }
    poseDetectionFrame();
  }

  async ngAfterViewInit() {
    const vid = this.video.nativeElement;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(stream => {
          vid.srcObject = stream;
        })
        .catch(err0r => {
          console.log("Something went wrong!");
        });
    }
  }
}
