import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-link.html',
  styleUrl: './share-link.css'
})
export class ShareLinkComponent {

  @Input() url: string = window.location.href;
  @Input() title: string = 'Apoya la necesidad';

  open(platform: string) {
    const encodedUrl = encodeURIComponent(this.url);
    const encodedTitle = encodeURIComponent(this.title);

    const links: any = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      instagram: `https://www.instagram.com/`
    };

    window.open(links[platform], '_blank');
  }

  copyLink() {
    navigator.clipboard.writeText(this.url);
    alert('Enlace copiado 📋');
  }
}
