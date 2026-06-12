import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  imageOutline,
  globeOutline,
  keyOutline,
  peopleOutline,
  personOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-nova-comunidade',
  templateUrl: './nova-comunidade.page.html',
  styleUrls: ['./nova-comunidade.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonButton],
})
export class NovaComunidadePage {
  fotoPreview: string | null = null;
  mensagemAcao = '';
  form: FormGroup;

  constructor(private readonly formBuilder: FormBuilder, private readonly router: Router) {
    this.form = this.formBuilder.group({
      nome: [''],
      descricao: [''],
      acesso: ['publico', Validators.required],
      foto: [''],
    });

    addIcons({
      addOutline,
      arrowBackOutline,
      globeOutline,
      imageOutline,
      keyOutline,
      peopleOutline,
      personOutline,
    });
  }

  voltar(): void {
    this.router.navigate(['/comunidades']);
  }

  salvar(): void {
    this.mensagemAcao = 'Comunidade criada localmente. O backend ainda não está ligado.';
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!arquivo) {
      this.fotoPreview = null;
      this.form.patchValue({ foto: '' });
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const fotoBase64 = String(leitor.result || '');
      this.fotoPreview = fotoBase64;
      this.form.patchValue({ foto: fotoBase64 });
    };
    leitor.readAsDataURL(arquivo);
  }
}
