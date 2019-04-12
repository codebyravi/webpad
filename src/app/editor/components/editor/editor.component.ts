import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, mergeAll, prop } from 'ramda';
import { merge, Subscription, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { webpadPost } from '../../../../core';
import { steemAccontNameValidators } from '../../validators/steem-account-name.validators';
import { tagsCustomValidators } from '../../validators/tags.validators';
import { beneficiariesCustomValidators } from './../../validators/beneficiaries.validators';
import { jsonMetadataCustomValidators } from './../../validators/json-metadata.validators';
import {
  AllowCurationRewardsField,
  BeneficiariesField,
  BodyField,
  CommunityField,
  EditorConfig,
  EditorFields,
  initialConfig,
  JsonMetadataField,
  MaxAcceptedPayoutField,
  PercentSteemDollarsField,
  TagsField,
  ThumbnailUrlField,
  TitleField
} from './config';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent implements OnInit, OnDestroy {
  @Input()
  config: EditorConfig = initialConfig;

  @Output()
  whenChanges = new EventEmitter<webpadPost>();
  @Output()
  whenSubmit = new EventEmitter<webpadPost>();

  contentForm: FormGroup;
  advancedOptionsForm: FormGroup;

  private mergedChangesSubscribtion: Subscription;

  get currentwebpadPost(): webpadPost {
    return mergeAll([
      this.contentForm.getRawValue(),
      this.advancedOptionsForm.getRawValue()
    ]);
  }

  get isRemovingFirstTagDisabled(): boolean {
    return this.getConfigField<TagsField>('tags').disableRemovingFirstTag;
  }

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.buildForms();

    this.mergedChangesSubscribtion = merge(
      this.contentForm.valueChanges,
      this.advancedOptionsForm.valueChanges
    )
      .pipe(debounce(() => timer(this.config.whenChangesDebounceTime)))
      .subscribe(() => {
        this.whenChanges.emit(this.currentwebpadPost);
      });
  }

  ngOnDestroy(): void {
    this.mergedChangesSubscribtion.unsubscribe();
  }

  onSubmit(): void {
    this.whenSubmit.emit(mergeAll([this.currentwebpadPost]));
  }

  private buildForms(): void {
    this.buildContentForm();
    this.buildAdvancedOptionsForm();
  }

  private buildContentForm(): void {
    const titleFieldConfig = this.getConfigField<TitleField>('title');
    const bodyFieldConfig = this.getConfigField<BodyField>('body');
    const communityFieldConfig = this.getConfigField<CommunityField>(
      'community'
    );
    const tagsFieldConfig = this.getConfigField<TagsField>('tags');
    const thumbnailUrlFieldConfig = this.getConfigField<ThumbnailUrlField>(
      'thumbnailUrl'
    );

    this.contentForm = this.formBuilder.group({
      title: [
        { value: titleFieldConfig.value, disabled: titleFieldConfig.disabled },
        Validators.required
      ],
      body: [
        { value: bodyFieldConfig.value, disabled: bodyFieldConfig.disabled },
        Validators.required
      ],
      community: [
        {
          value: communityFieldConfig.value,
          disabled: communityFieldConfig.disabled
        },
        steemAccontNameValidators
      ],
      tags: [
        { value: tagsFieldConfig.value, disabled: tagsFieldConfig.disabled },
        [Validators.required, ...tagsCustomValidators]
      ],
      thumbnailUrl: [
        {
          value: thumbnailUrlFieldConfig.value,
          disabled: thumbnailUrlFieldConfig.disabled
        },
        Validators.pattern(
          // tslint:disable-next-line:max-line-length
          /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/
        )
      ]
    });
  }

  private buildAdvancedOptionsForm(): void {
    const beneficiariesFieldConfig = this.getConfigField<BeneficiariesField>(
      'beneficiaries'
    );
    const allowVotesFieldConfig = this.getConfigField<
      AllowCurationRewardsField
    >('allowVotes');
    const allowCurationRewardsFieldConfig = this.getConfigField<
      AllowCurationRewardsField
    >('allowCurationRewards');
    const percentSteemDollarsFieldConfig = this.getConfigField<
      PercentSteemDollarsField
    >('percentSteemDollars');
    const maxAcceptedPayoutFieldConfig = this.getConfigField<
      MaxAcceptedPayoutField
    >('maxAcceptedPayout');
    const jsonMetadataFieldConfig = this.getConfigField<JsonMetadataField>(
      'jsonMetadata'
    );

    this.advancedOptionsForm = this.formBuilder.group({
      beneficiaries: this.formBuilder.array(
        map(
          beneficiary =>
            this.formBuilder.group({
              account: [
                {
                  value: beneficiary.account,
                  disabled: this.config.fields.beneficiaries.disabled
                },
                [
                  Validators.required,
                  Validators.pattern(/^[a-z][a-z0-9.-]{2,}$/)
                ]
              ],
              weight: [
                {
                  value: beneficiary.weight,
                  disabled: this.config.fields.beneficiaries.disabled
                },
                [Validators.required, Validators.min(0), Validators.max(100)]
              ]
            }),
          beneficiariesFieldConfig.value
        ),
        beneficiariesCustomValidators
      ),
      allowVotes: [
        {
          value: allowVotesFieldConfig.value,
          disabled: allowVotesFieldConfig.disabled
        }
      ],
      allowCurationRewards: [
        {
          value: allowCurationRewardsFieldConfig.value,
          disabled: allowCurationRewardsFieldConfig.disabled
        }
      ],
      percentSteemDollars: [
        {
          value: percentSteemDollarsFieldConfig.value,
          disabled: percentSteemDollarsFieldConfig.disabled
        },
        [
          Validators.min(percentSteemDollarsFieldConfig.min),
          Validators.max(percentSteemDollarsFieldConfig.max)
        ]
      ],
      maxAcceptedPayout: [
        {
          value: maxAcceptedPayoutFieldConfig.value,
          disabled: maxAcceptedPayoutFieldConfig.disabled
        },
        [
          Validators.min(maxAcceptedPayoutFieldConfig.min),
          Validators.max(maxAcceptedPayoutFieldConfig.max)
        ]
      ],
      jsonMetadata: [
        {
          value: jsonMetadataFieldConfig.value,
          disabled: jsonMetadataFieldConfig.disabled
        },
        jsonMetadataCustomValidators
      ]
    });
  }

  private getConfigField<T>(fieldName: keyof EditorFields): T {
    return prop(fieldName, this.config.fields);
  }
}
