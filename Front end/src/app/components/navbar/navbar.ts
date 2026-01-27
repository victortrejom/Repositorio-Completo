import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth-service';
@Component({
  selector: 'app-navbar',
  standalone: true,   
  imports: [CommonModule],       
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  showNav: boolean = true;
  showNav2: boolean = true;
  showNav3: boolean = true;
  nombreUser: string = '';
  tipo_usuario: number = 0;

  constructor(private router: Router, private auth: AuthService) {
    this.checkRuta(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRuta(event.url);
      }
    });
  }
   
  ngOnInit(): void {
    this.nombreUser = sessionStorage.getItem('nombre')!;
    this.tipo_usuario = Number(sessionStorage.getItem('tipo_usuario')!);
    this.showNav3 = !(this.tipo_usuario === 2 || this.tipo_usuario === 3);
  }

  checkRuta(url: string) {
    this.showNav = url !== '/login' && url !== '/consulta' && url !== '/';

    this.showNav2 = url === '/consulta';

    if (this.tipo_usuario === 2 || this.tipo_usuario === 3) {
      this.showNav3 = false;
    } else {
      this.showNav3 = true;
    }
  }

  verPreguntas() {
    this.router.navigate(['/preguntas']);
  }

  logout() {
    this.auth.logout();
    sessionStorage.clear(); 
    this.router.navigate(['/login']);
  };
}
