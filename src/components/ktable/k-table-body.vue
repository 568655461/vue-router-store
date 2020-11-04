<script>
export default {
  name: "k-table-body",
  props: ['vNode', 'row','index'],
  inject: ['table'],
  render: function (h) {
    return h('div', [
      this.row.$scopedSlots.default({
        index: this.index,
        row: this.table.data[this.index],
      })
    ])
  },
}
</script>

