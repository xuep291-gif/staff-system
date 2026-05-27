import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const invoiceApi = {
  // 获取票据列表
  getInvoiceList(params) {
    return request('GET', `${BASE}/api/v1/invoices`, params)
  },
  // 获取票据详情
  getInvoiceDetail(id) {
    return request('GET', `${BASE}/api/v1/invoices/${id}`)
  },
  // 开具票据
  issueInvoice(params) {
    return request('POST', `${BASE}/api/v1/invoices`, params)
  },
  // 补打票据
  reprintInvoice(id) {
    return request('POST', `${BASE}/api/v1/invoices/${id}/reprint`)
  },
  // 作废票据
  voidInvoice(id, params) {
    return request('POST', `${BASE}/api/v1/invoices/${id}/void`, params)
  }
}
