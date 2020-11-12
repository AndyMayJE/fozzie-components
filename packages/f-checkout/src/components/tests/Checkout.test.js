import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { VueI18n } from '@justeat/f-globalisation';
import VueCheckout from '../Checkout.vue';
import CheckoutServiceApi from '../../services/CheckoutServiceApi';
import EventNames from '../../event-names';
import tenantConfigs from '../../tenants';

jest.mock('../../services/CheckoutServiceApi', () => ({ submitCheckout: jest.fn() }));

const localVue = createLocalVue();

localVue.use(VueI18n);

const i18n = {
    locale: 'en-GB',
    messages: tenantConfigs['en-GB']
};

describe('Checkout', () => {
    allure.feature('Checkout');

    const checkoutUrl = '/checkout/uk/12345';

    let propsData;

    beforeEach(() => {
        propsData = { checkoutUrl };
    });

    it('should be defined', () => {
        const wrapper = shallowMount(VueCheckout, {
            i18n,
            localVue,
            propsData
        });

        expect(wrapper.exists()).toBe(true);
    });

    describe('computed ::', () => {
        const data = { customer: { firstName: 'name' } };

        describe('name ::', () => {
            it('should capitalize `firstName` data', async () => {
                // Arrange
                const wrapper = shallowMount(VueCheckout, {
                    i18n,
                    localVue,
                    propsData
                });

                const name = wrapper.find("[data-test-id='checkout-card-component']");

                // Act
                wrapper.setData(data);
                await wrapper.vm.$nextTick();

                // Assert
                expect(name.props('cardHeading')).toContain('Name');
            });
        });

        describe('title ::', () => {
            it('should add `name` to title text', async () => {
                // Arrange
                const wrapper = shallowMount(VueCheckout, {
                    i18n,
                    localVue,
                    propsData
                });

                const name = wrapper.find("[data-test-id='checkout-card-component']");

                // Act
                wrapper.setData(data);
                await wrapper.vm.$nextTick();

                // Assert
                expect(name.props('cardHeading')).toEqual('Name, confirm your details');
            });
        });
    });

    describe('when form submitted', () => {
        const mobileNumber = '07777777777';

        const address = {
            line1: 'Address First Line',
            city: 'City',
            postcode: 'EE1E 1EE'
        };

        describe('if checkoutMethod set to `Collection`', () => {
            let wrapper;

            beforeEach(() => {
                CheckoutServiceApi.submitCheckout.mockClear();
                CheckoutServiceApi.submitCheckout.mockImplementation(async () => Promise.resolve());

                propsData = {
                    checkoutMethod: 'Collection',
                    checkoutUrl
                };

                wrapper = mount(VueCheckout, {
                    i18n,
                    localVue,
                    propsData
                });
            });

            it('should emit success event when all fields are populated correctly', async () => {
                // Arrange
                wrapper.find('[data-test-id="input-mobile-number"]').setValue(mobileNumber);

                // Act
                await wrapper.vm.onFormSubmit();

                // Assert
                expect(wrapper.emitted(EventNames.CheckoutSuccess).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)).toBeUndefined();
            });

            it('should show error message and emit failure event when the mobile number field is not populated', async () => {
                // Arrange && Act
                await wrapper.vm.onFormSubmit();
                const mobileNumberEmptyMessage = wrapper.find('[data-test-id="error-mobile-number"]');

                // Assert
                expect(wrapper.vm.isMobileNumberValid).toBe(false);
                expect(mobileNumberEmptyMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('mobileNumber');
            });

            it('should show error message and emit failure event when the mobile number field is populated with a < 10 numbers', async () => {
                // Arrange
                wrapper.find('[data-test-id="input-mobile-number"]').setValue('077777');

                // Act
                await wrapper.vm.onFormSubmit();
                const mobileNumberEmptyMessage = wrapper.find('[data-test-id="error-mobile-number"]');

                // Assert
                expect(wrapper.vm.isMobileNumberValid).toBe(false);
                expect(mobileNumberEmptyMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('mobileNumber');
            });

            it('should show error message and emit failure event when the mobile number field is populated with non numeric value', async () => {
                // Arrange
                wrapper.find('[data-test-id="input-mobile-number"]').setValue('hs;-j`$e&1l');

                // Act
                await wrapper.vm.onFormSubmit();
                const mobileNumberEmptyMessage = wrapper.find('[data-test-id="error-mobile-number"]');

                // Assert
                expect(wrapper.vm.isMobileNumberValid).toBe(false);
                expect(mobileNumberEmptyMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('mobileNumber');
            });

            it('should not show error message or emit failure event when the address input fields are not populated', async () => {
                // Arrange
                wrapper.find('[data-test-id="input-mobile-number"]').setValue(mobileNumber);

                // Act
                await wrapper.vm.onFormSubmit();

                // Assert
                expect(wrapper.emitted(EventNames.CheckoutSuccess).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)).toBeUndefined();
            });

            it('should not create validations for address', () => {
                // Assert
                expect(wrapper.vm.$v.address).toBeUndefined();
            });
        });

        describe('if checkoutMethod set to `Delivery`', () => {
            let wrapper;

            beforeEach(() => {
                CheckoutServiceApi.submitCheckout.mockClear();
                CheckoutServiceApi.submitCheckout.mockImplementation(async () => Promise.resolve());

                propsData = {
                    checkoutMethod: 'Delivery',
                    checkoutUrl
                };

                wrapper = mount(VueCheckout, {
                    i18n,
                    localVue,
                    propsData
                });
            });

            it('should emit success event when all fields are populated correctly', async () => {
                // Arrange
                wrapper.find('[data-test-id="input-mobile-number"]').setValue(mobileNumber);
                wrapper.find('[data-test-id="input-address-line-1"]').setValue(address.line1);
                wrapper.find('[data-test-id="input-address-city"]').setValue(address.city);
                wrapper.find('[data-test-id="input-address-postcode"]').setValue(address.postcode);

                // Act
                await wrapper.vm.onFormSubmit();

                // Assert
                expect(wrapper.emitted(EventNames.CheckoutSuccess).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)).toBeUndefined();
            });

            it('should emit failure event and display error message when address line1 input field is empty', async () => {
                // Arrange && Act
                await wrapper.vm.onFormSubmit();
                const addressLine1EmptyMessage = wrapper.find('[data-test-id="error-address-line1-empty"]');

                // Assert
                expect(addressLine1EmptyMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('address');
            });

            it('should emit failure event and display error message when city input field is empty', async () => {
                // Arrange && Act
                await wrapper.vm.onFormSubmit();
                const addressCityEmptyMessage = wrapper.find('[data-test-id="error-address-city-empty"]');

                // Assert
                expect(addressCityEmptyMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('address');
            });

            it('should emit failure event and display error message when postcode input field is empty', async () => {
                // Arrange && Act
                await wrapper.vm.onFormSubmit();
                const addressPostcodeEmptyMessage = wrapper.find('[data-test-id="error-address-postcode-empty"]');

                // Assert
                expect(addressPostcodeEmptyMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('address');
            });

            it('should emit failure event and display error message when postcode contains incorrect characters', async () => {
                // Arrange
                wrapper.find('[data-test-id="input-address-postcode"]').setValue('?!hdb-se');

                // Act
                await wrapper.vm.onFormSubmit();
                const addressPostcodeTypeErrorMessage = wrapper.find('[data-test-id="error-address-postcode-type-error"]');

                // Assert
                expect(addressPostcodeTypeErrorMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('address');
            });


            it('should emit failure event and display error message when postcode contains incorrect characters', async () => {
                // Arrange
                wrapper.find('[data-test-id="input-address-postcode"]').setValue('EC4M 7R');

                // Act
                await wrapper.vm.onFormSubmit();
                const addressPostcodeTypeErrorMessage = wrapper.find('[data-test-id="error-address-postcode-type-error"]');

                // Assert
                expect(addressPostcodeTypeErrorMessage).toMatchSnapshot();
                expect(wrapper.emitted(EventNames.CheckoutFailure).length).toBe(1);
                expect(wrapper.emitted(EventNames.CheckoutFailure)[0][0].invalidFields).toContain('address');
            });

            it('should create validations for address', () => {
                // Assert
                expect(wrapper.vm.$v.address.line1).toBeDefined();
                expect(wrapper.vm.$v.address.city).toBeDefined();
                expect(wrapper.vm.$v.address.postcode).toBeDefined();
            });
        });
    });
});
