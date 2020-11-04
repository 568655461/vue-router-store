<script>
export default {
  name: "k-table-comon",
  inject: ['table'],
  props: {
    label: {
      type: String,
    },
    prop: {
      type: String,
    },
    sortable: {
      type: Boolean
    }
  },
  data() {
    return {
      index: 0,
    }
  },
  render (h) {
    return h('div', this.$slots.default)
  }
}
</script>

<style scoped>

</style>
