<template>
  <div>
    <table cellspacing="0" cellpadding="0">
      <thead >
      <tr>
        <td  v-for="item in column" :key="item[rowKey]">
          <div @click="sortClick(item)">
            {{ item.label || '' }}
            <span v-if="item.sortable">
             {{ item.sort ? '↑' : '↓' }}
           </span>
          </div>
        </td>
      </tr>
      </thead>
      <tbody class="k-tbody">
      <tr class="k-tr" v-for="(item,index) in data" :key="item[rowKey]">
        <td class="k-td" v-for="col in column" :key="col[rowKey]">
          <k-table-body v-if="col.vNode" :row="col" :index="index"></k-table-body>
          <div v-else>{{ item[col.prop] || '' }}</div>
        </td>
      </tr>
      </tbody>
    </table>
    <div style="visibility:hidden">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import kTableBody from './k-table-body'

export default {
  name: "k-table",
  components: {
    kTableBody
  },
  provide() {
    return {
      table: this
    }
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    rowKey: {
      type: String,
      default: 'id'
    }
  },
  data() {
    return {
      column: [],
      dom: '',
    }
  },
  mounted() {
    this.column = this.$children.map((elem) => {
      elem.vNode = !!elem.$scopedSlots.default
      return elem
    })
  },
  methods: {
    sortClick(el) {
      this.column.forEach(elem => {
        if (elem._uid === el._uid) {
          el.sort = !el.sort
        } else
          elem.sort = true
      })
     this.$emit('sortChange',el.prop,!el.sort)
    }
  }

}
</script>

<style scoped>
table {
  border: 1px solid #000;
}

td {
  border: 1px solid #000;
}
</style>
