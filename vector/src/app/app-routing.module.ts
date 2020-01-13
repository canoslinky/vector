import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DetectionComponent } from "./detection/detection.component";

const routes: Routes = [{ path: "detection", component: DetectionComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
