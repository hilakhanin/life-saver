import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  collapsed = true;
  isSettings = true;
  isErrorPage = false;

  constructor(private router: Router, private sharedService: SharedService) { }

  ngOnInit(): void {
    this.router.events.subscribe((val) => { // navigation bar change
      if (val instanceof NavigationEnd) {
        this.isSettings = val.url.includes('settings');
      }
    });

    this.sharedService.isError.subscribe(error => {
      this.isErrorPage = error;
    })
  }
}
