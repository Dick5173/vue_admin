<template lang="pug">
  div
    tenant-user-form(:mode="edit")
</template>

<script>
  import tenantUserForm from 'src/ui/other/tenant-user/Form.vue'

  export default {
    props: {},
    components: {tenantUserForm},
    data () {
      return {
        edit: 1
      }
    },
    computed: {},
    watch: {},
    methods: {}
  }
</script>


<style lang="scss" scoped>

</style>
