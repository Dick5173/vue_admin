import * as R from 'ramda'
import * as DateUtil from 'src/util/format'
import { convertYuanToFen } from 'src/util/money'

import {
  STATUS_PAID,
  STATUS_DELIVERED,
  STATUS_COMPLETED,
  STATUS_REFUNDED,
  REFUND_STATUS_NO_APPLY,
  REFUND_STATUS_WAIT_ADMIN,
  REFUND_STATUS_WAIT_CUSTOMER,
  REFUND_STATUS_CANCELED,
  REFUND_STATUS_REJECTED,
  REFUND_STATUS_COMPLETED,
  REFUND_STATUS_REFUND_LATER
} from 'src/constants/orderItem'

export const refundBtnText = (orderItem) => {
  switch (orderItem.refund_status) {
    case REFUND_STATUS_NO_APPLY:
      return '主动退款'
    case REFUND_STATUS_WAIT_ADMIN:
      return '等待处理退款'
    case REFUND_STATUS_WAIT_CUSTOMER:
      return '请买家处理退款'
    case REFUND_STATUS_CANCELED:
      return '退款已撤销'
    case REFUND_STATUS_REJECTED:
      return '拒绝退款'
    case REFUND_STATUS_COMPLETED:
      return '退款成功'
    case REFUND_STATUS_REFUND_LATER:
      return '系统退款中'
  }
  return ''
}

export const enableRefundToWx = (orderItem) => {
  return orderItem.refund_status === REFUND_STATUS_REFUND_LATER && orderItem.status === STATUS_REFUNDED
}

export const enableRefund = (orderItem) => {
  if (!orderItem.hasOwnProperty('refund_status')) {
    return false
  }
  if (orderItem.status === STATUS_PAID || orderItem.status === STATUS_DELIVERED || orderItem.refund_status !== REFUND_STATUS_NO_APPLY) {
    return true
  }
  if (orderItem.status === STATUS_COMPLETED) {
    return true
  }
  return false
}

export const coverSearchFormToParam = R.curry((data) => {
  return R.mapObjIndexed((val, key) => {
    if (key === 'start_time' || key === 'end_time') {
      if (val === 0) {
        return ''
      } else {
        return DateUtil.dateFormat(val, 'YYYY-MM-DD')
      }
    }
    return val
  })(data)
})

export const coverFormToParam = R.curry((form) => {
  return R.pipe(
    R.clone,
    (obj) => {
      return R.mapObjIndexed((val, key) => {
        if (key === 'amount' || key === 'wallet_use_amount' || key === 'share_reward_amount') {
          if (val) {
            return convertYuanToFen(val)
          } else {
            return ''
          }
        } else if (key === 'total') {
          return parseInt(val)
        }
        return val
      })(obj)
    }
  )(form)
})
