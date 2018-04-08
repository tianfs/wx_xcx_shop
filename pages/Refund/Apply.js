var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    refund_goods_id: 0,
    goods: [],
    refund_number: 0,
    supplierInfo: [],
    types: ["仅退款","退款/退货"],
    states: [ "未收到货","已收到货"],
    explains: ["请选择退款原因", "多买/买错/不想要", "快递无记录", "少货/空包裹", "未按约定时间发货", "快递一直未送达", "其他"],
    actual_money: 0, //退款金额
    refund_tel: '', //手机号码
    explain:'',//退款原因
    explain_img:[], //图片举证
    remark: '', //备注信息
    type_index: 0,
    state_index: 0,
    explain_index: 0,
    index_all: [0,1,2,3,4,5,6,7] 
  },
  typeChange: function(e) {
    this.setData({
        type_index: e.detail.value
    })
  },
  stateChange:function(e){
    this.setData({
        state_index: e.detail.value
    })
  },
  explainChange: function (e) {
    this.setData({
        explain_index: e.detail.value
    })
  },
  input_refund_tel: function (event) {
      this.setData({
          refund_tel: event.detail.value
      })
  },
  input_remark: function (event) {
      this.setData({
          remark: event.detail.value
      })
  },
  onLoad: function (options) {
      var that = this;
      this.setData({
          refund_goods_id: options.order_goods_id ? options.order_goods_id : ''
      });
  },
  onShow: function () {
      this.init();
  },
  init: function () {
	  var that = this;
	  app.getLogin(function () {
		  that.setData({
			  supplierInfo: app.globalData.supplier_info
		  })
		  that.getRefundGoods();
	  });
  },
  getRefundGoods: function () {
      var that = this;
      console.log(that.data);
          wx.request({
              url: app.globalData.apiDomain + '/OrderRefund/getRefundGoods',
              data: {
                  user_key: app.globalData.user_key,
                  supplier_key: app.globalData.supplier_key,
                  refund_goods_id: that.data.refund_goods_id
              },
              method: 'POST',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              success: function (res) {
                  var data = res.data;
                  if (data.status == 0) {
                      that.setData({
                          goods: data.info,
                          refund_number: data.info.buy_number,
                          actual_money: data.info.goods_price * data.info.buy_number
                      });
                  }
              }
          })
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
         app.getLogin(function () {
            wx.uploadFile({
                url: app.globalData.apiDomain + '/File/uploadImage/',
                filePath: res.tempFilePaths[0],
                name: 'file',
                header: { "Content-Type": "multipart/form-data" },
                formData: {
                    user_key: app.globalData.user_key,
                    supplier_key: app.globalData.supplier_key
                },
                success: function (res) {
                    var data= JSON.parse(res.data);
                    if (data.status == 0) {
                        that.setData({
                            explain_img: that.data.explain_img.concat(data.info)
                        });
                    } else {
                        wx.showModal({
                            content: '图片上传失败',
                            showCancel: false
                        });
                    }
                }
            })
        });
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.explain_img // 需要预览的图片http链接列表
    })
  },
  //提交
  submit: function() {
    var that = this;
    var refund_goods_id = that.data.refund_goods_id;
    var refund_number = that.data.refund_number;
    var index_all = that.data.index_all;
    var refund_type = index_all[that.data.type_index] + 1;
    var goods_state = index_all[that.data.state_index]+1;
    var explain = index_all[that.data.explain_index] ;
    var refund_tel = that.data.refund_tel;
    var remark = that.data.remark;
    var explain_img = that.data.explain_img;
    if (explain == 0) {
        wx.showModal({
            content: '请选择退款原因',
            showCancel: false
        });
        return false;
    }
    app.getLogin(function () {
        wx.request({
            url: app.globalData.apiDomain + '/OrderRefund/applyRefund',
            //url: 'http://127.0.0.1/chartShop/Api/OrderRefund/applyRefund/',
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key,
                refund_goods_id: refund_goods_id,
                refund_number: refund_number,
                refund_type: refund_type,
                goods_state: goods_state,
                refund_tel: refund_tel,
                explain: explain,
                explain_img: explain_img,
                remark: remark
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                if (data.status == 0) {
                    wx.redirectTo({
                        url: '../Refund/Details?refund_id=' + data.info
                    });
                } else {
                    wx.showModal({
                        content: data.info,
                        showCancel: false
                    });
                }
            }
        })
    });
  },
  bindMinus: function () {
      var that = this;
      var refund_number = that.data.refund_number;
      // 如果大于1时，才可以减
      if (refund_number > 1) {
          refund_number--;
      }
      // 只有大于一件的时候，才能normal状态，否则disable状态
      var minusStatus = refund_number <= 1 ? 'disabled' : 'normal';
      // 将数值与状态写回
      this.setData({
          refund_number: refund_number,
          minusStatus: minusStatus,
          actual_money: that.data.goods.goods_price * refund_number
      });
  },
  bindPlus:function(){
      var that = this;
      var refund_number = that.data.refund_number;
      if (refund_number < that.data.goods.buy_number) {
          refund_number++;
      }
      // 只有大于一件的时候，才能normal状态，否则disable状态
      var minusStatus = refund_number < this.data.goods.buy_number ? 'disabled' : 'normal';
      // 将数值与状态写回
      this.setData({
          refund_number: refund_number,
          minusStatus: minusStatus,
          actual_money: that.data.goods.goods_price * refund_number
      });
  }
})