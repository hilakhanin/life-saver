import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Data, ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit {

  errorMessage: string;

  constructor(private route: ActivatedRoute, private router: Router, private sharedService: SharedService) { }

  ngOnInit() {
    this.route.data.subscribe(
      (data: Data) => {
        this.errorMessage = data['message'];
        this.sharedService.isError.next(this.errorMessage !== '');
      }
    );
  }

  backToHomePage() {
    this.sharedService.isError.next(false);
    this.router.navigate(['/']);
  }
}
