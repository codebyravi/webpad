import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AuthEffects } from './effects';
import { authReducer } from './reducer';

@NgModule({
  imports: [
    StoreModule.forFeature('auth', authReducer),
    EffectsModule.forFeature([AuthEffects])
  ],
  providers: [AuthEffects]
})
export class AuthStoreModule {}
