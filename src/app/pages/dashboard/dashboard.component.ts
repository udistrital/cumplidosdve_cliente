import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/userService';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  //DATA
  roles: any = [];
  constructor(
    private userService: UserService
  ) {
   }

  ngOnInit(): void {
    this.consultarRol();
  }

  consultarRol(): void {
    this.userService.user$.subscribe((data:any) => {
      if(data ? data.userService ? data.userService.documento ? true : false : false : false){

        //UNIR ROLES
        this.roles = data.user.role;
        for(var i = 0; i<data.userService.role.length; i++){
          if(!this.roles.includes(data.userService.role[i])){
            this.roles.push(data.userService.role[i]);
          }
        }
      }
    });
  }
}
