<template lang="pug">
  div
    smart-table.skus-table(ref="skuTable", :dataList="skus", @drag-change="handleDragChange",  @drag-end="handleDragEnd")
      smart-table-column(type="drag")
      smart-table-column(label="规格", width="220px")
        div(slot-scope="props")
          el-form-item.show-validate-el-form(:ref="`spec{props.index}`", :prop="'skus.' + props.index + '.spec'", :rules="formRules.spec")
            el-input(v-model.trim="props.row.spec", clearable)
      smart-table-column(label="建议售价")
        div(slot-scope="props")
          el-form-item.show-validate-el-form(:ref="`suggest_price${props.index}`", :prop="'skus.' + props.index + '.suggest_price'", :rules="formRules.suggest_price")
            el-input(v-model.trim="props.row.suggest_price", clearable)
      smart-table-column(label="库存")
        div(slot-scope="props")
          el-form-item.show-validate-el-form(:ref="`stock${props.index}`", :prop="'skus.' + props.index + '.stock'", :rules="formRules.stock")
            el-input(v-model.trim="props.row.stock", clearable)
      smart-table-column(label="编码" width="220px")
        div(slot-scope="props")
          el-form-item.show-validate-el-form(:ref="`code${props.index}`", :prop="'skus.' + props.index + '.code'", :rules="formRules.code")
            el-input(v-model.trim="props.row.code", clearable)
      smart-table-column(label="重量(kg)" width="100px")
        div(slot-scope="props")
          el-form-item.show-validate-el-form(:ref="`weight{props.index}`", :prop="'skus.' + props.index + '.weight'", :rules="formRules.weight")
            el-input(v-model.trim="props.row.weight", clearable)
      smart-table-column(label="图片", width="80px")
        div(slot-scope="props")
          el-form-item.show-validate-el-form(:ref="`image${props.index}`", :prop="'skus.' + props.index + '.image'", :rules="formRules.image")
            upload-image(:ref="`uploadImage${props.index}`", :image.sync="props.row.image", size="50px", addIconSize="20px", :host="getHost", :token="getToken")
      smart-table-column(label="", width="80px")
        div(slot-scope="props")
          el-button(type="danger", size="mini", plain, @click="handleDelSku(props.index)") 删除
    div
      el-button(type="primary", size="mini", plain, @click="handleAddSku") 添加商品规格
      span.input-right-desc 商品编码不能重复，且必须首先在ERP系统上线，否则将无法发货
</template>

<script>
  import * as AliyunApi from 'src/api/aliyun'
  import emitter from 'element-ui/src/mixins/emitter'
  import { SmartTable, SmartTableColumn, UploadImage } from '@baibao/zeratul'
  import { nonZeroIntegerValidator } from 'src/util/validator'
  import * as ProductSer from 'src/service/product/index'

  export default {
    mixins: [emitter],
    components: {
      SmartTable,
      SmartTableColumn,
      UploadImage
    },
    props: {
      skus: {
        type: Array,
        required: true
      },
      purchase_price: {
        type: String,
        required: true
      },
      stPrice: {
        type: String,
        required: true
      }
    },
    data () {
      const suggestPriceValidator = async (rule, value, callback) => {
        await this.$nextTick()
        if (!this.R_.isPrice(value)) {
          callback(new Error('请输入正数，最多2位小数'))
          return
        }
        const suggestPrice = this.R_.convertYuanToFen(value)
        if (!this.purchase_price) {
          callback()
          return
        }
        const sypplyPrice = ProductSer.supplyPrice(this.purchase_price, this.skus, true)
        if (this.R_.isPrice(sypplyPrice)) {
          const sp = this.R_.convertYuanToFen(sypplyPrice)
          if (suggestPrice < sp) {
            callback(new Error('不能小于供货价'))
            return
          }
        }
        if (this.R_.isPrice(this.stPrice)) {
          const st = this.R_.convertYuanToFen(this.stPrice)
          if (suggestPrice > st) {
            callback(new Error('不能大于划线价'))
            return
          }
        }
        if (suggestPrice > 99999999) {
          callback(new Error('价格不能大于999999'))
          return
        }
        callback()
      }
      const weightValidator = (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        let reg = /(^[1-9]([0-9]{0,3})?(\.[0-9]{1})?$)|(^(0){1}$)|(^[0-9]\.[0-9]$)/
        if (!reg.test(value)) {
          callback(new Error('不大于9999，最多1位小数'))
          return
        }
        callback()
      }
      return {
        formRules: {
          spec: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          suggest_price: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: suggestPriceValidator, trigger: 'blur'}
          ],
          stock: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: nonZeroIntegerValidator, trigger: 'blur'}
          ],
          code: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          weight: [
            {validator: weightValidator, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      handleDragChange (dataList) {
        this.$emit('update:skus', arguments[0])
        this.dispatch('ElFormItem', 'el.form.change', [dataList])
      },
      async handleDragEnd () {
        await this.$nextTick()
        for (const i in this.skus) {
          const item = this.skus[i]
          Object.keys(item).forEach(async (k) => {
            await this.$nextTick()
            this.$refs[`${k}${i}`] && this.$refs[`${k}${i}`].clearValidate()
          })
        }
      },
      async handleAddSku () {
        this.skus.push(
          {
            spec: '',
            suggest_price: '',
            stock: '',
            code: '',
            weight: '',
            image: {
              url: '',
              width: 0,
              height: 0
            }
          }
        )
        await this.$nextTick()
        this.dispatch('ElFormItem', 'el.form.change', [this.skus])
      },
      async handleDelSku (index) {
        this.skus.splice(index, 1)
        await this.$nextTick()
        this.dispatch('ElFormItem', 'el.form.change', [this.skus])
      },
      isUpdating () {
        for (const i in this.skus) {
          if (this.$refs[`uploadImage${i}`] && this.$refs[`uploadImage${i}`].isUpdating) {
            return true
          }
        }
        return false
      },
      ...$global.$mapMethods({
        'getHost': AliyunApi.getOssHost,
        'getToken': AliyunApi.getOssToken
      })
    }
  }
</script>

<style lang="scss" scoped>
  .skus-table {
    width: 920px;
  }
</style>
