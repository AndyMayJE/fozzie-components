<template>
    <div :class="$style['c-restaurantData']">
        <div :class="$style['c-restaurantData-textWrapper']">
            <text-block :class="[$style['c-restaurantData-text']]" />
            <text-block :class="[$style['c-restaurantData-text']]" />
        </div>
        <rating />
    </div>
</template>

<script>
import TextBlock from './Text.vue';
import Rating from './Rating.vue';

export default {
    components: { TextBlock, Rating }
};
</script>

<style lang="scss" module>

.c-restaurantData {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 96%;
    margin: auto;
    padding: spacing();
}

.c-restaurantData-textWrapper {
    flex: 1;
}

.c-restaurantData-text {
    width: 25%;
    height: spacing(x1.5);
}

</style>
