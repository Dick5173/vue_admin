<template lang="pug">
  div
    div(v-if="!isPlatform")
      el-table(:data="skus", border)
        el-table-column(label="规格")
          div(slot-scope="scope") {{scope.row.sku.spec}}
        el-table-column(label="售价")
          div(slot-scope="scope") {{scope.row.sell_price | price}}
        el-table-column(v-if="formData.tp===3", label="建议售价")
          div(slot-scope="scope") {{scope.row.sku.suggest_price | price}}
        el-table-column(v-if="formData.tp===3", label="利润")
          div(slot-scope="scope") {{showProfit(scope.row) | price}}
        el-table-column(label="库存")
          div(slot-scope="scope") {{scope.row.sku.stock}}
        el-table-column(label="编码")
          div(slot-scope="scope") {{scope.row.sku.code}}
        el-table-column(label="重量(kg)")
          div(slot-scope="scope") {{getWeight(scope.row.sku.weight)}}
        el-table-column(label="图片")
          template(slot-scope="scope")
            div.skuImg(v-lazy:background-image="showImg(scope.row.sku.image)")
    div(v-if="isPlatform")
      el-table(ref="platform", :data="skus", border)
        el-table-column(label="规格")
          div(slot-scope="scope") {{scope.row.spec}}
        el-table-column(label="建议售价")
          div(slot-scope="scope") {{scope.row.suggest_price | price}}
        el-table-column(label="库存")
          div(slot-scope="scope") {{scope.row.stock}}
        el-table-column(label="编码")
          div(slot-scope="scope") {{scope.row.code}}
        el-table-column(label="重量(kg)")
          div(slot-scope="scope") {{getWeight(scope.row.weight)}}
        el-table-column(label="图片")
          template(slot-scope="scope")
            div.skuImg(v-lazy:background-image="showImg(scope.row.image)")
</template>

<script>
  import { convertGToKg } from '../../../util/weight'

  export default {
    props: {
      skus: {
        type: Array,
        default: () => {
          return []
        }
      },
      isPlatform: {
        type: Boolean
      },
      formData: {
        type: Object
      }
    },
    components: {},
    data () {
      return {}
    },
    computed: {},
    watch: {},
    methods: {
      showProfit (row) {
        if (this.formData.prop.suply_levels) {
          if (this.formData.prop.suply_levels.length > 0) {
            let data = row.sell_price - this.formData.prop.supply_levels[0].supply_price
            return data
          }
        }
        let data = row.sell_price - this.formData.prop.ext.supply_price
        return data
      },
      showImg (row) {
        if (row) {
          return row.url
        }
        return ''
      },
      getWeight (weigth) {
        return `${convertGToKg(weigth)}`
      }
    }
  }
</script>


<style lang="scss" scoped>
  .skuImg {
    width: 50px;
    height: 50px;
    background-size: cover;
    margin-right: 10px;
  }
</style>
