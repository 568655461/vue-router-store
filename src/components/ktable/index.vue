<template>
  <div>
    <k-table :data="tableData" @sortChange="sortChange">
      <k-table-column label="姓名" prop="name" sortable></k-table-column>
      <k-table-column label="性别" prop="sex" sortable></k-table-column>
      <k-table-column label="出身年月" v-slot="slotProps">
          <p>{{ slotProps.row.date }}</p>
      </k-table-column>
      <k-table-column label="操作" v-slot="slotProps">
       <div>删除</div>
      </k-table-column>
    </k-table>
  </div>
</template>

<script>
import kTable from './k-table'
import kTableColumn from './k-table-column'

export default {
  name: "vue-table",
  components: {
    kTable,
    kTableColumn,
  },
  data() {
    return {
      tableData: [
        {
          name: '村长喊你来搬砖',
          sex: '男',
          date: '1989',
        },
        {
          name: '杨老师喊你来搬砖',
          sex: '女',
          date: '1989',
        },
        {
          name: '喜洋洋喊你来搬砖',
          sex: '女',
          date: '1989',
        },
      ],
    }
  },
  methods: {
    sortChange() {
      this.tableData=this.tableData.reverse()
    }
  },
}
</script>

<style scoped>

</style>
