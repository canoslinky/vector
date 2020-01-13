import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import * as posenet from "@tensorflow-models/posenet";

@Component({
  selector: "app-detection",
  templateUrl: "./detection.component.html",
  styleUrls: ["./detection.component.scss"]
})
export class DetectionComponent implements OnInit, AfterViewInit {
  @ViewChild("video", { static: true }) video: ElementRef;
  loading = true;
  net: any;

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
