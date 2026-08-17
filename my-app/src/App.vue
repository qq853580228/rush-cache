<script setup>
import { HelloWorld } from 'my-components'
import { isNumber } from 'my-tools'

console.log('isNumber', isNumber(123));
console.log('isNumber', isNumber('123'));
</script>

<template>
  <HelloWorld msg="my-app" />
  <p>当前环境：{{ import.meta.env.VITE_ENV }}</p>
</template>
