import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerSoportesService {
  private Data = new BehaviorSubject(null);
  currentData = this.Data.asObservable();

  constructor() { }

  SendData(data){
    this.Data.next(data)
  }
}
