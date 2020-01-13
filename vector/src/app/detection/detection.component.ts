import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";
import { drawKeypoints, drawSkeleton } from "./../functions";

@Component({
  selector: "app-detection",
  templateUrl: "./detection.component.html",
  styleUrls: ["./detection.component.scss"]
})
export class DetectionComponent implements OnInit, AfterViewInit {
  @ViewChild("video", { static: true }) video: ElementRef;
  @ViewChild("canvas", { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;

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

    this.ctx = this.canvas.nativeElement.getContext("2d");
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    let poses = [];
    setInterval(async () => {
      const pose = await this.net.estimateSinglePose(this.video.nativeElement, {
        flipHorizontal: false,
        decodingMethod: "single-person"
      });
      poses = poses.concat(pose);

      if (poses.length > 0) {
        poses.forEach(({ score, keypoints }) => {
          if (score >= this.minPoseConfidence) {
            drawKeypoints(keypoints, this.minPartConfidence, this.ctx);
            //drawSkeleton(keypoints, minPartConfidence, this.ctx);
          }
        });
      }
      await tf.nextFrame();
    }, 3000);
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
