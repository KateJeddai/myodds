import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BettingService } from '../betting.service';

@Component({
  selector: 'app-add-team-logo',
  templateUrl: './add-team-logo.component.html',
  styleUrls: ['./add-team-logo.component.scss']
})
export class AddTeamLogoComponent implements OnInit {
  form: FormGroup;

  constructor(private bettingService: BettingService) { }

  ngOnInit() {
    this.form = new FormGroup({
      'team_name': new FormControl(null, {validators: [Validators.required]}),
      'image': new FormControl(null, {validators: [Validators.required]})
    })
  }
  
  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
  }

  onSubmitItem() {
      const team_name = this.form.value.team_name,
            image = this.form.value.image;
      this.bettingService.addTeamLogo(team_name, image)
          .subscribe(data => {
            console.log(data)
          }, (err) => {
            console.log(err);
          });
      this.form.reset();
  }

}
