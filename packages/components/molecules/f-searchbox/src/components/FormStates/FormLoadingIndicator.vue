<template>
    <div
        v-if="shouldDisplayLoadingIndicator"
        data-test-id="loading-spinner-indicator"
        :class="$style['c-spinner']">
        <div :class="$style['c-spinner-icon']" />
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { VUEX_MODULE_NAMESPACE } from '../../services/constants';

export default {
    computed: {
        ...mapState(VUEX_MODULE_NAMESPACE, [
            'isFullAddressSearchEnabled',
            'isLoadingResults'
        ]),

        /**
         * Only display loading spinner for Loqate feature for now.
         *
         * */
        shouldDisplayLoadingIndicator () {
            return this.isFullAddressSearchEnabled && this.isLoadingResults;
        }
    }
};
</script>

<style lang="scss" module>
@import '../../assets/scss/form';
</style>
