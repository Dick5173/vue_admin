<template lang="pug">
  div
    div
      search-toolbar(:queryParams="queryParams", @submit="handleSearch")
    div(v-loading="loading")
      el-table.list-el-table(:data="dataList.data", @sort-change="sortChanged", :defaultSort!='dataListSortInfo', border)
        el-table-column(label="店铺ID", width="65px")
          div(slot-scope="scope")
            el-tooltip(content="可开售", effect="light", placement="bottom-start", v-if="showShipping(scope.row)")
              el-icon(name="circle-check")
            span &nbsp;{{scope.row.id}}
        el-table-column(prop="", label="", width="68")
          div(slot-scope="scope")
            div.cover(v-lazy:background-image="scope.row.head_img")
        el-table-column(prop="", label="名称", width="110px")
          div(slot-scope="scope")
            el-button(type="text", @click="toDetail(scope.row)") {{scope.row.nick_name}}
        el-table-column(prop="total_amount", label="销售额", sortable, width="110px")
          div(slot-scope="scope")
            el-button(type="text", @click="toOrder(scope.row)") {{scope.row.total_amount  | price}}
        el-table-column(prop="total_profit", label="店铺利润", sortable, width="110px")
          div(slot-scope="scope") {{scope.row.total_profit  | price}}
        el-table-column(prop="up_product_count", label="上架商品", sortable, width="110px")
          div(slot-scope="scope")
            el-button(type="text", @click="toProduct(scope.row)") {{scope.row.up_product_count}}
        el-table-column(prop="level", label="店铺等级", width="110px")
          div(slot-scope="scope")
            el-button(type="text", @click="showTenantLevelDialog(scope.row)") {{scope.row.tenant_level.description}}
        el-table-column(prop="", label="商品权限", width="110px")
          div(slot-scope="scope")
            el-button(type="text", @click="showProductAuthDialog(scope.row)") {{showProductAuth(scope.row)}}
        el-table-column(prop="first_uptime", label="首次上线", sortable, width="110px")
          div(slot-scope="scope") {{scope.row.first_uptime | datetime}}
        el-table-column(prop="", label="小程序状态", width="110px")
          div(slot-scope="scope") {{showAppStatus(scope.row.app_status)}}
        el-table-column(prop="", label="店铺管理员ID", width="110px")
          div(slot-scope="scope") {{scope.row.admin_id}}
        el-table-column(prop="", label="支付服务商", width="110px")
          div(slot-scope="scope")
            div.pay-service(:class="{'full-pay': scope.row.pay_service === 2}")
        el-table-column(prop="", label="退款授权", width="110px")
          div(slot-scope="scope")
            div(v-if="scope.row.refund_status === 2") 已授权
            el-button(v-else, type="primary", size="small", @click="confirmRefund(scope.row)") 确认授权
        el-table-column(prop="", label="店铺状态", width="")
          div(slot-scope="scope") {{showTenantStatus(scope.row.tenant_status)}}
        el-table-column(label="操作", width="120px", fixed="right")
          div(slot-scope="props")
            el-dropdown()
              el-button(type="primary", size="medium", plain)
                | 操作
                i.el-icon-arrow-down.el-icon--right()
              el-dropdown-menu(slot="dropdown")
                el-dropdown-item(v-if="props.row.tenant_status === 1", type="danger", size="small", @click.native="disabled(props.row.id)", plain) &nbsp;&nbsp;禁用&nbsp;&nbsp;
                el-dropdown-item(v-else, type="primary", size="small", @click.native="enable(props.row.id)", plain) &nbsp;&nbsp;启用&nbsp;&nbsp;
                el-dropdown-item(:type="showBindStatus(props.row)", size="small", @click.native="handleBind(props.row)", plain) &nbsp;&nbsp;{{showMchBindButtonName(props.row)}}&nbsp;&nbsp;
                el-dropdown-item(:type="showErpBindStatus(props.row)", size="small", @click.native="handleErpBind(props.row)", plain) &nbsp;&nbsp;{{showErpBindButtonName(props.row)}}&nbsp;&nbsp;
                el-dropdown-item(:type="showQiyuBindStatus(props.row)", size="small", @click.native="handleQiyuBind(props.row)", plain) &nbsp;&nbsp;{{showQiyuBindButtonName(props.row)}}&nbsp;&nbsp;
                el-dropdown-item(v-if="props.row.relate_info_show", type="danger", size="small", @click.native="hideInfo(props.row.id)", plain) &nbsp;&nbsp;隐藏powered by&nbsp;&nbsp;
                el-dropdown-item(v-else, type="primary", size="small", @click.native="showInfo(props.row.id)", plain) &nbsp;&nbsp;显示powered by&nbsp;&nbsp;
    el-pagination(:currentPage="queryPager.page", :pageSize="queryPager.limit", :total="dataListTotal",  @current-change="changePage")
    bind-child-tenant-dialog(ref="dlgBindChildTenant", @refresh="loadDataListByQueryPage")
    bind-erp-shop-id-dialog(ref="dlgBindShopId", @refresh="loadDataListByQueryPage")
    bind-qiyu-dialog(ref="dlgBindQiyu" , @refresh="loadDataListByQueryPage")
    product-auth-dialog(ref="dlgProductAuth", @refresh="loadDataListByQueryPage")
    tenant-level-dialog(ref="dlgTenantLevel", @refresh="loadDataListByQueryPage")
</template>
<script>
  import SearchToolbar from 'src/ui/other/tenant/search-toolbar/IndexToolBar.vue'
  import TenantLevelDialog from 'src/ui/other/tenant/TenantLevelDialog.vue'
  import ProductAuthDialog from 'src/ui/common/product-auth-dialog/Index.vue'
  import BindChildTenantDialog from 'src/ui/other/tenant/BindChildTenantDialog.vue'
  import BindErpShopIdDialog from 'src/ui/other/tenant/BindErpShopIdDialog.vue'
  import BindQiyuDialog from 'src/ui/other/tenant/BindQiyuDialog.vue'

  import LoadPagerData from 'src/mixins/load-pager-data'
  import * as TenantApi from 'src/api/tenant'
  import { dateFormat } from 'src/util/format'
  import { showAppStatus, showTenantStatus, showProductAuth, showMchBindButtonName, showErpBindButtonName, showQiyuBindButtonName, isMchBind } from 'src/service/other/index'
  import { PUSH_STATUS_TENANT } from 'src/constants/orderPush'

  export default {
    mixins: [
      LoadPagerData
    ],
    props: {},
    components: {
      SearchToolbar,
      BindChildTenantDialog,
      ProductAuthDialog,
      BindErpShopIdDialog,
      BindQiyuDialog,
      TenantLevelDialog
    },
    data () {
      return {
        queryParams: {
          app_status: '',
          start: 0,
          end: 0,
          key: '',
          product_auth: '',
          level: '',
          delivery_mode: '',
          with_hidden: ''
        }
      }
    },
    computed: {},
    watch: {},
    methods: {
      getQueryApi (params) {
        return TenantApi.getList(this.R.mapObjIndexed((val, key, obj) => {
          if (key === 'start' || key === 'end') {
            if (val === 0) {
              return ''
            } else {
              return dateFormat(val, 'YYYY-MM-DD')
            }
          }
          return val
        })(params))
      },
      showProductAuthDialog (row) {
        this.$refs.dlgProductAuth.show(row)
      },
      showShipping (row) {
        return row.app_status === 2 && isMchBind(row)
      },
      handleBind (row) {
        this.$refs.dlgBindChildTenant.show(row)
      },
      handleErpBind (row) {
        this.$refs.dlgBindShopId.show(row)
      },
      handleQiyuBind (row) {
        this.$refs.dlgBindQiyu.show(row)
      },
      showTenantLevelDialog (row) {
        this.$refs.dlgTenantLevel.show(row)
      },
      showBindStatus (row) {
        if (row.sub_mch_id) {
          return ''
        }
        return 'primary'
      },
      showErpBindStatus (row) {
        if (row.erp_shop_id) {
          return ''
        }
        return 'primary'
      },
      showQiyuBindStatus (row) {
        if (row.qiyu_id) {
          return ''
        }
        return 'primary'
      },
      toOrder (row) {
        this.$router.push({
          name: 'OrderIndex',
          params: {
            tid: row.id
          },
          query: {
            status: PUSH_STATUS_TENANT
          }
        })
      },
      toProduct (row) {
        this.$router.push({
          name: 'TenantProduct',
          params: {
            id: row.id
          }
        })
      },
      toDetail (row) {
        this.$router.push({
          name: 'TenantDetail',
          params: {
            tid: row.id
          }
        })
      },
      confirmRefund (row) {
        this.$confirm(`“${row.nick_name}”已经完成了退款授权？`, '确认退款授权', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.loading = true
            await TenantApi.refundAuthAgree(row.id)
            this.$message({
              type: 'success',
              message: '已确认!'
            })
            this.loadDataListByQueryPage()
          } catch (err) {
            this.loading = false
          }
        }).catch(() => {
        })
      },
      disabled (id) {
        this.$confirm('小程序将无法访问，店铺后台将无法登录', '禁用？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.loading = true
            await TenantApi.disableTenant(id)
            this.$message({
              type: 'success',
              message: '已禁用!'
            })
            this.loadDataListByQueryPage()
          } catch (err) {
            this.loading = false
          }
        }).catch(() => {
        })
      },
      enable (id) {
        this.$confirm('启用店铺？', '提示？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.loading = true
            await TenantApi.enableTenant(id)
            this.$message({
              type: 'success',
              message: '已启用!'
            })
            this.loadDataListByQueryPage()
          } catch (err) {
            this.loading = false
          }
        }).catch(() => {
        })
      },
      hideInfo (id) {
        this.$confirm('隐藏"百宝美市提供平台支持"', '隐藏powered by？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.loading = true
            await TenantApi.hidePowerInfo(id)
            this.$message({
              type: 'success',
              message: '已隐藏!'
            })
            this.loadDataListByQueryPage()
          } catch (err) {
            this.loading = false
          }
        }).catch(() => {})
      },
      showInfo (id) {
        this.$confirm('显示"百宝美市提供平台支持"', '显示powered by？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.loading = true
            await TenantApi.showPowerInfo(id)
            this.$message({
              type: 'success',
              message: '已显示!'
            })
            this.loadDataListByQueryPage()
          } catch (err) {
            this.loading = false
          }
        }).catch(() => {})
      },
      handleSearch (data) {
        this.queryChange(data)
      },
      ...$global.$mapMethods({'showAppStatus': showAppStatus}),
      ...$global.$mapMethods({'showTenantStatus': showTenantStatus}),
      ...$global.$mapMethods({'showProductAuth': showProductAuth}),
      ...$global.$mapMethods({'showProductAuth': showProductAuth}),
      ...$global.$mapMethods({'showErpBindButtonName': showErpBindButtonName}),
      ...$global.$mapMethods({'showQiyuBindButtonName': showQiyuBindButtonName}),
      ...$global.$mapMethods({'showMchBindButtonName': showMchBindButtonName})
    }
  }
</script>


<style lang="scss" scoped>
  .cover {
    display: inline-block;
    width: 50px;
    height: 50px;
    background-size: cover;
    background-position: center;
  }

  .pay-service {
    width: 50px;
    height: 50px;
    background: url("~@/assets/image/icon-wx-pay.png") no-repeat center / 100% 100%;

    &.full-pay {
      background: url("~@/assets/image/icon-full-pay.png") no-repeat center / 100% 100%;
    }
  }
</style>
