<template>
  <div class="header">
    <span class="icon"></span>
    <h1 class="text">Cloud Music</h1>
  </div>
</template>

<script>
export default {
  name: 'm-header'
}
</script>

<style lang="scss" scoped>
.header {
  height: 44px;
  text-align: center;
  color: $color-theme;
  font-size: 0;
  .icon {
    display: inline-block;
    vertical-align: top;
    margin-top: 0px;
    width: 40px;
    height: 42px;
    margin-right: 9px;
    @include bg-image('logo3');
    background-size: 40px 42px;
  }
  .text {
    display: inline-block;
    vertical-align: top;
    line-height: 44px;
    font-size: $font-size-large;
  }
}
</style>
