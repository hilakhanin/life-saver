import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  constructor(private route: ActivatedRoute, private sharedService: SharedService) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['showSnackbar'] != undefined && params['snackbarMessage'] != undefined) {
        this.sharedService.openSnackBar(params['snackbarMessage'], 'Error');
      }
    });
  }

}
