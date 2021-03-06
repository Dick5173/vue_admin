<template lang="pug">
  el-form(ref="form", :model="formData", labelWidth="85px", v-loading="loading")
    el-form-item(label="商品图片：", prop="head")
      template(slot-scope="scope")
        div.img(v-for="headItem in formData.head", v-lazy:background-image="headItem.url")
    el-form-item(v-if="showFormItem(formData.cover)", label="列表图：", prop="cover")
      div.img(v-if="showImg(formData.cover) !== ''", v-lazy:background-image="showImg(formData.cover)")
    el-form-item(label="商品名称：", prop="")
      div {{formData.name}}
    el-form-item(v-if="showFormItem(formData.sell_point)", label="卖点：", prop="")
      div {{formData.sell_point}}
    el-form-item(label="商品规格：", prop="")
      skus(:skus="skus", :isPlatform="isPlatform", :formData="formData")
    el-form-item(v-if="showFormItem(formData.st_price)", label="划线价：", prop="st_price")
      span {{formData.st_price | price}}
      span.input-right-desc 元
    el-form-item(label="供货价：")
      span(v-if="isTenantProduct") {{formData.prop.ext.supply_price | price}}
      span.input-right-desc(v-if="isTenantProduct") 元
      span(v-if="isSelected") {{formData.supply_price | price}}
      span.input-right-desc(v-if="isSelected") 元
      supply-price-comp(v-if="isPlatform" :dataList="supply_levels")
      div(v-if="formData.prop.control_price") 控价
    el-form-item(v-if="isPlatform", label="商品分类：", prop="delivery_region_id")
      div {{showName(formData.prop.category)}}
    el-form-item(v-if="showFormItem(formData.prop.ext.delivery_region)", label="配送区域：", prop="delivery_region_id")
      div {{showName(formData.prop.ext.delivery_region)}}
    el-form-item(v-if="showFormItem(formData.prop.ext.oversea)", label="商品设置：", prop="oversea")
      div {{showOversea(formData.prop.ext.oversea)}}
    el-form-item(label="定向供货：")
      div.tenants {{showSupplyTenants}}
    el-form-item(label="运费：", v-if="formData.prop.ext.freight_template")
      div.freight-wrapper(v-html="freightDescText(formData.prop.ext.freight_template)")
    el-form-item(v-if="isPlatform && showFormItem(formData.prop.tags)", label="商品标签：", prop="oversea")
      div
        el-tag.ptag(type="primary", v-for="item in formData.prop.tags", :key="item.id") {{item.name}}
    el-form-item(v-if="showFormItem(description)", label="商品描述：", prop="content")
      show-description(:description="description")
    el-form-item(v-if="showFormItem(formData.prop.ext.service_tag_group)", label="服务组合：", prop="service_tag_group_id")
      div
        div {{ formData.prop.ext.service_tag_group.name }}
        div {{ serviceTagGroupShowText(formData.prop.ext.service_tag_group) }}
    el-form-item(v-if="showFormItem(formData.prop.ext.after_service)", label="售后模板：", prop="after_service_id")
      show-after-service(:afterService="formData.prop.ext.after_service")
    el-form-item.btn-fixed
      el-button(type="primary", :disabled="!isPlatform", @click="edit(formData.id)") 编 辑
</template>

<script>
  import ShowDescription from './ShowDescription.vue'
  import SupplyPriceComp from './SupplyPrice'
  import Skus from 'src/ui/common/ProductDetail/Skus.vue'
  import * as FreightService from 'src/service/freight-template'
  import * as ServiceTagGroupService from 'src/service/service_tag_group'
  import ShowAfterService from './ShowAfterService.vue'

  export default {
    props: {
      isPrompt: {
        type: Boolean,
        default: () => {
          return false
        }
      },
      rowFormData: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    components: {ShowDescription, Skus, SupplyPriceComp, ShowAfterService},
    data () {
      return {
        loading: false,
        skus: [],
        formData: {
          head: [],
          cover: {
            url: ''
          },
          prop: {
            ext: {}
          }
        },
        description: []
      }
    },
    computed: {
      isPlatform () {
        if (this.rowFormData.tp === 1) {
          return true
        }
        return false
      },
      isSelected () {
        if (this.rowFormData.tp === 3) {
          return true
        }
        return false
      },
      isTenantProduct () {
        if (this.rowFormData.tp === 2) {
          return true
        }
        return false
      },
      showSupplyTenants () {
        if (!this.formData.prop.supply_scope_tp || this.formData.prop.supply_scope_tp === 1) {
          return '无限制'
        }
        let tenants = ''
        this.R.forEachObjIndexed((item, index) => {
          tenants += `${parseInt(index) === 0 ? '' : '、'}${item.id}-${item.nick_name}`
        })(this.formData.prop.supply_tenants || [])
        return tenants
      }
    },
    watch: {
      rowFormData () {
        this.formData = this.rowFormData
        if (!this.isPlatform) {
          this.skus = this.rowFormData.tenant_skus
        } else {
          this.skus = this.rowFormData.prop.skus
        }
        this.supply_levels = this.rowFormData.supply_levels
        this.description = this.rowFormData.content ? this.rowFormData.content : []
      }
    },
    methods: {
      showFormItem (row) {
        if (Array.isArray(row)) {
          if (row.length !== 0) {
            return true
          }
          return false
        }
        if (row) {
          return true
        }
        return false
      },
      edit (id) {
        if (this.isPrompt) {
          this.$confirm('离开当前页面，放弃未保存内容？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$router.push({
              name: 'PlatformProductEdit',
              params: {
                id: id
              }
            })
          }).catch()
        } else {
          this.$router.push({
            name: 'PlatformProductEdit',
            params: {
              id: id
            }
          })
        }
      },
      showOversea (row) {
        if (row) {
          return '清关商品'
        }
        return '非清关商品'
      },
      showImg (row) {
        if (row) {
          return row.url
        }
        return ''
      },
      showName (row) {
        if (row) {
          return row.name
        }
        return ''
      },
      ...$global.$mapConst({'serviceTagGroupShowText': ServiceTagGroupService.showItemsText}),
      ...$global.$mapMethods({'freightDescText': FreightService.getDescText})
    },
    mounted () {
    }
  }
</script>


<style lang="scss">
  .img {
    display: inline-block;
    margin-right: 10px;
    width: 100px;
    height: 100px;
    background-size: cover;
  }

  .ptag {
    margin-right: 10px;
  }

  .tenants {
    max-width: 400px;
    color: $font-color-common;
  }
</style>
