import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

export class RuleConfig {
  LeftTileId?: number;
  RightTileId?: number;

  constructor(left: number, right: number) {
    this.LeftTileId = left;
    this.RightTileId = right;
  }
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  ruleConfigForm: FormGroup;
  ruleConfig: RuleConfig;
  selectedLeftRule: number;
  selectedRightRule: number;
  public clickedEvent: Event;

  constructor() { }

  ngOnInit() {
    this.ruleConfig = JSON.parse(localStorage.getItem("ruleConfig"))?.ruleConfig || this.ruleConfig;
    this.initForm();
  }

  private initForm() {
    this.selectedLeftRule = this.ruleConfig?.LeftTileId > -1 ? this.ruleConfig?.LeftTileId : -1;
    this.selectedRightRule = this.ruleConfig?.RightTileId > -1 ? this.ruleConfig?.RightTileId : -1;

    this.ruleConfigForm = new FormGroup({
      'leftTile': new FormControl(this.selectedLeftRule),
      'rightTile': new FormControl(this.selectedRightRule)
    });

  }

  onSubmit() {
    this.ruleConfig = new RuleConfig(this.selectedLeftRule, this.selectedRightRule);
    localStorage.setItem("ruleConfig", JSON.stringify({ ruleConfig: this.ruleConfig }));
  }

  onCancel() {
    this.ruleConfig = JSON.parse(localStorage.getItem("ruleConfig"))?.ruleConfig;
    this.initForm();
  }

  childEventClicked(event) {
    let side = event.target.id;
    this.clickedEvent = event.target.value;

    switch (side) {
      case "left":
        this.selectedLeftRule = +this.clickedEvent;
        this.ruleConfigForm.get('leftTile').patchValue(this.selectedLeftRule);
        break;
      case "right":
        this.selectedRightRule = +this.clickedEvent;
        this.ruleConfigForm.get('rightTile').patchValue(this.selectedRightRule);
        break;
    }
  }
}
