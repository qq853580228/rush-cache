<script setup>
import { HelloWorld } from 'my-components'
import { isNumber } from 'my-tools'

console.log('isNumber', isNumber(123));
console.log('isNumber', isNumber('123'));
const appEnv = import.meta.env.VITE_ENV
</script>

<template>
  <h1>无敌鲍哥</h1>
  <HelloWorld msg=" " />
  <p>当前环境：{{ appEnv }}</p>
</template>
