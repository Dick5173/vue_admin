<template lang="pug">
  el-form(ref="form", :model="formData", :rules="formRules", labelWidth="78px")
    el-form-item(label="商品图片", prop="head", :required="true")
      upload-image-list(ref="uploadHead", :imageList.sync="formData.head", :maxFiles='$options.MAX_HEAD_COUNT')
      div.input-bottom-desc 还能上传 {{ remainHeadCount }} 张，建议尺寸750×750像素
    el-form-item(label="列表图", prop="cover")
      upload-image(ref="uploadCover", :image.sync="formData.cover")
      div.input-bottom-desc 建议尺寸750×750像素
    el-form-item(label="商品名称", prop="name")
      el-input.medium-el-input(v-model="formData.name", :maxlength="50")
      span.input-right-desc {{ formData.name.length }} / 50
    el-form-item(label="卖点", prop="sell_point")
      el-input.medium-el-input(v-model="formData.sell_point", :maxlength="30")
      span.input-right-desc {{ formData.sell_point.length }} / 30
    el-form-item(label="商品规格", prop="skus")
      skus(ref="skus", :skus.sync="formData.skus", :stPrice="this.formData.st_price", :supplyPrice="this.formData.supply_price")
    el-form-item(label="划线价", prop="st_price")
      el-input.tiny-el-input(v-model="formData.st_price")
      span.input-right-desc 元
    el-form-item(label="供货价", prop="supply_price")
      el-input.tiny-el-input(v-model="formData.supply_price")
      span.input-right-desc 元
    el-form-item(label="商品分类", prop="category_id")
      el-select(v-model="formData.category_id", placeholder="请选择")
        el-option-group(v-for!="parentItem in allCategories", :label="parentItem.name", :key="parentItem.id")
          el-option(v-for!="childItem in parentItem.children", :label="childItem.name", :value="`${childItem.id}`", :key="childItem.id")
    el-form-item(label="商品描述", prop="content")
      content-comp(:content.sync="formData.content")
    el-form-item
      el-button(@click="$router.back()") 取消
      el-button(type="primary", :loading="loading", @click="save") 确定
</template>

<script>
  import UploadImageList from 'src/ui/widget/upload-image-list/Index.vue'
  import UploadImage from 'src/ui/widget/upload-image/Index.vue'
  import Skus from './Skus.vue'
  import ContentComp from './Content.vue'
  import * as FormApi from 'src/api/product'
  import * as CategoryApi from 'src/api/category'
  import { priceValidator } from 'src/util/validator'

  const MAX_HEAD_COUNT = 5

  export default {
    MAX_HEAD_COUNT,
    components: {
      UploadImageList,
      UploadImage,
      Skus,
      ContentComp
    },
    data () {
      const headValidator = (rule, value, callback) => {
        if (this.$refs.uploadHead.isUpdating) {
          callback(new Error('正在上传图片'))
          return
        }
        if (value) {
          if (value.length <= 0) {
            callback(new Error('请选择图片'))
          } else if (value.length > MAX_HEAD_COUNT) {
            callback(new Error(`最多选择${MAX_HEAD_COUNT}图片`))
          } else {
            callback()
          }
        }
        callback(new Error('请选择图片'))
      }
      const coverValidator = (rule, value, callback) => {
        if (this.$refs.uploadCover.isUpdating) {
          callback(new Error('正在上传图片'))
          return
        }
        callback()
      }
      const skuValidator = (rule, value, callback) => {
        if (!value || value.length <= 0) {
          callback(new Error('Sku不能为空'))
          return
        }
        if (this.$refs.skus.isUpdating()) {
          callback(new Error('正在上传图片'))
          return
        }
        callback()
      }
      const supplyPriceValidator = (rule, value, callback) => {
        if (!this.R_.isPrice(value)) {
          callback(new Error('不正确的价格'))
          return
        }
        const supplyPrice = this.R_.convertYuanToFen(value)
        if (this.R_.isPrice(this.formData.st_price)) {
          const st = this.R_.convertYuanToFen(this.formData.st_price)
          if (supplyPrice > st) {
            callback(new Error('不能大于划线价'))
            return
          }
        }
        callback()
      }
      return {
        loading: false,
        initialData: {},
        formData: {
          id: 0,
          status: 1,
          head: [],
          cover: {
            url: '',
            width: 0,
            height: 0
          },
          name: '',
          sell_point: '',
          skus: [],
          st_price: '',
          supply_price: '',
          category_id: '',
          content: []
        },
        formRules: {
          head: [
            {validator: headValidator, trigger: 'change'}
          ],
          cover: [
            {validator: coverValidator, trigger: 'change'}
          ],
          name: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {max: 50, message: '最多可以输入50个字符', trigger: 'blur'}
          ],
          sell_point: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {max: 30, message: '最多可以输入30个字符', trigger: 'blur'}
          ],
          skus: [
            {validator: skuValidator, trigger: 'change'}
          ],
          st_price: [
            {validator: priceValidator, trigger: 'blur'}
          ],
          supply_price: [
            {validator: supplyPriceValidator, trigger: 'blur'}
          ],
          category_id: [
            {required: true, message: '分类不能为空', trigger: 'change'}
          ]
        },
        allCategories: []
      }
    },
    computed: {
      isEditMode () {
        return this.$route.name === 'PlatformProductEdit'
      },
      remainHeadCount () {
        return MAX_HEAD_COUNT - this.formData.head.length
      }
    },
    methods: {
      async initData () {
        const resCategory = await CategoryApi.getList()
        this.allCategories = resCategory.data.data
        if (this.isEditMode) {
          const resItem = await FormApi.getItem(this.$route.params.id)
          this.formData = resItem.data
        }
        this.initialData = this.R.clone(this.formData)
      },
      save () {
        this.loading = true
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            try {
              if (!this.isEditMode) {
                await FormApi.create(this.formData)
                this.$message({
                  type: 'success',
                  message: '添加成功'
                })
              } else {
                await FormApi.update(this.formData.id, this.formData)
                this.$message({
                  type: 'success',
                  message: '编辑成功'
                })
              }
              this.$router.back()
            } catch (err) {
            }
          }
        })
        this.loading = false
      }
    },
    async mounted () {
      this.initData()
    }
  }
</script>

<style lang="scss" scoped>
</style>