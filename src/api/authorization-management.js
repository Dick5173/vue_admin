import Axios from 'axios'
import * as AuthorizationManagementService from 'src/service/authorization-management/index'

export const getAuthGroupList = (tp) => {
  return Axios.get(`/admin/auth_group`, {
    params: {
      tp: tp
    }
  })
}
export const getAuthList = (pid) => {
  return Axios.get(`/admin/auth`, {
    params: {
      pid
    }
  })
}
export const createAuthGroup = (formData) => {
  const params = AuthorizationManagementService.convertAuthGroupFormToParams(formData)
  return Axios.post(`/admin/auth_group`, params)
}
export const editAuthGroup = (formData) => {
  const params = AuthorizationManagementService.convertAuthGroupFormToParams(formData)
  return Axios.post(`/admin/auth_group/s/${formData.id}`, params)
}
export const deleteAuthGroup = (id) => {
  return Axios.delete(`/admin/auth_group/s/${id}`)
}
export const getAuthGroupItem = (id) => {
  return Axios.get(`/admin/auth_group/s/${id}`)
}
export const getAuthItem = (id) => {
  return Axios.get(`/admin/auth/s/${id}`)
}
export const createAuth = (formData) => {
  return Axios.post(`/admin/auth/`, formData)
}
export const editAuth = (formData) => {
  return Axios.post(`/admin/auth/s/${formData.id}`, formData)
}
export const deleteAuth = (id) => {
  return Axios.delete(`/admin/auth/s/${id}`)
}

export const sortSysAuthGroup = (pid, ids) => {
  return Axios.post(`/admin/sort/auth_group/sys/${pid}`, {
    val: ids || []
  })
}

export const sortTenantAuthGroup = (pid, ids) => {
  return Axios.post(`/admin/sort/auth_group/tenant/${pid}`, {
    val: ids || []
  })
}

export const sortAuth = (gid, ids) => {
  return Axios.post(`/admin/sort/auth/${gid}`, {
    val: ids || []
  })
}
