<template>
  <div>
    {{ answer }}
  </div>
</template>

<script>
  export default {
    props: {
      answer: {
        type: Object,
        required: true,
      },
    },
  };
</script>
