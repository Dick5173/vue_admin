<template lang="pug">
  div
    div.section-title 订单信息:
    el-table.list-wrapper(:data="order.show_order_items", border row-key="id")
      el-table-column(label="ID", width="70")
        template(slot-scope="scope")
          div.code-id {{scope.row.id}}
      el-table-column(label="商品", min-width="500")
        template(slot-scope="scope")
          div.info-wrapper
            div.icon-wrapper(v-lazy:background-image="scope.row.product_img_res.url")
            div.name {{scope.row.product_name}}, {{scope.row.spec}}, {{scope.row.price | price}} x {{scope.row.count}}
      el-table-column(label="编码", width="210")
        template(slot-scope="scope")
          div.code-id {{scope.row.sku_code}}
      el-table-column(label="退款", width="210", v-if="hasRefund")
        template(slot-scope="scope")
          div.status
            el-button(type="text", @click="goRefundDetail(scope.row)", v-if="refundBtnText(scope.row)") {{refundBtnText(scope.row)}}
            p.refund-fail-tips(v-if="scope.row.fail_refund") {{scope.row.fail_refund.errmsg}}
          div.status(v-if="enableRefundToWx(scope.row)")
            el-button(type="text", @click="refundToWx(scope.row)") 退款至微信
      el-table-column(label="物流状态", width="210", v-if="showStatue")
        template(slot-scope="scope")
          div.status
            div(v-if="scope.row.dev_status === 1")
              div(v-if="scope.row.no_need_delivery")
                el-button(type="text", @click="showUnDelivery") 已发货
                div {{scope.row.no_delivery_oper_name}}：{{scope.row.no_delivery_txt}}
              div(v-else)
                el-button(type="text", @click="showExpress(scope.row)") 已发货(点击查看物流信息)
                div {{scope.row.dt | datetime}}
            div(v-else)
              div 待发货
              el-button(type="text", v-if="isShowUnDeliver(scope.row)", @click="clickUnDeliver(scope.row)") 无需发货
      el-table-column(label="商品来源", width="100")
        template(slot-scope="scope")
          div {{showCat(scope.row.cat)}}
    div.items-wrapper
      div.info-item-wrapper
        div.txt-info
        div.txt-info
          span 商品金额：{{order.product_total_price | price}}，
          span(v-if="order.discount_amount > 0") 第N件M折立减：-{{order.discount_amount | price}}，
          span(v-if="order.full_reduce_amount > 0") 满减立减：-{{order.full_reduce_amount | price}}，
          span(v-if="order.user_voucher_amount > 0") 优惠券：-{{order.user_voucher_amount | price}}，
          span(v-if="order.postage > 0") 运费：{{order.postage | price}}，
          span(v-if="order.wallet_used_amount > 0") 余额抵用：-{{order.wallet_used_amount | price}}，
          span 实付：{{order.total_price | price}}，
          span 利润
            el-tooltip(effect="light", placement="bottom-start")
              div(slot="content") 利润未扣除平台服务费
              i.el-icon-question(v-if="false")
          span ：{{order.total_profit | price}}
    express-dialog(ref="dlgExpress")
    agree(ref="agree", :orderItem="currentOrderItem", @submit="$emit('refresh')")
    dialog-un-deliver(ref="dlgUndeliver", @submit="$emit('refresh')")
</template>


<script>
  import * as RefundUtil from 'src/service/refund/refund'
  import * as OrderUtil from 'src/service/order/orderUtil'
  import { REFUND_STATUS_NO_APPLY, STATUS_PAID } from '../../../constants/orderItem'
  import * as OrderSrvice from 'src/service/order/index'
  import { orderItems } from '../../../api/order'
  import { refundToWx } from '../../../api/refuse'
  import Agree from '../refund/Agree'
  import ExpressDialog from 'src/ui/order/express/Index'
  import DialogUnDeliver from './DialogUnDeliver'

  export default {
    components: {
      Agree,
      ExpressDialog,
      DialogUnDeliver
    },
    props: {
      order: {
        type: Object,
        default () {
          return {}
        }
      }
    },
    data () {
      return {
        currentOrderItem: {}
      }
    },
    computed: {
      hasRefund () {
        return OrderUtil.hasRefund(this.order) && !this.buyGroupOrder
      },
      buyGroupOrder () {
        return this.order.tp === 2 && this.order.buy_group_record_status === 2
      },
      showStatue () {
        return this.order.status !== 1
      }
    },
    methods: {
      showCat (cat) {
        if (cat === OrderSrvice.orderProductCat.platform.value) {
          return OrderSrvice.orderProductCat.platform.text
        } else if (cat === OrderSrvice.orderProductCat.self_support.value) {
          return OrderSrvice.orderProductCat.self_support.text
        }
      },
      enableRefundToWx (orderItem) {
        return RefundUtil.enableRefundToWx(orderItem)
      },
      refundBtnText (orderItem) {
        const text = RefundUtil.refundBtnText(orderItem)
        if (text === '申请退款') {
          return ''
        }
        return text
      },
      showUnDelivery () {
        this.$alert('此订单无需发货', '提示', {
          confirmButtonText: '确定'
        })
      },
      isShowUnDeliver (orderItem) {
        return orderItem.status === STATUS_PAID
      },
      showExpress (orderItem) {
        this.$refs.dlgExpress.show(this.order.id, orderItem.dev_name, orderItem.dev_no)
      },
      clickUnDeliver (orderItem) {
        this.$refs.dlgUndeliver.show(orderItem)
      },
      async goRefundDetail (row) {
        if (row.refund_status === REFUND_STATUS_NO_APPLY) {
          const resRefund = await orderItems(row.id)
          this.currentOrderItem = resRefund.data
          this.$refs.agree.show()
        } else {
          this.$router.push({
            name: 'OrderRefundDetail',
            params: {
              id: row.order_id,
              oiid: row.id
            },
            query: {
              refund: false
            }
          })
        }
      },
      refundToWx (row) {
        this.$confirm('退款至微信?').then(async () => {
          try {
            this.loading = true
            await refundToWx(row.id)
            this.$message({
              showClose: true,
              message: '退款已成功',
              type: 'success'
            })
            this.$emit('refresh')
          } finally {
            this.loading = false
          }
        }).catch(() => {})
      }
    }
  }
</script>

<style lang="scss" scoped>
  .section-title {
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .code-id {
    width: 100%;
    text-align: center;
  }

  .status {
    padding-top: 5px;
    padding-bottom: 5px;

    & > button {
      padding: 0 20px !important;
    }
  }

  .refund-fail-tips {
    padding-top: 1px;
    padding-bottom: 1px;

    & > button {
      padding: 0 1px !important;
    }
  }


  .list-wrapper {
    margin-top: 5px;
    .info-wrapper {
      display: flex;
      padding-top: 8px;
      padding-bottom: 8px;
      .icon-wrapper {
        padding-right: 5px;
        padding-top: 5px;
        width: 60px;
        height: 60px;
        background-size: cover;
      }
    }
  }

  .info-wrapper {
    display: flex;
    align-items: center;
    padding-top: 5px;
    padding-bottom: 5px;

    .name {
      flex: 1;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-height: 17px;
      max-height: 34px;
      padding-left: 5px;
      text-overflow: ellipsis;
      word-break: break-all;
      overflow: hidden;
    }
  }

  .items-wrapper {
    padding-top: 5px;
    .info-item-wrapper {
      display: flex;
      padding-bottom: 5px;
      justify-content: space-between;
      text-align: right;
      padding-top: 5px;
    }

  }
</style>
