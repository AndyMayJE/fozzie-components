<template>
    <div
        :data-theme-formfield="theme"
        :class="[
            $style['c-formField'], {
                [$style['c-formField--invalid']]: hasError,
                [$style['c-formField--grouped']]: isFieldGrouped
            }
        ]"
        :data-test-id="testId.container">
        <div
            :class="$style['c-formField-fieldWrapper']">
            <form-label
                v-if="!isInline"
                :label-style="normalisedLabelStyle"
                :label-for="uniqueId"
                :is-inline="isInline"
                :data-test-id="testId.label">
                {{ labelText }}
                <template #description>
                    <span
                        v-if="hasInputDescription"
                        :class="[
                            'u-spacingTop',
                            'u-spacingBottom--large',
                            $style['c-formField-label-description']
                        ]">
                        <slot />
                    </span>
                </template>
            </form-label>

            <form-dropdown
                v-if="isDropdown"
                :id="uniqueId"
                :attributes="$attrs"
                :type="normalisedInputType"
                :value="value"
                :class="[
                    $style['c-formField-field'],
                    $style['c-formField-field--defaultHeight'],
                    $style['c-formField-dropdownContainer']
                ]"
                :dropdown-options="dropdownOptions"
                v-on="listeners" />

            <textarea
                v-else-if="isTextarea"
                :id="`${uniqueId}`"
                :aria-labelledby="`label-${uniqueId}`"
                :value="value"
                v-bind="$attrs"
                :class="[
                    $style['c-formField-field'],
                    $style['c-formField-field--textarea']
                ]"
                data-test-id="formfield-textarea"
                v-on="listeners" />

            <input
                v-else
                :id="`${uniqueId}`"
                :aria-labelledby="`label-${uniqueId}`"
                :value="value"
                v-bind="$attrs"
                :type="normalisedInputType"
                :min="normalisedInputType === 'number' ? minNumber : false"
                :max="normalisedInputType === 'number' ? maxNumber : false"
                placeholder=" "
                :data-test-id="testId.input"
                :class="[
                    $style['c-formField-field'],
                    $style['c-formField-field--defaultHeight'],
                    { [$style['c-formField-field--noFocus']]: isSelectionControl }
                ]"
                v-on="listeners"
            >

            <form-label
                v-if="isInline"
                :id="`label-${uniqueId}`"
                :label-for="uniqueId"
                :label-style="normalisedLabelStyle"
                :is-inline="isInline"
                :data-test-id="`${testId.label}--inline`">
                {{ labelText }}
            </form-label>
        </div>
        <slot name="error" />
    </div>
</template>

<script>
import { globalisationServices } from '@justeat/f-services';
import FormDropdown from './FormDropdown.vue';
import FormLabel from './FormLabel.vue';
import debounce from '../services/debounce';
import tenantConfigs from '../tenants';
import {
    CUSTOM_INPUT_TYPES,
    DEFAULT_INPUT_TYPE,
    VALID_INPUT_TYPES,
    VALID_LABEL_STYLES,
    MOBILE_WIDTH
} from '../constants';

export default {
    name: 'FormField',

    components: {
        FormDropdown,
        FormLabel
    },

    inheritAttrs: false,

    props: {
        locale: {
            type: String,
            default: ''
        },

        labelText: {
            type: String,
            default: ''
        },

        inputType: {
            type: String,
            default: DEFAULT_INPUT_TYPE,
            validator: value => ((VALID_INPUT_TYPES.indexOf(value) !== -1) || (CUSTOM_INPUT_TYPES.indexOf(value) !== -1))// The prop value must match one of the valid input types
        },

        labelStyle: {
            type: String,
            default: 'default',
            validator: value => (VALID_LABEL_STYLES.indexOf(value) !== -1) // The prop value must match one of the valid input types
        },

        value: {
            type: [String, Number],
            default: ''
        },

        hasError: {
            type: Boolean,
            default: false
        },

        dropdownOptions: {
            type: Array,
            default: () => null
        },

        isGrouped: {
            type: Boolean,
            default: false
        },

        minNumber: {
            type: [Number, undefined],
            default: undefined
        },

        maxNumber: {
            type: [Number, undefined],
            default: undefined
        },

        hasInputDescription: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            windowWidth: null
        };
    },

    computed: {
        normalisedInputType () {
            if (VALID_INPUT_TYPES.includes(this.inputType)) {
                return this.inputType;
            }
            return DEFAULT_INPUT_TYPE;
        },

        normalisedLabelStyle () {
            if (VALID_LABEL_STYLES.includes(this.labelStyle)) {
                return this.labelStyle;
            }
            return '';
        },

        formFieldLocale () {
            return globalisationServices.getLocale(tenantConfigs, this.locale, this.$i18n);
        },

        copy () {
            const localeConfig = tenantConfigs[this.formFieldLocale];
            return { ...localeConfig };
        },

        theme () {
            return globalisationServices.getTheme(this.formFieldLocale);
        },

        listeners () {
            return {
                ...this.$listeners,
                input: this.updateValue,
                update: this.updateOption
            };
        },

        uniqueId () {
            return `formField-${(this.$attrs.name ? this.$attrs.name : this._uid)}`;
        },

        testId () {
            const formFieldName = this.$attrs.name;

            return {
                container: formFieldName ? `formfield-${formFieldName}` : 'formfield-container',
                input: formFieldName ? `formfield-${formFieldName}-input` : 'formfield-input',
                label: formFieldName ? `formfield-${formFieldName}-label` : 'formfield-label'
            };
        },

        isInline () {
            return (this.windowWidth < MOBILE_WIDTH && this.labelStyle === 'inlineNarrow') ||
                this.labelStyle === 'inline';
        },

        isDropdown () {
            return this.inputType === 'dropdown';
        },

        isSelectionControl () {
            return this.inputType === 'radio' || this.inputType === 'checkbox';
        },

        isFieldGrouped () {
            return this.isGrouped && !this.hasError;
        },

        isTextarea () {
            return this.inputType === 'textarea';
        }
    },

    mounted () {
        window.addEventListener('resize', debounce(this.updateWidth, 100));
        this.updateWidth();
    },

    destroyed () {
        window.removeEventListener('resize', this.updateWidth);
    },

    methods: {
        updateValue (event) {
            this.$emit('input', event.target.value);
        },

        updateOption (option) {
            this.$emit('input', option);
        },

        updateWidth () {
            if (typeof (window) !== 'undefined') {
                this.windowWidth = window.innerWidth;
            }
        }
    }
};
</script>

<style lang="scss" module>
$form-input-textColour                    : $color-content-default;
$form-input-textColour--disabled          : $color-content-disabled;
$form-input-bg--disabled                  : $color-disabled-01;
$form-input-borderRadius                  : $border-radius;
$form-input-borderWidth                   : 1px;
$form-input-borderColour                  : $color-border-strong;
$form-input-borderColour--focus           : $color-grey-50;
$form-input-borderColour--invalid         : $color-support-error;
$form-input-borderColour--disabled        : $color-disabled-01;
$form-input-height                        : 46px; // height is 46px + 1px border = 48px
$form-input-padding                       : spacing(x1.5) spacing(x2);
$form-input-fontSize                      : 'body-l';
$form-input-focus                         : $color-focus;
$form-input-focus--boxShadow              : 0 0 0 2px $form-input-focus;

.c-formField {
    & + & {
        margin-top: spacing(x2);
    }
}

    .c-formField-fieldWrapper {
        position: relative;
    }

    .c-formField-field--defaultHeight {
        @include rem(height, $form-input-height); //convert height to rem
    }

    .c-formField-field {
        width: 100%;
        font-family: $font-family-base;
        @include font-size($form-input-fontSize);
        font-weight: $font-weight-regular;
        color: $form-input-textColour;

        background-color: $form-input-bg;
        border: $form-input-borderWidth solid $form-input-borderColour;
        border-radius: $form-input-borderRadius;
        background-clip: padding-box;
        padding: $form-input-padding;

        &:hover {
            background-color: $form-input-bg--hover;
        }

        &:focus,
        &:active,
        &:focus-within {
            box-shadow: $form-input-focus--boxShadow;
            outline: none;
        }

        .c-formField--invalid & {
            border-color: $form-input-borderColour--invalid;
        }

        // Disabled state
        &[disabled] {
            cursor: not-allowed;

            &,
            &:hover {
                background-color: $form-input-bg--disabled;
                color: $form-input-textColour--disabled;
                border-color: $form-input-borderColour--disabled;
            }
        }
    }

    .c-formField-field--textarea {
        background-clip: padding-box;
        padding: spacing(x2);
        resize: none;
    }

    .c-formField-field--noFocus {
        &:focus,
        &:active,
        &:focus-within {
            box-shadow: none;
        }
    }

    .c-formField-dropdownContainer {
        padding: 0;
    }

    .c-formField--grouped {
        & + & {
            margin-top: 0;

            .c-formField-field {
                border-radius: 0 0 $form-input-borderRadius $form-input-borderRadius;
                border-top: 0;
            }
        }
    }

    .c-formField--grouped:not(:last-child) {
        .c-formField-field {
            border-radius: 0;
        }
    }

    .c-formField--grouped:nth-of-type(1) {
        .c-formField-field {
            border-radius: $form-input-borderRadius $form-input-borderRadius 0 0;
        }
    }

    .c-formField-label-description {
        display: block;
        font-weight: normal;
    }
</style>
