import Vue from 'vue'
import Router from 'vue-router'
import { getMe } from 'src/api/uc'
import { clearAuthCookie, getAuthRoute, isAuthRouter } from 'src/service/auth/index'

Vue.use(Router)

const homeGroups = [
  {
    name: 'Administrator',
    title: '管理员',
    path: '/'
  },
  {
    name: 'Other',
    title: '店铺管理',
    path: '/'
  },
  {
    name: 'Product',
    title: '商品管理',
    path: '/'
  },
  {
    name: 'VersionManagement',
    title: '版本管理',
    path: '/'
  }
]

const router = new Router({
  routes: [
    {
      path: '/',
      component: () => import('src/ui/layout/home/Index.vue'),
      meta: {
        menu: true,
        groups: homeGroups
      },
      children: [
        {
          path: '/err',
          name: 'PageErr',
          component: () => import('src/ui/err/Index.vue'),
          meta: {
            title: '错误',
            showInSide: false
          }
        },
        {
          path: '/',
          name: 'Dashboard',
          component: () => import('src/ui/home/dashboard/Index.vue'),
          meta: {
            title: '首页',
            showInSide: true
          }
        },
        {
          path: '/order',
          name: 'OrderIndex',
          component: () => import('src/ui/order/Index.vue'),
          meta: {
            title: '订单',
            showInSide: true
          }
        },
        {
          path: '/order/detail/:id',
          name: 'OrderDetail',
          component: () => import('src/ui/order/detail/Index.vue'),
          meta: {
            title: '订单详情',
            showInSide: false,
            breadcrumbItems: [{
              text: '订单',
              to: {name: 'OrderIndex'}
            }, {
              text: '订单详情'
            }]
          }
        },
        {
          path: '/order/refund/',
          name: 'OrderRefund',
          component: () => import('src/ui/order/refund/Index.vue'),
          meta: {
            title: '退款中',
            showInSide: false,
            breadcrumbItems: [{
              text: '订单',
              to: {name: 'OrderIndex'}
            }, {
              text: '退款中'
            }]
          }
        },
        {
          path: '/order/:id/refund/:oiid',
          name: 'OrderRefundDetail',
          component: () => import('src/ui/order/refund/Detail.vue'),
          meta: {
            customBreadcrumb: true,
            title: '退款详情',
            showInSide: false
          }
        },
        {
          path: 'pfproduct',
          name: 'PlatformProductIndex',
          component: () => import('src/ui/product/platform/Index.vue'),
          meta: {
            group: 'Product',
            title: '平台商品',
            showInSide: true
          }
        },
        {
          path: 'pfproduct/create-edit',
          name: 'PlatformProductCreate',
          component: () => import('src/ui/product/platform/Create.vue'),
          meta: {
            group: 'Product',
            title: '创建平台商品',
            breadcrumbItems: [
              {
                text: '平台商品',
                to: {
                  name: 'PlatformProductIndex'
                }
              },
              {
                text: '创建'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'pfproduct/edit/:id',
          name: 'PlatformProductEdit',
          component: () => import('src/ui/product/platform/Edit.vue'),
          meta: {
            group: 'Product',
            title: '编辑平台商品',
            breadcrumbItems: [
              {
                text: '平台商品',
                to: {
                  name: 'PlatformProductIndex'
                }
              },
              {
                text: '编辑'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'export/task',
          name: 'exportTask',
          component: () => import('src/ui/export_task/Index'),
          meta: {
            customBreadcrumb: true,
            showInSide: false
          }
        },
        {
          path: 'pfproduct/recycle',
          name: 'PlatformProductRecycle',
          component: () => import('src/ui/product/platform/Recycle/Index.vue'),
          meta: {
            group: 'Product',
            title: '回收站',
            breadcrumbItems: [
              {
                text: '平台商品',
                to: {
                  name: 'PlatformProductIndex'
                }
              },
              {
                text: '回收站'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'tsproduct',
          name: 'TenantSelfProductIndex',
          component: () => import('src/ui/product/tenant-self/Index.vue'),
          meta: {
            group: 'Product',
            title: '店铺自营商品',
            showInSide: true
          }
        },
        {
          path: 'category',
          name: 'CategoryIndex',
          component: () => import('src/ui/product/category/Index.vue'),
          meta: {
            group: 'Product',
            title: '分类',
            showInSide: true
          }
        },
        {
          path: 'tag',
          name: 'Tag',
          component: () => import('src/ui/product/tag/Index.vue'),
          meta: {
            group: 'Product',
            title: '标签',
            showInSide: true
          }
        },
        {
          path: 'afterservice',
          name: 'AfterServiceIndex',
          component: () => import('src/ui/product/after-service/Index.vue'),
          meta: {
            group: 'Product',
            title: '售后模板',
            showInSide: true
          }
        },
        {
          path: 'afterservice/create-edit',
          name: 'AfterServiceCreate',
          component: () => import('src/ui/product/after-service/Create.vue'),
          meta: {
            group: 'Product',
            title: '创建售后模板',
            breadcrumbItems: [
              {
                text: '售后模板',
                to: {
                  name: 'AfterServiceIndex'
                }
              },
              {
                text: '创建'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'afterservice/edit/:id',
          name: 'AfterServiceEdit',
          component: () => import('src/ui/product/after-service/Edit.vue'),
          meta: {
            group: 'Product',
            title: '编辑售后模板',
            breadcrumbItems: [
              {
                text: '售后模板',
                to: {
                  name: 'AfterServiceIndex'
                }
              },
              {
                text: '编辑'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'service',
          name: 'ServiceIndex',
          component: () => import('src/ui/product/service/Index.vue'),
          meta: {
            group: 'Product',
            title: '服务说明',
            showInSide: true
          }
        },
        {
          path: 'deliveryregion',
          name: 'DeliveryRegionIndex',
          component: () => import('src/ui/product/delivery-region/Index.vue'),
          meta: {
            group: 'Product',
            title: '配送区域',
            showInSide: true
          }
        },
        {
          path: 'deliveryregion/edit/:id',
          name: 'DeliveryRegionEdit',
          component: () => import('src/ui/product/delivery-region/Edit.vue'),
          meta: {
            group: 'Product',
            title: '编辑配送区域',
            breadcrumbItems: [
              {
                text: '配送区域',
                to: {
                  name: 'DeliveryRegionIndex'
                }
              },
              {
                text: '编辑'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'deliveryregion/create-edit',
          name: 'DeliveryRegioncCreate',
          component: () => import('src/ui/product/delivery-region/Create.vue'),
          meta: {
            group: 'Product',
            title: '创建配送区域',
            breadcrumbItems: [
              {
                text: '配送区域',
                to: {
                  name: 'DeliveryRegionIndex'
                }
              },
              {
                text: '创建'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'freight',
          name: 'FreightIndex',
          component: () => import('src/ui/product/freight/Index.vue'),
          meta: {
            group: 'Product',
            title: '运费模板',
            showInSide: true
          }
        },
        {
          path: 'freight/create-edit',
          name: 'FreightCreate',
          component: () => import('src/ui/product/freight/Create.vue'),
          meta: {
            group: 'Product',
            title: '创建运费模板',
            breadcrumbItems: [
              {
                text: '运费模板',
                to: {
                  name: 'FreightIndex'
                }
              },
              {
                text: '创建'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'freight/edit/:id',
          name: 'FreightEdit',
          component: () => import('src/ui/product/freight/Edit.vue'),
          meta: {
            group: 'Product',
            title: '编辑运费模板',
            breadcrumbItems: [
              {
                text: '运费模板',
                to: {
                  name: 'FreightIndex'
                }
              },
              {
                text: '编辑'
              }
            ],
            customBreadcrumb: false
          }
        },
        {
          path: 'tenant',
          name: 'Tenant',
          component: () => import('src/ui/other/tenant/Index.vue'),
          meta: {
            group: 'Other',
            title: '店铺',
            showInSide: true
          }
        },
        {
          path: 'tenant/detail/:tid',
          name: 'TenantDetail',
          component: () => import('src/ui/other/tenant/TenantDetail.vue'),
          meta: {
            group: 'Other',
            title: '店铺详情',
            showInSide: false,
            customBreadcrumb: true
          }
        },
        {
          path: 'tenant/product/:id',
          name: 'TenantProduct',
          component: () => import('src/ui/other/tenant/Product.vue'),
          meta: {
            group: 'Other',
            title: '商品',
            showInSide: false,
            breadcrumbItems: [{
              text: '店铺',
              to: {name: 'Tenant'}
            }, {
              text: '商品'
            }]
          }
        },
        {
          path: 'income',
          name: 'TenantIncome',
          component: () => import('src/ui/other/Income/Index.vue'),
          meta: {
            group: 'Other',
            title: '收入',
            showInSide: true
          }
        },
        {
          path: 'tenantuser',
          name: 'TenantUser',
          component: () => import('src/ui/other/tenant-user/Index.vue'),
          meta: {
            group: 'Other',
            title: '店铺管理员',
            showInSide: true
          }
        },
        {
          path: 'tenantuser/list/:tid',
          name: 'TenantUserList',
          component: () => import('src/ui/other/tenant-user/TenantUserList.vue'),
          meta: {
            group: 'Other',
            title: '店铺管理员详情',
            showInSide: false,
            breadcrumbItems: [{
              text: '店铺管理员',
              to: {name: 'TenantUser'}
            }, {
              text: '详情'
            }]
          }
        },
        {
          path: 'tenantuser/create-edit',
          name: 'CreateTenantUser',
          component: () => import('src/ui/other/tenant-user/Create.vue'),
          meta: {
            group: 'Other',
            title: '创建店铺管理员',
            showInSide: false,
            breadcrumbItems: [{
              text: '店铺管理员',
              to: {name: 'TenantUser'}
            }, {
              text: '创建店铺管理员'
            }]
          }
        },
        {
          path: 'tenantuser/edit/:id',
          name: 'EditTenantUser',
          component: () => import('src/ui/other/tenant-user/Edit.vue'),
          meta: {
            group: 'Other',
            title: '编辑店铺管理员',
            showInSide: false,
            breadcrumbItems: [{
              text: '店铺管理员',
              to: {name: 'TenantUser'}
            }, {
              text: '编辑店铺管理员'
            }]
          }
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('src/ui/other/user/Index.vue'),
          meta: {
            group: 'Other',
            title: '用户',
            showInSide: true
          }
        },
        {
          path: 'userdetail/:uid',
          name: 'UserDetail',
          component: () => import('src/ui/other/user/Detail.vue'),
          meta: {
            customBreadcrumb: true,
            group: 'Other',
            title: '用户详情',
            showInSide: false
          }
        },
        {
          path: '/user/userincome/:uid',
          name: 'UserIncome',
          component: () => import('src/ui/other/user/Income.vue'),
          meta: {
            title: '收入',
            showInSide: false,
            breadcrumbItems: [{
              text: '用户',
              to: {name: 'User'}
            }, {
              text: '收入'
            }]
          }
        },
        {
          path: '/user/userwithdraw/:uid',
          name: 'UserWithDraw',
          component: () => import('src/ui/other/user/Withdraw.vue'),
          meta: {
            title: '核销提现',
            showInSide: false,
            breadcrumbItems: [{
              text: '用户',
              to: {name: 'User'}
            }, {
              text: '核销提现'
            }]
          }
        },
        {
          path: 'user/userServerPurpose/:uid',
          name: 'UserServerPurpose',
          component: () => import('src/ui/other/user/ServerPurpose.vue'),
          meta: {
            title: '抵用',
            showInSide: false,
            breadcrumbItems: [{
              text: '用户',
              to: {name: 'User'}
            }, {
              text: '抵用'
            }]
          }
        },
        {
          path: 'hometemplate',
          name: 'HomeTemplate',
          component: () => import('src/ui/other/home_template/Index.vue'),
          meta: {
            group: 'Other',
            title: '首页模板',
            showInSide: true
          }
        },
        {
          path: 'hometemplate/create',
          name: 'HomeTemplateCreate',
          component: () => import('src/ui/other/home_template/create-edit/Create.vue'),
          meta: {
            title: '创建',
            showInSide: false,
            breadcrumbItems: [{
              text: '首页模板',
              to: {name: 'HomeTemplate'}
            }, {
              text: '创建'
            }]
          }
        },
        {
          path: 'hometemplate/edit/:id',
          name: 'HomeTemplateEdit',
          component: () => import('src/ui/other/home_template/create-edit/Edit.vue'),
          meta: {
            title: '编辑',
            showInSide: false,
            breadcrumbItems: [{
              text: '首页模板',
              to: {name: 'HomeTemplate'}
            }, {
              text: '编辑'
            }]
          }
        },
        {
          path: 'sysuser',
          name: 'SysUserIndex',
          component: () => import('src/ui/user/sys-user/Index.vue'),
          meta: {
            group: 'Administrator',
            title: '管理员列表',
            showInSide: true
          }
        },
        {
          path: 'characterauth',
          name: 'CharacterAuth',
          component: () => import('src/ui/user/character-auth/Index.vue'),
          meta: {
            group: 'Administrator',
            title: '角色管理',
            showInSide: true
          }
        },
        {
          path: 'characterauth/create-edit',
          name: 'CreateCharacter',
          component: () => import('src/ui/user/character-auth/Create.vue'),
          meta: {
            title: '创建角色',
            showInSide: false,
            breadcrumbItems: [
              {
                text: '角色管理',
                to: { name: 'CharacterAuth' }
              },
              {
                text: '创建角色'
              }
            ]
          }
        },
        {
          path: 'characterauth/edit/:id',
          name: 'EditCharacter',
          component: () => import('src/ui/user/character-auth/Edit.vue'),
          meta: {
            title: '编辑角色',
            showInSide: false,
            breadcrumbItems: [
              {
                text: '角色管理',
                to: { name: 'CharacterAuth' }
              },
              {
                text: '编辑角色'
              }
            ]
          }
        },
        {
          path: 'appversion',
          name: 'AppVersion',
          component: () => import('src/ui/maintain/app-version/Index.vue'),
          meta: {
            group: 'VersionManagement',
            title: '版本控制',
            showInSide: true
          }
        },
        {
          path: 'appversion/auditlist',
          name: 'AuditList',
          component: () => import('src/ui/maintain/app-version/audit-list/Index.vue'),
          meta: {
            group: 'VersionManagement',
            title: '审核列表',
            showInSide: false,
            breadcrumbItems: [{
              text: '版本控制',
              to: {name: 'AppVersion'}
            }, {
              text: '审核列表'
            }]
          }
        },
        {
          path: 'apptemplate',
          name: 'AppTemplate',
          component: () => import('src/ui/maintain/app-version/app-template/Index.vue'),
          meta: {
            group: 'VersionManagement',
            title: '小程序模板库',
            showInSide: false,
            breadcrumbItems: [{
              text: '版本控制',
              to: {name: 'AppVersion'}
            }, {
              text: '小程序模板库'
            }]
          }
        },
        {
          path: 'apptemplate/apptemplatedetail/:rowItem',
          name: 'AppTemplateDetail',
          component: () => import('src/ui/maintain/app-version/app-template/TemplatDetail.vue'),
          meta: {
            group: 'VersionManagement',
            title: '代码详情',
            showInSide: false,
            breadcrumbItems: [{
              text: '版本控制',
              to: {name: 'AppVersion'}
            }, {
              text: '小程序模板库',
              to: {name: 'AppTemplate'}
            }, {
              text: '代码详情'
            }]
          }
        },
        {
          path: 'version',
          name: 'Version',
          component: () => import('src/ui/maintain/version/Index.vue'),
          meta: {
            group: 'VersionManagement',
            title: '更新记录',
            showInSide: true
          }
        },
        {
          path: 'version/create-edit',
          name: 'VersionCreate',
          component: () => import('src/ui/maintain/version/Create.vue'),
          meta: {
            group: 'VersionManagement',
            title: '创建',
            showInSide: false,
            breadcrumbItems: [{
              text: '更新记录',
              to: {name: 'Version'}
            }, {
              text: '创建'
            }]
          }
        },
        {
          path: 'version/edit/:id',
          name: 'VersionEdit',
          component: () => import('src/ui/maintain/version/Edit.vue'),
          meta: {
            group: 'VersionManagement',
            title: '编辑',
            showInSide: false,
            breadcrumbItems: [{
              text: '更新记录',
              to: {name: 'Version'}
            }, {
              text: '编辑'
            }]
          }
        },
        {
          path: '/application',
          name: 'ApplicationIndex',
          component: () => import('src/ui/minprog-application/Index.vue'),
          meta: {
            title: '入驻申请',
            showInSide: true
          }
        },
        {
          path: '/am',
          name: 'AuthorizationManagement',
          component: () => import('src/ui/authorization-management/Index.vue'),
          meta: {
            title: '权限管理',
            showInSide: true
          }
        },
        {
          path: '/am/:id',
          name: 'AuthDetail',
          component: () => import('src/ui/authorization-management/AuthDetail.vue'),
          meta: {
            title: '权限',
            showInSide: false,
            breadcrumbItems: [{
              text: '权限管理',
              to: {name: 'AuthorizationManagement'}
            }, {
              text: '权限'
            }]
          }
        }
      ]
    },
    {
      path: '/login',
      name:
        'Login',
      component:
        () => import('src/ui/auth/login/Index.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (!Vue.$store.getters.isLogin) {
    try {
      await getMe()
    } catch (err) {
      if (!err.response || err.response.status !== 401) {
        clearAuthCookie()
      }
      if (to.name !== 'Login') {
        next({
          name: 'Login',
          replace: true
        })
      } else {
        next()
      }
      return
    }
  }

  // 以下就必须已完成了登录
  // 屏蔽掉处理不登录而访问login的情况
  if (to.name === 'Login') {
    next({
      name: 'Dashboard',
      replace: true
    })
    return
  }

  // 处理其它的路由
  // 处理角色权限
  // 超管无视权限
  if (Vue.$store.getters.isSuper) {
    next()
    return
  }
  if (to.name === 'PageErr') {
    next()
    return
  }
  // 登录后跳转到有权限的页面
  if (!from.name || from.name === 'Login' || to.name === 'Dashboard') {
    if (!isAuthRouter(to.meta.title, router.options.routes[0].children, Vue.$store.getters.sysRoles, Vue.$store.getters.allRoles)) {
      next({
        name: getAuthRoute(
          router.options.routes[0].children,
          Vue.$store.getters.sysRoles,
          Vue.$store.getters.allRoles
        ),
        replace: true
      })
      return
    } else {
      next()
    }
    return
  }
  next()
})

export default router
