import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private activitiesApi = 'http://localhost:3000/api/activities';
  private contractsApi = 'https://jsonplaceholder.typicode.com/users';
  private allContractsApi = 'http://localhost:3000/api/allContracts';
  private myContractsApi = 'http://localhost:3000/api/myContracts';
  private chartDataApi = 'http://localhost:3000/api/chart-data';
  private tableDataApi = 'http://localhost:3000/api/table-data';
  private usersAPI = 'http://localhost:3000/api/users';


  constructor(private http: HttpClient) {}

  fetchContracts(): Observable<any> {
    return this.http.get(this.contractsApi);
  }

  fetchActivities(): Observable<any> {
    return this.http.get(this.activitiesApi);
  }
  fetchAllContracts(): Observable<any> {
    return this.http.get(this.allContractsApi);
  }

  fetchMyContracts(): Observable<any> {
    return this.http.get(this.myContractsApi);
  }


  fetchChartData(): Observable<any[]> {
    return this.http.get<any[]>(this.chartDataApi);
  }

  fetchTableData(): Observable<any[]> {
    return this.http.get<any[]>(this.tableDataApi);
  }

    fetchUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersAPI);
  }
}
