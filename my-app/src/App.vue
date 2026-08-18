<script setup>
import { HelloWorld } from 'my-components'
import { isNumber } from 'my-tools'

console.log('isNumber', isNumber(123));
console.log('isNumber', isNumber('123'));
const appEnv = import.meta.env.VITE_ENV
</script>

<template>
  <HelloWorld msg="my-app" />
  <p>当前环境：{{ appEnv }}</p>
</template>
